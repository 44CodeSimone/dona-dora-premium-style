# ROADMAP OFICIAL — DONA DORA BOUTIQUE PREMIUM PLATFORM

> **Status:** Fonte Única de Verdade do Roadmap da Plataforma Comercial  
> **Repositório:** `dona-dora-premium-style`  
> **Proprietária:** 44CODE — Simone  
> **Branch Base:** `main` (`5775e34`)  

---

## 1. CLASSIFICAÇÕES PADRONIZADAS DE STATUS

Cada recurso ou fase do roadmap é estritamente classificado sob uma das seguintes nomenclaturas:

- `VERIFIED`: Implementado, auditado e validado em repositório/banco remoto.
- `IMPLEMENTED`: Código implementado na aplicação local.
- `PARTIALLY IMPLEMENTED`: Parcialmente construído, necessitando de extensão.
- `NOT IMPLEMENTED`: Funcionalidade ausente.
- `PLANNED`: Planejado formalmente para fase futura.
- `TECHNICAL DEBT`: Débito técnico conhecido aguardando refatoração controlada.
- `BLOCKED`: Bloqueado por dependência externa ou fase anterior.

---

## 2. HIERARQUIA COMPLETA DE FASES DA PLATAFORMA

### FASE P0 — SECURITY BASELINE & DATABASE RECONCILIATION
- **Status:** `VERIFIED` / `COMPLETE`
- **Entregas:**
  - Habilitação de RLS em `public.orders` e remoção da política insegura `orders_public_insert`.
  - Migração de banco incorporada à história do Git (`7cec064`).
  - Checkout autenticado autoritativo no servidor via `createOrder` e `supabaseAdmin`.
  - Documentações de segurança auditadas (`SECURITY.md`, `AUDITORIA_DONA_DORA.md`).

---

### FASE P1 — QUALITY ENGINEERING & INFRAESTRUTURA DE TESTES

#### P1.1 — Critical Order Invariant Tests
- **Status:** `VERIFIED` / `COMPLETE` (Incorporado em `main` no commit `5775e34`).
- **Entregas:**
  - Instalação e configuração determinística do Vitest 3.
  - Sincronização do lockfile canonical `bun.lock`.
  - Extração pura da função `processOrderItems` em `src/lib/site.functions.ts`.
  - Suite de 14 testes unitários cobrindo as invariantes críticas de pedidos (`src/lib/__tests__/createOrder.test.ts`).

#### P1.2 — Authentication / Authorization / Identity Tests
- **Status:** `PLANNED`
- **Escopo:** Testes profundos com mocks de contexto para `requireSupabaseAuth`, middleware de admin (`assertAdmin`), permissões de usuário e vinculação estrita de identidade.

#### P1.3 — CI Quality Gate
- **Status:** `PLANNED`
- **Escopo:** Pipeline automatizada no GitHub Actions para execução de `vitest run`, `tsc --noEmit`, `vite build` e `eslint` em cada Pull Request.

#### P1.4 — Type-Safety / API Modernization
- **Status:** `PLANNED`
- **Escopo:** Migração das chamadas deprecadas `createServerFn().inputValidator()` para `.validator()`, eliminação de `any` explícitos e tipagem rígida das respostas do Supabase.

#### P1.5 — Controlled Lint / Formatting Debt
- **Status:** `TECHNICAL DEBT` / `PLANNED`
- **Escopo:** Resolução controlada e gradual de avisos de formatação e linter legados no repositório sem introduzir riscos de regressão.

---

### FASE P2 — COMMERCE CORE READINESS
- **Status:** `PLANNED`
- **Escopo:**
  - Máquina de estados completa para pedidos (`Pendente`, `Aguardando Pagamento`, `Pago`, `Em Separação`, `Enviado`, `Entregue`, `Cancelado`, `Reembolsado`).
  - Regras de reserva temporária de estoque durante checkout.
  - Modelo de trocas, devoluções e cancelamentos autoritativos.
  - Gestão avançada de endereços e frete teórico.

