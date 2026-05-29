-- 1) Live Shopping fields on site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS live_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS live_url text,
  ADD COLUMN IF NOT EXISTS live_title text NOT NULL DEFAULT 'Live Dona Dora',
  ADD COLUMN IF NOT EXISTS live_description text NOT NULL DEFAULT 'Acompanhe nossa live com novidades e promoções exclusivas.',
  ADD COLUMN IF NOT EXISTS live_featured_product_ids jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  author_name text NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL CHECK (char_length(comment) BETWEEN 3 AND 2000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

-- Grants
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can read only approved
CREATE POLICY reviews_public_read_approved
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Logged user can read own (any status)
CREATE POLICY reviews_self_read
  ON public.reviews FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Logged user can insert own (forced pending in app layer, also enforced here)
CREATE POLICY reviews_self_insert
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Logged user can delete own
CREATE POLICY reviews_self_delete
  ON public.reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admin: full access
CREATE POLICY reviews_admin_all
  ON public.reviews FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE TRIGGER reviews_set_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS reviews_product_idx ON public.reviews(product_id, status);
CREATE INDEX IF NOT EXISTS reviews_user_idx ON public.reviews(user_id);