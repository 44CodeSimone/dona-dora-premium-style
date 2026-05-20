import { MessageCircle } from "lucide-react";

export function WhatsappFloat() {
  return (
    <a
      href="https://wa.me/5549991540421?text=Oi%20Dona%20Dora%2C%20vim%20pelo%20site%20✨"
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-50 group"
    >
      <span className="relative flex items-center gap-3 pl-4 pr-5 py-3.5 bg-foreground text-background rounded-full shadow-luxe hover:bg-gold hover:text-foreground transition-all duration-500 ease-luxe">
        <span className="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none" />
        <MessageCircle className="size-5" />
        <span className="hidden sm:inline text-xs tracking-[0.2em] uppercase">WhatsApp</span>
      </span>
    </a>
  );
}
