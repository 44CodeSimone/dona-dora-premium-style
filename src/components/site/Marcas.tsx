import { useQuery } from "@tanstack/react-query";
import { getPublicBrands } from "@/lib/site.functions";

export function Marcas() {
  const { data } = useQuery({
    queryKey: ["public-brands"],
    queryFn: () => getPublicBrands(),
    staleTime: 60_000,
  });
  if (!data || data.length === 0) return null;
  return (
    <section id="marcas" className="py-20 md:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex items-center gap-3 mb-3 justify-center">
          <span className="h-px w-10 bg-gold" />
          <span className="text-[11px] tracking-luxe uppercase text-muted-foreground">Marcas que vestimos</span>
          <span className="h-px w-10 bg-gold" />
        </div>
        <h2 className="font-display text-3xl md:text-5xl text-center mb-10 md:mb-14 text-balance">
          As marcas <span className="italic">que você ama</span>, aqui na Dona Dora.
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {data.map((b) => (
            <div
              key={b.id}
              className="aspect-square border border-foreground/10 bg-card hover:border-gold transition-colors flex items-center justify-center p-4"
              title={b.name}
            >
              {b.logo_url ? (
                <img
                  src={b.logo_url}
                  alt={b.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <span className="font-display text-base md:text-lg text-center">{b.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
