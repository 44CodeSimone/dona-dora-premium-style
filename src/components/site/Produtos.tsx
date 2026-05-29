import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Search, ShoppingBag } from "lucide-react";
import { getPublicProducts } from "@/lib/site.functions";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useCart } from "@/hooks/use-cart";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import fem from "@/assets/category-feminina.jpg";
import masc from "@/assets/category-masculina.jpg";
import acc from "@/assets/category-accessories.jpg";
import joias from "@/assets/category-joias.jpg";

const CATEGORIES = [
  { id: "todos", label: "Todos" },
  { id: "lancamentos", label: "Lançamentos" },
  { id: "feminina", label: "Feminino" },
  { id: "masculina", label: "Masculino" },
  { id: "acessorios", label: "Acessórios" },
  { id: "joias", label: "Joias" },
  { id: "oculos", label: "Óculos" },
  { id: "bones", label: "Bonés" },
  { id: "presentes", label: "Presentes" },
  { id: "outlet", label: "Outlet" },
  { id: "souvenirs", label: "Souvenirs" },
  { id: "promocoes", label: "Promoções" },
] as const;

type CatId = (typeof CATEGORIES)[number]["id"];

const FALLBACK_IMG: Record<string, string> = {
  feminina: fem,
  masculina: masc,
  acessorios: acc,
  joias,
};

function brl(v: number | null | undefined) {
  if (v == null) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v));
}

export function Produtos() {
  const [category, setCategory] = useState<CatId>("todos");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const cart = useCart();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Listen to category changes triggered from Categorias section
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { category?: string } | undefined;
      const cat = detail?.category;
      if (!cat) return;
      const known = CATEGORIES.find((c) => c.id === cat);
      if (known) setCategory(known.id);
    };
    window.addEventListener("dd:set-category", handler);
    return () => window.removeEventListener("dd:set-category", handler);
  }, []);


  const { data: settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp ?? "5549991210083";
  const waLink = `https://wa.me/${whatsapp}`;

  const queryArgs = useMemo(
    () => ({
      category: category === "todos" ? undefined : category,
      featured: onlyFeatured || undefined,
      search: debounced || undefined,
      limit: 24,
    }),
    [category, onlyFeatured, debounced],
  );

  const { data: products, isLoading } = useQuery({
    queryKey: ["public-products", queryArgs],
    queryFn: () => getPublicProducts({ data: queryArgs }),
    staleTime: 30_000,
  });

  return (
    <section id="colecao" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[11px] tracking-luxe uppercase text-muted-foreground">
                Favoritos de todo mundo
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
              Peças <span className="italic">selecionadas</span> para você.
            </h2>
          </div>
          <div className="flex items-center gap-2 self-stretch md:self-end w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto..."
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8 md:mb-12">
          {CATEGORIES.map((c) => {
            const active = c.id === category;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-3.5 py-1.5 text-[11px] tracking-luxe uppercase border transition-colors ${
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
            className={`ml-auto px-3.5 py-1.5 text-[11px] tracking-luxe uppercase border transition-colors ${
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
            {Array.from({ length: 8 }).map((_, i) => (
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
              Nenhum produto encontrado.
            </p>
            <a href={waLink} target="_blank" rel="noreferrer" className="inline-block mt-4 text-xs tracking-[0.22em] uppercase gold-underline">
              Falar no WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p: any) => {
              const img = p.image_url || p.images?.[0] || FALLBACK_IMG[p.category] || fem;
              const tag = p.promo ? "Promo" : p.featured ? "Destaque" : p.category;
              const finalPrice = p.promo && p.promo_price != null ? Number(p.promo_price) : p.price != null ? Number(p.price) : null;
              const outOfStock = p.stock != null && p.stock <= 0;
              const lowStock = !outOfStock && p.stock != null && p.stock <= 3;
              return (
                <div key={p.id} className="group flex flex-col">
                  <div className="img-zoom card-touch relative aspect-[3/4] bg-muted overflow-hidden">
                    <img
                      src={img}
                      alt={p.alt_text || p.name}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-background/90 backdrop-blur text-[10px] tracking-luxe uppercase">
                      {tag}
                    </div>
                    {outOfStock && (
                      <div className="absolute inset-0 bg-background/70 grid place-items-center">
                        <span className="text-xs tracking-luxe uppercase bg-foreground text-background px-3 py-1.5">Esgotado</span>
                      </div>
                    )}
                    {!outOfStock && (
                      <button
                        onClick={() => {
                          cart.add({
                            product_id: p.id,
                            name: p.name,
                            price: finalPrice ?? 0,
                            image: img,
                            size: p.sizes?.[0] ?? null,
                            color: p.colors?.[0] ?? null,
                            qty: 1,
                          });
                          toast.success("Adicionado à sacola");
                        }}
                        className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background text-[11px] tracking-luxe uppercase opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-luxe"
                      >
                        <ShoppingBag className="size-3.5" />
                        Adicionar à sacola
                      </button>
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg leading-tight truncate">{p.name}</h3>
                      {p.brand && <p className="text-[10px] tracking-luxe uppercase text-muted-foreground mt-1">{p.brand}</p>}
                      <div className="mt-1.5 space-y-0.5">
                        {p.promo && p.promo_price != null && p.price ? (
                          <p className="text-xs text-muted-foreground line-through">{brl(Number(p.price))}</p>
                        ) : null}
                        <p className="text-sm font-medium">{brl(finalPrice)}</p>
                        {p.pix_price && (
                          <p className="text-[11px] text-[color:var(--gold)]">{brl(Number(p.pix_price))} no Pix</p>
                        )}
                        {p.installments && p.installments > 1 && finalPrice ? (
                          <p className="text-[11px] text-muted-foreground">
                            ou {p.installments}x de {brl(finalPrice / p.installments)} s/ juros
                          </p>
                        ) : null}
                        {lowStock && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-luxe mt-1">
                            Últimas {p.stock} unidades
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={`${waLink}?text=${encodeURIComponent(`Olá! Tenho interesse na peça: ${p.name}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground"
                      aria-label="Falar no WhatsApp"
                      title="Falar no WhatsApp"
                    >
                      <MessageCircle className="size-4" />
                    </a>
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
