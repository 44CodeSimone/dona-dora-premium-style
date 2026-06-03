import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, Package, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pedido-confirmado")({
  head: () => ({
    meta: [
      { title: "Pedido confirmado · Dona Dora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PedidoConfirmadoPage,
});

function PedidoConfirmadoPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-foreground text-background border-b border-background/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl">
            Dona <span className="italic text-[color:var(--gold-soft)]">Dora</span>

            <span className="text-[10px] tracking-luxe uppercase text-background/60 ml-2">
              Pedido confirmado
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-12">
        <section className="bg-card border rounded-2xl p-6 md:p-10 text-center shadow-sm">
          <div className="mx-auto size-20 rounded-full bg-muted grid place-items-center mb-6">
            <CheckCircle className="size-10 text-[color:var(--gold)]" />
          </div>

          <div className="space-y-3">
            <p className="text-xs tracking-luxe uppercase text-muted-foreground">
              Pedido registrado com sucesso
            </p>

            <h1 className="font-display text-3xl md:text-4xl">
              Obrigada pelo seu pedido!
            </h1>

            <p className="text-muted-foreground max-w-xl mx-auto">
              Seu pedido foi recebido pela Dona Dora. Nossa equipe irá conferir
              os itens, validar a disponibilidade e dar continuidade ao atendimento
              com cuidado e atenção.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-8 text-left">
            <div className="border rounded-xl p-4 bg-background">
              <Package className="size-5 mb-3 text-[color:var(--gold)]" />

              <h2 className="font-medium">
                Pedido recebido
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Sua solicitação foi registrada no sistema da loja.
              </p>
            </div>

            <div className="border rounded-xl p-4 bg-background">
              <Sparkles className="size-5 mb-3 text-[color:var(--gold)]" />

              <h2 className="font-medium">
                Análise da loja
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                A equipe irá confirmar produtos, tamanhos e disponibilidade.
              </p>
            </div>

            <div className="border rounded-xl p-4 bg-background">
              <ShoppingBag className="size-5 mb-3 text-[color:var(--gold)]" />

              <h2 className="font-medium">
                Próximos passos
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                O pedido seguirá para atendimento, pagamento e entrega.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button asChild>
              <Link to="/minha-conta">
                Acompanhar meus pedidos
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link to="/">
                Continuar comprando
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
