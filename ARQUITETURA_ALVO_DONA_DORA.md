# Arquitetura Alvo — Dona Dora Boutique Premium

> **Status:** Especificação de Arquitetura de Referência  
> **Repositório:** `dona-dora-premium-style`  
> **Ramo:** `security/remediate-secrets`  
> **HEAD:** `d1b902a`

---

## 1. Visão Geral da Arquitetura

A arquitetura do **Dona Dora Boutique Premium** foi projetada para combinar uma experiência de usuário (UX) fluida e moderna no frontend com uma **fronteira de segurança rígida** no backend (Server-Side Rendering e Server Functions).

```
+-----------------------------------------------------------------------------------+
|                                 CLIENTE (BROWSER)                                 |
|  React 18 + Vite | TanStack Router | Client Cart (useCart) | UI Components (Shadcn) |
+-----------------------------------------------------------------------------------+
                                         |
                                         | HTTP / Server Function Invocation
                                         v
+-----------------------------------------------------------------------------------+
|                            CAMADA SERVIDOR (SSR / NODE)                           |
|  TanStack Start (createServerFn) | Middleware (requireSupabaseAuth) | assertAdmin |
|  - Validação de Schemas Zod                                                        |
|  - Reconsulta Autoritativa de Preços e Estoque no Banco                           |
|  - Gestão de Segredos (.env: SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, etc)      |
+-----------------------------------------------------------------------------------+
                        |                                       |
                        | Supabase Service Role Client          | External API Call
                        v                                       v
+-----------------------------------------------+     +-----------------------------+
|              SUPABASE POSTGRESQL              |     |   INTEGRAÇÕES EXTERNAS      |
|  Tables: site_settings, products, brands,     |     |  - OpenAI API (Try-On)      |
|          orders, reviews, leads, etc.         |     |  - Lovable Email Service    |
|  Storage Buckets: virtual-tryon               |     |  - WhatsApp Web Links       |
+-----------------------------------------------+     +-----------------------------+
```

---

## 2. Divisão Estrutural da Arquitetura

### 2.1 Arquitetura ATUAL (Implementada e Verificada)
- **Frontend / Cliente:** React 18, Vite, TanStack Router (file-based routing em `src/routes/`), Tailwind CSS e componentes Shadcn UI.
- **Gerenciamento de Estado de Carrinho:** Hook `useCart` com sincronização via `useSyncExternalStore` e persistência local.
- **Camada de Servidor (SSR):** Engine `@tanstack/react-start` com servidor HTTP configurado em [`src/server.ts`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/src/server.ts).
- **Server Functions Autenticadas:** Criadas via `createServerFn` protegidas pelo middleware `requireSupabaseAuth` e verificação `assertAdmin`.
- **Checkout Autoritativo no Servidor:** A função `createOrder` ([`src/lib/site.functions.ts`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/src/lib/site.functions.ts)) reconsulta o banco de dados via `supabaseAdmin` (Service Role), valida `active`, `available`, estoque, variantes de tamanho/cor, e calcula o subtotal no servidor antes da gravação.
- **Proteção de Segredos:** Arquivo `.env` removido do controle de versão Git (`.gitignore`) e substituição por `.env.example`.

### 2.2 Arquitetura ALVO (Target Architecture)
- **Separação Estrita de Clientes Supabase:**
  - Cliente Público (`supabaseClient`): Apenas operações públicas permitidas por RLS.
  - Cliente Privado (`supabaseAdmin`): Uso exclusivo em server functions no lado do servidor.
- **Tipagem End-to-End Estrita:** Eliminação completa de `any` explícito nas camadas de comunicação entre servidor e cliente.
- **Cobertura de Testes Automatizados:** Introdução de suíte de testes unitários e de integração para validar Server Functions e regras de negócio do checkout.
- **Zero Confiança no Navegador:** Garantia de que nenhuma mutation crítica (pedidos, estoque, pagamentos) dependa de dados passados diretamente pelo cliente.

### 2.3 Alterações de Segurança PENDENTES (Pending Security Changes)
- **Proposta de Remediação RLS em `orders`:**  
  `The direct public insert policy for orders remains a known security remediation proposal and has NOT been implemented or executed.`
- **Execução Controlada:** A remoção da política `orders_public_insert` permanece documentada em [`DATABASE_SECURITY_REMEDIATION_PROPOSAL.md`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/DATABASE_SECURITY_REMEDIATION_PROPOSAL.md) e aguarda confirmação do `project_ref` e autorização prévia. Nenhuma alteração foi executada no banco de dados.

---

## 3. Limites de Implantação e Segredos

- **Build de Produção:** O comando `bun run build` gera duas distribuições distintas: `dist/client` (ativos estáticos) e `dist/server` (bundle Node.js/SSR).
- **Segredos Protegidos (Somente Servidor):** `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY` e `OPENAI_API_KEY` são mantidos exclusivamente em variáveis de ambiente do servidor, sem exposição ao cliente web.
