import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Sobre } from "@/components/site/Sobre";
import { Categorias } from "@/components/site/Categorias";
import { Produtos } from "@/components/site/Produtos";
import { Nexa } from "@/components/site/Nexa";
import { Instagram } from "@/components/site/Instagram";
import { Depoimentos } from "@/components/site/Depoimentos";
import { Contato } from "@/components/site/Contato";
import { Footer } from "@/components/site/Footer";
import { WhatsappFloat } from "@/components/site/WhatsappFloat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dona Dora — Boutique Premium em Urubici/SC" },
      {
        name: "description",
        content:
          "Boutique premium em Urubici/SC. Moda feminina, masculina, acessórios e joias com curadoria sofisticada. Atendimento humanizado e experiência fashion exclusiva.",
      },
      { property: "og:title", content: "Dona Dora — Boutique Premium em Urubici/SC" },
      {
        property: "og:description",
        content:
          "Moda, elegância e estilo para quem ama se vestir bem. Boutique sofisticada em Urubici/SC.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ClothingStore",
          name: "Dona Dora",
          description:
            "Boutique premium de moda feminina, masculina e acessórios em Urubici/SC.",
          telephone: "+55-49-99154-0421",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Avenida Adolfo Konder, 2659",
            addressLocality: "Urubici",
            addressRegion: "SC",
            addressCountry: "BR",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "09:00",
              closes: "18:30",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Saturday",
              opens: "09:00",
              closes: "17:00",
            },
          ],
        }),
      },
    ],
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
        <Sobre />
        <Categorias />
        <Produtos />
        <Nexa />
        <Instagram />
        <Depoimentos />
        <Contato />
      </main>
      <Footer />
      <WhatsappFloat />
    </div>
  );
}
