import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, Send, X, ExternalLink, Sparkles } from "lucide-react";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const STORAGE_KEY = "dora_session_id";
const WHATSAPP = "5549991540421";

export function DoraFloat() {
  const [open, setOpen] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [lead, setLead] = useState({
    name: "",
    whatsapp: "",
    interest: "",
    product: "",
    size: "",
    budget: "",
    style: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return uid();
    let s = localStorage.getItem(STORAGE_KEY);
    if (!s) {
      s = uid();
      localStorage.setItem(STORAGE_KEY, s);
    }
    return s;
  }, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/dora",
        body: { sessionId },
      }),
    [sessionId],
  );

  const { messages, sendMessage, status } = useChat({
    id: sessionId,
    transport,
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status, showLeadForm, leadSent]);

  useEffect(() => {
    if (open && !showLeadForm) inputRef.current?.focus();
  }, [open, showLeadForm, status]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  };

  const conversationSummary = () =>
    messages
      .map((m) => {
        const txt = m.parts
          .map((p) => (p.type === "text" ? p.text : ""))
          .join("")
          .trim();
        return `${m.role === "user" ? "Cliente" : "Dora"}: ${txt}`;
      })
      .filter(Boolean)
      .join("\n");

  const submitLead = async () => {
    setSubmitting(true);
    try {
      const resp = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          sessionId,
          conversationSummary: conversationSummary(),
        }),
      });
      if (resp.ok) {
        setLeadSent(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const summary = conversationSummary();
    const text = encodeURIComponent(
      `Olá Dona Dora! Vim do chat da Dora no site.\n${lead.name ? `Sou ${lead.name}. ` : ""}${lead.interest ? `Tenho interesse em: ${lead.interest}.` : ""}${summary ? `\n\n— Resumo da conversa —\n${summary}` : ""}`,
    );
    window.open(`https://wa.me/${WHATSAPP}?text=${text}`, "_blank");
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar chat" : "Falar com a Dora"}
        className={`fixed bottom-5 right-5 md:bottom-7 md:right-7 z-[60] group transition-all duration-500 ease-luxe ${
          open ? "scale-90 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
      >
        <span className="relative flex items-center gap-3 pl-4 pr-5 py-3.5 bg-ink text-background rounded-full shadow-luxe hover:bg-gold hover:text-ink transition-all duration-500 ease-luxe">
          <span className="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none" />
          <Sparkles className="size-4" />
          <span className="text-xs tracking-[0.22em] uppercase font-medium">Falar com a Dora</span>
        </span>
      </button>

      {/* Drawer */}
      <div
        className={`fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-[70] flex md:block transition-all duration-500 ease-luxe ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop mobile */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-ink/40 backdrop-blur-sm md:hidden"
        />
        <div
          className={`relative ml-auto mt-auto md:m-0 w-full md:w-[400px] max-w-full h-[88vh] md:h-[640px] max-h-[88vh] bg-background border border-border md:rounded-lg shadow-luxe flex flex-col overflow-hidden transition-transform duration-500 ease-luxe ${
            open ? "translate-y-0" : "translate-y-8"
          }`}
        >
          {/* Header */}
          <header className="flex items-center justify-between gap-3 px-5 py-4 bg-ink text-background">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-gold grid place-items-center text-ink font-display text-lg animate-pulse-glow">
                D
              </div>
              <div>
                <div className="font-display text-base leading-tight">Dora</div>
                <div className="text-[10px] tracking-luxe uppercase text-gold-soft flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" /> Consultora Dona Dora
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="p-2 -mr-2 text-background/70 hover:text-background transition-colors"
            >
              <X className="size-5" />
            </button>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-background">
            {messages.length === 0 && (
              <div className="space-y-3 animate-fade-up">
                <div className="text-sm text-foreground/90 leading-relaxed">
                  Olá! Sou a <strong className="text-foreground">Dora</strong>, consultora de moda da
                  Dona Dora. Posso ajudar você a encontrar peças, acessórios ou presentes especiais.
                </div>
                <div className="text-sm text-foreground/70">
                  Como posso te ajudar hoje?
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    "Quero um look elegante",
                    "Procuro um presente",
                    "Tem novidades?",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendMessage({ text: s })}
                      className="text-xs px-3 py-2 border border-border hover:border-foreground hover:bg-muted transition-all duration-300"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground pt-3">
                  Ao continuar, você concorda em compartilhar seus dados com a Dona Dora para
                  atendimento (LGPD).
                </p>
              </div>
            )}

            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              if (!text) return null;
              return (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
                >
                  {m.role === "user" ? (
                    <div className="max-w-[85%] px-4 py-2.5 bg-ink text-background text-sm rounded-2xl rounded-br-sm">
                      {text}
                    </div>
                  ) : (
                    <div className="max-w-[90%] text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {text}
                    </div>
                  )}
                </div>
              );
            })}

            {status === "submitted" && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm animate-fade-up">
                <span className="inline-block size-1.5 rounded-full bg-gold animate-pulse" />
                <span className="inline-block size-1.5 rounded-full bg-gold animate-pulse" style={{ animationDelay: "0.15s" }} />
                <span className="inline-block size-1.5 rounded-full bg-gold animate-pulse" style={{ animationDelay: "0.3s" }} />
                <span className="ml-1">Dora está pensando...</span>
              </div>
            )}
          </div>

          {/* Lead form OR composer */}
          {showLeadForm ? (
            <div className="border-t border-border bg-muted/40 p-5 overflow-y-auto max-h-[60%]">
              {leadSent ? (
                <div className="text-center py-6 animate-fade-up">
                  <div className="size-12 rounded-full bg-gradient-gold grid place-items-center mx-auto mb-4 text-ink">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="font-display text-xl mb-2">Obrigada!</div>
                  <p className="text-sm text-muted-foreground mb-5">
                    Seus dados chegaram para a equipe da Dona Dora. Em breve entraremos em contato.
                  </p>
                  <button
                    type="button"
                    onClick={openWhatsApp}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-ink text-background text-xs tracking-[0.22em] uppercase hover:bg-gold hover:text-ink transition-all duration-500"
                  >
                    <ExternalLink className="size-4" /> Continuar no WhatsApp
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] tracking-luxe uppercase text-muted-foreground">
                      Deixe seus dados
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLeadForm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Voltar
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <LeadField label="Nome" value={lead.name} onChange={(v) => setLead({ ...lead, name: v })} className="col-span-2" />
                    <LeadField label="WhatsApp" value={lead.whatsapp} onChange={(v) => setLead({ ...lead, whatsapp: v })} className="col-span-2" />
                    <LeadField label="Interesse" value={lead.interest} onChange={(v) => setLead({ ...lead, interest: v })} className="col-span-2" />
                    <LeadField label="Tamanho" value={lead.size} onChange={(v) => setLead({ ...lead, size: v })} />
                    <LeadField label="Faixa de preço" value={lead.budget} onChange={(v) => setLead({ ...lead, budget: v })} />
                    <LeadField label="Estilo" value={lead.style} onChange={(v) => setLead({ ...lead, style: v })} className="col-span-2" />
                  </div>
                  <button
                    type="button"
                    disabled={submitting || (!lead.name && !lead.whatsapp)}
                    onClick={submitLead}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-ink text-background text-xs tracking-[0.22em] uppercase hover:bg-gold hover:text-ink transition-all duration-500 disabled:opacity-50 disabled:hover:bg-ink disabled:hover:text-background"
                  >
                    {submitting ? "Enviando..." : "Enviar para a Dona Dora"}
                  </button>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="border-t border-border bg-background p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as unknown as React.FormEvent);
                    }
                  }}
                  rows={1}
                  placeholder="Escreva sua mensagem..."
                  className="flex-1 resize-none bg-muted/50 border border-border focus:border-foreground outline-none rounded-md px-3 py-2.5 text-sm max-h-24 transition-colors"
                  disabled={isBusy}
                />
                <button
                  type="submit"
                  disabled={isBusy || !input.trim()}
                  aria-label="Enviar"
                  className="size-10 grid place-items-center bg-ink text-background hover:bg-gold hover:text-ink transition-colors disabled:opacity-40 rounded-md shrink-0"
                >
                  <Send className="size-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3 px-1">
                <button
                  type="button"
                  onClick={() => setShowLeadForm(true)}
                  className="flex-1 text-[10px] tracking-luxe uppercase text-muted-foreground hover:text-foreground py-2 border border-border hover:border-foreground transition-all duration-300"
                >
                  Deixar contato
                </button>
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="flex-1 inline-flex items-center justify-center gap-2 text-[10px] tracking-luxe uppercase bg-ink text-background hover:bg-gold hover:text-ink py-2 px-3 transition-all duration-300"
                >
                  <MessageCircle className="size-3" /> Continuar no WhatsApp
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function LeadField({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] tracking-luxe uppercase text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-background border border-border focus:border-foreground outline-none rounded px-2.5 py-2 text-sm transition-colors"
      />
    </label>
  );
}
