-- ============================================================================
-- LOLIX FASHIONS — SUPABASE / POSTGRESQL SCHEMA
-- Stage 1: Core foundation schema
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================
create type user_role as enum ('customer', 'admin', 'staff');
create type product_condition as enum ('new', 'thrift_premium', 'thrift_standard');
create type order_status as enum ('pending', 'confirmed', 'processing', 'ready_for_delivery', 'shipped', 'delivered', 'cancelled');
create type payment_status as enum ('pending', 'awaiting_payment', 'paid', 'failed', 'refunded');
create type payment_method as enum ('cod', 'whatsapp', 'mpesa');
create type discount_type as enum ('percentage', 'fixed_amount');
create type review_status as enum ('pending', 'approved', 'hidden');

-- ============================================================================
-- PROFILES (extends auth.users)
-- ============================================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- CATEGORIES & SUBCATEGORIES
-- ============================================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  slug text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (category_id, slug)
);

-- ============================================================================
-- SIZES & COLORS (flexible, reusable across product categories)
-- ============================================================================
create table sizes (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,        -- e.g. 'M', '42', 'King', 'One Size'
  size_group text not null,          -- e.g. 'clothing', 'shoes', 'bedding'
  display_order int not null default 0
);

create table colors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,         -- e.g. 'Maroon'
  hex_code text                      -- e.g. '#7B1E3A'
);

-- ============================================================================
-- BADGES
-- ============================================================================
create table badges (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,        -- NEW, SALE, HOT, TRENDING, BEST SELLER, LIMITED, SOLD OUT, FEATURED
  bg_color text not null default '#5B21B6',
  text_color text not null default '#FFFFFF',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- PRODUCTS
-- ============================================================================
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references categories(id) on delete set null,
  subcategory_id uuid references subcategories(id) on delete set null,
  brand text,
  sku text unique,
  condition product_condition not null default 'thrift_standard',

  normal_price numeric(12,2) not null,
  offer_price numeric(12,2),         -- nullable; when set, product is "on offer"

  stock_quantity int not null default 0,
  track_inventory boolean not null default true,
  is_sold_out boolean not null default false,

  weight_kg numeric(8,2),
  dimensions text,                    -- free text e.g. "180x220 cm" for beddings

  is_featured boolean not null default false,
  is_available boolean not null default true,

  tags text[] default '{}',

  seo_title text,
  seo_description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on products(category_id);
create index idx_products_slug on products(slug);
create index idx_products_featured on products(is_featured) where is_featured = true;
create index idx_products_available on products(is_available) where is_available = true;

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  display_order int not null default 0,
  alt_text text
);

create index idx_product_images_product on product_images(product_id);

-- Product variants: combination of size/color with its own stock override (optional)
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size_id uuid references sizes(id) on delete set null,
  color_id uuid references colors(id) on delete set null,
  stock_quantity int not null default 0,
  sku_suffix text,
  created_at timestamptz not null default now(),
  unique (product_id, size_id, color_id)
);

create table product_badges (
  product_id uuid not null references products(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  primary key (product_id, badge_id)
);

-- ============================================================================
-- OFFERS
-- ============================================================================
create table offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  discount_type discount_type not null,
  discount_value numeric(12,2) not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table offer_products (
  offer_id uuid not null references offers(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (offer_id, product_id, category_id)
);

-- ============================================================================
-- BANNERS (homepage hero carousel)
-- ============================================================================
create table banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  heading text,
  subtitle text,
  cta_label text,
  cta_link text,
  display_order int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- CART & WISHLIST
-- ============================================================================
create table carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  session_id text,                    -- for guest carts
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);

create table wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade unique,
  created_at timestamptz not null default now()
);

create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references wishlists(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

-- ============================================================================
-- ADDRESSES
-- ============================================================================
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  county text not null,
  town text not null,
  delivery_location text,
  instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- DELIVERY METHODS
-- ============================================================================
create table delivery_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- 'Nairobi Delivery', 'Countrywide Delivery', 'Pickup'
  description text,
  price numeric(12,2) not null default 0,
  is_active boolean not null default true,
  display_order int not null default 0
);

-- ============================================================================
-- ORDERS
-- ============================================================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,  -- e.g. LX-100234
  user_id uuid references profiles(id) on delete set null,

  customer_name text not null,
  customer_phone text not null,
  customer_email text,

  subtotal numeric(12,2) not null,
  delivery_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null,

  delivery_method_id uuid references delivery_methods(id) on delete set null,
  county text,
  town text,
  delivery_location text,
  delivery_instructions text,

  payment_method payment_method not null,
  payment_status payment_status not null default 'pending',
  order_status order_status not null default 'pending',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_number on orders(order_number);
