import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Acesso administrativo · Dona Dora" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErr("Credenciais inválidas. Verifique e tente novamente.");
      return;
    }
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-foreground text-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-10">
          <span className="font-display text-4xl">Dona <span className="italic text-[color:var(--gold-soft)]">Dora</span></span>
        </Link>
        <div className="bg-background text-foreground p-8 rounded-sm shadow-luxe">
          <h1 className="font-display text-3xl mb-1">Acesso administrativo</h1>
          <p className="text-sm text-muted-foreground mb-6">Entre para gerenciar a sua loja.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="text-center pt-2">
              <Link to="/reset-password" className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
                Esqueci minha senha
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
