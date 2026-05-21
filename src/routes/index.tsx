import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Diferenciais } from "@/components/site/Diferenciais";
import { Categorias } from "@/components/site/Categorias";
import { Produtos } from "@/components/site/Produtos";
import { GrupoVip } from "@/components/site/GrupoVip";
import { Instagram } from "@/components/site/Instagram";
import { Depoimentos } from "@/components/site/Depoimentos";
import { Contato } from "@/components/site/Contato";
import { Footer } from "@/components/site/Footer";
import { DoraFloat } from "@/components/site/DoraFloat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dona Dora — Boutique Premium em Urubici/SC" },
      { name: "description", content: "Boutique premium em Urubici/SC. Moda feminina, masculina, acessórios e joias com curadoria sofisticada." },
      { property: "og:title", content: "Dona Dora — Boutique Premium em Urubici/SC" },
      { property: "og:description", content: "Moda, elegância e estilo. Boutique sofisticada em Urubici/SC." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org", "@type": "ClothingStore", name: "Dona Dora",
        description: "Boutique premium de moda feminina, masculina e acessórios em Urubici/SC.",
        telephone: "+55-49-99154-0421",
        address: { "@type": "PostalAddress", streetAddress: "Avenida Adolfo Konder, 2659", addressLocality: "Urubici", addressRegion: "SC", addressCountry: "BR" },
      }),
    }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Diferenciais />
        <Categorias />
        <Produtos />
        <GrupoVip />
        <Instagram />
        <Depoimentos />
        <Contato />
      </main>
      <Footer />
      <DoraFloat />
    </div>
  );
}
