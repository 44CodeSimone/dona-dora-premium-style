
-- Products: novos campos
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pix_price numeric,
  ADD COLUMN IF NOT EXISTS installments integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique ON public.products(slug) WHERE slug IS NOT NULL;

-- Brands
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  description text,
  featured boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY brands_public_read ON public.brands FOR SELECT USING (active = true);
CREATE POLICY brands_admin_all ON public.brands FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER brands_set_updated_at BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_whatsapp text NOT NULL,
  customer_email text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  notes text,
  status text NOT NULL DEFAULT 'novo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_public_insert ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY orders_admin_read ON public.orders FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY orders_admin_update ON public.orders FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Site settings: novos campos
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS topbar_text text NOT NULL DEFAULT 'Faça seu pedido — enviamos para todo o Brasil',
  ADD COLUMN IF NOT EXISTS benefits jsonb NOT NULL DEFAULT '[
    {"title":"Enviamos para todo o Brasil","desc":"Receba sua peça com segurança em qualquer cidade."},
    {"title":"Compra segura · SSL","desc":"Atendimento protegido e ambiente confiável."},
    {"title":"Toda semana tem promoção","desc":"Novidades e descontos exclusivos para clientes."},
    {"title":"Garantia nos produtos","desc":"Qualidade selecionada peça a peça."}
  ]'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_methods jsonb NOT NULL DEFAULT '["Pix","Cartão de crédito","Cartão de débito","Dinheiro"]'::jsonb,
  ADD COLUMN IF NOT EXISTS policies jsonb NOT NULL DEFAULT '{"trocas":"Trocas em até 7 dias após o recebimento.","envio":"Enviamos para todo o Brasil.","privacidade":"Seus dados são tratados com sigilo."}'::jsonb,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS tiktok_url text;

-- Atualiza WhatsApp antigo
UPDATE public.site_settings
   SET whatsapp = '5549991210083',
       whatsapp_display = '(49) 99121-0083'
 WHERE id = 1
   AND (whatsapp = '5549991540421' OR whatsapp_display = '(49) 99154-0421' OR whatsapp IS NULL);

-- Default novo para futuros inserts
ALTER TABLE public.site_settings ALTER COLUMN whatsapp SET DEFAULT '5549991210083';
ALTER TABLE public.site_settings ALTER COLUMN whatsapp_display SET DEFAULT '(49) 99121-0083';
