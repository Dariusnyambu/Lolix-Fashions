-- ============================================================================
-- LOLIX FASHIONS — SEED DATA
-- Run after schema.sql. Populates starter categories, sizes, colors,
-- badges and delivery methods so the storefront isn't empty on first connect.
-- Products should be added via the admin dashboard.
--
-- Safe to run more than once — every insert uses ON CONFLICT DO NOTHING,
-- so re-running this script will not throw duplicate key errors.
-- ============================================================================

-- Categories
insert into categories (name, slug, display_order) values
  ('Thrift Clothes', 'thrift-clothes', 1),
  ('Shoes', 'shoes', 2),
  ('Suits', 'suits', 3),
  ('Beddings', 'beddings', 4),
  ('New Arrivals', 'new-arrivals', 5),
  ('Offers', 'offers', 6)
on conflict (slug) do nothing;

-- Subcategories
insert into subcategories (category_id, name, slug, display_order)
select id, sub.name, sub.slug, sub.ord
from categories, (values
  ('Dresses', 'dresses', 1),
  ('Tops', 'tops', 2),
  ('Trousers', 'trousers', 3),
  ('Jackets', 'jackets', 4),
  ('Sweaters', 'sweaters', 5)
) as sub(name, slug, ord)
where categories.slug = 'thrift-clothes'
on conflict (category_id, slug) do nothing;

insert into subcategories (category_id, name, slug, display_order)
select id, sub.name, sub.slug, sub.ord
from categories, (values
  ('Sneakers', 'sneakers', 1),
  ('Heels', 'heels', 2),
  ('Boots', 'boots', 3),
  ('Sandals', 'sandals', 4)
) as sub(name, slug, ord)
where categories.slug = 'shoes'
on conflict (category_id, slug) do nothing;

insert into subcategories (category_id, name, slug, display_order)
select id, sub.name, sub.slug, sub.ord
from categories, (values
  ('Men''s Suits', 'mens-suits', 1),
  ('Women''s Suits', 'womens-suits', 2)
) as sub(name, slug, ord)
where categories.slug = 'suits'
on conflict (category_id, slug) do nothing;

insert into subcategories (category_id, name, slug, display_order)
select id, sub.name, sub.slug, sub.ord
from categories, (values
  ('Bedsheets', 'bedsheets', 1),
  ('Duvets', 'duvets', 2),
  ('Blankets', 'blankets', 3),
  ('Comforters', 'comforters', 4)
) as sub(name, slug, ord)
where categories.slug = 'beddings'
on conflict (category_id, slug) do nothing;

-- Sizes: clothing
insert into sizes (label, size_group, display_order) values
  ('XS', 'clothing', 1),
  ('S', 'clothing', 2),
  ('M', 'clothing', 3),
  ('L', 'clothing', 4),
  ('XL', 'clothing', 5),
  ('XXL', 'clothing', 6)
on conflict (label) do nothing;

-- Sizes: shoes
insert into sizes (label, size_group, display_order) values
  ('36', 'shoes', 10), ('37', 'shoes', 11), ('38', 'shoes', 12), ('39', 'shoes', 13),
  ('40', 'shoes', 14), ('41', 'shoes', 15), ('42', 'shoes', 16), ('43', 'shoes', 17), ('44', 'shoes', 18)
on conflict (label) do nothing;

-- Sizes: bedding
insert into sizes (label, size_group, display_order) values
  ('Single', 'bedding', 20),
  ('Double', 'bedding', 21),
  ('Queen', 'bedding', 22),
  ('King', 'bedding', 23)
on conflict (label) do nothing;

-- Colors
insert into colors (name, hex_code) values
  ('Black', '#1a1a1a'),
  ('White', '#ffffff'),
  ('Maroon', '#7b1e3a'),
  ('Navy Blue', '#1e2a4a'),
  ('Beige', '#e8dcc4'),
  ('Grey', '#8a8a8a'),
  ('Gold', '#d4af37'),
  ('Purple', '#5b21b6')
on conflict (name) do nothing;

-- Badges
insert into badges (label, bg_color, text_color) values
  ('NEW', '#5B21B6', '#FFFFFF'),
  ('SALE', '#D4AF37', '#3B1578'),
  ('HOT', '#DC2626', '#FFFFFF'),
  ('TRENDING', '#6D28D9', '#FFFFFF'),
  ('BEST SELLER', '#4C1D95', '#FFFFFF'),
  ('LIMITED', '#967621', '#FFFFFF'),
  ('SOLD OUT', '#6B7280', '#FFFFFF'),
  ('FEATURED', '#B8942A', '#FFFFFF')
on conflict (label) do nothing;

-- Delivery methods (no unique constraint on name, so guard with a NOT EXISTS check instead)
insert into delivery_methods (name, description, price, display_order)
select v.name, v.description, v.price, v.ord
from (values
  ('Nairobi Delivery', 'Delivered within Nairobi, 1-2 business days', 200, 1),
  ('Countrywide Delivery', 'Delivered anywhere in Kenya via courier, 2-4 business days', 400, 2),
  ('Pickup', 'Collect your order in person', 0, 3)
) as v(name, description, price, ord)
where not exists (select 1 from delivery_methods d where d.name = v.name);