---

### FASE P3 — CRM CORE
- **Status:** `PLANNED`
- **Escopo:**
  - Modelo unificado de cliente: `Lead` -> `User` -> `Customer` -> `Buyer`.
  - Painel CRM 360 e linha do tempo de interações.
  - Tags de estilo e segmentação comportamental RFM.
  - Tarefas de acompanhamento de vendas (Follow-up) e pós-venda.
  - Gestão de consentimento e privacidade LGPD.

---

### FASE P4 — MERCADO PAGO INTEGRATION
- **Status:** `PLANNED`
- **Escopo:**
  - Provedor abstrato de pagamento (`PaymentProvider Adapter`).
  - Criação de intenções/preferências de pagamento PIX e Cartão de Crédito.
  - Processamento de Webhooks idempotentes com validação de assinatura.
  - Tratamento de falhas, estornos e reconciliação financeira.

---

### FASE P5 — MELHOR ENVIO INTEGRATION
- **Status:** `PLANNED`
- **Escopo:**
  - Provedor abstrato de logística (`LogisticsProvider Adapter`).
  - Cotação em tempo real de frete com múltiplas transportadoras.
  - Geração automática de etiquetas e pacotes de envio.
  - Atualização automática de rastreamento e status de entrega.

---

### FASE P6 — ADMIN OPERATIONS
- **Status:** `PLANNED`
- **Escopo:**
  - Painel administrativo unificado conectando Vendas, Estoque, CRM, Pagamentos e Logística.
  - Matriz RBAC para papéis operacionais (`Admin`, `Vendas`, `Atendimento`, `Estoque`, `Financeiro`).

---

### FASE P7 — CUSTOMER EXPERIENCE
- **Status:** `PLANNED`
- **Escopo:**
  - Central do Cliente aprimorada com rastreamento detalhado de pedidos em tempo real.
  - Comunicação automatizada via WhatsApp e E-mail em cada mudança de status.
  - Experiência de compra personalizada baseada no perfil do Provador Virtual.

---

### FASE P8 — MARKETING & RETENÇÃO
- **Status:** `PLANNED`
- **Escopo:**
  - Engine de cupons promocionais avançados.
  - Rastreamento de origem de aquisição (UTM/source).
  - Régua automatizada para recuperação de carrinho abandonado e campanhas de recompra.

---

### FASE P9 — ERP-READY EXPANSION FOUNDATION
- **Status:** `PLANNED`
- **Escopo:**
  - Fronteiras de domínio delimitadas para futura expansão de gestão:
    - Módulo de Fornecedores e Compras
    - Contas a Pagar e Contas a Receber
    - Fluxo de Caixa e Reconciliação Financeira
    - Emissão de Notas Fiscais (NF-e/NFC-e)
    - Estoque multi-depósito avançado

---

### FASE P10 — OBSERVABILITY, BACKUP & OPERATIONS
- **Status:** `PLANNED`
- **Escopo:**
  - Monitoramento de erros em tempo real (Sentry/LogRocket).
  - Rotinas automáticas de backup e recuperação de dados.
  - Métricas de saúde da aplicação e latência de servidor.

---

### FASE P11 — FULL END-TO-END HOMOLOGATION
- **Status:** `PLANNED`
- **Escopo:**
  - Testes integrados ponta a ponta (E2E) simulando a jornada completa da cliente: navegação -> provador -> checkout -> pagamento -> cotação de frete -> expedição -> entrega -> pós-venda.

---

### FASE P12 — PRODUCTION RELEASE READINESS
- **Status:** `PLANNED`
- **Escopo:**
  - Auditoria final de segurança pré-lançamento, validação de performance, checklist de conformidade LGPD e go-live oficial da Plataforma Comercial Dona Dora Boutique Premium.
