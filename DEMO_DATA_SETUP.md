# Demo Data Setup Instructions

## Overview
This document explains how to populate your Supabase database with demo data for the Restaurant POS system demo.

## Step 1: Run the SQL Script

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase-demo-data.sql` 
4. Copy and paste the entire SQL script into the SQL Editor
5. Click **Run** to execute the script

## What the Script Creates

The script will populate your database with:

### Tables (10 tables)
- Table 1-10 with various statuses (free, occupied, bill-pending, reserved)
- Different zones (Main Hall, VIP Section, Window)
- Different capacities (2-8 seats)

### Menu Categories (7 categories)
1. Starters
2. Main Course
3. Desserts
4. Beverages
5. Soups
6. Salads
7. Bread & Rice

### Menu Items (35+ items)
- Realistic Indian restaurant menu items
- Prices in INR (₹)
- Properly categorized
- All items marked as available

### Orders (125+ orders)
- **25 orders** from last 7 days (recent)
- **20 orders** from last 4 weeks
- **80 orders** from last 12 months
- **5 active orders** (pending/preparing/ready)
- Orders spread across all tables
- Revenue: ~₹200,000+ total

### Order Items
- 2-5 items per order
- Properly linked to orders and menu items
- Realistic quantities (1-3 per item)

### Payments
- Payments for all paid orders
- Multiple payment methods (cash, card, upi, qr)
- Transaction IDs generated
- All marked as completed

## Expected Results After Running

After running the script, you should see:
- **Total Revenue**: ₹200,000+ 
- **Total Orders**: 125+
- **Tables Served**: 10
- **Average Bill**: ₹1,500-2,500

## Verifying the Data

After running the script, you can verify by:

1. **Check Admin Dashboard**: Go to `/dashboard/admin` - you should see:
   - Revenue charts with data
   - Category performance pie chart
   - Top selling items chart
   - No error messages in console

2. **Check Data Counts**: Run this query in SQL Editor:
```sql
SELECT 
  (SELECT COUNT(*) FROM menu_categories) as categories,
  (SELECT COUNT(*) FROM menu_items) as menu_items,
  (SELECT COUNT(*) FROM tables) as tables,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM order_items) as order_items,
  (SELECT COUNT(*) FROM payments) as payments,
  (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'paid') as total_revenue;
```

## Troubleshooting

### If you get errors about missing tables:
Make sure your Supabase database has the following tables created:
- `tables`
- `menu_categories`
- `menu_items`
- `orders`
- `order_items`
- `payments`

If tables don't exist, you'll need to create them first. The schema is defined in `lib/supabase.ts`.

### If orders/payments don't show up:
1. Check that the foreign key relationships are correct
2. Verify that `order_id` in payments matches `id` in orders
3. Make sure `menu_item_id` in order_items exists in menu_items

### If revenue shows as 0:
1. Verify that orders have `status = 'paid'`
2. Check that order totals are calculated correctly
3. Run the order total update query from the script again

## Next Steps

After data is loaded:
1. Refresh your admin dashboard
2. All 6 errors should be resolved
3. Charts should display with data
4. Revenue numbers should be visible

## Notes

- The script uses `ON CONFLICT DO NOTHING` so you can run it multiple times safely
- All dates are relative (using `NOW() - INTERVAL`) so data will always be recent
- Revenue numbers are randomized but realistic (₹800-3,000 per order)
- The data is designed to show good business performance for demo purposes


