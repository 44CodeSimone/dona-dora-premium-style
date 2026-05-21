import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, Trash2, Upload, ExternalLink, Eye } from "lucide-react";
import {
  checkIsAdmin,
  updateSiteSettings,
  upsertProduct,
  deleteProduct,
  listAllProducts,
  listLeads,
  markLeadRead,
  uploadImage,
} from "@/lib/admin.functions";
import { getSiteSettings } from "@/lib/site.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel · Dona Dora" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const CATEGORIES = [
  { v: "feminina", l: "Moda Feminina" },
  { v: "masculina", l: "Moda Masculina" },
  { v: "acessorios", l: "Acessórios" },
  { v: "joias", l: "Joias" },
  { v: "oculos", l: "Óculos" },
  { v: "bones", l: "Bonés" },
  { v: "presentes", l: "Presentes" },
  { v: "promocoes", l: "Promoções" },
] as const;

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const checkAdmin = useServerFn(checkIsAdmin);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    checkAdmin().then((r) => {
      if (!r.isAdmin) {
        toast.error("Acesso restrito.");
        supabase.auth.signOut();
        navigate({ to: "/login" });
      } else {
        setIsAdmin(true);
      }
    });
  }, [user, loading, navigate, checkAdmin]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando painel...</div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-foreground text-background border-b border-background/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl">
            Dona <span className="italic text-[color:var(--gold-soft)]">Dora</span>{" "}
            <span className="text-[10px] tracking-luxe uppercase text-background/60 ml-2">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs tracking-luxe uppercase text-background/70 hover:text-background">
              Ver site <ExternalLink className="inline size-3" />
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/login" });
              }}
              className="bg-transparent border-background/30 text-background hover:bg-background hover:text-foreground"
            >
              <LogOut className="size-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <Tabs defaultValue="produtos">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="identidade">Identidade</TabsTrigger>
            <TabsTrigger value="vip">Grupo VIP</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="dora">Dora IA</TabsTrigger>
          </TabsList>
          <TabsContent value="produtos"><ProductsTab /></TabsContent>
          <TabsContent value="identidade"><IdentityTab /></TabsContent>
          <TabsContent value="vip"><VipTab /></TabsContent>
          <TabsContent value="leads"><LeadsTab /></TabsContent>
          <TabsContent value="seo"><SeoTab /></TabsContent>
          <TabsContent value="dora"><DoraTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ============ helpers ============
function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result);
      res(s.split(",")[1] ?? "");
    };
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}

