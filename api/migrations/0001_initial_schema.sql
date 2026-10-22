-- Migration: 0001_initial_schema.sql
-- NCTprop.com D1 Schema (Optimized for Cloudflare D1 SQLite free tier)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,               -- Firebase UID
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  user_type TEXT NOT NULL DEFAULT 'owner', -- 'owner' | 'agent' | 'builder'
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Listings Table
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                -- 'rent' | 'sale'
  category TEXT NOT NULL,            -- 'residential' | 'commercial' | 'plot' | 'pg'
  posted_by TEXT NOT NULL,           -- 'owner' | 'agent' | 'builder'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,            -- Monthly rent in INR or total sale price
  maintenance INTEGER DEFAULT 0,     -- Maintenance cost per month
  area_sqft INTEGER NOT NULL,        -- Super built-up or carpet area in sqft
  bedrooms INTEGER,                  -- 1, 2, 3, 4, etc. (NULL for plots/commercial)
  bathrooms INTEGER,
  furnishing TEXT DEFAULT 'unfurnished', -- 'unfurnished' | 'semi-furnished' | 'fully-furnished'
  floor_number INTEGER,
  total_floors INTEGER,
  city TEXT NOT NULL,                -- 'Delhi' | 'Gurugram' | 'Noida' | 'Greater Noida' | 'Ghaziabad' | 'Faridabad'
  locality TEXT NOT NULL,            -- e.g. 'Sector 62', 'DLF Phase 3', 'Indirapuram'
  society_or_colony TEXT,           -- Society/Apartment or colony name
  address TEXT,
  phone TEXT NOT NULL,               -- Contact phone
  whatsapp_number TEXT NOT NULL,     -- WhatsApp phone number (+91...)
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'rented' | 'sold' | 'expired'
  featured INTEGER NOT NULL DEFAULT 0,   -- 1 for featured listing, 0 for regular
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL        -- unixepoch timestamp (30-45 days after creation)
);

-- Compound indexes for high performance search without table scans
CREATE INDEX IF NOT EXISTS idx_listings_search_main ON listings(status, city, type, category);
CREATE INDEX IF NOT EXISTS idx_listings_locality ON listings(city, locality);
CREATE INDEX IF NOT EXISTS idx_listings_posted_by ON listings(posted_by);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_expiry ON listings(expires_at, status);

-- 3. Listing Images Table
CREATE TABLE IF NOT EXISTS listing_images (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,                 -- R2 image URL or key
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_images_listing ON listing_images(listing_id, sort_order);

-- 4. Leads / Inquiries Table
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_message TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_leads_listing ON leads(listing_id);
