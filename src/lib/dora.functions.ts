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

export const doraChat = createServerFn({ method: "POST" })
  .inputValidator((input) => chatSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("dora_system_prompt")
      .eq("id", 1)
      .single();

    const systemPrompt =
      settings?.dora_system_prompt ??
      "Você é Dora, consultora de moda da boutique Dona Dora em Urubici/SC. Elegante e acolhedora.";

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
      throw new Error(`AI error ${res.status}`);
    }
    const json = await res.json();
    const reply: string = json.choices?.[0]?.message?.content ?? "Desculpe, tente novamente.";

    // Persist conversation + messages (best effort)
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
  .inputValidator((input) => leadSchema.parse(input))
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