function ImageUploader({
  value,
  onChange,
  folder = "uploads",
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder?: string;
}) {
  const upload = useServerFn(uploadImage);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-24 w-24 object-cover rounded border" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="inline-flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm hover:bg-muted">
          <Upload className="size-4" />
          {busy ? "Enviando..." : "Enviar imagem"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={busy}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 5 * 1024 * 1024) {
                toast.error("Máximo 5MB.");
                return;
              }
              setBusy(true);
              try {
                const b64 = await fileToBase64(f);
                const r = await upload({
                  data: {
                    filename: f.name,
                    contentType: f.type as "image/jpeg" | "image/png" | "image/webp",
                    dataBase64: b64,
                    folder,
                  },
                });
                onChange(r.url);
                toast.success("Imagem enviada.");
              } catch (err: any) {
                toast.error(err?.message ?? "Falha no upload.");
              } finally {
                setBusy(false);
                e.target.value = "";
              }
            }}
          />
        </label>
        <Input
          placeholder="ou cole a URL"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      </div>
    </div>
  );
}

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((t, i) => (
          <Badge key={i} variant="secondary" className="gap-1">
            {t}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              const v = draft.trim();
              if (v && !value.includes(v)) onChange([...value, v]);
              setDraft("");
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const v = draft.trim();
            if (v && !value.includes(v)) onChange([...value, v]);
            setDraft("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

// ============ IDENTIDADE ============
function IdentityTab() {
  const qc = useQueryClient();
  const get = useServerFn(getSiteSettings);
  const save = useServerFn(updateSiteSettings);
  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: () => get() });
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  const mut = useMutation({
    mutationFn: (payload: any) => save({ data: payload }),
    onSuccess: () => {
      toast.success("Salvo!");
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  if (isLoading || !form) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  return (
    <div className="space-y-6 max-w-3xl">
      <Section title="Marca">
        <Field label="Nome da loja"><Input value={form.brand_name ?? ""} onChange={(e) => set("brand_name", e.target.value)} /></Field>
        <Field label="Logo"><ImageUploader value={form.logo_url} onChange={(u) => set("logo_url", u)} folder="brand" /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Cor primária"><Input type="color" value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)} /></Field>
          <Field label="Cor de destaque"><Input type="color" value={form.accent_color} onChange={(e) => set("accent_color", e.target.value)} /></Field>
          <Field label="Fundo"><Input type="color" value={form.bg_color} onChange={(e) => set("bg_color", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Hero (banner principal)">
        <Field label="Título"><Input value={form.hero_title ?? ""} onChange={(e) => set("hero_title", e.target.value)} /></Field>
        <Field label="Subtítulo"><Textarea value={form.hero_subtitle ?? ""} onChange={(e) => set("hero_subtitle", e.target.value)} /></Field>
        <Field label="Imagem"><ImageUploader value={form.hero_image_url} onChange={(u) => set("hero_image_url", u)} folder="hero" /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Texto do botão"><Input value={form.hero_cta_text ?? ""} onChange={(e) => set("hero_cta_text", e.target.value)} /></Field>
          <Field label="Link do botão"><Input value={form.hero_cta_link ?? ""} onChange={(e) => set("hero_cta_link", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Contato">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="WhatsApp (formato 55...)"><Input value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
          <Field label="WhatsApp (exibição)"><Input value={form.whatsapp_display ?? ""} onChange={(e) => set("whatsapp_display", e.target.value)} /></Field>
          <Field label="Instagram URL"><Input value={form.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} /></Field>
          <Field label="@instagram"><Input value={form.instagram_handle ?? ""} onChange={(e) => set("instagram_handle", e.target.value)} /></Field>
          <Field label="E-mail para receber leads"><Input value={form.lead_email ?? ""} onChange={(e) => set("lead_email", e.target.value)} /></Field>
          <Field label="Endereço"><Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="Horário semana"><Input value={form.hours_weekday ?? ""} onChange={(e) => set("hours_weekday", e.target.value)} /></Field>
          <Field label="Horário sábado"><Input value={form.hours_saturday ?? ""} onChange={(e) => set("hours_saturday", e.target.value)} /></Field>
        </div>
      </Section>

      <Button onClick={() => mut.mutate(stripUnchanged(form, data))} disabled={mut.isPending}>
        {mut.isPending ? "Salvando..." : "Salvar identidade"}
      </Button>
    </div>
  );
}

// ============ VIP ============
function VipTab() {
  const qc = useQueryClient();
  const get = useServerFn(getSiteSettings);
  const save = useServerFn(updateSiteSettings);
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => get() });
  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (data && !form) setForm(data); }, [data, form]);

  const mut = useMutation({
    mutationFn: (p: any) => save({ data: p }),
    onSuccess: () => {
      toast.success("Salvo!");
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  if (!form) return <div className="p-8 text-muted-foreground">Carregando...</div>;
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  return (
    <div className="space-y-6 max-w-3xl">
      <Section title="Grupo VIP Dona Dora">
        <Field label="Título"><Input value={form.vip_title} onChange={(e) => set("vip_title", e.target.value)} /></Field>
        <Field label="Texto / chamada"><Textarea rows={3} value={form.vip_subtitle} onChange={(e) => set("vip_subtitle", e.target.value)} /></Field>
        <Field label="Link do grupo WhatsApp"><Input value={form.vip_link} onChange={(e) => set("vip_link", e.target.value)} /></Field>
        <Field label="Imagem / banner"><ImageUploader value={form.vip_image_url} onChange={(u) => set("vip_image_url", u)} folder="vip" /></Field>
        <Field label="Benefícios">
          <TagInput
            value={Array.isArray(form.vip_benefits) ? form.vip_benefits : []}
            onChange={(v) => set("vip_benefits", v)}
            placeholder="Adicionar benefício e Enter"
          />
        </Field>
      </Section>
      <Button onClick={() => mut.mutate(stripUnchanged(form, data))} disabled={mut.isPending}>
        {mut.isPending ? "Salvando..." : "Salvar Grupo VIP"}
      </Button>
    </div>
  );
}

// ============ SEO ============
function SeoTab() {
  const qc = useQueryClient();
  const get = useServerFn(getSiteSettings);
  const save = useServerFn(updateSiteSettings);
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => get() });
  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (data && !form) setForm(data); }, [data, form]);

  const mut = useMutation({
    mutationFn: (p: any) => save({ data: p }),
    onSuccess: () => {
      toast.success("Salvo!");
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  if (!form) return <div className="p-8 text-muted-foreground">Carregando...</div>;
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  return (
    <div className="space-y-6 max-w-3xl">
      <Section title="SEO">
        <Field label="Título (max 70)"><Input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} maxLength={70} /></Field>
        <Field label="Descrição (max 170)"><Textarea value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} maxLength={170} /></Field>
        <Field label="Palavras-chave (separe por vírgula)"><Input value={form.seo_keywords} onChange={(e) => set("seo_keywords", e.target.value)} /></Field>
        <Field label="Imagem de compartilhamento (OG image)"><ImageUploader value={form.seo_og_image} onChange={(u) => set("seo_og_image", u)} folder="seo" /></Field>
      </Section>
      <Button onClick={() => mut.mutate(stripUnchanged(form, data))} disabled={mut.isPending}>
        {mut.isPending ? "Salvando..." : "Salvar SEO"}
      </Button>
    </div>
  );
}

// ============ DORA IA ============
function DoraTab() {
  const qc = useQueryClient();
  const get = useServerFn(getSiteSettings);
  const save = useServerFn(updateSiteSettings);
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => get() });
  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (data && !form) setForm(data); }, [data, form]);
  const mut = useMutation({
    mutationFn: (p: any) => save({ data: p }),
    onSuccess: () => {
      toast.success("Salvo!");
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  if (!form) return <div className="p-8 text-muted-foreground">Carregando...</div>;
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-6 max-w-3xl">
      <Section title="Dora — Assistente virtual">
        <Field label="Mensagem de boas-vindas"><Textarea rows={3} value={form.dora_welcome_message ?? ""} onChange={(e) => set("dora_welcome_message", e.target.value)} /></Field>
        <Field label="Instruções da Dora (personalidade, comportamento)">
          <Textarea rows={10} value={form.dora_system_prompt ?? ""} onChange={(e) => set("dora_system_prompt", e.target.value)} />
        </Field>
      </Section>
      <Button onClick={() => mut.mutate(stripUnchanged(form, data))} disabled={mut.isPending}>
        {mut.isPending ? "Salvando..." : "Salvar Dora"}
      </Button>
    </div>
  );
}

// ============ PRODUTOS ============
function ProductsTab() {
  const qc = useQueryClient();
  const list = useServerFn(listAllProducts);
  const remove = useServerFn(deleteProduct);
  const { data: products } = useQuery({ queryKey: ["all-products"], queryFn: () => list() });
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Removido.");
      qc.invalidateQueries({ queryKey: ["all-products"] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl">Produtos ({products?.length ?? 0})</h2>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="size-4 mr-1" /> Novo produto
        </Button>
      </div>

      <div className="bg-card rounded border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>
                  {(p.images?.[0] || p.image_url) ? (
                    <img src={p.images?.[0] || p.image_url} alt="" className="size-12 object-cover rounded" />
                  ) : <div className="size-12 bg-muted rounded" />}
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="capitalize">{p.category}</TableCell>
                <TableCell>
                  {p.promo_price ? (
                    <><span className="line-through text-muted-foreground text-xs">R$ {p.price}</span>{" "}<span>R$ {p.promo_price}</span></>
                  ) : p.price ? `R$ ${p.price}` : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {p.active ? <Badge>Ativo</Badge> : <Badge variant="outline">Inativo</Badge>}
                    {p.featured && <Badge variant="secondary">Destaque</Badge>}
                    {p.promo && <Badge variant="secondary">Promo</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={() => confirm("Excluir?") && del.mutate(p.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!products?.length && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">Nenhum produto ainda.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProductDialog open={open} onOpenChange={setOpen} initial={editing} />
    </div>
  );
}

function ProductDialog({ open, onOpenChange, initial }: { open: boolean; onOpenChange: (v: boolean) => void; initial: any | null }) {
  const qc = useQueryClient();
  const save = useServerFn(upsertProduct);
  const [f, setF] = useState<any>(emptyProduct());

  useEffect(() => {
    setF(initial ? { ...emptyProduct(), ...initial } : emptyProduct());
  }, [initial, open]);

  const mut = useMutation({
    mutationFn: (p: any) => save({ data: p }),
    onSuccess: () => {
      toast.success("Salvo!");
      qc.invalidateQueries({ queryKey: ["all-products"] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const set = (k: string, v: any) => setF({ ...f, [k]: v });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Field label="Nome"><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Descrição"><Textarea rows={3} value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria">
              <Select value={f.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Texto alternativo (acessibilidade)">
              <Input value={f.alt_text ?? ""} onChange={(e) => set("alt_text", e.target.value)} />
            </Field>
            <Field label="Preço (R$)"><Input type="number" step="0.01" value={f.price ?? ""} onChange={(e) => set("price", e.target.value ? parseFloat(e.target.value) : null)} /></Field>
            <Field label="Preço promo (R$)"><Input type="number" step="0.01" value={f.promo_price ?? ""} onChange={(e) => set("promo_price", e.target.value ? parseFloat(e.target.value) : null)} /></Field>
          </div>
          <Field label="Tamanhos"><TagInput value={f.sizes ?? []} onChange={(v) => set("sizes", v)} placeholder="P, M, G..." /></Field>
          <Field label="Cores"><TagInput value={f.colors ?? []} onChange={(v) => set("colors", v)} placeholder="Preto, Bege..." /></Field>
          <Field label="Imagens (até 8)">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {(f.images ?? []).map((url: string, i: number) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="size-20 object-cover rounded border" />
                    <button type="button" onClick={() => set("images", f.images.filter((_: any, j: number) => j !== i))} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"><Trash2 className="size-3" /></button>
                  </div>
                ))}
              </div>
              {(f.images?.length ?? 0) < 8 && (
                <ImageUploader value={null} onChange={(u) => u && set("images", [...(f.images ?? []), u])} folder="products" />
              )}
            </div>
          </Field>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ToggleField label="Ativo" value={f.active} onChange={(v) => set("active", v)} />
            <ToggleField label="Disponível" value={f.available} onChange={(v) => set("available", v)} />
            <ToggleField label="Destaque" value={f.featured} onChange={(v) => set("featured", v)} />
            <ToggleField label="Promoção" value={f.promo} onChange={(v) => set("promo", v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mut.mutate({
            ...f,
            image_url: f.image_url || f.images?.[0] || null,
          })} disabled={mut.isPending}>
            {mut.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function emptyProduct() {
  return {
    name: "", description: "", category: "feminina", price: null, promo_price: null,
    image_url: null, images: [], sizes: [], colors: [],
    featured: false, promo: false, active: true, available: true, alt_text: "",
  };
}

// ============ LEADS ============
function LeadsTab() {
  const qc = useQueryClient();
  const list = useServerFn(listLeads);
  const mark = useServerFn(markLeadRead);
  const { data: leads } = useQuery({ queryKey: ["leads"], queryFn: () => list() });
  const [viewing, setViewing] = useState<any | null>(null);

  const mut = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => mark({ data: { id, read } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  const unread = leads?.filter((l: any) => !l.read).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="font-display text-2xl">Leads ({leads?.length ?? 0}) <span className="text-sm text-muted-foreground">· {unread} novos</span></h2>
        <Button variant="outline" onClick={() => exportLeads(leads ?? [])}>Exportar CSV</Button>
      </div>
      <div className="bg-card rounded border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Interesse</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads?.map((l: any) => (
              <TableRow key={l.id} className={l.read ? "" : "font-medium bg-accent/10"}>
                <TableCell className="text-xs">{new Date(l.created_at).toLocaleString("pt-BR")}</TableCell>
                <TableCell>{l.name ?? "—"}</TableCell>
                <TableCell>{l.whatsapp ?? "—"}</TableCell>
                <TableCell className="max-w-[200px] truncate">{l.interest ?? l.product ?? "—"}</TableCell>
                <TableCell><Badge variant="outline">{l.source}</Badge></TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button size="sm" variant="ghost" onClick={() => { setViewing(l); if (!l.read) mut.mutate({ id: l.id, read: true }); }}>
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!leads?.length && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">Nenhum lead ainda.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lead — {viewing?.name}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <Row k="Data" v={new Date(viewing.created_at).toLocaleString("pt-BR")} />
              <Row k="Nome" v={viewing.name} />
              <Row k="WhatsApp" v={viewing.whatsapp} />
              <Row k="Interesse" v={viewing.interest} />
              <Row k="Produto" v={viewing.product} />
              <Row k="Tamanho" v={viewing.size} />
              <Row k="Faixa de preço" v={viewing.budget} />
              <Row k="Estilo" v={viewing.style} />
              <Row k="Mensagem" v={viewing.message} />
              <Row k="Origem" v={viewing.source} />
              {viewing.whatsapp && (
                <a href={`https://wa.me/${viewing.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-foreground text-background text-xs uppercase tracking-luxe rounded">
                  Abrir no WhatsApp <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function exportLeads(leads: any[]) {
  const cols = ["created_at", "name", "whatsapp", "email", "interest", "product", "size", "budget", "style", "message", "source", "read"];
  const csv = [
    cols.join(","),
    ...leads.map((l) => cols.map((c) => `"${String(l[c] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============ small UI ============
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded border p-6 space-y-4">
      <h3 className="font-display text-xl">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between border rounded p-3">
      <Label className="text-sm">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
function Row({ k, v }: { k: string; v: any }) {
  if (!v) return null;
  return (
    <div className="grid grid-cols-3 gap-2 border-b py-1.5">
      <span className="text-muted-foreground text-xs uppercase">{k}</span>
      <span className="col-span-2 break-words">{String(v)}</span>
    </div>
  );
}

function stripUnchanged(form: any, original: any) {
  const out: any = {};
  for (const k of Object.keys(form)) {
    if (JSON.stringify(form[k]) !== JSON.stringify(original?.[k])) out[k] = form[k];
  }
  return out;
}
