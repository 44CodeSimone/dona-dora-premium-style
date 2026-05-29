import { useQuery } from "@tanstack/react-query";
import { getLiveData } from "@/lib/site.functions";
import { Radio } from "lucide-react";

function toEmbed(url: string): { type: "iframe" | "link"; src: string } {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let id = u.searchParams.get("v");
      if (!id && u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
      if (!id && u.pathname.startsWith("/live/")) id = u.pathname.split("/")[2];
      if (id) return { type: "iframe", src: `https://www.youtube.com/embed/${id}?autoplay=0` };
    }
    // Instagram → não embeda live, vira link
    return { type: "link", src: url };
  } catch {
    return { type: "link", src: url };
  }
}

export function Live() {
  const { data } = useQuery({ queryKey: ["live"], queryFn: () => getLiveData(), staleTime: 30_000 });
  if (!data?.enabled) return null;
  const s = data.settings!;
  const embed = s.live_url ? toEmbed(s.live_url) : null;

  return (
    <section id="live" className="relative bg-foreground text-background py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #fff 0, transparent 50%)" }} />
      <div className="max-w-6xl mx-auto px-5 md:px-8 relative">
        <div className="flex items-center gap-3 mb-5">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-300 text-[10px] tracking-[0.25em] uppercase">
            <span className="size-2 rounded-full bg-red-500 animate-pulse" /> Ao Vivo
          </span>
          <Radio className="size-4 text-[color:var(--gold-soft)]" />
        </div>
        <h2 className="font-display text-3xl md:text-5xl leading-tight mb-3">{s.live_title}</h2>
        <p className="text-background/70 max-w-2xl mb-10">{s.live_description}</p>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
          <div className="rounded-xl overflow-hidden border border-background/10 bg-black aspect-video">
            {embed?.type === "iframe" ? (
              <iframe
                src={embed.src}
                title={s.live_title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : embed ? (
              <a href={embed.src} target="_blank" rel="noreferrer"
                className="flex flex-col items-center justify-center h-full text-center p-8 hover:bg-white/5 transition">
                <Radio className="size-10 text-[color:var(--gold-soft)] mb-4" />
                <span className="text-xs tracking-luxe uppercase text-background/60 mb-2">Live em andamento</span>
                <span className="font-display text-xl">Abrir transmissão →</span>
              </a>
            ) : (
              <div className="flex items-center justify-center h-full text-background/40 text-sm">Link da live não configurado</div>
            )}
          </div>

          {data.products.length > 0 && (
            <div>
              <h3 className="text-[11px] tracking-luxe uppercase text-[color:var(--gold-soft)] mb-4">Peças em destaque na live</h3>
              <div className="space-y-3">
                {data.products.map((p) => (
                  <a key={p.id} href="#colecao"
                    className="flex gap-3 items-center p-3 rounded-lg bg-background/[0.04] border border-background/10 hover:bg-background/[0.08] transition card-touch">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.name} className="size-16 rounded object-cover" loading="lazy" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-base truncate">{p.name}</div>
                      <div className="text-xs text-[color:var(--gold-soft)] mt-0.5">
                        {p.promo_price ? `R$ ${Number(p.promo_price).toFixed(2)}` : p.price ? `R$ ${Number(p.price).toFixed(2)}` : ""}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
