import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getApprovedReviews, getPublicProducts } from "@/lib/site.functions";
import { submitReview } from "@/lib/account.functions";
import { useAuth } from "@/hooks/use-auth";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={onChange ? "button" : undefined}
          onClick={onChange ? () => onChange(n) : undefined}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} estrelas`}
        >
          <Star
            className={`size-5 transition ${n <= value ? "fill-[color:var(--gold)] text-[color:var(--gold)]" : "text-muted-foreground/40"}`}
          />
        </button>
      ))}
    </div>
  );
}

export function Avaliacoes() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", "approved"],
    queryFn: () => getApprovedReviews({ data: { limit: 12 } }),
    staleTime: 60_000,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["public-products-lite"],
    queryFn: () => getPublicProducts({ data: { limit: 100 } }),
    staleTime: 60_000,
  });
  const submitFn = useServerFn(submitReview);
  const submit = useMutation({
    mutationFn: (vars: { product_id: string; rating: number; comment: string; author_name: string }) =>
      submitFn({ data: vars }),
    onSuccess: () => {
      toast.success("Avaliação enviada! Vamos revisar e publicar.");
      qc.invalidateQueries({ queryKey: ["reviews"] });
      setForm({ product_id: "", rating: 5, comment: "", author_name: "" });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao enviar."),
  });

  const [form, setForm] = useState({ product_id: "", rating: 5, comment: "", author_name: "" });

  return (
    <section id="avaliacoes" className="bg-background py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="text-center mb-12">
          <span className="text-[11px] tracking-luxe uppercase text-[color:var(--gold)]">O que dizem</span>
          <h2 className="font-display text-3xl md:text-5xl mt-2">Avaliações de clientes</h2>
        </div>

        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground italic">Seja a primeira a avaliar nossas peças.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {reviews.map((r) => (
              <article key={r.id} className="p-6 rounded-lg border bg-card card-touch">
                <Stars value={r.rating} />
                <p className="mt-3 text-sm leading-relaxed text-foreground/90 italic">“{r.comment}”</p>
                <div className="mt-4 pt-4 border-t text-xs tracking-luxe uppercase text-muted-foreground">
                  {r.author_name}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-lg border bg-muted/30">
          <h3 className="font-display text-2xl mb-1">Deixe sua avaliação</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Após aprovação, sua avaliação aparece para outros clientes.
          </p>
          {!user ? (
            <div className="text-sm text-muted-foreground">
              <Link to="/login" className="underline">Entre na sua conta</Link> para avaliar uma peça que você comprou.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.product_id) return toast.error("Escolha um produto.");
                if (form.comment.trim().length < 3) return toast.error("Escreva pelo menos 3 caracteres.");
                if (!form.author_name.trim()) return toast.error("Informe como deseja aparecer.");
                submit.mutate(form);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs uppercase tracking-luxe text-muted-foreground">Produto</label>
                <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-luxe text-muted-foreground mb-1 block">Nota</label>
                <Stars value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-luxe text-muted-foreground">Seu nome</label>
                <Input maxLength={120} value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="Como deseja aparecer" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-luxe text-muted-foreground">Comentário</label>
                <Textarea rows={4} maxLength={2000} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Conte sua experiência…" />
              </div>
              <Button type="submit" disabled={submit.isPending} className="w-full">
                {submit.isPending ? "Enviando…" : "Enviar avaliação"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
