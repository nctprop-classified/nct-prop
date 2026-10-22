# NCTprop.com — Delhi-NCR Property Classifieds

> **100% Free Property Classifieds Marketplace for Delhi-NCR**  
> Covers: **Delhi, Gurugram (Gurgaon), Noida, Greater Noida, Ghaziabad, and Faridabad**

---

## 🌟 Highlights & Architecture

- **Zero-Cost Free Tier Stack:** Runs completely within the free tiers of Cloudflare (Pages, Workers, D1, R2) and Firebase Auth.
- **Direct WhatsApp Connect:** Buyers and tenants contact property owners and verified agents directly on WhatsApp with pre-filled property links.
- **Owner vs. Agent Transparency:** Dedicated "Direct Owner Only" filter so users can find zero-brokerage properties effortlessly.
- **Auto-Compressing Image Pipeline:** Client-side WebP compression (< 300KB) preserves Cloudflare R2 free tier capacity for 35,000+ photos.
- **Listing Auto-Expiry:** 45-day auto-expiry with 1-click renewal ensures inventory stays fresh with zero dead listings.
- **AdSense & SEO Optimized:** Structured JSON-LD schema, locality guides, and full legal compliance pages for swift Google AdSense approval.

---

## 📁 Project Structure

```text
E:\nct prop\
├── api/                       # Cloudflare Workers API (Hono router)
│   ├── migrations/            # Cloudflare D1 SQL schemas & sample seed data
│   │   ├── 0001_initial_schema.sql
│   │   └── 0002_seed_sample_data.sql
│   ├── src/
│   │   ├── routes/            # listings, cities, upload, leads, auth, admin
│   │   ├── middleware/        # CORS & Auth verification
│   │   ├── index.ts           # Hono entrypoint
│   │   └── types.ts           # Worker bindings
│   └── wrangler.jsonc         # Cloudflare Worker, D1 & R2 configuration
│
├── web/                       # Cloudflare Pages Frontend (Vite + React + Tailwind)
│   ├── src/
│   │   ├── components/        # Navbar, PropertyCard, Footer, AdSlot
│   │   ├── pages/             # Home, SearchResults, Detail, PostProperty, MyListings, Static
│   │   ├── lib/               # API client, WhatsApp helper, Auth context
│   │   ├── App.tsx            # Main application router
│   │   └── main.tsx
│   ├── public/                # Favicon, assets
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── shared/                    # Shared TypeScript interfaces & Delhi-NCR seed data
│   └── src/index.ts           # DELHI_NCR_CITIES taxonomy, formatPriceINR, buildWhatsAppLink
│
└── docs/                      # Deployment & Architecture Guides
    └── FREE_TIER_DEPLOYMENT_GUIDE.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Local D1 Database & Seed
```bash
npm run db:migrate:local
npm run db:seed:local
```

### 3. Launch Development Servers
- **Start Worker API (`http://localhost:8787`):**
  ```bash
  npm run dev:api
  ```
- **Start Web Frontend (`http://localhost:5173`):**
  ```bash
  npm run dev:web
  ```

---

## 🌐 Free Production Deployment

Refer to [`docs/FREE_TIER_DEPLOYMENT_GUIDE.md`](./docs/FREE_TIER_DEPLOYMENT_GUIDE.md) for step-by-step instructions on deploying the API to Cloudflare Workers and the Frontend to Cloudflare Pages.
