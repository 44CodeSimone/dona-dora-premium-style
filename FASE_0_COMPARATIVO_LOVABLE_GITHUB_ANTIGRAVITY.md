# Fase 0 — Comparativo: Lovable, GitHub e Antigravity

> **Status:** Documentação de Alinhamento e Estado Técnico Verificado  
> **Repositório:** `dona-dora-premium-style`  
> **Ramo Atual:** `security/remediate-secrets`  
> **HEAD:** `d1b902a`

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
- **Ramo Ativo Local:** `security/remediate-secrets` (HEAD: `d1b902a`).
- **Ramos Remotos (`origin`):**
  - `origin/main` (ramo principal de produção no GitHub);
  - `origin/lovable-sync-1781795431` (ramo automático mantido pela integração Lovable).
- **Histórico de Commits Recentes no Ramo de Segurança:**
  - `d1b902a`: `chore: resolve targeted lint issues` (comentários em catch de storage e `let` -> `const` em tryon);
  - `0cb4fc2`: `security: validate order pricing server-side` (recalculo server-side de preços no checkout e criação da proposta de banco);
  - `1c97acf`: `security: stop tracking local environment files` (remoção do `.env` rastreado e inclusão no `.gitignore`).

### 2.2 Ambiente Local Antigravity (Windows OS + Bun 1.3.14 / Node)
- **Sistema Operacional:** Windows.
- **Runtime:** Bun 1.3.14.
- **Ambiente de Build/Dependências:**
  - **Problema Conhecido de Lifecycle Script (Bun 1.3.14 em Windows):** Durante execuções do Bun em Windows, scripts de ciclo de vida (postinstall) disparando binários como `esbuild` ou `workerd` (Cloudflare Workers runtime) apresentam erros `ENOENT` ou travamentos.
  - **Solução Técnica Utilizada:** As dependências em `node_modules` foram instanciadas localmente utilizando o gerenciador `npm` para contornar limitações de execução de binários nativos via Bun em Windows.
  - **Integridade do Lockfile:** O arquivo `bun.lock` foi mantido **intacto e inalterado**. Nenhum `package-lock.json` ou lockfile não autorizado foi adicionado ao repositório Git.

### 2.3 Integração Lovable (Plataforma e Automações)
- **Commits Históricos Lovable:** `009ee30`, `dea1c4b`, `10d3ce3`, `f671eea` (adição de templates de e-mail de autenticação, webhooks e preview em `src/routes/lovable/`).
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
| **Integridade da Árvore Git Local** | **VERIFIED** | Working tree limpa, 0 arquivos modificados não autorizados. |
| **Checagem de Tipos TypeScript** | **VERIFIED** | `bun x tsc --noEmit` retorna 0 erros. |
| **Build de Produção (Client + SSR)** | **VERIFIED** | `bun run build` executa e gera artefatos em `dist/client` e `dist/server`. |
| **Proteção de Segredos (`.env`)** | **VERIFIED** | `.env` removido do rastreamento (commit `1c97acf`), `.gitignore` configurado. |
| **Checkout Seguro (`createOrder`)** | **VERIFIED** | Preço, estoque e disponibilidade validados no servidor (commit `0cb4fc2`). |
| **Remediação de Lint Alvo** | **VERIFIED** | Erros `no-empty` e `prefer-const` corrigidos no commit `d1b902a`. |
| **Suíte de Testes Automatizados** | **NOT AVAILABLE** | Não existe script de teste configurado no `package.json`. |
| **Linter Completo (ESLint / Prettier)** | **TECHNICAL DEBT** | Não passa por conta de débito diferido (93 `any`, 1630 Prettier, 6 Fast Refresh). |
| **Histórico Lovable (`email-templates`)** | **HISTORICAL/KNOWN** | Arquivos em `src/routes/lovable/` e `src/lib/email-templates/` integrados via `gpt-engineer-app[bot]`. |
| **Recuperação de `node_modules` via npm** | **HISTORICAL/KNOWN** | Realizado localmente para contornar limitações do Bun 1.3.14/Windows com `workerd`/`esbuild`. |
| **Sincronização Ativa com Lovable Web** | **NOT VERIFIED** | Não há garantia de que o ambiente web do Lovable possua os commits locais sem um push/merge explícito. |
| **Credenciais / Ref do Supabase Produção** | **NOT VERIFIED** | O `project_ref` do banco de dados remoto precisa de confirmação antes de aplicabilidade de migrations. |
| **Remoção da Policy `orders_public_insert`** | **PENDING / NOT IMPLEMENTED** | The direct public insert policy for orders remains a known security remediation proposal and has NOT been implemented or executed. |
| **Publicação / Deploy em Produção** | **PENDING** | Nenhuma ação de deploy ou merge foi executada nesta fase. |

---

## 4. Riscos de Sincronização e Recomendações

1. **Risco de Sobrescrita pelo Lovable:** Se edições forem feitas na plataforma Lovable enquanto o ramo local `security/remediate-secrets` estiver com correções de segurança não sincronizadas, um merge automático poderá reintroduzir cálculo de preço no cliente (`Cart.tsx`).
2. **Recomendação de Fluxo de Trabalho:**
   - Manter as alterações de segurança isoladas no ramo `security/remediate-secrets`.
   - Realizar Code Review rigoroso antes de mesclar na `main` ou sincronizar com o ramo do Lovable.
   - Não publicar na plataforma Lovable sem verificar se a validação server-side de pedidos está intacta.
