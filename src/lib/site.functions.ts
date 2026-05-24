import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

// Fields that must NEVER be sent to the public browser
const SENSITIVE_SETTINGS_FIELDS = ["dora_system_prompt", "lead_email"] as const;

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw new Error(error.message);
  // Strip sensitive fields before returning to public callers
  const safe = { ...data } as Record<string, unknown>;
  for (const k of SENSITIVE_SETTINGS_FIELDS) delete safe[k];
  return safe;
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
