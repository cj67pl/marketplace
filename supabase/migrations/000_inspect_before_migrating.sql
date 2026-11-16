-- Run these in the SQL Editor BEFORE the migration (read-only).

-- A) listings columns. Expect: id, title, description, price, category,
--    seller_email, image_url, location, created_at, updated_at. No "status" yet.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'listings'
ORDER BY ordinal_position;

-- B) Existing policies. Expect "Anyone can create listings" on listings.
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- C) The updated_at trigger function must exist. Expect one row.
SELECT proname FROM pg_proc WHERE proname = 'update_updated_at_column';
