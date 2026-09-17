-- ============================================================================
-- LOLIX FASHIONS — CHECKOUT SETUP
-- Run after schema.sql, seed.sql and auth_setup.sql.
--
-- Order creation is handled entirely inside this one Postgres function rather
-- than as separate client-side inserts, because checkout needs three things
-- client-side RLS policies can't safely give it:
--   1. Prices/totals computed from the live products table, never trusted
--      from the browser (a tampered client request can't discount itself).
--   2. Stock checked and decremented atomically in the same transaction, so
--      two customers buying the last item at the same moment can't both
--      succeed (row-level locking via `for update`).
--   3. A single atomic write across orders + order_items + payments + stock,
--      so a failure partway through never leaves a half-created order.
-- ============================================================================

create sequence if not exists order_number_seq start 1000;

create or replace function place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,2) := 0;
  v_delivery_fee numeric(12,2) := 0;
  v_total numeric(12,2);
  v_item jsonb;
  v_product record;
  v_qty int;
  v_unit_price numeric(12,2);
  v_line_total numeric(12,2);
  v_delivery_method_id uuid;
  v_payment_method text;
  v_payment_status payment_status;
  v_items jsonb;
begin
  v_delivery_method_id := nullif(payload->>'delivery_method_id', '')::uuid;
  v_payment_method := payload->>'payment_method';
  v_items := payload->'items';

  if v_items is null or jsonb_array_length(v_items) = 0 then
    raise exception 'Order must include at least one item';
  end if;

  if v_payment_method not in ('cod', 'whatsapp', 'mpesa') then
    raise exception 'Invalid payment method';
  end if;

  if v_delivery_method_id is not null then
    select price into v_delivery_fee from delivery_methods
      where id = v_delivery_method_id and is_active = true;
    if not found then
      raise exception 'Invalid delivery method';
    end if;
  end if;

  -- Pass 1: lock the rows we're about to sell, validate stock, price everything
  -- from the live database (client-sent prices are never used).
  for v_item in select * from jsonb_array_elements(v_items)
  loop
    v_qty := (v_item->>'quantity')::int;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Invalid quantity';
    end if;

    select id, name, normal_price, offer_price, stock_quantity, track_inventory, is_sold_out
      into v_product
      from products
      where id = (v_item->>'product_id')::uuid
      for update;

    if not found then
      raise exception 'Product not found';
    end if;

    if v_product.is_sold_out then
      raise exception 'Sorry, "%" just sold out', v_product.name;
    end if;

    if v_product.track_inventory and v_product.stock_quantity < v_qty then
      raise exception 'Only % left in stock for "%"', v_product.stock_quantity, v_product.name;
    end if;

    v_unit_price := coalesce(v_product.offer_price, v_product.normal_price);
    v_subtotal := v_subtotal + (v_unit_price * v_qty);
  end loop;

  v_total := v_subtotal + v_delivery_fee;
  v_order_number := 'LX-' || lpad(nextval('order_number_seq')::text, 6, '0');
  v_payment_status := case when v_payment_method = 'mpesa' then 'awaiting_payment' else 'pending' end;

  insert into orders (
    order_number, user_id, customer_name, customer_phone, customer_email,
    subtotal, delivery_fee, total, delivery_method_id,
    county, town, delivery_location, delivery_instructions,
    payment_method, payment_status, order_status
  ) values (
    v_order_number,
    auth.uid(),
    payload->>'customer_name',
    payload->>'customer_phone',
    nullif(payload->>'customer_email', ''),
    v_subtotal, v_delivery_fee, v_total, v_delivery_method_id,
    payload->>'county', payload->>'town',
    nullif(payload->>'delivery_location', ''), nullif(payload->>'delivery_instructions', ''),
    v_payment_method::payment_method, v_payment_status, 'pending'
  ) returning id into v_order_id;

  -- Pass 2: write line items and decrement stock now that the order exists.
  for v_item in select * from jsonb_array_elements(v_items)
  loop
    v_qty := (v_item->>'quantity')::int;

    select id, name, normal_price, offer_price into v_product
      from products where id = (v_item->>'product_id')::uuid;

    v_unit_price := coalesce(v_product.offer_price, v_product.normal_price);
    v_line_total := v_unit_price * v_qty;

    insert into order_items (
      order_id, product_id, product_name, variant_id, size_label, color_name,
      unit_price, quantity, line_total
    ) values (
      v_order_id, v_product.id, v_product.name,
      nullif(v_item->>'variant_id', '')::uuid,
      nullif(v_item->>'size_label', ''),
      nullif(v_item->>'color_name', ''),
      v_unit_price, v_qty, v_line_total
    );

    update products
      set stock_quantity = greatest(0, stock_quantity - v_qty),
          is_sold_out = (greatest(0, stock_quantity - v_qty) = 0)
      where id = v_product.id and track_inventory = true;

    if nullif(v_item->>'variant_id', '') is not null then
      update product_variants
        set stock_quantity = greatest(0, stock_quantity - v_qty)
        where id = (v_item->>'variant_id')::uuid;
    end if;
  end loop;

  insert into payments (order_id, method, status, amount)
  values (v_order_id, v_payment_method::payment_method, v_payment_status, v_total);

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total', v_total
  );
end;
$$;

-- Anonymous (guest checkout) and logged-in customers both need to call this.
grant execute on function place_order(jsonb) to anon, authenticated;
