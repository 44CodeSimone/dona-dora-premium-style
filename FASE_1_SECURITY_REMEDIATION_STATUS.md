# Fase 1 — Status da Remediação de Segurança

> **Status:** Documentação Oficial de Segurança e Débito Técnico
> **Repositório:** `dona-dora-premium-style`
> **Ramo:** `docs/reconcile-security-state`
> **Base Remote:** `origin/main` (`7cec064`)

---

## 1. Resumo do Status de Segurança

A Fase 1 da auditoria e remediação de segurança concentrou-se na **proteção de credenciais de ambiente**, no **fortalecimento da fronteira de confiança do checkout** (eliminação da manipulação de preços no lado do cliente) e na **eliminação da política de inserção direta no banco de dados remoto**.

---

## 2. Remediações Concluídas (Commits e Banco de Dados)

### 2.1 Commit `1c97acf` — Proteção de Arquivos de Ambiente
- **Descrição:** `security: stop tracking local environment files`
- **Ações Realizadas:**
  1. Remoção do arquivo `.env` do controle de versão Git (`git rm --cached .env`);
  2. Atualização do arquivo `.gitignore` para ignorar `.env` e variações `.env.*`;
  3. Criação do arquivo `.env.example` com chaves de modelo seguras para orientação de desenvolvimento.
- **Estado Atual:** **CONCLUÍDO E VERIFICADO**. O arquivo `.env` local não é mais rastreado pelo Git.

### 2.2 Commit `0cb4fc2` — Validação Server-Side de Preços e Pedidos
- **Descrição:** `security: validate order pricing server-side`
- **Ações Realizadas:**
  1. **Transferência de Responsabilidade:** A lógica de cálculo de subtotal e determinação de preços de produtos foi totalmente removida do cliente frontend ([`src/components/site/Cart.tsx`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/src/components/site/Cart.tsx)). O navegador envia apenas `product_id`, `size`, `color` e `qty`.
  2. **Validação Autoritativa no Servidor:** A função server-side `createOrder` ([`src/lib/site.functions.ts`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/src/lib/site.functions.ts)):
     - Exige autenticação prévia via middleware `requireSupabaseAuth`;
     - Valida os dados de entrada via schema Zod (`orderSchema`);
     - Consulta os dados oficiais de preços diretamente no banco de dados Supabase via `supabaseAdmin` (Service Role);
     - Valida se o produto está ativo (`active = true`) e disponível (`available = true`);
     - Valida se o tamanho (`size`) e a cor (`color`) selecionados são suportados pelo produto;
     - Valida se há estoque suficiente (`stock`);
     - Recalcula o preço unitário (aplicando `promo_price` se `promo = true`, ou `price`);
     - Calcula o subtotal autoritativo no servidor antes de realizar a inserção na tabela `orders`.
  3. **Documentação de Remediação de Banco:** Criação do documento [`DATABASE_SECURITY_REMEDIATION_PROPOSAL.md`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/DATABASE_SECURITY_REMEDIATION_PROPOSAL.md).
- **Estado Atual:** **CONCLUÍDO E VERIFICADO**.

### 2.3 Remediação de Banco de Dados — Remoção da Policy `orders_public_insert`
- **Descrição:** Eliminação da política pública RLS de inserção em `public.orders` no banco de dados remoto Supabase.
- **Estado Remoto:** A política `orders_public_insert` foi **REMOVIDA E VERIFICADA NO BANCO REMOTO**.
- **Estado do Repositório:** A migração [`supabase/migrations/20260821234621_8a71a813-dcc7-4c7c-9081-7e0ec09519b0.sql`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/supabase/migrations/20260821234621_8a71a813-dcc7-4c7c-9081-7e0ec09519b0.sql) já está integrada na história remota (`origin/main` no commit `7cec064`).
- **Documentação de Referência:** [`SECURITY.md`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/SECURITY.md).

### 2.4 Commit `d1b902a` — Resolução de Alertas de Lint Direcionados
- **Descrição:** `chore: resolve targeted lint issues`
- **Ações Realizadas:**
  1. Adição de comentários explicativos nos blocos `catch` vazios do hook de carrinho ([`src/hooks/use-cart.ts`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/src/hooks/use-cart.ts)), eliminando os 2 erros `no-empty`;
  2. Alteração da declaração da variável `providerPreviewUrl` de `let` para `const` em [`src/lib/tryon.functions.ts`](file:///C:/Users/simon/OneDrive/Documentos/dona-dora-premium-style/src/lib/tryon.functions.ts), eliminando 1 erro `prefer-const`.
- **Estado Atual:** **CONCLUÍDO E VERIFICADO**.

---

## 3. Estado Atual dos Controles de Segurança

| Controle de Segurança | Status | Mecanismo de Garantia |
| :--- | :---: | :--- |
| **Arquivos de Ambiente Ignorados** | **ATIVO** | `.env` no `.gitignore`, removido do rastreamento Git. |
| **Cálculo de Preço Autoritativo** | **ATIVO** | `createOrder` reconsulta banco de dados via `supabaseAdmin`. |
| **Validação de Disponibilidade de Produto** | **ATIVO** | `createOrder` checa `active` e `available`. |
| **Validação de Estoque** | **ATIVO** | `createOrder` valida `qty <= stock`. |
| **Validação de Variantes (Tamanho/Cor)** | **ATIVO** | `createOrder` verifica inclusão em `sizes` e `colors`. |
| **Vínculo de E-mail do Cliente** | **ATIVO** | `customer_email` é obtido do token JWT autenticado (`context.claims.email`). |
| **Remoção de Insert Direto RLS (`orders`)** | **ATIVO (REMOTAMENTE & GIT)** | Policy `orders_public_insert` removida do Supabase remoto e registrada na migração em `origin/main` (`7cec064`). |

---

## 4. Classificação do Débito Técnico Diferido

O linter completo **NÃO PASSA** devido ao débito técnico que foi explicitamente **diferido** para fases futuras:

1. **93 Ocorrências de `@typescript-eslint/no-explicit-any`**:
   - Classificação: Débito de Tipagem / Manutenibilidade.
   - Status: **DIFERIDO** (Não afeta o comportamento em tempo de execução nem a segurança do checkout).
2. **1.630 Ocorrências de `prettier/prettier`**:
   - Classificação: Débito de Formatação de Código.
   - Status: **DIFERIDO** (Não deve ser corrigido no ramo de segurança para evitar diffs massivos de formatação).
3. **6 Alertas de `react-refresh/only-export-components`**:
   - Classificação: Limitação de HMR em Desenvolvimento (Shadcn UI component co-exports).
   - Status: **DIFERIDO** (Comportamento padrão da biblioteca em produção, sem risco em tempo de execução).
