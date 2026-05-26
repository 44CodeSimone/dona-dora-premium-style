import { Truck } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Topbar() {
  const { data: s } = useSiteSettings();
  const text = s?.topbar_text ?? "Faça seu pedido — enviamos para todo o Brasil";
  return (
    <div className="bg-foreground text-background text-[11px] tracking-luxe uppercase">
      <div className="mx-auto max-w-7xl px-6 md:px-10 h-9 flex items-center justify-center gap-2">
        <Truck className="size-3.5 text-[color:var(--gold-soft)]" />
        <span className="opacity-90 text-center truncate">{text}</span>
      </div>
    </div>
  );
}
