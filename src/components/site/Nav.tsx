import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-wordmark.png";


const links = [
  { href: "#sobre", label: "Sobre" },
  { href: "#categorias", label: "Categorias" },
  { href: "#colecao", label: "Coleção" },
  { href: "#nexa", label: "Nexa IA" },
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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-luxe ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/60"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group" aria-label="Dona Dora">
          <img
            src={logo}
            alt="Dona Dora"
            width={1536}
            height={1024}
            className={`h-9 md:h-11 w-auto object-contain transition-[filter] duration-500 ease-luxe ${
              scrolled ? "invert-0" : "invert brightness-200"
            }`}
          />
        </a>


        <nav className="hidden md:flex items-center gap-9">
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

        <a
          href="https://wa.me/5549991540421"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase px-5 py-3 bg-foreground text-background hover:bg-foreground/90 transition-all duration-500 ease-luxe"
        >
          Atendimento
        </a>

        <button
          onClick={() => setOpen((s) => !s)}
          className="md:hidden p-2 -mr-2 text-foreground"
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
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
            href="https://wa.me/5549991540421"
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
