import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/site/Topbar";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Beneficios } from "@/components/site/Beneficios";
import { Categorias } from "@/components/site/Categorias";
import { Produtos } from "@/components/site/Produtos";
import { Marcas } from "@/components/site/Marcas";
import { GrupoVip } from "@/components/site/GrupoVip";
import { Instagram } from "@/components/site/Instagram";
import { Depoimentos } from "@/components/site/Depoimentos";
import { Contato } from "@/components/site/Contato";
import { Footer } from "@/components/site/Footer";
import { DoraFloat } from "@/components/site/DoraFloat";
import { Marquee } from "@/components/site/Marquee";
import { Reveal } from "@/components/site/Reveal";
import { useGlobalRipple } from "@/hooks/use-global-ripple";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dona Dora — Boutique Premium em Urubici/SC" },
      { name: "description", content: "Boutique premium em Urubici/SC. Moda feminina, masculina, acessórios, joias e marcas selecionadas. Enviamos para todo o Brasil." },
      { property: "og:title", content: "Dona Dora — Boutique Premium em Urubici/SC" },
      { property: "og:description", content: "Moda, elegância e estilo. Boutique sofisticada em Urubici/SC com envio para todo o Brasil." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org", "@type": "ClothingStore", name: "Dona Dora",
        description: "Boutique premium de moda feminina, masculina e acessórios em Urubici/SC.",
        telephone: "+55-49-99121-0083",
        address: { "@type": "PostalAddress", streetAddress: "Avenida Adolfo Konder, 2659", addressLocality: "Urubici", addressRegion: "SC", addressCountry: "BR" },
      }),
    }],
  }),
  component: Index,
});

function Index() {
  useGlobalRipple();
  return (
    <div className="bg-background text-foreground">
      <Topbar />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Reveal as="section"><Beneficios /></Reveal>
        <Reveal as="section" delay={80}><Marcas /></Reveal>
        <Reveal as="section" delay={120}><Categorias /></Reveal>
        <Reveal as="section" delay={80}><Produtos /></Reveal>
        <Reveal as="section" delay={120}><GrupoVip /></Reveal>
        <Reveal as="section" delay={80}><Instagram /></Reveal>
        <Reveal as="section" delay={80}><Depoimentos /></Reveal>
        <Reveal as="section" delay={80}><Contato /></Reveal>
      </main>
      <Footer />
      <DoraFloat />
    </div>
  );
}

