import fem from "@/assets/category-feminina.jpg";
import masc from "@/assets/category-masculina.jpg";
import acc from "@/assets/category-accessories.jpg";
import joias from "@/assets/category-joias.jpg";
import { MessageCircle } from "lucide-react";

const products = [
  { name: "Vestido Midi Sereno", tag: "Novidade", price: "Sob consulta", img: fem },
  { name: "Blazer Alfaiataria Noir", tag: "Coleção", price: "Sob consulta", img: masc },
  { name: "Óculos Solar Dourado", tag: "Acessórios", price: "Sob consulta", img: acc },
  { name: "Colar Filigrana Ouro", tag: "Joias", price: "Sob consulta", img: joias },
];

export function Produtos() {
  return (
    <section id="colecao" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[11px] tracking-luxe uppercase text-muted-foreground">
                Coleção destaque
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
              Peças <span className="italic">selecionadas</span> para você.
            </h2>
          </div>
          <a
            href="https://wa.me/5549991540421"
            target="_blank"
            rel="noreferrer"
            className="self-start md:self-end text-xs tracking-[0.22em] uppercase gold-underline"
          >
            Ver todos os produtos
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <div key={p.name} className="group flex flex-col">
              <div className="img-zoom relative aspect-[3/4] bg-muted overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="size-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-background/90 backdrop-blur text-[10px] tracking-luxe uppercase">
                  {p.tag}
                </div>
                <a
                  href="https://wa.me/5549991540421"
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background text-[11px] tracking-luxe uppercase opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-luxe"
                >
                  <MessageCircle className="size-3.5" />
                  Comprar via WhatsApp
                </a>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg leading-tight">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{p.price}</p>
                </div>
                <span className="text-xs text-gold">✦</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
