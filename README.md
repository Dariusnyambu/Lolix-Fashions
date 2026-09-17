# Lolix Fashions — E-Commerce Website

Thrift clothes, shoes, suits and beddings — a modern, WhatsApp-first e-commerce
storefront for Lolix Fashions (@lolixfashions), with a full admin dashboard.

## Stage 3 — Checkout, Customer Accounts & Category Images

- **Checkout**: full flow — customer details, delivery method selection
  (priced from `delivery_methods`, nothing hardcoded), and Cash on
  Delivery / WhatsApp / M-Pesa payment selection. Placing an order calls a
  single secure Postgres function (`place_order`, in
  `src/supabase/checkout_setup.sql`) rather than raw client-side inserts,
  because that's the only safe way to guarantee: prices are always read from
  the live `products` table (never trusted from the browser), stock is
  checked and decremented atomically so two people can't both buy the last
  item, and the whole order either writes completely or not at all. Orders
  placed this way appear immediately in the admin **Orders** dashboard.
- **Customer accounts**: `/account` is now a real sign-up/sign-in page
  (Supabase Auth), with a profile editor and order history once logged in.
  Guest checkout still works without an account.
- **Category images**: each category now shows a distinct, relevant photo
  (via `src/utils/categoryImages.ts`) instead of one shared placeholder —
  automatically overridden by whatever image an admin uploads in the
  Categories dashboard.

## Stage 1 — Foundation

- Project architecture (React + Vite + TypeScript + Tailwind CSS v4 + Supabase)
- Full database schema with Row Level Security (`src/supabase/schema.sql`)
- Starter seed data — categories, sizes, colors, badges, delivery methods (`src/supabase/seed.sql`)
- Brand design system — royal purple, gold, warm white palette
- Storefront pages: Home, Shop (filters/search/sort), Product Details, Cart
- WhatsApp ordering wired throughout (product page, cart, floating button)
- Wishlist + Cart (persisted locally, ready to sync to Supabase in Stage 3)
- Mobile-first responsive layout with sticky bottom navigation

## Stage 2 — Admin Dashboard & Login (this delivery)

- Secure admin login at `/admin/login` using Supabase Auth, with role-based
  access (customer / staff / admin) enforced by `AdminRoute` and Supabase RLS
- Auto-profile creation trigger (`src/supabase/auth_setup.sql`) plus a guide
  for promoting an account to admin
- Admin dashboard shell — dark sidebar navigation, distinct from the customer
  site, fully responsive with a mobile drawer
- **Overview**: sales/order/customer stats, low & out-of-stock alerts,
  14-day sales chart, orders-by-status pie chart
- **Products**: full CRUD, multi-image upload to Supabase Storage, badge
  assignment, duplicate product, category/subcategory linking
- **Categories**: create/deactivate categories, manage subcategories inline
- **Orders**: table with filters, detail view, order status + payment status
  updates
- **Customers**: list with order history drill-down
- **Inventory**: quick stock +/- adjustment, low-stock / out-of-stock filters
- **Offers**: percentage/fixed discounts with start/end dates and live status
- **Badges, Sizes, Colors**: full CRUD for product attribute management
- **Delivery**: manage delivery methods and pricing (no more hardcoded fees)
- **Banners**: homepage hero carousel management with image upload
- **Reviews**: approve / hide / delete customer reviews
- **Settings**: business info, social links, SEO defaults — no hardcoded
  business details anywhere in the app
- Admin bundle is code-split (lazy-loaded) so storefront visitors never
  download dashboard/chart code

**Not yet built** (coming in later stages): full checkout flow (delivery
method + Cash on Delivery/WhatsApp/M-Pesa selection), order placement writing
to Supabase, customer-facing account/order history, cart & wishlist synced to
Supabase for logged-in users, SEO metadata/sitemap generation.

## Getting Started

```bash
npm install
cp .env.example .env
# then fill in your Supabase project URL and anon key in .env
npm run dev
```

## Setting up Supabase

1. Create a new project at https://supabase.com
2. Open the SQL editor and run, in order:
   1. `src/supabase/schema.sql`
   2. `src/supabase/seed.sql`
   3. `src/supabase/auth_setup.sql`
   4. `src/supabase/checkout_setup.sql`
3. Copy your Project URL and anon public key into `.env`
4. Create two **public** Storage buckets: `product-images` and `banners`
5. Create your first admin login:
   - In the Supabase dashboard, go to **Authentication → Users → Add User**
     and create an account (e.g. `admin@lolixfashions.com` + a password)
   - In the SQL editor, run:
     ```sql
     update profiles set role = 'admin'
     where id = (select id from auth.users where email = 'admin@lolixfashions.com');
     ```
   - Sign in at `/admin/login` with that email and password
6. Add products, categories, badges, sizes, colors and delivery methods from
   the admin dashboard — no more manual table editing needed

## Deploying to Vercel

Two things trip people up every time — both are already fixed in this project,
but double-check them if the deployed site misbehaves:

1. **Environment variables aren't in your repo.** `.env` is gitignored on
   purpose (it's meant to stay local), so Vercel never sees your Supabase
   credentials unless you add them yourself:
   - Vercel dashboard → your project → **Settings → Environment Variables**
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values
     from your local `.env`
   - Redeploy after adding them (env vars only apply to *new* deployments)

2. **Client-side routing needs a rewrite rule.** Without it, visiting
   `/admin/login` directly (or refreshing any non-home route) returns a 404
   from Vercel's static file server, because it doesn't know those paths
   belong to the React app. This project includes `vercel.json` with the fix:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```
   Make sure this file is committed/uploaded — Vercel picks it up
   automatically.

If admin login still doesn't work after both are in place, check the browser
console on the deployed site the same way we debugged it locally.

```
src/
  admin/         AdminRoute guard (role-based access)
  components/    Reusable UI (product, cart, layout, whatsapp, ui, admin)
  pages/         Route-level pages (pages/admin/ for the dashboard)
  layouts/       Page shells (MainLayout for storefront, AdminLayout for dashboard)
  contexts/      Cart, Wishlist, Auth, Toast global state
  services/      Supabase data-fetching functions (services/admin/ for admin CRUD)
  lib/           Supabase client, class-name helper
  utils/         Formatting, WhatsApp message builders
  types/         Shared TypeScript types matching the DB schema
  supabase/      schema.sql, seed.sql, auth_setup.sql, checkout_setup.sql
```

## WhatsApp Number

Business WhatsApp: **0724 361 307** (auto-converted to `254724361307` for
`wa.me` links across the site).
