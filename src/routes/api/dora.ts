import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type ChatRequestBody = {
  messages?: UIMessage[];
  sessionId?: string;
};

const FALLBACK_PROMPT = `Você é Dora, a consultora de moda virtual da boutique Dona Dora em Urubici/SC.

Personalidade:
- Elegante, educada, simpática e acolhedora
- Consultora de moda — ajuda o cliente a decidir, sugere sem pressionar
- Persuasiva sem ser insistente; valoriza a experiência da loja
- Fala em português brasileiro, tom próximo e humano

Especialidades: moda feminina, moda masculina, acessórios, joias, presentes.

Sua missão:
1. Receber bem e entender o que o cliente busca
2. Recomendar produtos do catálogo quando fizer sentido (você receberá a lista em contexto)
3. Coletar de forma natural ao longo da conversa: nome, WhatsApp, interesse, produto desejado, faixa de preço, tamanho (se for roupa) e preferência de estilo
4. Quando o cliente demonstrar intenção de compra ou quiser falar com a loja, ofereça encaminhar para o WhatsApp (49) 99154-0421

Importante:
- Nunca peça todos os dados de uma vez; conduza a conversa de forma fluida
- Confirme dados pessoais apenas quando o cliente sinalizar interesse real
- Respeite a LGPD: explique brevemente que os dados são para atendimento se o cliente perguntar`;

export const Route = createFileRoute("/api/dora")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Load context: prompt + featured products
        let systemPrompt = FALLBACK_PROMPT;
        let productsContext = "";
        try {
          const [{ data: settings }, { data: products }] = await Promise.all([
            supabaseAdmin.from("site_settings").select("dora_system_prompt").eq("id", 1).maybeSingle(),
            supabaseAdmin
              .from("products")
              .select("name,category,price,description")
              .eq("active", true)
              .order("featured", { ascending: false })
              .limit(30),
          ]);
          if (settings?.dora_system_prompt) systemPrompt = settings.dora_system_prompt;
          if (products && products.length > 0) {
            productsContext =
              "\n\nCATÁLOGO ATUAL DA BOUTIQUE (use para recomendar):\n" +
              products
                .map(
                  (p) =>
                    `- ${p.name} (${p.category})${p.price ? ` · R$ ${p.price}` : ""}${p.description ? ` — ${p.description}` : ""}`,
                )
                .join("\n");
          }
        } catch (e) {
          console.error("[dora] context load error", e);
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        try {
          const result = streamText({
            model,
            system: systemPrompt + productsContext,
            messages: await convertToModelMessages(messages),
          });
          return result.toUIMessageStreamResponse({ originalMessages: messages });
        } catch (err) {
          console.error("[dora] streamText error", err);
          return new Response("AI service error", { status: 500 });
        }
      },
    },
  },
});
