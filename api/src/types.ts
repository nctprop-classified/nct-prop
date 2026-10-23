export interface Env {
  DB: D1Database;
  BUCKET?: R2Bucket;
  IMAGES_KV?: KVNamespace;
  ENVIRONMENT?: string;
  ALLOWED_ORIGINS?: string;
  R2_PUBLIC_DOMAIN?: string;
}

export interface UserSession {
  uid: string;
  phone?: string;
  email?: string;
  name?: string;
  role?: 'user' | 'admin';
}
