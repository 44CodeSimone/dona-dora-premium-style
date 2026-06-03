import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta · Dona Dora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CadastroPage,
});

function validatePassword(password: string) {
  if (password.length < 8) {
    return "A senha precisa ter pelo menos 8 caracteres.";
  }

  if (!/[A-Z]/.test(password)) {
    return "A senha precisa ter pelo menos uma letra maiúscula.";
  }

  if (!/[a-z]/.test(password)) {
    return "A senha precisa ter pelo menos uma letra minúscula.";
  }

  if (!/[0-9]/.test(password)) {
    return "A senha precisa ter pelo menos um número.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "A senha precisa ter pelo menos um símbolo, como @, ! ou #.";
  }

  return null;
}

function translateSignUpError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("weak") ||
    normalized.includes("easy to guess")
  ) {
    return "Essa senha ainda é considerada fraca. Use uma senha mais longa, misturando letras, números e símbolos.";
  }

  if (
    normalized.includes("already") ||
    normalized.includes("registered") ||
    normalized.includes("exists")
  ) {
    return "Esse e-mail já possui cadastro. Tente entrar na sua conta ou recuperar a senha.";
  }

  if (normalized.includes("invalid email")) {
    return "Informe um e-mail válido.";
  }

  if (
    normalized.includes("signup") &&
    normalized.includes("disabled")
  ) {
    return "O cadastro de novos clientes está desativado no momento. Entre em contato com a loja.";
  }

  return "Não foi possível criar sua conta agora. Verifique os dados e tente novamente.";
}

function CadastroPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const cleanName = fullName.trim();
    const cleanWhatsapp = whatsapp.trim();
    const cleanEmail = email.trim().toLowerCase();

    setErr(null);
    setSuccess(null);

    if (cleanName.length < 3) {
      setErr("Informe seu nome completo.");
      return;
    }

    if (cleanWhatsapp.length < 8) {
      setErr("Informe um WhatsApp válido para contato sobre seus pedidos.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("As senhas não conferem.");
      return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      setErr(passwordError);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          phone: cleanWhatsapp,
        },
      },
    });

    setLoading(false);

    if (error) {
      setErr(translateSignUpError(error.message));
      return;
    }

    if (!data.session) {
      setSuccess(
        "Conta criada com sucesso. Caso a confirmação por e-mail esteja habilitada, verifique sua caixa de entrada antes de acessar sua conta.",
      );
      return;
    }

    navigate({ to: "/minha-conta" });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-foreground text-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-10">
          <span className="font-display text-4xl">
            Dona{" "}
            <span className="italic text-[color:var(--gold-soft)]">
              Dora
            </span>
          </span>
        </Link>

        <div className="bg-background text-foreground p-8 rounded-sm shadow-luxe">
          <h1 className="font-display text-3xl mb-1">
            Criar conta
          </h1>

          <p className="text-sm text-muted-foreground mb-6">
            Crie sua conta para acompanhar pedidos, favoritos e dados de compra.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>

              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>

              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                autoComplete="tel"
                placeholder="(DDD) 9 9999-9999"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>

              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              <p className="mt-1 text-xs text-muted-foreground">
                Use pelo menos 8 caracteres com letras maiúsculas,
                minúsculas, número e símbolo.
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">
                Confirmar senha
              </Label>

              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {err && (
              <p className="text-sm text-destructive">
                {err}
              </p>
            )}

            {success && (
              <p className="text-sm text-emerald-600">
                {success}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || Boolean(success)}
            >
              {loading
                ? "Criando conta..."
                : success
                  ? "Conta criada"
                  : "Criar conta"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Já possui conta?{" "}
              <Link
                to="/login"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Entrar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}