import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { CartButton } from "./Cart";

const links = [
  { href: "#colecao", label: "Loja" },
  { href: "#categorias", label: "Categorias" },
  { href: "#marcas", label: "Marcas" },
  { href: "#vip", label: "Grupo VIP" },
  { href: "#contato", label: "Contato" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-luxe ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border/60"
          : "bg-background/70 backdrop-blur"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10 h-16 md:h-20 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-baseline gap-2 group shrink-0">
          <span className="font-display text-2xl md:text-[28px] leading-none tracking-tight">
            Dona <span className="italic">Dora</span>
          </span>
          <span className="hidden sm:inline text-[10px] tracking-luxe text-muted-foreground uppercase">
            Boutique
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="gold-underline text-sm text-foreground/80 hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <a
            href="https://wa.me/5549991210083"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase px-4 py-2.5 bg-foreground text-background hover:bg-foreground/90 transition-all duration-500 ease-luxe"
          >
            Atendimento
          </a>
          <CartButton />
          <button
            onClick={() => setOpen((s) => !s)}
            className="md:hidden p-2 -mr-2 text-foreground"
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-luxe bg-background/95 backdrop-blur-xl ${
          open ? "max-h-[420px] border-b border-border" : "max-h-0"
        }`}
      >
        <nav className="px-6 py-6 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-base text-foreground/90 border-b border-border/60 last:border-0"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://wa.me/5549991210083"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex justify-center items-center gap-2 text-xs tracking-[0.2em] uppercase px-5 py-4 bg-foreground text-background"
          >
            Falar no WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
