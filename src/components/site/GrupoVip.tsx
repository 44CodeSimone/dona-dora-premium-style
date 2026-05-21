import { Sparkles } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function GrupoVip() {
  const { data: s } = useSiteSettings();
  const benefits: string[] = Array.isArray(s?.vip_benefits) ? (s!.vip_benefits as string[]) : [];

  return (
    <section id="vip" className="relative py-24 md:py-32 bg-foreground text-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 size-[400px] rounded-full blur-3xl bg-[color:var(--gold)] opacity-20" />
        <div className="absolute bottom-0 right-0 size-[500px] rounded-full blur-3xl bg-[color:var(--gold-soft)] opacity-10" />
      </div>
      <div className="relative max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-[color:var(--gold)]" />
            <span className="text-[11px] tracking-luxe uppercase text-[color:var(--gold-soft)]">Acesso exclusivo</span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
            {s?.vip_title ?? "Grupo VIP Dona Dora"}
          </h2>
          <p className="mt-6 text-background/75 text-base md:text-lg max-w-xl whitespace-pre-line text-pretty">
            {s?.vip_subtitle}
          </p>
          <ul className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-background/85">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <Sparkles className="size-3.5 text-[color:var(--gold)] shrink-0 mt-1" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <a
            href={s?.vip_link ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex items-center gap-2 px-8 py-4 bg-[color:var(--gold)] text-foreground text-xs tracking-[0.22em] uppercase shadow-gold hover:opacity-90 transition"
          >
            <Sparkles className="size-4" /> Entrar no Grupo VIP
          </a>
        </div>
        {s?.vip_image_url && (
          <div className="md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden rounded-lg shadow-luxe">
              <img src={s.vip_image_url} alt="Grupo VIP Dona Dora" className="size-full object-cover" loading="lazy" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
