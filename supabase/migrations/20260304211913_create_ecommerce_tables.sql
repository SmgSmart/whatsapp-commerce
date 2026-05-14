/*
  # Create ecommerce tables for Ghana small business store

  1. New Tables
    - `business_info`: Store business details like name, logo, contact info
      - `id` (uuid, primary key)
      - `business_name` (text)
      - `logo_url` (text)
      - `tagline` (text)
      - `hero_banner_url` (text)
      - `whatsapp_number` (text)
      - `location` (text)
      - `facebook_url` (text)
      - `instagram_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `categories`: Product categories
      - `id` (uuid, primary key)
      - `name` (text)
      - `display_order` (integer)
      - `active` (boolean)
      - `created_at` (timestamp)
    
    - `products`: Store products with details
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `image_url` (text)
      - `category_id` (uuid, foreign key)
      - `in_stock` (boolean)
      - `display_order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Business info readable by all (public)
    - Categories readable by all (public)
    - Products readable by all (public)
*/

CREATE TABLE IF NOT EXISTS business_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL DEFAULT 'My Business',
  logo_url text,
  tagline text,
  hero_banner_url text,
  whatsapp_number text NOT NULL DEFAULT '+233201234567',
  location text,
  facebook_url text,
  instagram_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10, 2) NOT NULL,
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  in_stock boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business info is public"
  ON business_info FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Categories are public"
  ON categories FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Products are public"
  ON products FOR SELECT
  TO public
  USING (in_stock = true);
