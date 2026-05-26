import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, X, MessageCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { doraChat, createDoraLead } from "@/lib/dora.functions";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  let s = localStorage.getItem("dora_session");
  if (!s) {
    s = `dora-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("dora_session", s);
  }
  return s;
}

export function DoraFloat() {
  const { data: settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"chat" | "form" | "done">("chat");

  const welcome = settings?.dora_welcome_message ?? "Oi! Eu sou a Dora 😊 Posso te ajudar a encontrar a peça perfeita. Me conta: o que você procura hoje?";
  const whatsapp = settings?.whatsapp ?? "5549991210083";

  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: welcome }]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const chatFn = useServerFn(doraChat);
  const leadFn = useServerFn(createDoraLead);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 1 && settings?.dora_welcome_message) {
      setMessages([{ role: "assistant", content: settings.dora_welcome_message }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.dora_welcome_message]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setDraft("");
    setSending(true);
    try {
      const r = await chatFn({ data: { sessionId: getSessionId(), messages: next } });
      setMessages([...next, { role: "assistant", content: r.reply }]);
    } catch (e: any) {
      toast.error("Não consegui responder agora. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Float button */}
      <button
        type="button"
        aria-label="Falar com a Dora"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40 group"
      >
        <span className="relative flex items-center gap-3 pl-4 pr-5 py-3.5 bg-foreground text-background rounded-full shadow-luxe hover:bg-[color:var(--gold)] hover:text-foreground transition-all duration-500 ease-luxe">
          <span className="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none" />
          <Sparkles className="size-5" />
          <span className="text-xs tracking-[0.2em] uppercase">Falar com a Dora</span>
        </span>
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:items-end md:justify-end animate-fade-in">
          <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Fechar" />
          <div className="relative w-full md:w-[420px] h-[100dvh] md:h-[640px] md:m-6 bg-background text-foreground flex flex-col shadow-luxe md:rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-foreground text-background">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-[color:var(--gold)] grid place-items-center font-display text-lg text-foreground animate-pulse-glow">D</div>
                <div>
                  <div className="font-display text-lg leading-none">Dora</div>
                  <div className="text-[10px] tracking-luxe uppercase text-background/60 flex items-center gap-1.5 mt-1">
                    <span className="size-1.5 rounded-full bg-emerald-400" /> Consultora Dona Dora
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Fechar"><X className="size-5" /></button>
            </div>

            {phase === "chat" && (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-muted/30">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-foreground text-background rounded-br-sm" : "bg-card border rounded-bl-sm"}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {sending && <div className="text-xs text-muted-foreground px-2">Dora está digitando…</div>}
                </div>
                <div className="border-t p-3 bg-background">
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder="Escreva sua mensagem…"
                    />
                    <button onClick={send} disabled={sending} className="size-10 grid place-items-center rounded-full bg-foreground text-background disabled:opacity-50">
                      <Send className="size-4" />
                    </button>
                  </div>
                  <button onClick={() => setPhase("form")} className="w-full text-xs tracking-luxe uppercase py-2.5 bg-[color:var(--gold)] text-foreground rounded">
                    Continuar e deixar meus dados
                  </button>
                </div>
              </>
            )}

            {phase === "form" && (
              <LeadForm
                onSubmit={async (vals) => {
                  try {
                    await leadFn({ data: { sessionId: getSessionId(), ...vals } });
                    setPhase("done");
                    toast.success("Recebemos seus dados!");
                  } catch (e: any) {
                    toast.error(e?.message ?? "Erro ao enviar.");
                  }
                }}
                onCancel={() => setPhase("chat")}
              />
            )}

            {phase === "done" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-5">
                <div className="size-16 rounded-full bg-[color:var(--gold)] grid place-items-center">
                  <MessageCircle className="size-7 text-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-2xl">Tudo certo!</h3>
                  <p className="text-sm text-muted-foreground mt-2">A Dona Dora vai te chamar no WhatsApp.<br />Quer continuar a conversa agora?</p>
                </div>
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Oi Dona Dora, vim pelo site após conversar com a Dora ✨")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-xs tracking-luxe uppercase rounded"
                >
                  Continuar no WhatsApp <MessageCircle className="size-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function LeadForm({ onSubmit, onCancel }: { onSubmit: (v: any) => Promise<void>; onCancel: () => void }) {
  const [f, setF] = useState({ name: "", whatsapp: "", interest: "", product: "", size: "", budget: "", message: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF({ ...f, [k]: v });
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!f.name.trim() || !f.whatsapp.trim()) {
          toast.error("Nome e WhatsApp são obrigatórios.");
          return;
        }
        setBusy(true);
        await onSubmit(f);
        setBusy(false);
      }}
      className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/30"
    >
      <h3 className="font-display text-xl">Seus dados</h3>
      <p className="text-xs text-muted-foreground">A Dona Dora entra em contato com novidades e o produto ideal para você.</p>
      <Input placeholder="Nome *" value={f.name} onChange={(e) => set("name", e.target.value)} />
      <Input placeholder="WhatsApp *" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
      <Input placeholder="Interesse (ex.: vestidos)" value={f.interest} onChange={(e) => set("interest", e.target.value)} />
      <Input placeholder="Produto desejado" value={f.product} onChange={(e) => set("product", e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Tamanho" value={f.size} onChange={(e) => set("size", e.target.value)} />
        <Input placeholder="Faixa de preço" value={f.budget} onChange={(e) => set("budget", e.target.value)} />
      </div>
      <Textarea placeholder="Mensagem" rows={3} value={f.message} onChange={(e) => set("message", e.target.value)} />
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 border rounded text-xs uppercase tracking-luxe">Voltar</button>
        <button type="submit" disabled={busy} className="flex-1 py-2.5 bg-foreground text-background rounded text-xs uppercase tracking-luxe disabled:opacity-50">
          {busy ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
