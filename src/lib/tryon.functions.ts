import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PROVIDER_URL = "https://fal.run/fal-ai/fashn/tryon/v1.6";

const TECHNICAL_INTENT = {
  base_image_role: "customer_photo",
  garment_image_role: "store_garment",
  final_result_expected: "same_customer_wearing_selected_store_garment",
  must_preserve: [
    "customer_face",
    "customer_hair",
    "customer_skin_tone",
    "customer_expression",
    "customer_identity",
    "customer_body_proportions",
  ],
  must_not: [
    "use_store_model_as_final_person",
    "replace_customer_face",
    "change_identity",
    "beautify_artificially",
    "reshape_body_unrealistically",
  ],
} as const;

async function callProvider(args: {
  customer_image_url: string;
  store_garment_image_url: string;
  category: "tops" | "bottoms" | "one-pieces" | "auto";
}): Promise<{ image_url: string } | { error: string }> {
  const key = process.env.VIRTUAL_TRY_ON_API_KEY;
  if (!key) return { error: "VIRTUAL_TRY_ON_API_KEY ausente no servidor." };
  try {
    const res = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${key}`,
      },
      body: JSON.stringify({
        model_image: args.customer_image_url,
        garment_image: args.store_garment_image_url,
        category: args.category,
        mode: "balanced",
        garment_photo_type: "auto",
        moderation_level: "permissive",
        num_samples: 1,
        segmentation_free: true,
        output_format: "png",
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("[tryon] provider error", res.status, text.slice(0, 500));
      return { error: `Provider ${res.status}: ${text.slice(0, 180)}` };
    }
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return { error: "Resposta inválida do provedor" };
    }
    // fal.ai shapes commonly return { images: [{ url }] } or { image: { url } }
    const url =
      json?.images?.[0]?.url ??
      json?.image?.url ??
      json?.output?.[0] ??
      json?.url ??
      null;
    if (!url || typeof url !== "string") {
      console.error("[tryon] no image in provider response", JSON.stringify(json).slice(0, 500));
      return { error: "Sem imagem na resposta" };
    }
    return { image_url: url };
  } catch (e: any) {
    console.error("[tryon] provider exception", e?.message);
    return { error: e?.message ?? "Falha de rede com o provedor" };
  }
}

function mapCategory(productCategory?: string | null): "tops" | "bottoms" | "one-pieces" | "auto" {
  const c = (productCategory ?? "").toLowerCase();
  if (c.includes("calc") || c.includes("short") || c.includes("saia")) return "bottoms";
  if (c.includes("vestid") || c.includes("macac")) return "one-pieces";
  if (c.includes("blusa") || c.includes("camisa") || c.includes("cropped") || c.includes("jaqueta")) return "tops";
  return "auto";
}

const submitSchema = z.object({
  product_id: z.string().uuid(),
  original_path: z.string().min(3).max(300), // storage path inside virtual-tryon
  selected_size: z.string().max(40).optional().nullable(),
  selected_color: z.string().max(40).optional().nullable(),
  consent_text: z.string().min(10).max(2000),
});

export const submitTryOn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => submitSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Toggle global
    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("virtual_tryon_enabled")
      .eq("id", 1)
      .single();
    if (!settings?.virtual_tryon_enabled) {
      throw new Error("Provador virtual desabilitado.");
    }

    // Produto + flag
    const { data: product, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id,name,category,image_url,images,allow_virtual_try_on,active")
      .eq("id", data.product_id)
      .single();
    if (pErr || !product) throw new Error("Produto não encontrado.");
    if (!product.active || !product.allow_virtual_try_on) {
      throw new Error("Este produto não está disponível no provador.");
    }

    // Path do upload deve estar no diretório do próprio usuário
    if (!data.original_path.startsWith(`${userId}/`)) {
      throw new Error("Caminho de upload inválido.");
    }

    // Registra consentimento + sessão
    await supabaseAdmin.from("virtual_try_on_consents").insert({
      user_id: userId,
      product_id: data.product_id,
      consent_text: data.consent_text,
      selected_color: data.selected_color ?? null,
      selected_size: data.selected_size ?? null,
    });

    const { data: session, error: sErr } = await supabaseAdmin
      .from("virtual_try_on_sessions")
      .insert({
        user_id: userId,
        product_id: data.product_id,
        consent_accepted: true,
        selected_size: data.selected_size ?? null,
        selected_color: data.selected_color ?? null,
        original_image_path: data.original_path,
        status: "processing",
      })
      .select("id")
      .single();
    if (sErr || !session) throw new Error("Falha ao criar sessão.");

    // Signed URLs para o provedor consumir
    const { data: origSigned } = await supabaseAdmin.storage
      .from("virtual-tryon")
      .createSignedUrl(data.original_path, 60 * 10);

    const garmentImageUrl =
      product.image_url || (product.images && product.images[0]) || null;

    if (!origSigned?.signedUrl || !garmentImageUrl) {
      await supabaseAdmin
        .from("virtual_try_on_sessions")
        .update({ status: "failed" })
        .eq("id", session.id);
      throw new Error("Imagens indisponíveis para processar.");
    }

    const result = await callProvider({
      model_image_url: origSigned.signedUrl,
      garment_image_url: garmentImageUrl,
      category: mapCategory(product.category),
    });

    if ("error" in result) {
      await supabaseAdmin
        .from("virtual_try_on_sessions")
        .update({ status: "failed" })
        .eq("id", session.id);
      return { id: session.id, status: "failed" as const, error: result.error };
    }

    // Baixa imagem gerada e guarda no bucket privado
    let storedPath: string | null = null;
    try {
      const dl = await fetch(result.image_url);
      if (dl.ok) {
        const buf = new Uint8Array(await dl.arrayBuffer());
        const ext = (dl.headers.get("content-type")?.includes("png") ? "png" : "jpg");
        const path = `${userId}/${session.id}-result.${ext}`;
        const { error: upErr } = await supabaseAdmin.storage
          .from("virtual-tryon")
          .upload(path, buf, {
            contentType: dl.headers.get("content-type") ?? "image/jpeg",
            upsert: true,
          });
        if (!upErr) storedPath = path;
      }
    } catch (e) {
      console.error("[tryon] download/upload result failed", e);
    }

    await supabaseAdmin
      .from("virtual_try_on_sessions")
      .update({
        status: "completed",
        generated_image_path: storedPath,
      })
      .eq("id", session.id);

    return { id: session.id, status: "completed" as const };
  });

export const getMyTryOnSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: row, error } = await supabaseAdmin
      .from("virtual_try_on_sessions")
      .select("id,status,generated_image_path,original_image_path,product_id,selected_size,selected_color,created_at")
      .eq("id", data.id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();
    if (error || !row) throw new Error("Sessão não encontrada.");
    let signedUrl: string | null = null;
    if (row.generated_image_path) {
      const { data: s } = await supabaseAdmin.storage
        .from("virtual-tryon")
        .createSignedUrl(row.generated_image_path, 60 * 30);
      signedUrl = s?.signedUrl ?? null;
    }
    return { ...row, signed_url: signedUrl };
  });

export const listMyTryOnSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabaseAdmin
      .from("virtual_try_on_sessions")
      .select("id,status,product_id,created_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
