# Arquitetura Alvo — Dona Dora Boutique Premium

> **Status:** Especificação Arquitetural e Fronteiras de Segurança
> **Repositório:** `dona-dora-premium-style`
> **Ramo:** `docs/reconcile-security-state`
> **Base Remote:** `origin/main` (`7cec064`)

---

## 1. Visão Geral da Arquitetura

O **Dona Dora Boutique Premium** foi construído sobre uma arquitetura moderna de aplicação web full-stack SSR (Server-Side Rendering) utilizando **TanStack Start** (baseado em Vite e TanStack Router), **TypeScript**, **Tailwind CSS** e **Supabase** como backend de banco de dados e autenticação.

```
[ Cliente Browser / Frontend ]
          |
          |  (1) Envia formulários / payloads sem valores financeiros
          v
[ Server Functions (@tanstack/react-start) ]
          |
          |  (2) Valida JWT do cliente (requireSupabaseAuth)
          |  (3) Valida entrada via Zod Schemas
          |  (4) Consulta preços autoritativos, estoque e variantes no DB
          v
[ Supabase Admin (Service Role) ]
          |
          |  (5) Grava pedidos com RLS bypassado e subtotal recalculado
          v
[ Banco PostgreSQL Remote (Supabase) ] (RLS Ativo, orders_public_insert REMOVIDA)
```

---

## 2. Fronteira de Confiança e Modelo de Segurança

### 2.1 Modelo de Confiança no Checkout
- **Princípio:** O cliente frontend é considerado **não confiável** para a definição de valores financeiros, descontos ou confirmação de estoque.
- **Implementação:**
  - O cliente frontend envia exclusivamente os identificadores de produto e variantes selecionadas (`product_id`, `size`, `color`, `qty`).
  - A server function `createOrder` ([`src/lib/site.functions.ts`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/src/lib/site.functions.ts)) executa no servidor, reconsulta a tabela `products` via `supabaseAdmin` e efetua o cálculo autoritativo do subtotal.

### 2.2 Controle de Acesso e Autenticação
- **Autenticação de Usuários:** Gerenciada pelo Supabase Auth.
- **Proteção de Server Functions:** O middleware `requireSupabaseAuth` valida os tokens JWT em cada requisição de servidor.
- **Vínculo Autoritativo:** O e-mail do comprador é obrigatoriamente associado ao e-mail extraído do token JWT autenticado (`context.claims.email`), impedindo falsificação de identidade de terceiros.
- **Painel Administrativo:** Funções em `src/lib/admin.functions.ts` utilizam a função `assertAdmin` para validar a permissão de administrador no banco de dados antes de executar operações de leitura/escrita.

### 2.3 Fronteira de Segurança do Banco de Dados (Supabase / RLS)
- **Tabela `public.orders`:** Possui Row Level Security (RLS) habilitado.
- **Remoção da Policy Insegura (`orders_public_insert`):** **REMOVIDA E VERIFICADA NO BANCO REMOTO**. A política histórica que permitia que usuários `anon` ou `authenticated` inserissem dados diretamente na tabela `orders` sem passar pelo servidor foi desativada no Supabase remoto Cloud.
- **Migração no Repositório:** A migração [`supabase/migrations/20260821234621_8a71a813-dcc7-4c7c-9081-7e0ec09519b0.sql`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/supabase/migrations/20260821234621_8a71a813-dcc7-4c7c-9081-7e0ec09519b0.sql) já está integrada na história do repositório remoto (`origin/main` no commit `7cec064`).
- **Escrita em `orders`:** A gravação de pedidos ocorre exclusivamente através da chave administrativa de servidor (`supabaseAdmin`), garantindo isolamento total contra ataques de injeção direta via API REST pública do Supabase.

---

## 3. Arquitetura de Componentes Full-Stack

### 3.1 Camada de Apresentação (Frontend)
- **Framework:** React 18 com TanStack Router (File-based Routing).
- **Estilização:** Vanilla CSS estendido (`src/styles.css`) + Tailwind CSS + Shadcn UI.
- **Gerenciamento de Estado do Carrinho:** Zustand com persistência local em `localStorage` ([`src/hooks/use-cart.ts`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/src/hooks/use-cart.ts)).

### 3.2 Camada de Servidor (SSR & Server Functions)
- **Framework:** TanStack Start.
- **Funções de Servidor Divididas por Domínio:**
  - `src/lib/site.functions.ts`: Vitrine pública e criação de pedidos (`createOrder`).
  - `src/lib/account.functions.ts`: Perfil do cliente e histórico de pedidos (`listMyOrders`).
  - `src/lib/admin.functions.ts`: Gestão administrativa, produtos, marcas e status de pedidos.
  - `src/lib/dora.functions.ts`: Atendimento virtual e captura de leads.
  - `src/lib/tryon.functions.ts`: Provador virtual (OpenAI).

### 3.3 Camada de Dados e Integrações
- **Banco de Dados Relacional:** PostgreSQL no Supabase Cloud.
- **Armazenamento de Arquivos:** Supabase Storage (bucket `virtual-tryon` para uploads do provador virtual).
- **Provedor de Inteligência Artificial:** OpenAI API (`gpt-image-1` / `images/edits`).
