
-- ==========================================
-- 1. EXTEND site_settings
-- ==========================================
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS brand_name text NOT NULL DEFAULT 'Dona Dora',
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS primary_color text NOT NULL DEFAULT '#0a0a0a',
  ADD COLUMN IF NOT EXISTS accent_color text NOT NULL DEFAULT '#c9a84c',
  ADD COLUMN IF NOT EXISTS bg_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS hero_cta_text text NOT NULL DEFAULT 'Conhecer a coleção',
  ADD COLUMN IF NOT EXISTS hero_cta_link text NOT NULL DEFAULT '#colecao',
  ADD COLUMN IF NOT EXISTS instagram_url text NOT NULL DEFAULT 'https://instagram.com',
  ADD COLUMN IF NOT EXISTS instagram_handle text NOT NULL DEFAULT '@donadora',
  ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT 'Av. Adolfo Konder, 2659 · Bairro Esquina · Urubici/SC',
  ADD COLUMN IF NOT EXISTS hours_weekday text NOT NULL DEFAULT 'Seg–Sex · 09h às 18h30',
  ADD COLUMN IF NOT EXISTS hours_saturday text NOT NULL DEFAULT 'Sábado · 09h às 17h',
  ADD COLUMN IF NOT EXISTS vip_title text NOT NULL DEFAULT 'Grupo VIP Dona Dora',
  ADD COLUMN IF NOT EXISTS vip_subtitle text NOT NULL DEFAULT '✨ Bem-vinda ao Grupo VIP Dona Dora! Aqui você recebe novidades, promoções e lançamentos antes de todo mundo.',
  ADD COLUMN IF NOT EXISTS vip_benefits jsonb NOT NULL DEFAULT '["Acesso antecipado às novidades","Promoções exclusivas","Condições especiais","Avisos de reposição","Prioridade no atendimento","Sugestões de peças e presentes"]'::jsonb,
  ADD COLUMN IF NOT EXISTS vip_link text NOT NULL DEFAULT 'https://chat.whatsapp.com/',
  ADD COLUMN IF NOT EXISTS vip_image_url text,
  ADD COLUMN IF NOT EXISTS seo_keywords text NOT NULL DEFAULT 'boutique urubici, moda feminina urubici, moda masculina, acessórios, joias, dona dora',
  ADD COLUMN IF NOT EXISTS seo_og_image text,
  ADD COLUMN IF NOT EXISTS dora_welcome_message text NOT NULL DEFAULT 'Oi! Eu sou a Dora 😊 Posso te ajudar a encontrar a peça perfeita. Me conta: o que você procura hoje?';

-- ==========================================
-- 2. EXTEND products
-- ==========================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS promo_price numeric,
  ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS colors text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS alt_text text;

-- ==========================================
-- 3. EXTEND leads
-- ==========================================
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS read boolean NOT NULL DEFAULT false;

-- Allow anonymous insert (chat Dora) so leads can be captured from the public site
DROP POLICY IF EXISTS leads_public_insert ON public.leads;
CREATE POLICY leads_public_insert ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous insert into conversations/messages for the Dora chat
DROP POLICY IF EXISTS conversations_public_insert ON public.conversations;
CREATE POLICY conversations_public_insert ON public.conversations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS conversations_public_update ON public.conversations;
CREATE POLICY conversations_public_update ON public.conversations
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS messages_public_insert ON public.messages;
CREATE POLICY messages_public_insert ON public.messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ==========================================
-- 4. STORAGE BUCKET
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('dona-dora', 'dona-dora', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "dona_dora_public_read" ON storage.objects;
CREATE POLICY "dona_dora_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'dona-dora');

DROP POLICY IF EXISTS "dona_dora_admin_write" ON storage.objects;
CREATE POLICY "dona_dora_admin_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dona-dora' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "dona_dora_admin_update" ON storage.objects;
CREATE POLICY "dona_dora_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'dona-dora' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "dona_dora_admin_delete" ON storage.objects;
CREATE POLICY "dona_dora_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'dona-dora' AND public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- 5. ADMIN USER
-- ==========================================
DO $$
DECLARE
  v_user_id uuid;
  v_existing uuid;
BEGIN
  SELECT id INTO v_existing FROM auth.users WHERE email = 'donadoraecommerce@gmail.com';

  IF v_existing IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
      'donadoraecommerce@gmail.com', crypt('1981@ju2512', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Dona Dora Admin"}'::jsonb,
      now(), now(), '', '', '', ''
    );
  ELSE
    v_user_id := v_existing;
    UPDATE auth.users
      SET encrypted_password = crypt('1981@ju2512', gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
      WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (v_user_id, 'donadoraecommerce@gmail.com', 'Dona Dora Admin')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
