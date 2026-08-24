import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PROVIDER_URL = "https://api.openai.com/v1/images/edits";
const PROVIDER_MODEL = "gpt-image-1";

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

function buildPrompt(category: string): string {
  return [
    "Photorealistic virtual try-on.",
    "The FIRST image is the real customer (model). The SECOND image is a garment from the store.",
    "Generate a single photo of the SAME customer from the first image wearing the garment shown in the second image.",
    "Strictly preserve the customer's face, hair, skin tone, expression, identity, body proportions, pose and background lighting from the first image.",
    "Do NOT use the person from the second image. Do NOT alter, beautify or reshape the customer.",
    "Replace only the relevant clothing area with the garment, preserving its colors, print, fabric and silhouette.",
    `Garment category: ${category}.`,
    "Output: a single full-body, natural and realistic photo.",
  ].join(" ");
}

async function fetchAsFile(url: string, filename: string): Promise<File> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Falha ao baixar imagem (${r.status})`);
  const ct = r.headers.get("content-type") || "image/png";
  const buf = await r.arrayBuffer();
  return new File([buf], filename, { type: ct });
}

async function callProvider(args: {
  customer_image_url: string;
  store_garment_image_url: string;
  category: "tops" | "bottoms" | "one-pieces" | "auto";
}): Promise<{ b64: string; mime: string } | { error: string }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { error: "OPENAI_API_KEY ausente no servidor." };
  try {
    const [customerFile, garmentFile] = await Promise.all([
      fetchAsFile(args.customer_image_url, "customer.png"),
      fetchAsFile(args.store_garment_image_url, "garment.png"),
    ]);

    const form = new FormData();
    form.append("model", PROVIDER_MODEL);
    form.append("prompt", buildPrompt(args.category));
    form.append("n", "1");
    form.append("size", "1024x1024");
    form.append("quality", "high");
    form.append("input_fidelity", "high");
    // Multi-image edit: customer first (base), garment second (reference)
    form.append("image[]", customerFile, "customer.png");
    form.append("image[]", garmentFile, "garment.png");

    const res = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("[tryon] openai error", res.status, text.slice(0, 500));
      return { error: `Provider ${res.status}: ${text.slice(0, 200)}` };
    }
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return { error: "Resposta inválida do provedor" };
    }
    const b64: string | undefined = json?.data?.[0]?.b64_json;
    if (!b64) {
      console.error("[tryon] no b64 in response", JSON.stringify(json).slice(0, 500));
      return { error: "Sem imagem na resposta" };
    }
    return { b64, mime: "image/png" };
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
  .validator((input) => submitSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const providerPreviewUrl: string | null = null;

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

    console.info("[tryon] technical intent", JSON.stringify({ session_id: session.id, ...TECHNICAL_INTENT }));

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
      customer_image_url: origSigned.signedUrl,
      store_garment_image_url: garmentImageUrl,
      category: mapCategory(product.category),
    });

    if ("error" in result) {
      await supabaseAdmin
        .from("virtual_try_on_sessions")
        .update({ status: "failed" })
        .eq("id", session.id);
      return { id: session.id, status: "failed" as const, error: result.error };
    }

    // Decodifica base64 e guarda no bucket privado
    let storedPath: string | null = null;
    try {
      const binary = atob(result.b64);
      const buf = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
      const path = `${userId}/${session.id}-result.png`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("virtual-tryon")
        .upload(path, buf, {
          contentType: result.mime,
          upsert: true,
        });
      if (!upErr) storedPath = path;
      else console.error("[tryon] upload result failed", upErr);
    } catch (e) {
      console.error("[tryon] decode/upload result failed", e);
    }

    await supabaseAdmin
      .from("virtual_try_on_sessions")
      .update({
        status: "completed",
        generated_image_path: storedPath,
      })
      .eq("id", session.id);

    return { id: session.id, status: "completed" as const, preview_url: null };
  });

export const getMyTryOnSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
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
