import { Instagram, MessageCircle, MapPin } from "lucide-react";
import logo from "@/assets/logo-wordmark.png";


export function Footer() {
  return (
    <footer className="bg-ink text-background">
      <div className="mx-auto max-w-7xl px-6 md:px-10 pt-20 pb-10">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <img
              src={logo}
              alt="Dona Dora"
              width={1536}
              height={1024}
              loading="lazy"
              className="h-16 md:h-20 w-auto object-contain invert brightness-200"
            />

            <p className="mt-5 text-background/65 max-w-sm text-pretty">
              Boutique premium em Urubici/SC — moda feminina, masculina, acessórios e joias.
              Curadoria, elegância e estilo.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Social href="https://wa.me/5549991540421" label="WhatsApp">
                <MessageCircle className="size-4" />
              </Social>
              <Social href="https://instagram.com" label="Instagram">
                <Instagram className="size-4" />
              </Social>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[11px] tracking-luxe uppercase text-gold-soft mb-5">Navegação</h4>
            <ul className="space-y-3 text-sm text-background/80">
              <li><a href="#sobre" className="gold-underline">Sobre</a></li>
              <li><a href="#categorias" className="gold-underline">Categorias</a></li>
              <li><a href="#colecao" className="gold-underline">Coleção</a></li>
              <li><a href="#nexa" className="gold-underline">Nexa IA</a></li>
              <li><a href="#contato" className="gold-underline">Contato</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-[11px] tracking-luxe uppercase text-gold-soft mb-5">Boutique</h4>
            <div className="space-y-4 text-sm text-background/80">
              <div className="flex gap-3">
                <MapPin className="size-4 text-gold shrink-0 mt-0.5" />
                <span>Av. Adolfo Konder, 2659 · Bairro Esquina · Urubici/SC</span>
              </div>
              <div>
                <span className="text-background/60">Seg–Sex</span> · 09h às 18h30
              </div>
              <div>
                <span className="text-background/60">Sábado</span> · 09h às 17h
              </div>
              <a
                href="https://wa.me/5549991540421"
                target="_blank"
                rel="noreferrer"
                className="inline-block pt-1 gold-underline"
              >
                (49) 99154-0421
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-background/15 flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-background/55">
          <div>© {new Date().getFullYear()} Dona Dora · Todos os direitos reservados.</div>
          <div className="tracking-[0.2em] uppercase">
            Desenvolvido por <span className="text-gold-soft">44CODE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="size-10 grid place-items-center border border-background/20 hover:border-gold hover:text-gold transition-all duration-500 ease-luxe"
    >
      {children}
    </a>
  );
}
