import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const LeadSchema = z.object({
  name: z.string().trim().max(200).optional().nullable(),
  whatsapp: z.string().trim().max(40).optional().nullable(),
  interest: z.string().trim().max(500).optional().nullable(),
  product: z.string().trim().max(500).optional().nullable(),
  size: z.string().trim().max(50).optional().nullable(),
  budget: z.string().trim().max(100).optional().nullable(),
  style: z.string().trim().max(300).optional().nullable(),
  message: z.string().trim().max(4000).optional().nullable(),
  sessionId: z.string().trim().max(100).optional().nullable(),
  conversationSummary: z.string().trim().max(8000).optional().nullable(),
});

async function sendLeadEmail(payload: z.infer<typeof LeadSchema>, to: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!apiKey || !lovableKey) {
    console.warn("[lead] RESEND_API_KEY ausente — lead salvo, e-mail não enviado");
    return false;
  }
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#111;max-width:600px;margin:0 auto">
      <div style="background:#0a0a0a;color:#fff;padding:32px;text-align:center">
        <h1 style="font-family:'Cormorant Garamond',serif;font-weight:400;margin:0;letter-spacing:.04em">DONA DORA</h1>
        <p style="color:#caa55a;margin:8px 0 0;font-size:11px;letter-spacing:.32em;text-transform:uppercase">Novo lead via Chat Dora</p>
      </div>
      <div style="padding:32px;background:#fff;border:1px solid #eee;border-top:0">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${[
            ["Nome", payload.name],
            ["WhatsApp", payload.whatsapp],
            ["Interesse", payload.interest],
            ["Produto desejado", payload.product],
            ["Tamanho", payload.size],
            ["Faixa de preço", payload.budget],
            ["Preferência de estilo", payload.style],
            ["Mensagem", payload.message],
          ]
            .filter(([, v]) => v)
            .map(
              ([k, v]) =>
                `<tr><td style="padding:10px 0;color:#666;width:160px;vertical-align:top">${k}</td><td style="padding:10px 0;color:#111">${String(v).replace(/</g, "&lt;")}</td></tr>`,
            )
            .join("")}
          <tr><td style="padding:10px 0;color:#666">Origem</td><td style="padding:10px 0">Chat Dora no site</td></tr>
          <tr><td style="padding:10px 0;color:#666">Data/Hora</td><td style="padding:10px 0">${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</td></tr>
        </table>
        ${
          payload.conversationSummary
            ? `<div style="margin-top:24px;padding-top:24px;border-top:1px solid #eee"><div style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.2em;margin-bottom:8px">Conversa</div><pre style="white-space:pre-wrap;font-family:inherit;font-size:13px;color:#333;margin:0">${payload.conversationSummary.replace(/</g, "&lt;")}</pre></div>`
            : ""
        }
      </div>
      <div style="text-align:center;padding:16px;color:#888;font-size:11px;letter-spacing:.2em;text-transform:uppercase">Dona Dora · Urubici/SC</div>
    </div>`;

  try {
    const resp = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": apiKey,
      },
      body: JSON.stringify({
        from: "Dora <onboarding@resend.dev>",
        to: [to],
        subject: `🌟 Novo lead Dona Dora${payload.name ? ` — ${payload.name}` : ""}`,
        html,
        reply_to: payload.whatsapp ? undefined : undefined,
      }),
    });
    if (!resp.ok) {
      console.error("[lead] resend error", resp.status, await resp.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[lead] resend exception", e);
    return false;
  }
}

export const Route = createFileRoute("/api/lead")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let payload: z.infer<typeof LeadSchema>;
        try {
          payload = LeadSchema.parse(await request.json());
        } catch (e) {
          return new Response(JSON.stringify({ error: "Invalid input" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { data: settings } = await supabaseAdmin
          .from("site_settings")
          .select("lead_email")
          .eq("id", 1)
          .maybeSingle();
        const to = settings?.lead_email ?? "donadoraecommerce@gmail.com";

        let conversationId: string | null = null;
        if (payload.sessionId) {
          const { data: existing } = await supabaseAdmin
            .from("conversations")
            .select("id")
            .eq("session_id", payload.sessionId)
            .maybeSingle();
          if (existing) {
            conversationId = existing.id;
            await supabaseAdmin
              .from("conversations")
              .update({
                customer_name: payload.name ?? undefined,
                customer_whatsapp: payload.whatsapp ?? undefined,
                customer_interest: payload.interest ?? undefined,
              })
              .eq("id", existing.id);
          } else {
            const { data: created } = await supabaseAdmin
              .from("conversations")
              .insert({
                session_id: payload.sessionId,
                customer_name: payload.name ?? null,
                customer_whatsapp: payload.whatsapp ?? null,
                customer_interest: payload.interest ?? null,
              })
              .select("id")
              .single();
            conversationId = created?.id ?? null;
          }
        }

        const { data: lead, error } = await supabaseAdmin
          .from("leads")
          .insert({
            conversation_id: conversationId,
            name: payload.name ?? null,
            whatsapp: payload.whatsapp ?? null,
            interest: payload.interest ?? null,
            product: payload.product ?? null,
            size: payload.size ?? null,
            budget: payload.budget ?? null,
            style: payload.style ?? null,
            message: payload.message ?? null,
            source: "Chat Dora no site",
          })
          .select("id")
          .single();

        if (error) {
          console.error("[lead] insert error", error);
          return new Response(JSON.stringify({ error: "Erro ao salvar" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const emailed = await sendLeadEmail(payload, to);
        if (emailed) {
          await supabaseAdmin.from("leads").update({ emailed: true }).eq("id", lead.id);
        }

        return new Response(JSON.stringify({ ok: true, id: lead.id, emailed }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
