import { Star } from "lucide-react";

const items = [
  {
    quote:
      "A curadoria da Dona Dora é impecável. Cada visita eu saio com algo especial — sinto que vestem o meu estilo.",
    name: "Mariana S.",
    role: "Cliente Urubici",
  },
  {
    quote:
      "Atendimento que faz diferença. A loja é linda, sofisticada, e as peças são únicas. Virei cliente fiel.",
    name: "Carolina R.",
    role: "Cliente São Joaquim",
  },
  {
    quote:
      "Comprei presentes pra família toda e todos amaram. Embalagem premium, produto premium. Recomendo demais.",
    name: "Júlia P.",
    role: "Cliente Florianópolis",
  },
];

export function Depoimentos() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-10 bg-gold" />
            <span className="text-[11px] tracking-luxe uppercase text-muted-foreground">
              Depoimentos
            </span>
            <span className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl leading-tight text-balance">
            Quem veste Dona Dora, <span className="italic">conta.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {items.map((t) => (
            <figure
              key={t.name}
              className="hover-lift p-8 bg-card border border-border flex flex-col gap-6"
            >
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="font-display text-xl leading-snug text-foreground/90">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-auto pt-4 border-t border-border">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-[11px] tracking-luxe uppercase text-muted-foreground mt-0.5">
                  {t.role}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
