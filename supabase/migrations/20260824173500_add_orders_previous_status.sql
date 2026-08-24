-- Migration: add previous_status column to orders table
--
-- Purpose: Supports the order trash-bin feature. This column stores the
--          operational status an order held immediately before it was moved
--          to trash, enabling safe restoration to the previous state.
--
-- Design decisions:
--   - TEXT (not enum) — matches the existing orders.status column type.
--   - NULL default — all existing rows correctly start with no previous_status.
--   - IF NOT EXISTS — idempotent: safe to run even if the column was applied
--     outside version-controlled migration history (e.g. via Lovable's direct
--     Supabase connection during development).
--   - No CHECK constraint — operational status validation is enforced
--     server-side in restoreOrder via an explicit allowlist in Zod/application
--     code, consistent with the existing schema design for orders.status.
--   - RLS is not modified — all trash-bin server functions use supabaseAdmin
--     (service role), which bypasses RLS by design.
--
-- DO NOT execute this migration manually or via Supabase CLI without explicit
-- authorization from the project owner (Simone).

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS previous_status TEXT NULL;

COMMENT ON COLUMN public.orders.previous_status IS
  'Operational status immediately before this order was moved to trash. '
  'NULL for all non-trashed orders. '
  'Set server-side by trashOrder; cleared server-side by restoreOrder. '
  'Must never be supplied by the client.';
