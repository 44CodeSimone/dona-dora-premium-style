import { useSiteSettings } from "@/hooks/use-site-settings";

const DEFAULT = "Nova Coleção · Enviamos para todo o Brasil · Boutique Premium · Urubici/SC · Grupo VIP";

export function Marquee() {
  const { data: s } = useSiteSettings();
  const raw = (s?.topbar_text ?? "").trim();
  const text = raw && raw.includes("·") ? raw : DEFAULT;
  const items = text.split("·").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="py-5 bg-foreground text-background overflow-hidden border-y border-border/20 select-none">
      <div className="marquee whitespace-nowrap">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-12 text-[11px] tracking-luxe uppercase">
            <span className="font-display italic text-[13px] tracking-normal lowercase">{item}</span>
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
