import { Hono } from 'hono';
import { Env, UserSession } from '../types';
import { requireAuth } from '../middleware/auth';

export const adminRoute = new Hono<{ Bindings: Env; Variables: { user?: UserSession } }>();

// Admin guard middleware
adminRoute.use('*', requireAuth(), async (c, next) => {
  const user = c.get('user')!;
  if (user.role !== 'admin') {
    return c.json({ success: false, error: 'Admin access required.' }, 403);
  }
  await next();
});

// Admin stats
adminRoute.get('/stats', async (c) => {
  const db = c.env.DB;
  const stats = await db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM listings) as total_listings,
      (SELECT COUNT(*) FROM listings WHERE status = 'active') as active_listings,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM leads) as total_leads
  `).first();

  return c.json({ success: true, stats });
});

// Toggle featured status
adminRoute.post('/listings/:id/toggle-featured', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  
  const current = await db.prepare('SELECT featured FROM listings WHERE id = ?').bind(id).first<{ featured: number }>();
  if (!current) {
    return c.json({ success: false, error: 'Listing not found' }, 404);
  }

  const newFeatured = current.featured ? 0 : 1;
  await db.prepare('UPDATE listings SET featured = ? WHERE id = ?').bind(newFeatured, id).run();

  return c.json({ success: true, featured: newFeatured });
});
