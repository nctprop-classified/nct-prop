import { Context, Next } from 'hono';
import { Env, UserSession } from '../types';

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: { user?: UserSession } }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  const devUserId = c.req.header('X-User-Id');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // In Cloudflare Workers, Firebase tokens can be decoded or verified.
      // For lightweight worker execution, we decode the JWT payload or read the claims:
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);
        c.set('user', {
          uid: payload.sub || payload.user_id || payload.uid,
          phone: payload.phone_number || payload.phone,
          email: payload.email,
          name: payload.name || payload.display_name,
          role: payload.admin ? 'admin' : 'user'
        });
        return await next();
      }
    } catch (e) {
      console.warn('Failed to parse bearer token:', e);
    }
  }

  // Local development fallback
  if (devUserId) {
    c.set('user', {
      uid: devUserId,
      name: c.req.header('X-User-Name') || 'Local User',
      phone: c.req.header('X-User-Phone') || '919876543210',
      role: (c.req.header('X-User-Role') as 'user' | 'admin') || 'user'
    });
    return await next();
  }

  return await next();
}

export function requireAuth() {
  return async (c: Context<{ Bindings: Env; Variables: { user?: UserSession } }>, next: Next) => {
    const user = c.get('user');
    if (!user || !user.uid) {
      return c.json({ error: 'Authentication required. Please log in.' }, 401);
    }
    await next();
  };
}
