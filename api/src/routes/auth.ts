import { Hono } from 'hono';
import { Env, UserSession } from '../types';
import { requireAuth } from '../middleware/auth';

export const authRoute = new Hono<{ Bindings: Env; Variables: { user?: UserSession } }>();

// Sync / Upsert User profile from Firebase token
authRoute.post('/sync', requireAuth(), async (c) => {
  const db = c.env.DB;
  const user = c.get('user')!;
  const body = await c.req.json().catch(() => ({}));

  const name = body.name || user.name || 'User';
  const phone = body.phone || user.phone || '';
  const email = body.email || user.email || null;
  const userType = body.user_type || 'owner';
  const now = Math.floor(Date.now() / 1000);

  await db.prepare(`
    INSERT INTO users (id, name, phone, email, role, user_type, created_at)
    VALUES (?, ?, ?, ?, 'user', ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      phone = CASE WHEN excluded.phone != '' THEN excluded.phone ELSE users.phone END,
      email = coalesce(excluded.email, users.email),
      user_type = coalesce(excluded.user_type, users.user_type)
  `).bind(user.uid, name, phone, email, userType, now).run();

  const savedUser = await db.prepare('SELECT * FROM users WHERE id = ?').bind(user.uid).first();

  return c.json({
    success: true,
    user: savedUser
  });
});

// Get current user profile and their listings
authRoute.get('/me', requireAuth(), async (c) => {
  const db = c.env.DB;
  const user = c.get('user')!;

  const profile = await db.prepare('SELECT * FROM users WHERE id = ?').bind(user.uid).first();
  
  const myListings = await db.prepare(`
    SELECT 
      l.*,
      (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY sort_order ASC LIMIT 1) as cover_image
    FROM listings l
    WHERE l.user_id = ?
    ORDER BY l.created_at DESC
  `).bind(user.uid).all();

  return c.json({
    success: true,
    user: profile || { id: user.uid, name: user.name, phone: user.phone, role: user.role || 'user' },
    listings: myListings.results || []
  });
});
