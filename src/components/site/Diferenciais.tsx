import { Sparkles, Heart, Users, Crown } from "lucide-react";

const items = [
  { icon: Crown, title: "Moda feminina e masculina", text: "Curadoria premium para todos os estilos, com peças únicas escolhidas a dedo." },
  { icon: Sparkles, title: "Curadoria de peças", text: "Cada coleção é selecionada para entregar elegância, conforto e atualidade." },
  { icon: Heart, title: "Atendimento próximo", text: "Você é recebida pela Dona Dora com carinho — presencialmente ou pelo WhatsApp." },
  { icon: Users, title: "Grupo VIP Dona Dora", text: "Acesso antecipado a novidades, promoções exclusivas e prioridade no atendimento." },
];

export function Diferenciais() {
  return (
    <section id="diferenciais" className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="max-w-2xl mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-[color:var(--gold)]" />
            <span className="text-[11px] tracking-luxe uppercase text-muted-foreground">Por que Dona Dora</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl leading-[1.05] text-balance">
            Uma boutique pensada para quem ama <span className="italic">se vestir bem</span>.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(({ icon: Icon, title, text }) => (
            <div key={title} className="group p-6 md:p-8 bg-card border border-border hover:border-[color:var(--gold)] transition-all duration-500 ease-luxe hover-lift">
              <Icon className="size-6 text-[color:var(--gold)] mb-5" strokeWidth={1.5} />
              <h3 className="font-display text-xl md:text-2xl leading-tight mb-3">{title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
