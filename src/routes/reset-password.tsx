import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Redefinir senha · Dona Dora" }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  // Detect Supabase recovery link (hash contains type=recovery or access_token)
  const [mode, setMode] = useState<"request" | "update">("request");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setMode("update");
    }
    // Supabase parses the hash automatically and triggers PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("update");
    });
    setChecking(false);
    return () => subscription.unsubscribe();
  }, []);

  if (checking) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="min-h-screen grid place-items-center bg-foreground text-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-10">
          <span className="font-display text-4xl">Dona <span className="italic text-[color:var(--gold-soft)]">Dora</span></span>
        </Link>
        <div className="bg-background text-foreground p-8 rounded-sm shadow-luxe">
          {mode === "request" ? <RequestForm /> : <UpdateForm onDone={() => navigate({ to: "/login" })} />}
          <div className="text-center pt-6">
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center space-y-3">
        <h1 className="font-display text-2xl">Verifique seu e-mail</h1>
        <p className="text-sm text-muted-foreground">
          Enviamos um link para <strong className="text-foreground">{email}</strong>. Clique no link para definir uma nova senha.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h1 className="font-display text-2xl mb-1">Esqueci minha senha</h1>
        <p className="text-sm text-muted-foreground">Informe seu e-mail para receber o link de redefinição.</p>
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Enviando..." : "Enviar link de redefinição"}
      </Button>
    </form>
  );
}

function UpdateForm({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha alterada! Faça login com a nova senha.");
    await supabase.auth.signOut();
    onDone();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h1 className="font-display text-2xl mb-1">Nova senha</h1>
        <p className="text-sm text-muted-foreground">Escolha uma senha forte (mínimo 8 caracteres).</p>
      </div>
      <div>
        <Label htmlFor="new-password">Nova senha</Label>
        <Input id="new-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
      </div>
      <div>
        <Label htmlFor="confirm-password">Confirmar nova senha</Label>
        <Input id="confirm-password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Salvando..." : "Atualizar senha"}
      </Button>
    </form>
  );
}
