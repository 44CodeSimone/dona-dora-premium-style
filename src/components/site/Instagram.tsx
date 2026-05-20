import { Instagram as IGIcon } from "lucide-react";
import fem from "@/assets/category-feminina.jpg";
import masc from "@/assets/category-masculina.jpg";
import acc from "@/assets/category-accessories.jpg";
import joias from "@/assets/category-joias.jpg";

const tiles = [fem, masc, acc, joias, fem, masc];

export function Instagram() {
  return (
    <section className="py-24 md:py-32 bg-nude/50">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[11px] tracking-luxe uppercase text-muted-foreground">
                @donadora
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              Siga a Dona Dora no <span className="italic">Instagram</span>
            </h2>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="self-start md:self-end inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase gold-underline"
          >
            <IGIcon className="size-4" /> @donadora
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
          {tiles.map((src, i) => (
            <a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="img-zoom relative aspect-square bg-foreground/5 overflow-hidden group"
            >
              <img
                src={src}
                alt="Post Instagram Dona Dora"
                loading="lazy"
                width={1024}
                height={1024}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all duration-500 grid place-items-center">
                <IGIcon className="size-6 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
