import { Hono } from 'hono';
import { Env, UserSession } from '../types';
import { requireAuth } from '../middleware/auth';

export const listingsRoute = new Hono<{ Bindings: Env; Variables: { user?: UserSession } }>();

// Auto-initialize schema in D1 database if tables don't exist yet
async function ensureSchema(db: D1Database) {
  try {
    await db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          role TEXT NOT NULL DEFAULT 'user',
          user_type TEXT NOT NULL DEFAULT 'owner',
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS listings (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          posted_by TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          price INTEGER NOT NULL,
          maintenance INTEGER DEFAULT 0,
          area_sqft INTEGER NOT NULL,
          bedrooms INTEGER,
          bathrooms INTEGER,
          furnishing TEXT DEFAULT 'unfurnished',
          floor_number INTEGER,
          total_floors INTEGER,
          city TEXT NOT NULL,
          locality TEXT NOT NULL,
          society_or_colony TEXT,
          address TEXT,
          phone TEXT NOT NULL,
          whatsapp_number TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          featured INTEGER NOT NULL DEFAULT 0,
          views_count INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          expires_at INTEGER NOT NULL
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS listing_images (
          id TEXT PRIMARY KEY,
          listing_id TEXT NOT NULL,
          url TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS leads (
          id TEXT PRIMARY KEY,
          listing_id TEXT NOT NULL,
          buyer_name TEXT NOT NULL,
          buyer_phone TEXT NOT NULL,
          buyer_message TEXT,
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        )
      `)
    ]);
  } catch (err) {
    console.warn('ensureSchema warning:', err);
  }
}

// 1. GET /api/listings - Search & Filter
listingsRoute.get('/', async (c) => {
  const db = c.env.DB;
  const q = c.req.query();

  const city = q.city;
  const locality = q.locality;
  const type = q.type;
  const category = q.category;
  const postedBy = q.posted_by;
  const bedrooms = q.bedrooms ? parseInt(q.bedrooms) : undefined;
  const minPrice = q.min_price ? parseInt(q.min_price) : undefined;
  const maxPrice = q.max_price ? parseInt(q.max_price) : undefined;
  const featuredOnly = q.featured === '1' || q.featured === 'true';
  const page = Math.max(1, parseInt(q.page || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(q.limit || '15')));
  const offset = (page - 1) * limit;
  const sort = q.sort || 'recent';

  let whereClauses = ["l.status = 'active'"];
  const params: any[] = [];

  if (city) {
    whereClauses.push('l.city = ?');
    params.push(city);
  }
  if (locality) {
    whereClauses.push('l.locality LIKE ?');
    params.push(`%${locality}%`);
  }
  if (type) {
    whereClauses.push('l.type = ?');
    params.push(type);
  }
  if (category) {
    whereClauses.push('l.category = ?');
    params.push(category);
  }
  if (postedBy) {
    whereClauses.push('l.posted_by = ?');
    params.push(postedBy);
  }
  if (bedrooms !== undefined && !isNaN(bedrooms)) {
    if (bedrooms >= 4) {
      whereClauses.push('l.bedrooms >= ?');
      params.push(bedrooms);
    } else {
      whereClauses.push('l.bedrooms = ?');
      params.push(bedrooms);
    }
  }
  if (minPrice !== undefined && !isNaN(minPrice)) {
    whereClauses.push('l.price >= ?');
    params.push(minPrice);
  }
  if (maxPrice !== undefined && !isNaN(maxPrice)) {
    whereClauses.push('l.price <= ?');
    params.push(maxPrice);
  }
  if (featuredOnly) {
    whereClauses.push('l.featured = 1');
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  let orderBySQL = 'ORDER BY l.featured DESC, l.created_at DESC';
  if (sort === 'price_asc') {
    orderBySQL = 'ORDER BY l.price ASC, l.created_at DESC';
  } else if (sort === 'price_desc') {
    orderBySQL = 'ORDER BY l.price DESC, l.created_at DESC';
  }

  try {
    const countQuery = `SELECT COUNT(*) as total FROM listings l ${whereSQL}`;
    const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;

    const query = `
      SELECT 
        l.*,
        u.name as user_name,
        (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY sort_order ASC LIMIT 1) as cover_image
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      ${whereSQL}
      ${orderBySQL}
      LIMIT ? OFFSET ?
    `;

    const results = await db.prepare(query).bind(...params, limit, offset).all();

    return c.json({
      success: true,
      data: results.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    // If table does not exist, initialize schema and return empty
    if (err.message && err.message.includes('no such table')) {
      await ensureSchema(db);
    }
    return c.json({
      success: true,
      data: [],
      pagination: { page: 1, limit, total: 0, totalPages: 1 }
    });
  }
});

// 2. GET /api/listings/:id - Listing Details
listingsRoute.get('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');

  try {
    const listing = await db
      .prepare(`
        SELECT l.*, u.name as user_name 
        FROM listings l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.id = ?
      `)
      .bind(id)
      .first();

    if (!listing) {
      return c.json({ success: false, error: 'Listing not found' }, 404);
    }

    const images = await db
      .prepare('SELECT id, url, sort_order FROM listing_images WHERE listing_id = ? ORDER BY sort_order ASC')
      .bind(id)
      .all();

    c.executionCtx?.waitUntil?.(
      db.prepare('UPDATE listings SET views_count = views_count + 1 WHERE id = ?').bind(id).run().catch(() => null)
    );

    return c.json({
      success: true,
      data: {
        ...listing,
        images: images.results || []
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: 'Listing not found' }, 404);
  }
});

// 3. POST /api/listings - Create Property Listing
listingsRoute.post('/', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();

  const {
    type,
    category,
    posted_by,
    title,
    description,
    price,
    maintenance = 0,
    area_sqft,
    bedrooms,
    bathrooms,
    furnishing = 'unfurnished',
    floor_number,
    total_floors,
    city,
    locality,
    society_or_colony = '',
    address = '',
    phone,
    whatsapp_number,
    images = []
  } = body;

  // Validation
  if (!title || !price || !area_sqft || !city || !locality || !phone) {
    return c.json({ success: false, error: 'Missing required listing fields.' }, 400);
  }

  // Strict Photo Limit Enforcement (Free Tier: Max 5 Photos)
  if (Array.isArray(images) && images.length > 5) {
    return c.json({ 
      success: false, 
      error: 'Free tier limit exceeded: Maximum 5 photos allowed per property listing.' 
    }, 400);
  }

  // Ensure DB schema exists in production
  await ensureSchema(db);

  // Derive resilient user ID from context or phone number
  const contextUser = c.get('user');
  const cleanPhone = String(phone).replace(/[^0-9]/g, '').slice(-10);
  const uid = contextUser?.uid || `usr_${cleanPhone || Date.now()}`;
  const userName = contextUser?.name || body.contact_name || 'Property Owner';

  const listingId = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + (45 * 86400); // 45 days default expiry

  try {
    // 1. Upsert user
    await db.prepare(`
      INSERT INTO users (id, name, phone, email, role, user_type, created_at)
      VALUES (?, ?, ?, ?, 'user', ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = coalesce(excluded.name, users.name),
        phone = coalesce(excluded.phone, users.phone)
    `).bind(
      uid,
      userName,
      cleanPhone,
      contextUser?.email || null,
      posted_by || 'owner',
      now
    ).run();

    // 2. Insert Listing
    await db.prepare(`
      INSERT INTO listings (
        id, user_id, type, category, posted_by, title, description, price, maintenance,
        area_sqft, bedrooms, bathrooms, furnishing, floor_number, total_floors,
        city, locality, society_or_colony, address, phone, whatsapp_number,
        status, featured, views_count, created_at, expires_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        'active', 0, 0, ?, ?
      )
    `).bind(
      listingId,
      uid,
      type || 'rent',
      category || 'residential',
      posted_by || 'owner',
      title,
      description || '',
      Number(price),
      Number(maintenance) || 0,
      Number(area_sqft),
      bedrooms !== undefined && bedrooms !== null ? Number(bedrooms) : null,
      bathrooms !== undefined && bathrooms !== null ? Number(bathrooms) : null,
      furnishing,
      floor_number !== undefined && floor_number !== null ? Number(floor_number) : null,
      total_floors !== undefined && total_floors !== null ? Number(total_floors) : null,
      city,
      locality,
      society_or_colony,
      address,
      phone,
      whatsapp_number || phone,
      now,
      expiresAt
    ).run();

    // 3. Insert images (Strictly capped at 5 photos)
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < Math.min(images.length, 5); i++) {
        const imgUrl = typeof images[i] === 'string' ? images[i] : images[i].url;
        if (imgUrl) {
          const imgId = `img_${Date.now()}_${i}`;
          await db.prepare('INSERT INTO listing_images (id, listing_id, url, sort_order) VALUES (?, ?, ?, ?)')
            .bind(imgId, listingId, imgUrl, i)
            .run();
        }
      }
    }

    return c.json({
      success: true,
      message: 'Listing published successfully!',
      id: listingId
    }, 201);
  } catch (err: any) {
    console.error('Database listing insertion error:', err);
    return c.json({
      success: false,
      error: `Failed to publish property: ${err.message || 'Database error'}`
    }, 500);
  }
});

// 4. PATCH /api/listings/:id/status - Update Status or Renew
listingsRoute.patch('/:id/status', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const id = c.req.param('id');
  const { status, action } = await c.req.json();

  try {
    const listing = await db.prepare('SELECT user_id, expires_at FROM listings WHERE id = ?').bind(id).first<{ user_id: string; expires_at: number }>();
    if (!listing) {
      return c.json({ success: false, error: 'Listing not found' }, 404);
    }

    if (user && listing.user_id !== user.uid && user.role !== 'admin') {
      return c.json({ success: false, error: 'Unauthorized to modify this listing.' }, 403);
    }

    if (action === 'renew') {
      const now = Math.floor(Date.now() / 1000);
      const newExpiry = now + (30 * 86400); // extend by 30 days
      await db.prepare("UPDATE listings SET expires_at = ?, status = 'active' WHERE id = ?").bind(newExpiry, id).run();
      return c.json({ success: true, message: 'Listing renewed for 30 days.' });
    }

    if (['active', 'rented', 'sold', 'expired'].includes(status)) {
      await db.prepare('UPDATE listings SET status = ? WHERE id = ?').bind(status, id).run();
      return c.json({ success: true, message: `Listing marked as ${status}.` });
    }

    return c.json({ success: false, error: 'Invalid status or action.' }, 400);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 5. DELETE /api/listings/:id - Delete Listing
listingsRoute.delete('/:id', async (c) => {
  const db = c.env.DB;
  const user = c.get('user');
  const id = c.req.param('id');

  try {
    const listing = await db.prepare('SELECT user_id FROM listings WHERE id = ?').bind(id).first<{ user_id: string }>();
    if (!listing) {
      return c.json({ success: false, error: 'Listing not found' }, 404);
    }

    if (user && listing.user_id !== user.uid && user.role !== 'admin') {
      return c.json({ success: false, error: 'Unauthorized' }, 403);
    }

    await db.prepare('DELETE FROM listings WHERE id = ?').bind(id).run();
    return c.json({ success: true, message: 'Listing deleted successfully.' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
