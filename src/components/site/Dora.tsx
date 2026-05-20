import { Sparkles, MessageCircle, Heart, ShoppingBag } from "lucide-react";

export function Dora() {
  return (
    <section id="dora" className="relative py-24 md:py-40 bg-ink text-background overflow-hidden">
      {/* Glow background sutil */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 size-[600px] rounded-full opacity-[0.08] blur-3xl bg-gradient-gold" />
        <div className="absolute -bottom-40 -left-20 size-[500px] rounded-full opacity-[0.05] blur-3xl bg-background" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 grid md:grid-cols-12 gap-12 md:gap-16 items-center">
        <div className="md:col-span-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-gold" />
            <span className="text-[11px] tracking-luxe uppercase text-gold-soft">
              Inteligência Artificial · Consultora
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.02] text-balance">
            Conheça a <span className="italic text-gold-soft">Dora</span> — sua consultora de moda
            virtual.
          </h2>
          <p className="mt-6 text-background/75 text-base md:text-lg max-w-xl text-pretty">
            Inteligente, simpática e disponível 24h. A Dora te ajuda a encontrar produtos,
            montar looks, escolher presentes e descobrir as novidades da boutique — direto no
            site, com encaminhamento para o WhatsApp quando você quiser fechar.
          </p>

          <ul className="mt-10 grid sm:grid-cols-2 gap-5 max-w-2xl">
            {[
              { icon: Heart, t: "Atendimento humanizado", d: "Próximo, educado, sem pressionar." },
              { icon: ShoppingBag, t: "Recomendação real", d: "Sugere peças do catálogo Dona Dora." },
              { icon: Sparkles, t: "Sugestão de presentes", d: "Encontra o presente certo para cada ocasião." },
              { icon: MessageCircle, t: "Encaminha pro WhatsApp", d: "Continue a conversa com a loja em um clique." },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-4">
                <div className="size-10 rounded-full border border-background/15 grid place-items-center text-gold shrink-0">
                  <Icon className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-background">{t}</div>
                  <div className="text-sm text-background/65 mt-0.5">{d}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-col sm:flex-row gap-3">
            <p className="text-xs text-background/55 tracking-[0.2em] uppercase">
              ↓ Use o botão dourado no canto da tela para conversar
            </p>
          </div>
        </div>

        {/* Card visual da Dora */}
        <div className="md:col-span-5">
          <div className="relative max-w-md mx-auto">
            <div className="relative bg-background/5 backdrop-blur-2xl border border-background/10 rounded-2xl p-8 shadow-luxe">
              <div className="flex items-center gap-4 pb-5 border-b border-background/10">
                <div className="size-14 rounded-full bg-gradient-gold grid place-items-center text-ink font-display text-2xl animate-pulse-glow">
                  D
                </div>
                <div>
                  <div className="font-display text-2xl">Dora</div>
                  <div className="text-[10px] tracking-luxe uppercase text-gold-soft flex items-center gap-1.5 mt-1">
                    <span className="size-1.5 rounded-full bg-emerald-400" /> Online · 24h
                  </div>
                </div>
              </div>
              <div className="py-6 space-y-3">
                <div className="text-sm text-background/85 px-4 py-2.5 bg-background/5 border border-background/10 rounded-2xl rounded-bl-sm max-w-[85%]">
                  Olá! Posso te ajudar a encontrar algo especial hoje? 😊
                </div>
                <div className="flex justify-end">
                  <div className="text-sm text-ink px-4 py-2.5 bg-background rounded-2xl rounded-br-sm max-w-[85%]">
                    Procuro um vestido elegante.
                  </div>
                </div>
                <div className="text-sm text-background/85 px-4 py-2.5 bg-background/5 border border-background/10 rounded-2xl rounded-bl-sm max-w-[85%]">
                  Adorei! Para qual ocasião? Tenho peças incríveis na nova coleção ✨
                </div>
              </div>
              <div className="pt-4 border-t border-background/10 text-center">
                <div className="text-[10px] tracking-luxe uppercase text-gold-soft">
                  ✦ Powered by Dona Dora ✦
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
