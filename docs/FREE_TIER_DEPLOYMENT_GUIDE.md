# NCTprop.com — 100% Free-Tier Deployment & Architecture Guide

This guide walks you through deploying **NCTprop.com** (Delhi-NCR Property Classifieds) entirely on **zero-cost free tiers** with no monthly cloud bills.

---

## 1. Zero-Cost Infrastructure Overview

| Component | Provider & Free Tier Limits | Cost | Purpose in NCTprop |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | **Cloudflare Pages** (Unlimited bandwidth, 500 builds/mo) | **₹0 / $0** | Hosts React/Vite SPA, instant global CDN |
| **Backend API** | **Cloudflare Workers** (100,000 req/day free) | **₹0 / $0** | Hono REST API, search filters, lead routes |
| **Database** | **Cloudflare D1** (5M reads/day, 100k writes/day, 5 GB) | **₹0 / $0** | Serverless SQLite for users, listings, leads |
| **Image Storage** | **Cloudflare R2** (10 GB storage, 0 egress fees) | **₹0 / $0** | Stores WebP photos compressed to ~200KB |
| **Lead Notifications** | **WhatsApp Direct Link Protocol** (`wa.me/91...`) | **₹0 / $0** | No SMS gateway fees, instantaneous delivery |
| **Authentication** | **Firebase Auth Spark Free Tier** (Email + Phone) | **₹0 / $0** | User authentication & OTP verification |
| **Monetization** | **Google AdSense** | **Revenue** | Auto ads and responsive banner slots |
| **Analytics** | **Google Analytics 4 (GA4)** | **₹0 / $0** | Real-time traffic & conversion tracking |

---

## 2. Local Setup & Testing

### Step 1: Install Dependencies
From the root directory:
```bash
npm run install:all
```

### Step 2: Initialize Local D1 Database & Seed
Run local D1 migrations and populate Delhi-NCR sample properties:
```bash
npm run db:migrate:local
npm run db:seed:local
```

### Step 3: Run Local Development Servers
In terminal 1 (API on `http://localhost:8787`):
```bash
npm run dev:api
```

In terminal 2 (Web on `http://localhost:5173`):
```bash
npm run dev:web
```

---

## 3. Production Deployment (Cloudflare Free Tier)

### Step 1: Login to Cloudflare Wrangler (Free)
```bash
npx wrangler login
```

### Step 2: Create D1 Database & R2 Bucket
1. Create the serverless SQLite D1 database:
   ```bash
   npx wrangler d1 create nctprop-db
   ```
   *Copy the `database_id` from the output and paste it into `api/wrangler.jsonc`.*

2. Create the R2 storage bucket:
   ```bash
   npx wrangler r2 bucket create nctprop-images
   ```

3. Run the migrations on your production D1 database:
   ```bash
   npm run db:migrate:prod
   npm run db:seed:prod
   ```

### Step 3: Deploy the Worker API
From `api/`:
```bash
npm run deploy
```
*Note down the resulting worker URL (e.g. `https://nctprop-api.<your-subdomain>.workers.dev`).*

### Step 4: Deploy the Web Frontend to Cloudflare Pages
1. Build the frontend:
   ```bash
   npm run build:web
   ```
2. Deploy the `web/dist` folder to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy web/dist --project-name nctprop
   ```
3. In the Cloudflare Pages Dashboard, navigate to **Settings > Domains** and attach your custom domain `nctprop.com`.

---

## 4. Key Architectural Safeguards

1. **Client-Side Image Optimization:**
   The frontend automatically converts every photo uploaded by owners to **WebP (max 1400px width, ~200KB)** via `browser-image-compression` *before* uploading to R2.  
   *Result:* 10 GB of free R2 storage holds **over 35,000 property photos** without paying a rupee.

2. **No SMS Gateway Costs:**
   Instead of paying expensive per-SMS transaction charges, leads trigger pre-filled WhatsApp chats (`https://wa.me/91...`). This is 100% free and preferred by 99% of Indian property seekers.

3. **Auto-Expiry for Listing Cleanliness:**
   Listings automatically expire after 45 days unless renewed with 1 click from "My Listings", keeping the database free of dead inventory.
