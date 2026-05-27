
-- 1. Products: allow_virtual_try_on
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS allow_virtual_try_on boolean NOT NULL DEFAULT false;

-- 2. site_settings: virtual_tryon_enabled
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS virtual_tryon_enabled boolean NOT NULL DEFAULT true;

-- 3. wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY wishlist_self_all ON public.wishlist
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. customer_profiles
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  user_id uuid PRIMARY KEY,
  full_name text,
  phone text,
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_profiles TO authenticated;
GRANT ALL ON public.customer_profiles TO service_role;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_profiles_self_all ON public.customer_profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE TRIGGER customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. virtual_try_on_consents
CREATE TABLE IF NOT EXISTS public.virtual_try_on_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  selected_size text,
  selected_color text,
  consent_text text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.virtual_try_on_consents TO authenticated;
GRANT ALL ON public.virtual_try_on_consents TO service_role;
ALTER TABLE public.virtual_try_on_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY vtoc_self_select ON public.virtual_try_on_consents
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY vtoc_self_insert ON public.virtual_try_on_consents
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 6. virtual_try_on_sessions
CREATE TABLE IF NOT EXISTS public.virtual_try_on_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  selected_size text,
  selected_color text,
  original_image_path text,
  generated_image_path text,
  consent_accepted boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.virtual_try_on_sessions TO authenticated;
GRANT ALL ON public.virtual_try_on_sessions TO service_role;
ALTER TABLE public.virtual_try_on_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY vtos_self_select ON public.virtual_try_on_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid() AND deleted_at IS NULL);
CREATE POLICY vtos_self_insert ON public.virtual_try_on_sessions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY vtos_self_update ON public.virtual_try_on_sessions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY vtos_admin_count ON public.virtual_try_on_sessions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. private bucket virtual-tryon
INSERT INTO storage.buckets (id, name, public)
VALUES ('virtual-tryon', 'virtual-tryon', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY vtryon_owner_read ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'virtual-tryon' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY vtryon_owner_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'virtual-tryon' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY vtryon_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'virtual-tryon' AND auth.uid()::text = (storage.foldername(name))[1]);
