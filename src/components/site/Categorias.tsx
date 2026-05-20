import fem from "@/assets/category-feminina.jpg";
import masc from "@/assets/category-masculina.jpg";
import acc from "@/assets/category-accessories.jpg";
import joias from "@/assets/category-joias.jpg";

const cats = [
  { title: "Moda Feminina", desc: "Vestidos, alfaiataria, casual chic.", img: fem, span: "md:col-span-7 md:row-span-2" },
  { title: "Moda Masculina", desc: "Camisaria, blazers, essenciais.", img: masc, span: "md:col-span-5" },
  { title: "Acessórios", desc: "Óculos, bolsas, bonés.", img: acc, span: "md:col-span-5" },
  { title: "Joias", desc: "Peças delicadas e atemporais.", img: joias, span: "md:col-span-12" },
];

export function Categorias() {
  return (
    <section id="categorias" className="py-24 md:py-32 bg-muted">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[11px] tracking-luxe uppercase text-muted-foreground">
                Categorias
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] max-w-2xl text-balance">
              Estilo para cada <span className="italic">história</span>.
            </h2>
          </div>
          <p className="text-foreground/65 max-w-md text-pretty">
            Uma curadoria pensada para o seu dia, o seu trabalho e os seus momentos especiais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 md:auto-rows-[280px] gap-4 md:gap-5">
          {cats.map((c) => (
            <a
              key={c.title}
              href="https://wa.me/5549991540421"
              target="_blank"
              rel="noreferrer"
              className={`group relative img-zoom block overflow-hidden bg-foreground/5 ${c.span} aspect-[4/5] md:aspect-auto`}
            >
              <img
                src={c.img}
                alt={c.title}
                loading="lazy"
                width={1024}
                height={1280}
                className="absolute inset-0 size-full object-cover grayscale-[15%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-background">
                <div className="text-[10px] tracking-luxe uppercase text-gold-soft mb-2">
                  Coleção
                </div>
                <h3 className="font-display text-2xl md:text-3xl">{c.title}</h3>
                <p className="text-sm text-background/75 mt-1">{c.desc}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-[11px] tracking-luxe uppercase">
                  Explorar
                  <span className="h-px w-8 bg-background transition-all duration-500 ease-luxe group-hover:w-14 group-hover:bg-gold" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
