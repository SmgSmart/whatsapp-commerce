-- Create buckets for products and branding if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for 'products' bucket
-- Authenticated users (admins) can upload, update, and delete
-- Everyone (public) can read

-- Allow public read access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('products', 'branding'));

-- Allow admins to manage (Insert, Update, Delete)
DROP POLICY IF EXISTS "Admins can manage products" ON storage.objects;
CREATE POLICY "Admins can manage products" ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'products')
  WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Admins can manage branding" ON storage.objects;
CREATE POLICY "Admins can manage branding" ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'branding')
  WITH CHECK (bucket_id = 'branding');
