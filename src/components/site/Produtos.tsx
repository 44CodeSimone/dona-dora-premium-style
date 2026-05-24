import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { getPublicProducts } from "@/lib/site.functions";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Skeleton } from "@/components/ui/skeleton";
import fem from "@/assets/category-feminina.jpg";
import masc from "@/assets/category-masculina.jpg";
import acc from "@/assets/category-accessories.jpg";
import joias from "@/assets/category-joias.jpg";

type Category = "todos" | "feminina" | "masculina" | "acessorios" | "joias";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "feminina", label: "Feminina" },
  { id: "masculina", label: "Masculina" },
  { id: "acessorios", label: "Acessórios" },
  { id: "joias", label: "Joias" },
];

const FALLBACK_IMG: Record<string, string> = {
  feminina: fem,
  masculina: masc,
  acessorios: acc,
  joias: joias,
};

function formatPrice(value: number | null | undefined) {
  if (value == null) return "Sob consulta";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
  } catch {
    return "Sob consulta";
  }
}

export function Produtos() {
  const [category, setCategory] = useState<Category>("todos");
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  const { data: settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp ?? "5549991540421";
  const waLink = `https://wa.me/${whatsapp}`;

  const queryArgs = useMemo(
    () => ({
      category: category === "todos" ? undefined : category,
      featured: onlyFeatured || undefined,
      limit: 12,
    }),
    [category, onlyFeatured],
  );

  const { data: products, isLoading } = useQuery({
    queryKey: ["public-products", queryArgs],
    queryFn: () => getPublicProducts({ data: queryArgs }),
    staleTime: 30_000,
  });

  return (
    <section id="colecao" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-12">
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
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="self-start md:self-end text-xs tracking-[0.22em] uppercase gold-underline"
          >
            Ver todos os produtos
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-8 md:mb-12">
          {CATEGORIES.map((c) => {
            const active = c.id === category;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-4 py-2 text-[11px] tracking-luxe uppercase border transition-colors ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "border-foreground/15 text-foreground hover:border-foreground/40"
                }`}
              >
                {c.label}
              </button>
            );
          })}
          <button
            onClick={() => setOnlyFeatured((v) => !v)}
            className={`ml-auto px-4 py-2 text-[11px] tracking-luxe uppercase border transition-colors ${
              onlyFeatured
                ? "bg-gold text-background border-gold"
                : "border-foreground/15 text-foreground hover:border-gold/60"
            }`}
          >
            ✦ Apenas destaques
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="border border-foreground/10 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum produto encontrado nesta seleção.
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 text-xs tracking-[0.22em] uppercase gold-underline"
            >
              Falar no WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => {
              const img = p.image_url || p.images?.[0] || FALLBACK_IMG[p.category] || fem;
              const tag = p.promo ? "Promo" : p.featured ? "Destaque" : p.category;
              const displayPrice = p.promo && p.promo_price != null
                ? formatPrice(Number(p.promo_price))
                : formatPrice(p.price != null ? Number(p.price) : null);
              return (
                <div key={p.id} className="group flex flex-col">
                  <div className="img-zoom relative aspect-[3/4] bg-muted overflow-hidden">
                    <img
                      src={img}
                      alt={p.alt_text || p.name}
                      loading="lazy"
                      width={1024}
                      height={1280}
                      className="size-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-background/90 backdrop-blur text-[10px] tracking-luxe uppercase">
                      {tag}
                    </div>
                    <a
                      href={`${waLink}?text=${encodeURIComponent(`Olá! Tenho interesse na peça: ${p.name}`)}`}
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
                      <p className="text-xs text-muted-foreground mt-1">{displayPrice}</p>
                    </div>
                    {p.featured && <span className="text-xs text-gold">✦</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
