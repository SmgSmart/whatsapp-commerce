-- Admins can manage business info
DROP POLICY IF EXISTS "Admins can manage business info" ON business_info;
CREATE POLICY "Admins can manage business info"
  ON business_info FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admins can manage categories
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admins can manage products
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
