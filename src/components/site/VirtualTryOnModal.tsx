import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { submitTryOn, getMyTryOnSession } from "@/lib/tryon.functions";
import { useCart } from "@/hooks/use-cart";

const CONSENT_TEXT =
  "Aceito enviar minha imagem para gerar uma simulação no provador virtual da Dona Dora. A imagem é armazenada em ambiente privado, usada apenas para esta simulação e pode ser excluída a qualquer momento por mim na área 'Minha conta'.";

type Product = {
  id: string;
  name: string;
  image_url?: string | null;
  images?: string[] | null;
  price?: number | null;
  promo?: boolean | null;
  promo_price?: number | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  category?: string | null;
};

export function VirtualTryOnModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const submitFn = useServerFn(submitTryOn);
  const getFn = useServerFn(getMyTryOnSession);
  const navigate = useNavigate();
  const cart = useCart();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [size, setSize] = useState<string>(product.sizes?.[0] ?? "");
  const [color, setColor] = useState<string>(product.colors?.[0] ?? "");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "completed" | "failed">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onPick(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Envie uma imagem.");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 8MB.");
      return;
    }
    setFile(f);
  }

  async function handleSubmit() {
    if (!file) return toast.error("Envie uma foto sua.");
    if (!consent) return toast.error("Aceite o termo de uso da imagem.");
    setBusy(true);
    setErrorMsg(null);
    try {
      setStatus("uploading");
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Faça login novamente.");
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
      const path = `${userId}/${Date.now()}-original.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("virtual-tryon")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw new Error(upErr.message);

      setStatus("processing");
      const res = await submitFn({
        data: {
          product_id: product.id,
          original_path: path,
          selected_size: size || null,
          selected_color: color || null,
          consent_text: CONSENT_TEXT,
        },
      });

      if (res.status === "failed") {
        setStatus("failed");
        setErrorMsg(("error" in res && res.error) || "Não foi possível gerar a prévia.");
        return;
      }

      // Buscar URL assinada
      const sess = await getFn({ data: { id: res.id } });
      if (sess.signed_url) {
        setResultUrl(sess.signed_url);
        setStatus("completed");
      } else {
        setStatus("failed");
        setErrorMsg("Imagem resultante indisponível.");
      }
    } catch (e: any) {
      setStatus("failed");
      setErrorMsg(e?.message ?? "Falha inesperada.");
    } finally {
      setBusy(false);
    }
  }

  function addToCart() {
    const img = product.image_url || product.images?.[0] || "";
    const finalPrice =
      product.promo && product.promo_price != null
        ? Number(product.promo_price)
        : product.price != null
          ? Number(product.price)
          : 0;
    cart.add({
      product_id: product.id,
      name: product.name,
      price: finalPrice,
      image: img,
      size: size || null,
      color: color || null,
      qty: 1,
    });
    toast.success("Adicionado à sacola");
    onClose();
  }

  // Bloqueia scroll do body
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-foreground/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-auto bg-background border border-foreground/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="size-5" />
        </button>

        <div className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="size-5 text-[color:var(--gold)]" />
            <h2 className="font-display text-2xl md:text-3xl">Provador Virtual</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <div className="aspect-[3/4] bg-muted overflow-hidden mb-3">
                <img
                  src={product.image_url || product.images?.[0] || ""}
                  alt={product.name}
                  className="size-full object-cover"
                />
              </div>
              <p className="text-xs tracking-luxe uppercase text-muted-foreground">Peça</p>
              <p className="font-display text-lg">{product.name}</p>
            </div>

            <div className="flex flex-col">
              {authed === false ? (
                <div className="border border-foreground/10 p-6 text-center">
                  <p className="text-sm mb-4">Faça login para usar o provador virtual.</p>
                  <button
                    onClick={() => navigate({ to: "/login" })}
                    className="inline-flex items-center justify-center px-5 py-3 bg-foreground text-background text-[11px] tracking-luxe uppercase"
                  >
                    Entrar / Criar conta
                  </button>
                </div>
              ) : status === "completed" && resultUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" /> Prévia gerada
                  </div>
                  <div className="aspect-[3/4] bg-muted overflow-hidden">
                    <img src={resultUrl} alt="Resultado" className="size-full object-cover" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Simulação aproximada. A peça real pode apresentar pequenas variações.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={addToCart}
                      className="flex-1 px-4 py-3 bg-foreground text-background text-[11px] tracking-luxe uppercase"
                    >
                      Adicionar à sacola
                    </button>
                    <button
                      onClick={() => {
                        setResultUrl(null);
                        setStatus("idle");
                        setFile(null);
                      }}
                      className="px-4 py-3 border border-foreground/20 text-[11px] tracking-luxe uppercase"
                    >
                      Outra foto
                    </button>
                  </div>
                </div>
              ) : status === "failed" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="size-4" /> {errorMsg ?? "Falha."}
                  </div>
                  <button
                    onClick={() => {
                      setStatus("idle");
                      setErrorMsg(null);
                    }}
                    className="px-4 py-3 border border-foreground/20 text-[11px] tracking-luxe uppercase"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] tracking-luxe uppercase text-muted-foreground">Sua foto</label>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => onPick(e.target.files?.[0] ?? null)}
                    />
                    {preview ? (
                      <div className="mt-2 relative aspect-[3/4] bg-muted overflow-hidden">
                        <img src={preview} alt="Sua foto" className="size-full object-cover" />
                        <button
                          onClick={() => setFile(null)}
                          className="absolute top-2 right-2 p-1.5 bg-background/90 text-foreground"
                          aria-label="Remover"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => inputRef.current?.click()}
                        className="mt-2 w-full aspect-[3/4] border border-dashed border-foreground/25 flex flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground hover:border-foreground/50 transition"
                      >
                        <Upload className="size-5" />
                        <span>Envie uma foto sua de frente</span>
                        <span className="text-[10px] tracking-luxe uppercase">rosto visível · boa iluminação · até 8MB</span>
                      </button>
                    )}
                  </div>

                  {(product.sizes?.length ?? 0) > 0 && (
                    <div>
                      <label className="text-[11px] tracking-luxe uppercase text-muted-foreground">Tamanho</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {product.sizes!.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSize(s)}
                            className={`px-3 py-1.5 text-xs border ${size === s ? "bg-foreground text-background border-foreground" : "border-foreground/20"}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(product.colors?.length ?? 0) > 0 && (
                    <div>
                      <label className="text-[11px] tracking-luxe uppercase text-muted-foreground">Cor</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {product.colors!.map((c) => (
                          <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`px-3 py-1.5 text-xs border ${color === c ? "bg-foreground text-background border-foreground" : "border-foreground/20"}`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>{CONSENT_TEXT}</span>
                  </label>

                  <button
                    disabled={busy || !file || !consent}
                    onClick={handleSubmit}
                    className="w-full px-5 py-3 bg-foreground text-background text-[11px] tracking-luxe uppercase disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {status === "uploading" ? "Enviando foto..." : "Gerando prévia..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Gerar prévia
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
