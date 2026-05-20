import heroImg from "@/assets/hero-fashion.jpg";
import logo from "@/assets/logo-wordmark.png";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-ink text-background">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Editorial Dona Dora — boutique premium em Urubici"
          width={1536}
          height={1920}
          className="size-full object-cover object-center opacity-70 animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10 pt-32 md:pt-40 pb-20 min-h-[100svh] flex flex-col justify-end">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="h-px w-10 bg-gold" />
            <span className="text-[11px] tracking-luxe uppercase text-gold-soft">
              Urubici · Santa Catarina
            </span>
          </div>

          <img
            src={logo}
            alt="Dona Dora"
            width={1536}
            height={1024}
            className="h-20 md:h-28 lg:h-32 w-auto object-contain mb-8 invert brightness-200 animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          />

          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            Moda, elegância e<br />
            <span className="italic text-gold-soft">estilo</span> para quem
            <br />ama se vestir bem.
          </h1>

          <p
            className="mt-8 max-w-xl text-base md:text-lg text-background/75 text-pretty animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            Uma experiência moderna e sofisticada em moda e acessórios em Urubici —
            curadoria premium, atendimento próximo, peças que contam histórias.
          </p>

          <div
            className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up"
            style={{ animationDelay: "0.55s" }}
          >
            <a
              href="https://wa.me/5549991540421"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center justify-center gap-3 px-7 py-4 bg-background text-foreground text-xs tracking-[0.22em] uppercase hover:bg-gold transition-all duration-500 ease-luxe"
            >
              Falar no WhatsApp
              <ArrowRight className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Pilares premium */}
        <div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-background/15 animate-fade-up"
          style={{ animationDelay: "0.75s" }}
        >
          {[
            ["Feminino & Masculino", "Curadoria autoral"],
            ["Atendimento", "Próximo e humano"],
            ["Curadoria", "Peças exclusivas"],
            ["WhatsApp", "(49) 99154-0421"],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-[10px] tracking-luxe uppercase text-gold-soft mb-2">{k}</div>
              <div className="text-sm text-background/85">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
