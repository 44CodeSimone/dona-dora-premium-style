# Fase 0 — Comparativo: Lovable, GitHub e Antigravity

> **Status:** Documentação de Alinhamento e Estado Técnico Verificado
> **Repositório:** `dona-dora-premium-style`
> **Ramo Atual:** `docs/reconcile-security-state`
> **Base Remote:** `origin/main` (`7cec064`)

---

## 1. Visão Geral da Arquitetura de Ambientes e Sincronização

O projeto **Dona Dora Boutique Premium** possui histórico de desenvolvimento com contribuição da plataforma **Lovable** (via `gpt-engineer-app[bot]`), sincronização no **GitHub**, e execução/desenvolvimento local com a IDE/agente **Antigravity**.

Para garantir a integridade técnica, segurança e prevenção de regressões, esta análise compara os quatro pilares do ecossistema:

```
+------------------+         +--------------------+         +-----------------------+
|  Lovable Platform|         |   GitHub Remote    |         | Antigravity / Local   |
| (Lovable Cloud)  |<------->| (origin/main, etc) |<------->| (Windows + Bun/npm)   |
+------------------+         +--------------------+         +-----------------------+
```

---

## 2. Comparativo de Ambientes e Componentes

### 2.1 Repositório e Controle de Versão (Git / GitHub)
- **Ramo Principal Remote:** `origin/main` (HEAD: `7cec064`).
- **Pull Request #1 (PR #1):** **MERGED** no GitHub (Merge commit: `ba0f8ea`).
- **Remediação no Banco Remote:** Commit `7cec064` (`Dropped orders_public_insert`) com a migração `supabase/migrations/20260821234621_8a71a813-dcc7-4c7c-9081-7e0ec09519b0.sql` integrada diretamente na história remota.
- **Ramo de Conciliação:** `docs/reconcile-security-state`.

### 2.2 Ambiente Local Antigravity (Windows OS + Bun 1.3.14 / Node)
- **Sistema Operacional:** Windows.
- **Runtime:** Bun 1.3.14.
- **Ambiente de Build/Dependências:**
  - **Problema Conhecido de Lifecycle Script (Bun 1.3.14 em Windows):** Durante execuções do Bun em Windows, scripts de ciclo de vida (postinstall) disparando binários como `esbuild` ou `workerd` (Cloudflare Workers runtime) apresentam erros `ENOENT` ou travamentos.
  - **Solução Técnica Utilizada:** As dependências em `node_modules` foram instanciadas localmente utilizando o gerenciador `npm` para contornar limitações de execução de binários nativos via Bun em Windows.
  - **Integridade do Lockfile:** O arquivo `bun.lock` foi mantido **intacto e inalterado**. Nenhum `package-lock.json` ou lockfile não autorizado foi adicionado ao repositório Git.

### 2.3 Integração Lovable (Plataforma e Automações)
- **Commits Históricos Lovable:** `009ee30`, `dea1c4b`, `10d3ce3`, `f671eea`, `9ceec1b`, `7cec064` (adição de templates de e-mail de autenticação, webhooks, segurança da fila PGMQ e remoção da política `orders_public_insert`).
- **Ramo de Sincronização:** `origin/lovable-sync-1781795431`.
- **Risco de Dessincronização:** Alterações diretas realizadas na interface web do Lovable podem sobrescrever correções de segurança aplicadas no repositório Git local se mescladas sem revisão prévia.

### 2.4 Ambiente de Build, Testes e Lint
- **Status do Build de Produção:** **PASS** (Client bundle + Server/SSR bundle via `bun run build`).
- **Status da Checagem de Tipos:** **PASS** (`bun x tsc --noEmit` — 0 erros).
- **Status da Suíte de Testes:** **NÃO DISPONÍVEL** (Não existe script ou suíte de testes automatizados no `package.json`).
- **Status do Linter Completo:** **NÃO PASSA** devido a débito técnico diferido (93 ocorrências de `@typescript-eslint/no-explicit-any`, 1.630 avisos `prettier/prettier` e 6 avisos Fast Refresh).
- **Comportamento do `src/routeTree.gen.ts`:** Durante o processo de build (`vite build` / `@tanstack/router-plugin`), a árvore de rotas é regenerada automaticamente pelo TanStack Router, reordenando as importações e declarações de rotas em ordem alfabética. Essa alteração foi verificada como sendo estritamente de formatação/ordenação e é revertida com `git restore -- src/routeTree.gen.ts` para manter o histórico Git limpo.

---

## 3. Matriz de Classificação de Estado

| Componente / Funcionalidade | Classificação de Estado | Evidência / Observação |
| :--- | :--- | :--- |
| **Integridade da Árvore Git Local** | **VERIFIED** | Baseado em `origin/main` no commit `7cec064`. |
| **Checagem de Tipos TypeScript** | **VERIFIED** | `bun x tsc --noEmit` retorna 0 erros. |
| **Build de Produção (Client + SSR)** | **VERIFIED** | `bun run build` executa e gera artefatos em `dist/client` e `dist/server`. |
| **Proteção de Segredos (`.env`)** | **VERIFIED** | `.env` removido do rastreamento (commit `1c97acf`), `.gitignore` configurado. |
| **Checkout Seguro (`createOrder`)** | **VERIFIED** | Preço, estoque e disponibilidade validados no servidor (commit `0cb4fc2`). |
| **Remoção da Policy `orders_public_insert`** | **VERIFIED (REMOTAMENTE & GIT)** | Removida do banco remoto Supabase e registrada na migração `20260821234621_8a71a813-dcc7-4c7c-9081-7e0ec09519b0.sql` em `origin/main` (`7cec064`). |
| **Remediação de Lint Alvo** | **VERIFIED** | Erros `no-empty` e `prefer-const` corrigidos no commit `d1b902a`. |
| **Suíte de Testes Automatizados** | **NOT AVAILABLE** | Não existe script de teste configurado no `package.json`. |
| **Linter Completo (ESLint / Prettier)** | **TECHNICAL DEBT** | Não passa por conta de débito diferido (93 `any`, 1630 Prettier, 6 Fast Refresh). |
| **Histórico Lovable (`email-templates`)** | **HISTORICAL/KNOWN** | Arquivos em `src/routes/lovable/` e `src/lib/email-templates/` integrados via `gpt-engineer-app[bot]`. |
| **Recuperação de `node_modules` via npm** | **HISTORICAL/KNOWN** | Realizado localmente para contornar limitações do Bun 1.3.14/Windows com `workerd`/`esbuild`. |
| **Publicação / Deploy em Produção** | **PENDING** | Nenhuma ação de deploy foi executada nesta fase. |

---

## 4. Riscos de Sincronização e Recomendações

1. **Risco de Sobrescrita pelo Lovable:** Se edições forem feitas na plataforma Lovable enquanto o código estiver com correções de segurança não sincronizadas, um merge automático poderá reintroduzir cálculo de preço no cliente (`Cart.tsx`).
2. **Recomendação de Fluxo de Trabalho:**
   - Manter as alterações de segurança e migrações documentadas no repositório.
   - Realizar Code Review rigoroso antes de sincronizar com a plataforma Lovable.
   - Garantir que a remoção da política `orders_public_insert` permaneça ativa em todas as instâncias do banco de dados Supabase.
