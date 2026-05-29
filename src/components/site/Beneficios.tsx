import { Truck, ShieldCheck, Tag, BadgeCheck } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

const ICONS = [Truck, ShieldCheck, Tag, BadgeCheck];

export function Beneficios() {
  const { data: s } = useSiteSettings();
  const items: { title: string; desc: string }[] = Array.isArray(s?.benefits)
    ? (s!.benefits as any[])
    : [];
  if (!items.length) return null;
  return (
    <section className="py-14 md:py-20 bg-nude/40 border-y border-foreground/10">
      <div className="mx-auto max-w-7xl px-6 md:px-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {items.slice(0, 4).map((b, i) => {
          const Icon = ICONS[i] ?? BadgeCheck;
          return (
            <div key={i} className="benefit-card flex flex-col items-center text-center gap-3 p-4">
              <div className="benefit-icon size-12 rounded-full grid place-items-center bg-foreground text-background">
                <Icon className="size-5" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-display text-base md:text-lg">{b.title}</div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
