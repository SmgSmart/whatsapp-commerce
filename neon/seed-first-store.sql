-- Replace the placeholders, then run this once after neon/schema.sql.
-- The admin user id should match your Neon Auth user id.

WITH new_store AS (
  INSERT INTO stores (
    owner_id,
    slug,
    business_name,
    whatsapp_number,
    tagline,
    location,
    active
  )
  VALUES (
    'REPLACE_WITH_NEON_AUTH_USER_ID',
    'demo-store',
    'Demo Store',
    '+233201234567',
    'Quality products, delivered fast',
    'Accra, Ghana',
    true
  )
  RETURNING id
)
INSERT INTO store_admins (store_id, user_id, role)
SELECT id, '9cf33718-487f-4340-8bd9-9aa38cab6af2', 'owner'
FROM new_store;

INSERT INTO categories (store_id, name, display_order, active)
SELECT id, 'Electronics', 1, true FROM stores WHERE slug = 'demo-store'
UNION ALL
SELECT id, 'Fashion', 2, true FROM stores WHERE slug = 'demo-store';
