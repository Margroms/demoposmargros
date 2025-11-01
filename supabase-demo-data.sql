-- Demo Data for Restaurant POS System
-- Run this in Supabase SQL Editor

-- First, clear existing data (optional - uncomment if needed)
-- TRUNCATE TABLE payments, order_items, orders, menu_items, menu_categories, tables RESTART IDENTITY CASCADE;

-- 1. Insert Tables
INSERT INTO tables (number, capacity, status, zone, seats, created_at, updated_at)
VALUES
  (1, 4, 'free', 'Main Hall', 4, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (2, 2, 'occupied', 'Main Hall', 2, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (3, 6, 'free', 'VIP Section', 6, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (4, 4, 'free', 'Main Hall', 4, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (5, 2, 'bill-pending', 'Window', 2, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (6, 8, 'free', 'VIP Section', 8, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (7, 4, 'occupied', 'Main Hall', 4, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (8, 2, 'free', 'Window', 2, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (9, 6, 'free', 'Main Hall', 6, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (10, 4, 'reserved', 'VIP Section', 4, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- 2. Insert Menu Categories
INSERT INTO menu_categories (name, display_order, created_at, updated_at)
VALUES
  ('Starters', 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('Main Course', 2, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('Desserts', 3, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('Beverages', 4, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('Soups', 5, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('Salads', 6, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('Bread & Rice', 7, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- 3. Insert Menu Items (with realistic prices in INR)
-- Starters (category 1)
INSERT INTO menu_items (name, price, category_id, description, is_available, created_at, updated_at)
SELECT name, price, (SELECT id FROM menu_categories WHERE display_order = 1 LIMIT 1), description, is_available, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
FROM (VALUES
  ('Paneer Tikka', 280, 'Grilled cottage cheese with spices', true),
  ('Chicken Wings', 320, 'Spicy fried chicken wings', true),
  ('Spring Rolls', 220, 'Crispy vegetable spring rolls', true),
  ('Fish Fingers', 290, 'Breaded fish fingers with tartar sauce', true),
  ('Cheese Balls', 250, 'Deep fried cheese balls', true)
) AS v(name, price, description, is_available)
ON CONFLICT DO NOTHING;

-- Main Course (category 2)
INSERT INTO menu_items (name, price, category_id, description, is_available, created_at, updated_at)
SELECT name, price, (SELECT id FROM menu_categories WHERE display_order = 2 LIMIT 1), description, is_available, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
FROM (VALUES
  ('Butter Chicken', 380, 'Creamy tomato curry with chicken', true),
  ('Chicken Biryani', 350, 'Aromatic basmati rice with spiced chicken', true),
  ('Paneer Makhani', 340, 'Cottage cheese in rich tomato gravy', true),
  ('Lamb Curry', 420, 'Tender lamb in aromatic curry', true),
  ('Fish Curry', 380, 'Fresh fish in coconut curry', true),
  ('Dal Makhani', 280, 'Creamy black lentils', true),
  ('Chicken Curry', 360, 'Traditional chicken curry', true)
) AS v(name, price, description, is_available)
ON CONFLICT DO NOTHING;

-- Desserts (category 3)
INSERT INTO menu_items (name, price, category_id, description, is_available, created_at, updated_at)
SELECT name, price, (SELECT id FROM menu_categories WHERE display_order = 3 LIMIT 1), description, is_available, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
FROM (VALUES
  ('Gulab Jamun', 150, 'Sweet milk dumplings in syrup', true),
  ('Ice Cream', 180, 'Vanilla ice cream with toppings', true),
  ('Chocolate Brownie', 200, 'Warm chocolate brownie with ice cream', true),
  ('Kheer', 160, 'Traditional rice pudding', true),
  ('Cheesecake', 220, 'New York style cheesecake', true)
) AS v(name, price, description, is_available)
ON CONFLICT DO NOTHING;

-- Beverages (category 4)
INSERT INTO menu_items (name, price, category_id, description, is_available, created_at, updated_at)
SELECT name, price, (SELECT id FROM menu_categories WHERE display_order = 4 LIMIT 1), description, is_available, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
FROM (VALUES
  ('Fresh Lime Soda', 80, 'Refreshing lime soda', true),
  ('Mango Lassi', 120, 'Sweet mango yogurt drink', true),
  ('Fresh Orange Juice', 100, 'Freshly squeezed orange juice', true),
  ('Cola', 70, 'Soft drink', true),
  ('Coffee', 90, 'Hot coffee', true),
  ('Tea', 60, 'Masala tea', true),
  ('Beer', 180, 'Draft beer', true)
) AS v(name, price, description, is_available)
ON CONFLICT DO NOTHING;

-- Soups (category 5)
INSERT INTO menu_items (name, price, category_id, description, is_available, created_at, updated_at)
SELECT name, price, (SELECT id FROM menu_categories WHERE display_order = 5 LIMIT 1), description, is_available, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
FROM (VALUES
  ('Tomato Soup', 140, 'Creamy tomato soup', true),
  ('Chicken Soup', 160, 'Clear chicken soup', true),
  ('Vegetable Soup', 130, 'Mixed vegetable soup', true)
) AS v(name, price, description, is_available)
ON CONFLICT DO NOTHING;

-- Salads (category 6)
INSERT INTO menu_items (name, price, category_id, description, is_available, created_at, updated_at)
SELECT name, price, (SELECT id FROM menu_categories WHERE display_order = 6 LIMIT 1), description, is_available, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
FROM (VALUES
  ('Garden Salad', 180, 'Fresh mixed vegetables', true),
  ('Caesar Salad', 220, 'Romaine lettuce with caesar dressing', true),
  ('Chicken Salad', 260, 'Grilled chicken with vegetables', true)
) AS v(name, price, description, is_available)
ON CONFLICT DO NOTHING;

-- Bread & Rice (category 7)
INSERT INTO menu_items (name, price, category_id, description, is_available, created_at, updated_at)
SELECT name, price, (SELECT id FROM menu_categories WHERE display_order = 7 LIMIT 1), description, is_available, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
FROM (VALUES
  ('Naan', 50, 'Fresh baked naan', true),
  ('Butter Naan', 60, 'Buttered naan', true),
  ('Garlic Naan', 70, 'Garlic flavored naan', true),
  ('Basmati Rice', 100, 'Steamed basmati rice', true),
  ('Jeera Rice', 120, 'Cumin flavored rice', true)
) AS v(name, price, description, is_available)
ON CONFLICT DO NOTHING;

-- 4. Generate Orders with good spread across time periods
-- Recent orders (last 7 days)
INSERT INTO orders (table_id, status, subtotal, discount, total, payment_method, created_at, updated_at)
SELECT 
  t.id,
  'paid',
  ROUND((random() * 2000 + 800)::numeric, 2),
  ROUND((random() * 100)::numeric, 2),
  ROUND((random() * 2000 + 800)::numeric, 2),
  (ARRAY['cash', 'card', 'upi', 'qr'])[floor(random() * 4 + 1)],
  NOW() - (random() * INTERVAL '7 days'),
  NOW() - (random() * INTERVAL '7 days')
FROM tables t
CROSS JOIN generate_series(1, 3)  -- 3 orders per table for last 7 days
LIMIT 25;

-- Orders from last 4 weeks
INSERT INTO orders (table_id, status, subtotal, discount, total, payment_method, created_at, updated_at)
SELECT 
  t.id,
  'paid',
  ROUND((random() * 2500 + 1000)::numeric, 2),
  ROUND((random() * 150)::numeric, 2),
  ROUND((random() * 2500 + 1000)::numeric, 2),
  (ARRAY['cash', 'card', 'upi', 'qr'])[floor(random() * 4 + 1)],
  NOW() - (random() * INTERVAL '28 days'),
  NOW() - (random() * INTERVAL '28 days')
FROM tables t
CROSS JOIN generate_series(1, 2)  -- 2 orders per table for last 4 weeks
LIMIT 20;

-- Orders from last 12 months
INSERT INTO orders (table_id, status, subtotal, discount, total, payment_method, created_at, updated_at)
SELECT 
  t.id,
  'paid',
  ROUND((random() * 3000 + 1200)::numeric, 2),
  ROUND((random() * 200)::numeric, 2),
  ROUND((random() * 3000 + 1200)::numeric, 2),
  (ARRAY['cash', 'card', 'upi', 'qr'])[floor(random() * 4 + 1)],
  NOW() - (random() * INTERVAL '365 days'),
  NOW() - (random() * INTERVAL '365 days')
FROM tables t
CROSS JOIN generate_series(1, 8)  -- 8 orders per table for last year
LIMIT 80;

-- Some pending/preparing/ready orders
INSERT INTO orders (table_id, status, subtotal, discount, total, created_at, updated_at)
SELECT 
  t.id,
  (ARRAY['pending', 'preparing', 'ready'])[floor(random() * 3 + 1)],
  ROUND((random() * 1500 + 500)::numeric, 2),
  0,
  ROUND((random() * 1500 + 500)::numeric, 2),
  NOW() - (random() * INTERVAL '2 hours'),
  NOW() - (random() * INTERVAL '2 hours')
FROM tables t
LIMIT 5;

-- 5. Insert Order Items
INSERT INTO order_items (order_id, menu_item_id, quantity, price, created_at)
SELECT 
  o.id,
  mi.id,
  floor(random() * 3 + 1)::int,  -- quantity between 1-3
  mi.price,
  o.created_at
FROM orders o
CROSS JOIN LATERAL (
  SELECT id, price FROM menu_items 
  ORDER BY random() 
  LIMIT floor(random() * 4 + 2)::int  -- 2-5 items per order
) mi;

-- Update order totals based on order_items
UPDATE orders o
SET 
  subtotal = (
    SELECT COALESCE(SUM(price * quantity), 0)
    FROM order_items oi
    WHERE oi.order_id = o.id
  ),
  total = (
    SELECT COALESCE(SUM(price * quantity), 0) - o.discount
    FROM order_items oi
    WHERE oi.order_id = o.id
  )
WHERE o.status = 'paid';

-- 6. Insert Payments for paid orders
INSERT INTO payments (order_id, amount, payment_method, status, transaction_id, created_at)
SELECT 
  o.id,
  o.total,
  COALESCE(o.payment_method, 'cash'),
  'completed',
  'TXN' || LPAD((o.id::text), 8, '0'),
  o.updated_at
FROM orders o
WHERE o.status = 'paid';

-- Summary
SELECT 
  'Data Inserted' as status,
  (SELECT COUNT(*) FROM menu_categories) as categories,
  (SELECT COUNT(*) FROM menu_items) as menu_items,
  (SELECT COUNT(*) FROM tables) as tables,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM order_items) as order_items,
  (SELECT COUNT(*) FROM payments) as payments,
  (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'paid') as total_revenue;

