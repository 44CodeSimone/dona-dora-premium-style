import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

// Public-safe projection: excludes dora_system_prompt and lead_email
const PUBLIC_SETTINGS_COLUMNS =
  "id,brand_name,logo_url,primary_color,accent_color,bg_color,hero_title,hero_subtitle,hero_image_url,hero_cta_text,hero_cta_link,whatsapp,whatsapp_display,instagram_url,instagram_handle,address,hours_weekday,hours_saturday,vip_title,vip_subtitle,vip_benefits,vip_link,vip_image_url,seo_title,seo_description,seo_keywords,seo_og_image,dora_welcome_message,updated_at";

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select(PUBLIC_SETTINGS_COLUMNS)
    .eq("id", 1)
    .single();
  if (error) throw new Error(error.message);
  return data;
});

export const getPublicProducts = createServerFn({ method: "GET" })
  .inputValidator((d: { category?: string; featured?: boolean; limit?: number } | undefined) =>
    z
      .object({
        category: z.string().optional(),
        featured: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin.from("products").select("*").eq("active", true);
    if (data.category) q = q.eq("category", data.category);
    if (data.featured) q = q.eq("featured", true);
    q = q.order("created_at", { ascending: false }).limit(data.limit ?? 12);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows;
  });
