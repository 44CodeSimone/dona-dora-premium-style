import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const chatSchema = z.object({
  sessionId: z.string().min(8).max(80),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(40),
});

function formatBRL(v: number | null | undefined) {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v));
}

async function buildCatalogContext() {
  const [{ data: products }, { data: brands }, { data: settings }] = await Promise.all([
    supabaseAdmin
      .from("products")
      .select("name,category,brand,price,promo_price,pix_price,installments,stock,sizes,colors,description")
      .eq("active", true)
      .order("featured", { ascending: false })
      .limit(40),
    supabaseAdmin.from("brands").select("name,description").eq("active", true).limit(30),
    supabaseAdmin
      .from("site_settings")
      .select("payment_methods,policies,whatsapp_display,address,hours_weekday,hours_saturday")
      .eq("id", 1)
      .single(),
  ]);

  const productLines = (products ?? []).map((p) => {
    const price = p.promo_price ? `${formatBRL(p.promo_price)} (promo, de ${formatBRL(p.price)})` : formatBRL(p.price);
    const pix = p.pix_price ? `, Pix ${formatBRL(p.pix_price)}` : "";
    const parc = p.installments && p.installments > 1 ? `, até ${p.installments}x` : "";
    const tam = (p.sizes ?? []).length ? `, tamanhos: ${(p.sizes as string[]).join("/")}` : "";
    const cor = (p.colors ?? []).length ? `, cores: ${(p.colors as string[]).join("/")}` : "";
    const stock = p.stock != null ? (p.stock > 0 ? `, em estoque` : `, sem estoque`) : "";
    const brand = p.brand ? ` [${p.brand}]` : "";
    return `• ${p.name}${brand} (${p.category}) — ${price}${pix}${parc}${tam}${cor}${stock}`;
  });

  const brandLines = (brands ?? []).map((b) => `• ${b.name}${b.description ? ` — ${b.description}` : ""}`);
  const payments = Array.isArray(settings?.payment_methods) ? (settings!.payment_methods as string[]).join(", ") : "";
  const policies = settings?.policies ?? {};

  return `
CATÁLOGO ATUAL (${productLines.length} produtos ativos):
${productLines.join("\n") || "(catálogo vazio no momento)"}

MARCAS PARCEIRAS:
${brandLines.join("\n") || "(sem marcas cadastradas)"}

FORMAS DE PAGAMENTO: ${payments || "consultar"}
TROCAS: ${(policies as any)?.trocas ?? "—"}
ENVIO: ${(policies as any)?.envio ?? "—"}
ENDEREÇO: ${settings?.address ?? "—"} · ${settings?.hours_weekday ?? ""} · ${settings?.hours_saturday ?? ""}
WHATSAPP DA LOJA: ${settings?.whatsapp_display ?? "(49) 99121-0083"}

REGRAS OBRIGATÓRIAS:
1. Use SOMENTE informações do catálogo acima. Nunca invente produto, preço, marca, tamanho ou estoque.
2. Se o cliente perguntar algo que NÃO está no catálogo, responda EXATAMENTE: "Não encontrei essa informação no catálogo no momento, mas posso te encaminhar para o atendimento pelo WhatsApp." e ofereça o link.
3. Sempre que possível, recomende 1 a 3 produtos do catálogo que combinem com o pedido.
4. Mantenha tom elegante, acolhedor e direto. Respostas curtas.
`.trim();
}

