import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

// Public-safe projection: excludes dora_system_prompt and lead_email
const PUBLIC_SETTINGS_COLUMNS =
  "id,brand_name,logo_url,primary_color,accent_color,bg_color,hero_title,hero_subtitle,hero_image_url,hero_cta_text,hero_cta_link,whatsapp,whatsapp_display,instagram_url,instagram_handle,facebook_url,tiktok_url,address,hours_weekday,hours_saturday,vip_title,vip_subtitle,vip_benefits,vip_link,vip_image_url,seo_title,seo_description,seo_keywords,seo_og_image,dora_welcome_message,topbar_text,benefits,payment_methods,policies,virtual_tryon_enabled,live_enabled,live_url,live_title,live_description,live_featured_product_ids,updated_at";

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select(PUBLIC_SETTINGS_COLUMNS)
    .eq("id", 1)
    .single();
  if (error) throw new Error(error.message);
  return data;
});

// Live: returns settings + the featured products (only when enabled)
export const getLiveData = createServerFn({ method: "GET" }).handler(async () => {
  const { data: s, error } = await supabaseAdmin
    .from("site_settings")
    .select("live_enabled,live_url,live_title,live_description,live_featured_product_ids")
    .eq("id", 1)
    .single();
  if (error) throw new Error(error.message);
  if (!s?.live_enabled) return { enabled: false, products: [] as any[], settings: s };
  const ids = Array.isArray(s.live_featured_product_ids) ? (s.live_featured_product_ids as string[]) : [];
  if (!ids.length) return { enabled: true, products: [], settings: s };
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id,name,price,promo_price,image_url,slug")
    .in("id", ids)
    .eq("active", true);
  return { enabled: true, products: products ?? [], settings: s };
});

// Public approved reviews
export const getApprovedReviews = createServerFn({ method: "GET" })
  .inputValidator((d: { product_id?: string; limit?: number } | undefined) =>
    z.object({ product_id: z.string().uuid().optional(), limit: z.number().int().min(1).max(50).optional() }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("reviews")
      .select("id,product_id,author_name,rating,comment,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 12);
    if (data.product_id) q = q.eq("product_id", data.product_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getPublicProducts = createServerFn({ method: "GET" })
  .inputValidator(
    (d: { category?: string; featured?: boolean; brand?: string; search?: string; limit?: number } | undefined) =>
      z
        .object({
          category: z.string().optional(),
          featured: z.boolean().optional(),
          brand: z.string().optional(),
          search: z.string().max(80).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin.from("products").select("*").eq("active", true);
    if (data.category) q = q.eq("category", data.category);
    if (data.featured) q = q.eq("featured", true);
    if (data.brand) q = q.eq("brand", data.brand);
    if (data.search) q = q.ilike("name", `%${data.search}%`);
    q = q.order("created_at", { ascending: false }).limit(data.limit ?? 24);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows;
  });

export const getPublicBrands = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("brands")
    .select("id,name,slug,logo_url,description,featured,order_index")
    .eq("active", true)
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
});

// Anonymous checkout: cria o pedido a partir do carrinho
const orderItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(200),
  size: z.string().max(40).optional().nullable(),
  color: z.string().max(40).optional().nullable(),
  qty: z.number().int().min(1).max(99),
  price: z.number().min(0),
});

const orderSchema = z.object({
  customer_name: z.string().min(1).max(120),
  customer_whatsapp: z.string().min(8).max(30),
  customer_email: z.string().email().max(160).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  items: z.array(orderItemSchema).min(1).max(50),
  subtotal: z.number().min(0),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        customer_whatsapp: data.customer_whatsapp,
        customer_email: data.customer_email ?? null,
        notes: data.notes ?? null,
        items: data.items,
        subtotal: data.subtotal,
        status: "novo",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });
