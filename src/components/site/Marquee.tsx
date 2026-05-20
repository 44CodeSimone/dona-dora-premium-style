const items = [
  "Curadoria premium",
  "Moda feminina",
  "Moda masculina",
  "Acessórios",
  "Joias delicadas",
  "Presentes especiais",
  "Atendimento humanizado",
  "Urubici · SC",
];

export function Marquee() {
  return (
    <div className="py-6 bg-foreground text-background overflow-hidden border-y border-border/20">
      <div className="marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-12 text-[11px] tracking-luxe uppercase">
            {item}
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
