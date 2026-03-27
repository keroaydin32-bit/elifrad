-- RLS (Row Level Security) Fix for Admin Access
-- Execute this in Supabase SQL Editor

-- Enable RLS for categories if not already enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access (everyone can see categories)
DROP POLICY IF EXISTS "Public Read Access" ON categories;
CREATE POLICY "Public Read Access" ON categories FOR SELECT USING (true);

-- Allow authenticated admins to perform all operations (CUD) on categories
DROP POLICY IF EXISTS "Admin Full Access" ON categories;
CREATE POLICY "Admin Full Access" ON categories
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM customers
            WHERE auth_id = auth.uid() AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM customers
            WHERE auth_id = auth.uid() AND is_admin = true
        )
    );

-- Also ensure Admin access for products
DROP POLICY IF EXISTS "Admin Full Access" ON products;
CREATE POLICY "Admin Full Access" ON products
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM customers
            WHERE auth_id = auth.uid() AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM customers
            WHERE auth_id = auth.uid() AND is_admin = true
        )
    );

-- Also ensure Admin access for manufacturers
DROP POLICY IF EXISTS "Admin Full Access" ON manufacturers;
CREATE POLICY "Admin Full Access" ON manufacturers
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM customers
            WHERE auth_id = auth.uid() AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM customers
            WHERE auth_id = auth.uid() AND is_admin = true
        )
    );
