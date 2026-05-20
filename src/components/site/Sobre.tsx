import femImg from "@/assets/category-feminina.jpg";

export function Sobre() {
  return (
    <section id="sobre" className="py-24 md:py-40 bg-background">
      <div className="mx-auto max-w-7xl px-6 md:px-10 grid md:grid-cols-12 gap-12 md:gap-16 items-center">
        <div className="md:col-span-5 order-2 md:order-1">
          <div className="img-zoom aspect-[3/4] bg-muted shadow-luxe">
            <img
              src={femImg}
              alt="Estilo Dona Dora"
              loading="lazy"
              width={1024}
              height={1280}
              className="size-full object-cover"
            />
          </div>
        </div>

        <div className="md:col-span-7 md:pl-10 order-1 md:order-2">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-gold" />
            <span className="text-[11px] tracking-luxe uppercase text-muted-foreground">
              Sobre a boutique
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
            Uma boutique moderna, <span className="italic text-foreground/70">acolhedora</span> e referência
            em moda em Urubici.
          </h2>
          <div className="mt-8 space-y-5 text-foreground/75 text-base md:text-lg max-w-xl">
            <p>
              A <strong className="text-foreground font-medium">Dona Dora</strong> nasceu para traduzir elegância em peças
              do dia a dia — moda feminina, masculina e acessórios escolhidos com olhar
              autoral, para quem quer se vestir bem sem abrir mão de identidade.
            </p>
            <p>
              Cada visita é uma experiência: ambiente sofisticado, atendimento humano e uma
              curadoria que une tendências, conforto e exclusividade.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            {[
              ["+5k", "clientes"],
              ["100%", "curadoria"],
              ["Urubici", "SC"],
            ].map(([n, l]) => (
              <div key={l} className="border-l border-border pl-4">
                <div className="font-display text-3xl">{n}</div>
                <div className="text-[11px] tracking-luxe uppercase text-muted-foreground mt-1">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