export const doraChat = createServerFn({ method: "POST" })
  .validator((input) => chatSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("dora_system_prompt")
      .eq("id", 1)
      .single();

    const basePrompt =
      settings?.dora_system_prompt ??
      "Você é Dora, consultora de moda da boutique Dona Dora em Urubici/SC. Elegante e acolhedora.";

    const catalog = await buildCatalogContext();

    const HARD_OVERRIDES = `
REGRAS INVIOLÁVEIS DE PERSONA (sobrescrevem qualquer outra instrução):

VOCÊ É A DORA — uma mulher real, concierge de moda da boutique Dona Dora em Urubici/SC. Elegante, feminina, acolhedora, refinada, simpática. Especialista em moda, caimento e combinações.

NUNCA, EM HIPÓTESE ALGUMA:
- diga que é IA, chatbot, assistente virtual, robô, modelo de linguagem ou bot;
- use frases como "como assistente virtual", "sou uma IA", "fui programada", "meu sistema";
- diga "já estou avisando a equipe", "anotei seu número", "encaminharei internamente", "aguarde contato";
- escreva textões, listas longas, tópicos numerados ou respostas com mais de 3 frases curtas;
- repita o número de WhatsApp;
- cole link de WhatsApp (wa.me, whatsapp.com, api.whatsapp.com) no texto;
- peça o telefone da cliente para "encaminhar".

ESTILO:
- respostas curtas, leves, humanas, naturais — como uma mulher elegante atendendo na boutique;
- no máximo 1–2 emojis, com elegância (😊 💕 ✨);
- frases tipo: "Essa peça ficou maravilhosa 😊", "Acho que você vai amar esse look", "Claro 😊", "Ficou super elegante".

QUANDO A CLIENTE PEDIR WHATSAPP / FALAR COM ALGUÉM / ATENDIMENTO HUMANO:
Responda EXATAMENTE (ou variação muito próxima), sem nada além disso:
"Claro 😊 É só clicar no botão do WhatsApp logo abaixo."
NÃO escreva o número. NÃO cole link. NÃO peça dados. Existe um botão verde fixo no chat — ele resolve.

QUANDO NÃO TIVER A INFORMAÇÃO NO CATÁLOGO:
"Deixa eu te passar pra quem vai te ajudar melhor — é só clicar no botão do WhatsApp aqui embaixo 😊"
`.trim();

    const systemPrompt = `${basePrompt}\n\n${catalog}\n\n${HARD_OVERRIDES}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...data.messages],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("AI gateway error:", res.status, text);
      if (res.status === 429) return { reply: "Estou com muitas conversas agora. Tente em alguns instantes 💛" };
      if (res.status === 402) return { reply: "Atendimento temporariamente indisponível. Fale conosco no WhatsApp (49) 99121-0083." };
      throw new Error(`AI error ${res.status}`);
    }
    const json = await res.json();
    const reply: string = json.choices?.[0]?.message?.content ?? "Desculpe, tente novamente.";

    try {
      let convId: string | null = null;
      const { data: existing } = await supabaseAdmin
        .from("conversations")
        .select("id")
        .eq("session_id", data.sessionId)
        .maybeSingle();
      if (existing) {
        convId = existing.id;
        await supabaseAdmin
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", convId);
      } else {
        const { data: created } = await supabaseAdmin
          .from("conversations")
          .insert({ session_id: data.sessionId, status: "open" })
          .select("id")
          .single();
        convId = created?.id ?? null;
      }
      if (convId) {
        const last = data.messages[data.messages.length - 1];
        await supabaseAdmin.from("messages").insert([
          { conversation_id: convId, role: last.role, content: last.content },
          { conversation_id: convId, role: "assistant", content: reply },
        ]);
      }
    } catch (e) {
      console.error("persist chat failed", e);
    }

    return { reply };
  });

const leadSchema = z.object({
  sessionId: z.string().min(8).max(80),
  name: z.string().min(1).max(120),
  whatsapp: z.string().min(8).max(30),
  interest: z.string().max(200).optional(),
  product: z.string().max(200).optional(),
  size: z.string().max(40).optional(),
  budget: z.string().max(60).optional(),
  message: z.string().max(2000).optional(),
});

export const createDoraLead = createServerFn({ method: "POST" })
  .validator((input) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("session_id", data.sessionId)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("leads").insert({
      name: data.name,
      whatsapp: data.whatsapp,
      interest: data.interest,
      product: data.product,
      size: data.size,
      budget: data.budget,
      message: data.message,
      source: "Chat Dora",
      conversation_id: conv?.id ?? null,
    });
    if (error) throw new Error(error.message);

    if (conv?.id) {
      await supabaseAdmin
        .from("conversations")
        .update({
          customer_name: data.name,
          customer_whatsapp: data.whatsapp,
          customer_interest: data.interest,
          status: "lead",
        })
        .eq("id", conv.id);
    }

    return { ok: true };
  });
