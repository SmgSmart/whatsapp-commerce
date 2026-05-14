/*
  # Seed demo data for ecommerce store

  Inserts sample business info, categories, and products for demonstration
*/

-- Clear existing data (if any)
DELETE FROM products;
DELETE FROM categories;
DELETE FROM business_info;

-- Insert business info
INSERT INTO business_info (
  business_name,
  logo_url,
  tagline,
  hero_banner_url,
  whatsapp_number,
  location,
  facebook_url,
  instagram_url
) VALUES (
  'Ghana Goods Store',
  'https://images.unsplash.com/photo-1599231512714-00226374eee7?w=100&h=100&fit=crop',
  'Quality Products, Delivered Fast',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&h=400&fit=crop',
  '+233 20 123 4567',
  'Accra, Kumasi, Takoradi, Tema',
  'https://facebook.com/ghanagoods',
  'https://instagram.com/ghanagoods'
);

-- Insert categories
INSERT INTO categories (name, display_order, active) VALUES
('Electronics', 1, true),
('Fashion', 2, true),
('Home & Garden', 3, true),
('Food & Beverages', 4, true);

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category_id, in_stock, display_order)
SELECT 
  'Wireless Headphones',
  'High quality sound with noise cancellation',
  89.99,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1),
  true,
  1
UNION ALL
SELECT
  'USB-C Charging Cable',
  'Durable 2-meter cable with fast charging',
  12.50,
  'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop',
  (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1),
  true,
  2
UNION ALL
SELECT
  'Classic T-Shirt',
  'Comfortable cotton t-shirt, multiple colors',
  24.99,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  (SELECT id FROM categories WHERE name = 'Fashion' LIMIT 1),
  true,
  1
UNION ALL
SELECT
  'Denim Jeans',
  'Premium quality, perfect fit',
  59.99,
  'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400&h=400&fit=crop',
  (SELECT id FROM categories WHERE name = 'Fashion' LIMIT 1),
  true,
  2
UNION ALL
SELECT
  'Ceramic Plant Pot',
  'Beautiful handcrafted pot for indoor plants',
  34.99,
  'https://images.unsplash.com/photo-1578500521702-25a2b55c9b59?w=400&h=400&fit=crop',
  (SELECT id FROM categories WHERE name = 'Home & Garden' LIMIT 1),
  true,
  1
UNION ALL
SELECT
  'Bamboo Cutting Board',
  'Large serving and cutting board',
  28.50,
  'https://images.unsplash.com/photo-1610855332276-d9621e3fc07c?w=400&h=400&fit=crop',
  (SELECT id FROM categories WHERE name = 'Home & Garden' LIMIT 1),
  true,
  2
UNION ALL
SELECT
  'Premium Coffee Beans',
  'Freshly roasted, 500g bag',
  19.99,
  'https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=400&h=400&fit=crop',
  (SELECT id FROM categories WHERE name = 'Food & Beverages' LIMIT 1),
  true,
  1
UNION ALL
SELECT
  'Organic Honey Jar',
  'Pure honey, 500ml jar',
  15.99,
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=400&h=400&fit=crop',
  (SELECT id FROM categories WHERE name = 'Food & Beverages' LIMIT 1),
  true,
  2;
