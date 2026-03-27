-- Migration to add missing columns for product and manufacturer visibility, and customer management.

-- 1. Update products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 2. Update manufacturers table
ALTER TABLE manufacturers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Update customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 4. Ensure RLS policies don't block access (basic setup)
-- Note: Replace with your actual table names if different.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON products FOR SELECT USING (true);

ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON manufacturers FOR SELECT USING (true);
