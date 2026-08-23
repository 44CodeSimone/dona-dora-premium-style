# Security: orders

- `public.orders` has Row Level Security (RLS) enabled.
- Order creation is permitted exclusively through the trusted server-side checkout flow (`createOrder`).
- Service-role credentials (`supabaseAdmin`) remain strictly server-only and bypass RLS to write authorized orders.
- The legacy direct browser insert policy `orders_public_insert` was removed remotely on Supabase Cloud.
- The corresponding migration file `20260821234621_8a71a813-dcc7-4c7c-9081-7e0ec09519b0.sql` is integrated in the remote repository history (`origin/main` commit `7cec064`).
- Administrative CRM actions continue through their authenticated server-side functions.