create index idx_orders_user on orders(user_id);
create index idx_orders_status on orders(order_status);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,          -- snapshot at time of order
  variant_id uuid references product_variants(id) on delete set null,
  size_label text,
  color_name text,
  unit_price numeric(12,2) not null,
  quantity int not null,
  line_total numeric(12,2) not null
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  method payment_method not null,
  status payment_status not null default 'pending',
  amount numeric(12,2) not null,
  mpesa_receipt_number text,           -- populated when M-Pesa STK Push integration is connected
  mpesa_checkout_request_id text,
  raw_provider_response jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- REVIEWS
-- ============================================================================
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  status review_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index idx_reviews_product on reviews(product_id) where status = 'approved';

-- ============================================================================
-- SETTINGS (single-row config table)
-- ============================================================================
create table settings (
  id int primary key default 1,
  business_name text not null default 'Lolix Fashions',
  logo_url text,
  phone text not null default '0724361307',
  whatsapp_number text not null default '254724361307',
  tiktok_url text default 'https://www.tiktok.com/@lolixfashions',
  facebook_url text,
  instagram_url text,
  business_description text default 'Thrift clothes, shoes, suits and beddings',
  currency text not null default 'KSh',
  seo_default_title text default 'Lolix Fashions — Thrift Clothes, Shoes, Suits & Beddings in Kenya',
  seo_default_description text default 'Shop premium thrift clothes, shoes, suits and beddings at Lolix Fashions. Order via website or WhatsApp for fast delivery across Kenya.',
  constraint single_row check (id = 1)
);

insert into settings (id) values (1);

-- ============================================================================
-- TIMESTAMP TRIGGERS
-- ============================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_products_updated before update on products
  for each row execute function set_updated_at();
create trigger trg_orders_updated before update on orders
  for each row execute function set_updated_at();
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();
create trigger trg_carts_updated before update on carts
  for each row execute function set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table wishlists enable row level security;
alter table wishlist_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table products enable row level security;
alter table categories enable row level security;
alter table settings enable row level security;

-- Helper: is the current user an admin/staff?
create or replace function is_staff()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$ language sql security definer stable;

-- Public read access to catalog data
create policy "Public can view active products" on products
  for select using (is_available = true or is_staff());
create policy "Public can view categories" on categories
  for select using (true);
create policy "Public can view settings" on settings
  for select using (true);
create policy "Public can view approved reviews" on reviews
  for select using (status = 'approved' or is_staff());

-- Profiles: users manage their own profile; staff can view all
create policy "Users manage own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Staff can view all profiles" on profiles
  for select using (is_staff());

-- Addresses: owner only
create policy "Users manage own addresses" on addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cart: owner only (guest carts handled via session_id at app layer with anon key)
create policy "Users manage own cart" on carts
  for all using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);
create policy "Users manage own cart items" on cart_items
  for all using (
    exists (select 1 from carts c where c.id = cart_id and (c.user_id = auth.uid() or c.user_id is null))
  );

-- Wishlist: owner only
create policy "Users manage own wishlist" on wishlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own wishlist items" on wishlist_items
  for all using (
    exists (select 1 from wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
  );

-- Orders: owner or staff
create policy "Users view own orders" on orders
  for select using (auth.uid() = user_id or is_staff());
create policy "Users create own orders" on orders
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "Staff manage orders" on orders
  for update using (is_staff());
create policy "Order items follow order access" on order_items
  for select using (
    exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_staff()))
  );
create policy "Payments follow order access" on payments
  for select using (
    exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_staff()))
  );

-- Reviews: users create their own; staff moderate
create policy "Users create reviews" on reviews
  for insert with check (auth.uid() = user_id);
create policy "Staff manage reviews" on reviews
  for update using (is_staff());

-- Staff-only management on catalog tables
create policy "Staff manage products" on products
  for insert with check (is_staff());
create policy "Staff update products" on products
  for update using (is_staff());
create policy "Staff delete products" on products
  for delete using (is_staff());
create policy "Staff manage categories" on categories
  for all using (is_staff()) with check (is_staff());
create policy "Staff manage settings" on settings
  for update using (is_staff());
