-- ============================================================================
-- LOLIX FASHIONS — AUTH SETUP
-- Run after schema.sql and seed.sql.
-- Auto-creates a `profiles` row whenever someone signs up via Supabase Auth,
-- and shows how to promote an account to admin/staff.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- CREATING YOUR FIRST ADMIN LOGIN
-- ============================================================================
-- 1. In the Supabase dashboard, go to Authentication > Users > Add User.
--    Create the account with an email and password (e.g. admin@lolixfashions.com).
--    This automatically creates a matching row in `profiles` with role='customer'
--    thanks to the trigger above.
--
-- 2. Promote that account to admin by running this in the SQL editor
--    (replace the email with the one you used):
--
--    update profiles
--    set role = 'admin'
--    where id = (select id from auth.users where email = 'admin@lolixfashions.com');
--
-- 3. Sign in at /admin/login with that email and password.
--
-- To add staff members later (limited access, same login flow), create their
-- auth user the same way and set role = 'staff' instead of 'admin'.
