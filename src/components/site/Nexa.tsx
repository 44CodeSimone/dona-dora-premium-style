import { Sparkles, Send } from "lucide-react";
import nexaImg from "@/assets/nexa-glow.jpg";

const msgs = [
  { from: "nexa", text: "Oi 😊 posso te ajudar a encontrar algo lindo hoje?" },
  { from: "user", text: "Procuro algo elegante para um jantar." },
  { from: "nexa", text: "Adorei! Você prefere algo casual chic ou mais sofisticado?" },
  { from: "nexa", text: "Posso te mostrar novidades da Dona Dora 😊" },
];

export function Nexa() {
  return (
    <section id="nexa" className="relative py-24 md:py-40 bg-ink text-background overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 size-[600px] rounded-full opacity-40 blur-3xl bg-gradient-rose" />
        <div className="absolute -bottom-40 -left-20 size-[500px] rounded-full opacity-20 blur-3xl bg-gradient-gold" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 grid md:grid-cols-12 gap-12 md:gap-16 items-center">
        <div className="md:col-span-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-gold" />
            <span className="text-[11px] tracking-luxe uppercase text-gold-soft">
              Assistente virtual
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
            Conheça a <span className="italic text-gold-soft">Nexa</span> — sua consultora de moda Dona Dora.
          </h2>
          <p className="mt-6 text-background/75 text-base md:text-lg max-w-lg text-pretty">
            Inteligente, simpática e disponível 24/7. A Nexa te ajuda a encontrar produtos,
            montar looks, escolher presentes e descobrir as novidades da boutique — direto no
            WhatsApp.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-background/85 max-w-md">
            {[
              "Recomendações de looks personalizadas",
              "Sugestões de presentes",
              "Novidades e promoções em primeira mão",
              "Atendimento direto com a loja",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Sparkles className="size-3.5 text-gold" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/5549991540421?text=Oi%20Nexa%2C%20quero%20uma%20recomendação%20da%20Dona%20Dora"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gradient-gold text-ink text-xs tracking-[0.22em] uppercase shadow-gold hover:opacity-90 transition-opacity duration-500"
            >
              <Sparkles className="size-4" /> Conversar com a Nexa
            </a>
          </div>
        </div>

        {/* Chat mock */}
        <div className="md:col-span-6">
          <div className="relative max-w-md mx-auto">
            <img
              src={nexaImg}
              alt=""
              aria-hidden
              loading="lazy"
              width={1280}
              height={1280}
              className="absolute -top-20 -right-12 size-72 object-cover rounded-full opacity-60 blur-2xl animate-float"
            />
            <div className="relative bg-background/5 backdrop-blur-2xl border border-background/10 rounded-2xl p-5 shadow-luxe">
              <div className="flex items-center gap-3 pb-4 border-b border-background/10">
                <div className="relative size-10 rounded-full bg-gradient-rose grid place-items-center text-ink font-display text-lg animate-pulse-glow">
                  N
                </div>
                <div>
                  <div className="font-display text-base">Nexa</div>
                  <div className="text-[10px] tracking-luxe uppercase text-gold-soft flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-400" /> Online agora
                  </div>
                </div>
              </div>
              <div className="space-y-3 py-5 max-h-[320px] overflow-hidden">
                {msgs.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                        m.from === "user"
                          ? "bg-background text-foreground rounded-br-sm"
                          : "bg-background/10 text-background border border-background/10 rounded-bl-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-background/10">
                <div className="flex-1 px-3 py-2.5 rounded-full bg-background/5 border border-background/10 text-sm text-background/50">
                  Escreva sua mensagem…
                </div>
                <button className="size-10 grid place-items-center rounded-full bg-gradient-gold text-ink">
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
