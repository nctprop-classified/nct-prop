import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env, UserSession } from './types';
import { authMiddleware } from './middleware/auth';
import { listingsRoute } from './routes/listings';
import { citiesRoute } from './routes/cities';
import { uploadRoute } from './routes/upload';
import { authRoute } from './routes/auth';
import { leadsRoute } from './routes/leads';
import { adminRoute } from './routes/admin';

const app = new Hono<{ Bindings: Env; Variables: { user?: UserSession } }>();

// Logger
app.use('*', logger());

// Dynamic CORS for Cloudflare Pages / Custom Domain / Localhost
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: (origin) => {
      // Allow localhost and production nctprop domains
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('nctprop.com') || origin.includes('.pages.dev')) {
        return origin || '*';
      }
      return 'https://nctprop.com';
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Name', 'X-User-Phone', 'X-User-Role'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// Auth inspection middleware
app.use('*', authMiddleware);

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'nctprop-api',
    region: 'Delhi-NCR',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.route('/api/cities', citiesRoute);
app.route('/api/listings', listingsRoute);
app.route('/api/upload', uploadRoute);
app.route('/api/auth', authRoute);
app.route('/api/leads', leadsRoute);
app.route('/api/admin', adminRoute);

// 404 Handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found', path: c.req.path }, 404);
});

// Error Handler
app.onError((err, c) => {
  console.error('Unhandled Worker error:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
