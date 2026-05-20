import { useState } from "react";
import { MapPin, Clock, Phone, Send } from "lucide-react";

export function Contato() {
  const [form, setForm] = useState({ nome: "", whats: "", interesse: "", msg: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Olá Dona Dora!\n\nNome: ${form.nome}\nWhatsApp: ${form.whats}\nInteresse: ${form.interesse}\n\n${form.msg}`,
    );
    window.open(`https://wa.me/5549991540421?text=${text}`, "_blank");
  };

  return (
    <section id="contato" className="py-24 md:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 md:px-10 grid md:grid-cols-12 gap-12 md:gap-16">
        {/* Info */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-gold" />
            <span className="text-[11px] tracking-luxe uppercase text-muted-foreground">
              Visite a boutique
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl leading-[1.05] text-balance">
            Te esperamos em <span className="italic">Urubici</span>.
          </h2>
          <p className="mt-6 text-foreground/70 max-w-md">
            Venha viver a experiência Dona Dora pessoalmente. Ou converse com a gente agora
            mesmo pelo WhatsApp.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex gap-4">
              <MapPin className="size-5 text-gold shrink-0 mt-1" />
              <div>
                <div className="text-[11px] tracking-luxe uppercase text-muted-foreground mb-1">
                  Endereço
                </div>
                <div className="text-sm leading-relaxed">
                  Avenida Adolfo Konder, nº 2659<br />
                  Bairro Esquina · Urubici/SC
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="size-5 text-gold shrink-0 mt-1" />
              <div>
                <div className="text-[11px] tracking-luxe uppercase text-muted-foreground mb-1">
                  Horários
                </div>
                <div className="text-sm leading-relaxed">
                  Segunda a sexta · 09h às 18h30<br />
                  Sábado · 09h às 17h
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Phone className="size-5 text-gold shrink-0 mt-1" />
              <div>
                <div className="text-[11px] tracking-luxe uppercase text-muted-foreground mb-1">
                  WhatsApp
                </div>
                <a
                  href="https://wa.me/5549991540421"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm gold-underline"
                >
                  (49) 99154-0421
                </a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-10 aspect-[16/10] overflow-hidden border border-border shadow-soft">
            <iframe
              title="Mapa Dona Dora"
              src="https://www.google.com/maps?q=Avenida+Adolfo+Konder+2659+Urubici+SC&output=embed"
              className="size-full grayscale-[20%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border p-8 md:p-12 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-gold" />
              <span className="text-[11px] tracking-luxe uppercase text-muted-foreground">
                Fale conosco
              </span>
            </div>
            <h3 className="font-display text-3xl md:text-4xl mb-8">
              Deixe sua mensagem
            </h3>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
              <Field label="WhatsApp" value={form.whats} onChange={(v) => setForm({ ...form, whats: v })} required />
              <div className="sm:col-span-2">
                <Field label="Interesse / Produto desejado" value={form.interesse} onChange={(v) => setForm({ ...form, interesse: v })} />
              </div>
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="text-[11px] tracking-luxe uppercase text-muted-foreground">
                    Mensagem
                  </span>
                  <textarea
                    value={form.msg}
                    onChange={(e) => setForm({ ...form, msg: e.target.value })}
                    rows={4}
                    className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground outline-none py-2 text-base resize-none transition-colors duration-300"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="mt-10 inline-flex items-center justify-center gap-3 px-8 py-4 bg-foreground text-background text-xs tracking-[0.22em] uppercase hover:bg-gold hover:text-foreground transition-all duration-500 ease-luxe w-full sm:w-auto"
            >
              <Send className="size-4" /> Enviar via WhatsApp
            </button>
            <p className="mt-4 text-xs text-muted-foreground">
              Ao enviar, você concorda em receber contato da Dona Dora.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label, value, onChange, required,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-luxe uppercase text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground outline-none py-2 text-base transition-colors duration-300"
      />
    </label>
  );
}
