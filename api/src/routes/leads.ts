import { Hono } from 'hono';
import { Env, UserSession } from '../types';
import { requireAuth } from '../middleware/auth';

export const leadsRoute = new Hono<{ Bindings: Env; Variables: { user?: UserSession } }>();

// Record lead & generate direct WhatsApp connect link
leadsRoute.post('/', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const { listing_id, buyer_name, buyer_phone, buyer_message } = body;

  if (!listing_id || !buyer_phone) {
    return c.json({ success: false, error: 'Listing ID and phone number are required.' }, 400);
  }

  // Fetch listing details to prepare WhatsApp link
  const listing = await db.prepare('SELECT title, phone, whatsapp_number FROM listings WHERE id = ?')
    .bind(listing_id)
    .first<{ title: string; phone: string; whatsapp_number: string }>();

  if (!listing) {
    return c.json({ success: false, error: 'Listing not found.' }, 404);
  }

  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = Math.floor(Date.now() / 1000);

  // Save lead in D1 database
  await db.prepare(`
    INSERT INTO leads (id, listing_id, buyer_name, buyer_phone, buyer_message, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(leadId, listing_id, buyer_name || 'Interested Buyer', buyer_phone, buyer_message || '', now).run();

  // Create WhatsApp redirect link
  const targetPhone = (listing.whatsapp_number || listing.phone || '').replace(/[^0-9]/g, '');
  const cleanTarget = targetPhone.startsWith('91') ? targetPhone : `91${targetPhone}`;
  const whatsappMsg = `Hello! I saw your property listing "${listing.title}" on NCTprop.com. My name is ${buyer_name || 'Buyer'} (${buyer_phone}). Is it still available?`;
  const whatsappUrl = `https://wa.me/${cleanTarget}?text=${encodeURIComponent(whatsappMsg)}`;

  return c.json({
    success: true,
    message: 'Lead recorded successfully',
    whatsapp_url: whatsappUrl
  });
});

// View leads for my listings
leadsRoute.get('/my-leads', requireAuth(), async (c) => {
  const db = c.env.DB;
  const user = c.get('user')!;

  const leads = await db.prepare(`
    SELECT ld.*, l.title as listing_title
    FROM leads ld
    JOIN listings l ON ld.listing_id = l.id
    WHERE l.user_id = ?
    ORDER BY ld.created_at DESC
    LIMIT 100
  `).bind(user.uid).all();

  return c.json({
    success: true,
    data: leads.results || []
  });
});
