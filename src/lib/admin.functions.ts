import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin required");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      await assertAdmin(context.userId);
      return { isAdmin: true };
    } catch {
      return { isAdmin: false };
    }
  });


// Admin-only: returns full site_settings including sensitive fields (dora_system_prompt, lead_email)
export const getAdminSiteSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error) throw new Error(error.message);
    return data;
  });

// ------ SETTINGS ------
const settingsSchema = z
  .object({
    brand_name: z.string().min(1).max(80).optional(),
    logo_url: z.string().url().nullable().optional(),
    primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    bg_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    hero_title: z.string().min(1).max(200).optional(),
    hero_subtitle: z.string().min(1).max(400).optional(),
    hero_image_url: z.string().url().nullable().optional(),
    hero_cta_text: z.string().max(60).optional(),
    hero_cta_link: z.string().max(200).optional(),
    whatsapp: z.string().min(8).max(20).optional(),
    whatsapp_display: z.string().max(40).optional(),
    instagram_url: z.string().url().optional(),
    instagram_handle: z.string().max(40).optional(),
    address: z.string().max(300).optional(),
    hours_weekday: z.string().max(100).optional(),
    hours_saturday: z.string().max(100).optional(),
    lead_email: z.string().email().optional(),
    vip_title: z.string().max(120).optional(),
    vip_subtitle: z.string().max(600).optional(),
    vip_benefits: z.array(z.string().min(1).max(120)).max(20).optional(),
    vip_link: z.string().url().optional(),
    vip_image_url: z.string().url().nullable().optional(),
    seo_title: z.string().max(70).optional(),
    seo_description: z.string().max(170).optional(),
    seo_keywords: z.string().max(300).optional(),
    seo_og_image: z.string().url().nullable().optional(),
    dora_system_prompt: z.string().max(4000).optional(),
    dora_welcome_message: z.string().max(400).optional(),
  })
  .strict();

export const updateSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("site_settings")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------ PRODUCTS ------
const productInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional().nullable(),
  category: z.enum([
    "feminina",
    "masculina",
    "acessorios",
    "joias",
    "oculos",
    "bones",
    "presentes",
    "promocoes",
    "lancamentos",
    "outlet",
    "souvenirs",
    "outros",
  ]),
  price: z.number().min(0).nullable().optional(),
  promo_price: z.number().min(0).nullable().optional(),
  pix_price: z.number().min(0).nullable().optional(),
  installments: z.number().int().min(1).max(24).default(1),
  stock: z.number().int().min(0).default(0),
  brand: z.string().max(80).nullable().optional(),
  slug: z.string().max(120).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  images: z.array(z.string().url()).max(8).default([]),
  sizes: z.array(z.string().min(1).max(20)).max(20).default([]),
  colors: z.array(z.string().min(1).max(30)).max(20).default([]),
  featured: z.boolean().default(false),
  promo: z.boolean().default(false),
  active: z.boolean().default(true),
  available: z.boolean().default(true),
  alt_text: z.string().max(160).nullable().optional(),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => productInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const payload = { ...data, updated_at: new Date().toISOString() };
    if (data.id) {
      const { error } = await supabaseAdmin.from("products").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAllProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

// ------ LEADS ------
export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data;
  });

export const markLeadRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; read: boolean }) =>
    z.object({ id: z.string().uuid(), read: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("leads").update({ read: data.read }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------ IMAGE UPLOAD ------
const uploadSchema = z.object({
  filename: z.string().min(1).max(120),
  contentType: z.enum(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  dataBase64: z.string().min(1).max(10_000_000), // ~7.5MB binary
  folder: z.string().regex(/^[a-z0-9_-]+$/).max(40).default("uploads"),
});

export const uploadImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => uploadSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const ext = data.contentType.split("/")[1].replace("jpeg", "jpg");
    const safeName = data.filename.replace(/[^a-z0-9._-]/gi, "_").slice(0, 60);
    const path = `${data.folder}/${Date.now()}-${safeName.split(".")[0]}.${ext}`;
    const buf = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
    const { error } = await supabaseAdmin.storage
      .from("dona-dora")
      .upload(path, buf, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("dona-dora").getPublicUrl(path);
    return { url: pub.publicUrl };
  });
