import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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

// Checkout autenticado: o navegador envia apenas IDs e quantidades.
// Preços, nomes, disponibilidade e estoque são sempre revalidados no servidor.
export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  size: z.string().max(40).optional().nullable(),
  color: z.string().max(40).optional().nullable(),
  qty: z.number().int().min(1).max(99),
});

export const orderSchema = z.object({
  customer_name: z.string().min(1).max(120),
  customer_whatsapp: z.string().min(8).max(30),
  notes: z.string().max(2000).optional().nullable(),
  items: z.array(orderItemSchema).min(1).max(50),
});

export interface RawOrderItem {
  product_id: string;
  size?: string | null;
  color?: string | null;
  qty: number;
}

export interface CatalogProductItem {
  id: string;
  name: string;
  price?: number | null;
  promo?: boolean | null;
  promo_price?: number | null;
  available?: boolean | null;
  stock?: number | null;
  sizes?: string[] | unknown | null;
  colors?: string[] | unknown | null;
}

export function processOrderItems(
  items: RawOrderItem[],
  products: CatalogProductItem[],
): {
  pricedItems: Array<{
    product_id: string;
    name: string;
    size: string | null;
    color: string | null;
    qty: number;
    price: number;
  }>;
  subtotal: number;
} {
  const productIds = [...new Set(items.map((item) => item.product_id))];
  const productById = new Map((products ?? []).map((product) => [product.id, product]));
  if (productById.size !== productIds.length) {
    throw new Error("Um dos itens do pedido não está mais disponível.");
  }

  const pricedItems = items.map((item) => {
    const product = productById.get(item.product_id);
    if (!product || product.available === false) {
      throw new Error("Um dos itens do pedido não está mais disponível.");
    }

    const sizes = Array.isArray(product.sizes) ? (product.sizes as string[]) : [];
    const colors = Array.isArray(product.colors) ? (product.colors as string[]) : [];
    if (item.size && sizes.length > 0 && !sizes.includes(item.size)) {
      throw new Error(`O tamanho selecionado para ${product.name} não está disponível.`);
    }
    if (item.color && colors.length > 0 && !colors.includes(item.color)) {
      throw new Error(`A cor selecionada para ${product.name} não está disponível.`);
    }
    if (typeof product.stock === "number" && item.qty > product.stock) {
      throw new Error(`Estoque insuficiente para ${product.name}.`);
    }

    const unitPrice =
      product.promo && product.promo_price != null
        ? Number(product.promo_price)
        : Number(product.price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error("Um item do catálogo está com preço inválido.");
    }

    return {
      product_id: product.id,
      name: product.name,
      size: item.size ?? null,
      color: item.color ?? null,
      qty: item.qty,
      price: unitPrice,
    };
  });

  const subtotal =
    Math.round(pricedItems.reduce((total, item) => total + item.price * item.qty, 0) * 100) / 100;

  return { pricedItems, subtotal };
}

export async function createOrderForAuthenticatedCustomer(
  data: z.infer<typeof orderSchema>,
  context: { claims?: { email?: string } },
) {
  const productIds = [...new Set(data.items.map((item) => item.product_id))];
  const { data: products, error: productsError } = await supabaseAdmin
    .from("products")
    .select("id,name,price,promo,promo_price,available,stock,sizes,colors")
    .in("id", productIds)
    .eq("active", true);

  if (productsError) throw new Error(productsError.message);

  const { pricedItems, subtotal } = processOrderItems(data.items, products ?? []);

  const { data: row, error } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: data.customer_name,
      customer_whatsapp: data.customer_whatsapp,
      customer_email: context.claims?.email ?? null,
      notes: data.notes ?? null,
      items: pricedItems,
      subtotal,
      status: "novo",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: row.id };
}

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => orderSchema.parse(input))
  .handler(async ({ data, context }) => createOrderForAuthenticatedCustomer(data, context));
