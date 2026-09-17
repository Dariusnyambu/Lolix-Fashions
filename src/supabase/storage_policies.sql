-- Run this once in the Supabase SQL Editor after creating the existing
-- `Lolix store` bucket. The bucket remains public so storefront image URLs
-- continue to work for shoppers; only staff can mutate its objects.

update storage.buckets
set public = true
where id = 'Lolix store';

alter table public.product_images enable row level security;

drop policy if exists "Public can view product images" on public.product_images;
create policy "Public can view product images"
  on public.product_images
  for select
  using (true);

drop policy if exists "Staff manage product images" on public.product_images;
create policy "Staff manage product images"
  on public.product_images
  for all
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "Staff upload product images" on storage.objects;
create policy "Staff upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'Lolix store'
    and public.is_staff()
  );

drop policy if exists "Staff view product images" on storage.objects;
create policy "Staff view product images"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'Lolix store'
    and public.is_staff()
  );

drop policy if exists "Staff update product images" on storage.objects;
create policy "Staff update product images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'Lolix store'
    and public.is_staff()
  )
  with check (
    bucket_id = 'Lolix store'
    and public.is_staff()
  );

drop policy if exists "Staff delete product images" on storage.objects;
create policy "Staff delete product images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'Lolix store'
    and public.is_staff()
  );
