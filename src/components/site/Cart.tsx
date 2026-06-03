import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useCart, cart } from "@/hooks/use-cart";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useAuth } from "@/hooks/use-auth";
import { createOrder } from "@/lib/site.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

function brl(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export function CartButton() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Abrir carrinho"
          className="relative p-2 -mr-1 text-foreground/85 hover:text-foreground transition-colors"
        >
          <ShoppingBag className="size-5" />

          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 size-4 text-[10px] font-medium grid place-items-center rounded-full bg-[color:var(--gold)] text-foreground">
              {count}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b">
          <SheetTitle className="font-display text-2xl">
            Sua sacola
          </SheetTitle>
        </SheetHeader>

        <CartBody onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

function CartBody({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { items, subtotal } = useCart();

  const { data: settings } = useSiteSettings();

  const whatsapp = settings?.whatsapp ?? "5549991210083";

  const orderFn = useServerFn(createOrder);

  const [checkout, setCheckout] = useState(false);

  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    notes: "",
  });

  const [busy, setBusy] = useState(false);

  async function finalize() {
    if (!form.name.trim() || !form.whatsapp.trim()) {
      toast.error("Informe nome e WhatsApp.");
      return;
    }

    if (items.length === 0) return;

    setBusy(true);

    try {
      await orderFn({
        data: {
          customer_name: form.name.trim(),
          customer_whatsapp: form.whatsapp.trim(),
          customer_email: form.email.trim() || null,
          notes: form.notes.trim() || null,
          subtotal,

          items: items.map((i) => ({
            product_id: i.product_id,
            name: i.name,
            size: i.size ?? null,
            color: i.color ?? null,
            qty: i.qty,
            price: i.price,
          })),
        },
      });

      const msg = [
        `Olá! Quero finalizar este pedido na Dona Dora:`,
        ``,
        `*Nome:* ${form.name}`,
        `*WhatsApp:* ${form.whatsapp}`,
        form.email ? `*E-mail:* ${form.email}` : "",
        ``,
        `*Pedido:*`,

        ...items.map(
          (i) =>
            `• ${i.qty}x ${i.name}${
              i.size ? ` · Tam ${i.size}` : ""
            }${i.color ? ` · ${i.color}` : ""} — ${brl(
              i.price * i.qty,
            )}`,
        ),

        ``,

        `*Subtotal:* ${brl(subtotal)}`,

        form.notes ? `\n*Observações:* ${form.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;

      window.open(url, "_blank");

      cart.clear();

      toast.success("Pedido enviado! Continuamos no WhatsApp.");

      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Não foi possível enviar.");
    } finally {
      setBusy(false);
    }
  }

  function handleCheckout() {
    if (!user) {
      toast.info("Entre na sua conta para finalizar o pedido.");

      navigate({
        to: "/login",
      });

      return;
    }

    setCheckout(true);
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
        <div className="size-16 rounded-full bg-muted grid place-items-center">
          <ShoppingBag className="size-6 text-muted-foreground" />
        </div>

        <div>
          <p className="font-display text-xl">
            Sua sacola está vazia
          </p>

          <p className="text-sm text-muted-foreground mt-1">
            Adicione peças da coleção.
          </p>
        </div>

        <Button onClick={onClose} variant="outline">
          Continuar comprando
        </Button>
      </div>
    );
  }

  if (checkout) {
    return (
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/20">
        <p className="text-sm text-muted-foreground">
          Para finalizar, deixe seus dados. Você será encaminhada ao WhatsApp com o resumo do pedido.
        </p>

        <div className="space-y-3">
          <div>
            <Label>Nome *</Label>

            <Input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>WhatsApp *</Label>

            <Input
              value={form.whatsapp}
              onChange={(e) =>
                setForm({
                  ...form,
                  whatsapp: e.target.value,
                })
              }
              placeholder="(DDD) 9 9999-9999"
            />
          </div>

          <div>
            <Label>E-mail (opcional)</Label>

            <Input
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>Observações</Label>

            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
              placeholder="Cor, tamanho extra, presente..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            Subtotal
          </span>

          <span className="font-display text-xl">
            {brl(subtotal)}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCheckout(false)}
            className="flex-1"
          >
            Voltar
          </Button>

          <Button
            onClick={finalize}
            disabled={busy}
            className="flex-1"
          >
            <MessageCircle className="size-4 mr-2" />

            {busy ? "Enviando..." : "Finalizar no WhatsApp"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto divide-y">
        {items.map((i) => {
          const k = cart.key(i);

          return (
            <div key={k} className="flex gap-3 p-4">
              {i.image && (
                <img
                  src={i.image}
                  alt={i.name}
                  className="size-20 object-cover rounded border"
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium leading-tight truncate">
                  {i.name}
                </p>

                <p className="text-xs text-muted-foreground mt-0.5">
                  {[i.size && `Tam ${i.size}`, i.color]
                    .filter(Boolean)
                    .join(" · ")}
                </p>

                <p className="text-sm mt-1">
                  {brl(i.price)}
                </p>

                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => cart.setQty(k, i.qty - 1)}
                    className="size-7 border rounded grid place-items-center hover:bg-muted"
                  >
                    <Minus className="size-3" />
                  </button>

                  <span className="w-7 text-center text-sm">
                    {i.qty}
                  </span>

                  <button
                    onClick={() => cart.setQty(k, i.qty + 1)}
                    className="size-7 border rounded grid place-items-center hover:bg-muted"
                  >
                    <Plus className="size-3" />
                  </button>

                  <button
                    onClick={() => cart.remove(k)}
                    className="ml-auto p-1.5 text-muted-foreground hover:text-destructive"
                    aria-label="Remover"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t p-4 space-y-3 bg-background">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Subtotal
          </span>

          <span className="font-display text-2xl">
            {brl(subtotal)}
          </span>
        </div>

        <Button className="w-full" onClick={handleCheckout}>
          Finalizar pedido
        </Button>

        <button
          onClick={() => cart.clear()}
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          Esvaziar sacola
        </button>
      </div>
    </>
  );
}
