import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  Trash2,
  Heart,
  Package,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import { checkIsAdmin } from "@/lib/admin.functions";
import {
  getMyOrders,
  getMyWishlist,
  getMyProfile,
  upsertMyProfile,
  removeFromWishlist,
} from "@/lib/account.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/minha-conta")({
  head: () => ({
    meta: [
      { title: "Minha conta · Dona Dora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function formatOrderStatus(status: string) {
  const labels: Record<string, string> = {
    novo: "Novo",
    aguardando_pagamento: "Aguardando pagamento",
    pago: "Pago",
    separando: "Separando",
    enviado: "Enviado",
    entregue: "Entregue",
    cancelado: "Cancelado",
    concluido: "Concluído",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

function AccountPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const checkAdmin = useServerFn(checkIsAdmin);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    checkAdmin()
      .then((r) => {
        setIsAdmin(Boolean(r.isAdmin));
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => {
        setReady(true);
      });
  }, [user, loading, navigate, checkAdmin]);

  if (loading || !ready) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-foreground text-background border-b border-background/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <Link to="/" className="font-display text-2xl">
            Dona <span className="italic text-[color:var(--gold-soft)]">Dora</span>
            <span className="text-[10px] tracking-luxe uppercase text-background/60 ml-2">
              Minha conta
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-transparent border-background/30 text-background hover:bg-background hover:text-foreground"
              >
                <Link to="/admin">
                  <ShieldCheck className="size-4 mr-2" />
                  Painel admin
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
              className="bg-transparent border-background/30 text-background hover:bg-background hover:text-foreground"
            >
              <LogOut className="size-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <Tabs defaultValue="pedidos">
          <TabsList>
            <TabsTrigger value="pedidos">
              <Package className="size-4 mr-1.5" /> Pedidos
            </TabsTrigger>
            <TabsTrigger value="favoritos">
              <Heart className="size-4 mr-1.5" /> Favoritos
            </TabsTrigger>
            <TabsTrigger value="perfil">
              <UserIcon className="size-4 mr-1.5" /> Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos">
            <OrdersPanel />
          </TabsContent>

          <TabsContent value="favoritos">
            <WishlistPanel />
          </TabsContent>

          <TabsContent value="perfil">
            <ProfilePanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function getOrderStep(status: string) {
  const steps = ["novo", "aguardando_pagamento", "pago", "separando", "enviado", "entregue"];

  if (status === "concluido") return steps.length - 1;
  if (status === "cancelado") return -1;

  const index = steps.indexOf(status);
  return index >= 0 ? index : 0;
}

function OrdersPanel() {
  const list = useServerFn(getMyOrders);

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => list(),
  });

  if (isLoading) {
    return <div className="py-10 text-muted-foreground">Carregando pedidos...</div>;
  }

  if (!data?.length) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Você ainda não fez pedidos.
      </div>
    );
  }

  const steps = [
    { key: "novo", label: "Pedido recebido" },
    { key: "aguardando_pagamento", label: "Aguardando pagamento" },
    { key: "pago", label: "Pagamento aprovado" },
    { key: "separando", label: "Separando pedido" },
    { key: "enviado", label: "Pedido enviado" },
    { key: "entregue", label: "Entregue" },
  ];

  return (
    <div className="space-y-5">
      {data.map((o: any) => {
        const status = String(o.status ?? "novo");
        const currentStep = getOrderStep(status);
        const cancelled = status === "cancelado";
        const items = Array.isArray(o.items) ? o.items : [];

        return (
          <div key={o.id} className="bg-card border rounded-lg p-5 space-y-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString("pt-BR")}
                </div>
                <div className="font-medium">Pedido #{o.id.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {items.length} {items.length === 1 ? "item" : "itens"}
                </div>
              </div>

              <div className="text-right">
                <Badge
                  variant={
                    status === "entregue" || status === "concluido"
                      ? "default"
                      : status === "cancelado"
                        ? "destructive"
                        : "secondary"
                  }
                  className="capitalize"
                >
                  {formatOrderStatus(status)}
                </Badge>

                <div className="font-display text-xl mt-1">
                  R$ {Number(o.subtotal ?? 0).toFixed(2)}
                </div>
              </div>
            </div>

            {cancelled ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                Este pedido foi cancelado. Se tiver dúvidas, entre em contato com a loja.
              </div>
            ) : (
              <div className="space-y-3 border-t pt-4">
                <div className="text-xs uppercase tracking-luxe text-muted-foreground">
                  Acompanhamento do pedido
                </div>

                <div className="grid sm:grid-cols-6 gap-2">
                  {steps.map((s, i) => {
                    const done = i <= currentStep;

                    return (
                      <div
                        key={s.key}
                        className={`rounded border p-3 text-xs ${
                          done
                            ? "bg-foreground text-background border-foreground"
                            : "bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        <div className="font-medium">{done ? "✓" : "•"} {s.label}</div>
                      </div>
                    );
                  })}
                </div>

                {status === "enviado" && (
                  <div className="text-sm text-muted-foreground">
                    Seu pedido foi enviado. O rastreamento detalhado será informado pela loja assim que disponível.
                  </div>
                )}
              </div>
            )}

            {!!items.length && (
              <div className="border-t pt-4">
                <div className="text-xs uppercase tracking-luxe text-muted-foreground mb-2">
                  Itens do pedido
                </div>

                <div className="space-y-2">
                  {items.map((it: any, i: number) => (
                    <div key={i} className="flex justify-between gap-3 text-sm border-b pb-2 last:border-b-0">
                      <div>
                        <div className="font-medium">{it.name ?? "Produto"}</div>
                        <div className="text-xs text-muted-foreground">
                          {it.size ? `Tam: ${it.size} · ` : ""}
                          {it.color ? `Cor: ${it.color} · ` : ""}
                          Qtd: {it.qty ?? 1}
                        </div>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        R$ {Number(it.price ?? 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {o.notes && (
              <div className="border-t pt-4 text-sm">
                <div className="text-xs uppercase tracking-luxe text-muted-foreground mb-1">
                  Observações da loja
                </div>
                <div className="text-muted-foreground">{o.notes}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
function WishlistPanel() {
  const qc = useQueryClient();
  const list = useServerFn(getMyWishlist);
  const remove = useServerFn(removeFromWishlist);

  const { data, isLoading } = useQuery({
    queryKey: ["my-wishlist"],
    queryFn: () => list(),
  });

  const del = useMutation({
    mutationFn: (product_id: string) => remove({ data: { product_id } }),
    onSuccess: () => {
      toast.success("Removido dos favoritos.");
      qc.invalidateQueries({ queryKey: ["my-wishlist"] });
    },
  });

  if (isLoading) {
    return <div className="py-10 text-muted-foreground">Carregando favoritos...</div>;
  }

  if (!data?.length) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Sua lista de favoritos está vazia.
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((w: any) => {
        const p = w.product;
        const img = p?.images?.[0] || p?.image_url;
        const price = p?.promo_price ?? p?.price;

        return (
          <div key={w.id} className="bg-card border rounded overflow-hidden">
            <div className="aspect-square bg-muted">
              {img ? (
                <img
                  src={img}
                  alt={p?.name ?? ""}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>

            <div className="p-4 space-y-2">
              <div className="font-medium text-sm line-clamp-2">
                {p?.name ?? "Produto indisponível"}
              </div>

              {price ? (
                <div className="font-display text-lg">
                  R$ {Number(price).toFixed(2)}
                </div>
              ) : null}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => del.mutate(w.product_id)}
              >
                <Trash2 className="size-4 mr-1" /> Remover
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProfilePanel() {
  const qc = useQueryClient();
  const get = useServerFn(getMyProfile);
  const save = useServerFn(upsertMyProfile);

  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => get(),
  });

  const [f, setF] = useState<any>(null);

  useEffect(() => {
    if (data !== undefined && !f) {
      setF({
        full_name: data?.full_name ?? "",
        phone: data?.phone ?? "",
        address: data?.address ?? {},
      });
    }
  }, [data, f]);

  const mut = useMutation({
    mutationFn: (p: any) => save({ data: p }),
    onSuccess: () => {
      toast.success("Perfil atualizado!");
      qc.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar."),
  });

  if (isLoading || !f) {
    return <div className="py-10 text-muted-foreground">Carregando perfil...</div>;
  }

  const a = f.address ?? {};

  const setA = (k: string, v: string) =>
    setF({
      ...f,
      address: {
        ...a,
        [k]: v,
      },
    });

  return (
    <div className="space-y-6 max-w-2xl bg-card border rounded p-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Nome completo</Label>
          <Input
            value={f.full_name}
            onChange={(e) => setF({ ...f, full_name: e.target.value })}
          />
        </div>

        <div>
          <Label>Telefone / WhatsApp</Label>
          <Input
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-lg">Endereço</h3>

        <div className="grid sm:grid-cols-[2fr_1fr] gap-3">
          <div>
            <Label>Rua</Label>
            <Input
              value={a.street ?? ""}
              onChange={(e) => setA("street", e.target.value)}
            />
          </div>

          <div>
            <Label>Número</Label>
            <Input
              value={a.number ?? ""}
              onChange={(e) => setA("number", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Complemento</Label>
          <Input
            value={a.complement ?? ""}
            onChange={(e) => setA("complement", e.target.value)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Bairro</Label>
            <Input
              value={a.neighborhood ?? ""}
              onChange={(e) => setA("neighborhood", e.target.value)}
            />
          </div>

          <div>
            <Label>Cidade</Label>
            <Input
              value={a.city ?? ""}
              onChange={(e) => setA("city", e.target.value)}
            />
          </div>

          <div>
            <Label>Estado</Label>
            <Input
              value={a.state ?? ""}
              onChange={(e) => setA("state", e.target.value)}
            />
          </div>

          <div>
            <Label>CEP</Label>
            <Input
              value={a.zip ?? ""}
              onChange={(e) => setA("zip", e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button onClick={() => mut.mutate(f)} disabled={mut.isPending}>
        {mut.isPending ? "Salvando..." : "Salvar perfil"}
      </Button>
    </div>
  );
}

