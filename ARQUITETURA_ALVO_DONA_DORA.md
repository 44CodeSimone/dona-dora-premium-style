# ARQUITETURA ALVO — DONA DORA BOUTIQUE PREMIUM

> **Status:** Especificação Arquitetural de Plataforma Comercial Modular
> **Repositório:** `dona-dora-premium-style`
> **Branch / Base:** `main` (`5775e34`)
> **Padrão:** Modular Monolith (Monólito Modular de Alta Coesão e Baixo Acoplamento)

---

## 1. VISÃO GERAL DA PLATAFORMA COMERCIAL MODULAR

O **Dona Dora Boutique Premium** foi projetado para evoluir de uma vitrine virtual para uma **Plataforma Comercial Modular de Alta Performance**, combinando E-commerce Premium, CRM (Customer Relationship Management) integrado e fundação preparada para expansão ERP (Enterprise Resource Planning).

Para suportar o crescimento sem aumentar prematuramente a complexidade operacional, a arquitetura adota o padrão **Modular Monolith**. Todos os domínios residem na mesma aplicação full-stack (TanStack Start + Node/Bun + PostgreSQL Supabase), protegidos por contratos internos rígidos e adaptadores de borda para serviços externos.

```
+-----------------------------------------------------------------------------------+
|                            CAMADA DE APRESENTAÇÃO (UI/UX)                         |
|   Vitrine E-Commerce   |   Painel Admin   |   Provador Virtual   |   Dora Assistant   |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        CAMADA DE SERVIDOR & EVENTOS (SSR)                         |
|             TanStack Start Server Functions  |  Domain Event Contracts            |
+-----------------------------------------------------------------------------------+
                                          |
     +------------------------------------+-----------------------------------+
     |                                    |                                   |
     v                                    v                                   v
+------------------------+   +------------------------+   +------------------------+
|     COMMERCE CORE      |   |        CRM CORE        |   |       IDENTITY         |
| Products | Cart | Order|   | Leads | 360 | Timeline |   | RBAC | Claims | Auth   |
+------------------------+   +------------------------+   +------------------------+
     |                                    |                                   |
     v                                    v                                   v
+------------------------+   +------------------------+   +------------------------+
|   PAYMENTS ADAPTER     |   |   LOGISTICS ADAPTER    |   |    INVENTORY CORE      |
| Payment | Status | MP  |   | Quote | Label | ME     |   | Stock | Movements      |
+------------------------+   +------------------------+   +------------------------+
     |                                    |                                   |
     +------------------------------------+-----------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     CAMADA ERP-READY (EXPANSÃO FUTURA)                            |
| Suppliers | Purchasing | Accounts Payable/Receivable | Cash Flow | Fiscal / NF    |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     BANCO DE DADOS & SEGURANÇA DE BORDA                           |
|      PostgreSQL (Supabase Cloud)  |  Row Level Security (RLS)  |  Storage     |
+-----------------------------------------------------------------------------------+
```

---

## 2. PRINCÍPIOS ARQUITETURAIS FUNDAMENTAIS

1. **Monólito Modular (Modular Monolith):**
   - Evita microserviços prematuros e a sobrecarga de rede/infraestrutura.
   - Domínios são isolados através de interfaces TypeScript e funções puras, permitindo eventual extração em serviços independentes apenas se a escala exigir.

2. **Isolamento de Provedores Externos (Sem Vendor Lock-in):**
   - Regras de negócio de pagamentos e logística **nunca** dependem diretamente das estruturas de payload da Mercado Pago ou Melhor Envio.
   - Provedores externos atuam estritamente como *adapters* que implementam contratos genéricos do domínio (`PaymentProvider`, `LogisticsProvider`).

3. **Fronteira de Confiança do Servidor:**
   - O navegador frontend é considerado **não confiável**. Preços, estoques, regras de promoção, cupons e subtotais são recalculados autoritativamente no servidor via `processOrderItems`.
   - `createOrder` opera com chave de serviço (`supabaseAdmin`) isolada no servidor, eliminando escrita direta cliente-banco.

4. **Identidade Unificada e Reconciliada:**
   - Evita duplicidade de dados mantendo uma reconciliação fluida no ciclo de vida:
     `Lead (Captura/Assistente)` -> `User (Conta Autenticada)` -> `Customer (Perfil CRM 360)` -> `Buyer (Histórico de Pedidos)`.

---

## 3. DOMÍNIOS DA PLATAFORMA

### 3.1 COMMERCE CORE
- **Escopo:** Gestão do catálogo, produtos, variantes (tamanho/cor), carrinho de compras, checkout autoritativo, máquinas de estado de pedidos, descontos e cancelamentos.
- **Status:** `PARTIALLY IMPLEMENTED` (Catálogo, checkout autenticado autoritativo e criação de pedidos com `status: "novo"` implementados; máquina de estados estendida, endereços de entrega e trocas/devoluções planejadas para P2).

### 3.2 CRM (CUSTOMER RELATIONSHIP MANAGEMENT)
- **Escopo:** Captura de leads (Dora Assistant / Provador), conversão em clientes, perfil 360°, linha do tempo de interações, tags, segmentação dinâmica, tarefas de acompanhamento, régua de relacionamento, pós-venda, recompra e gestão de consentimento LGPD.
- **Status:** `PARTIALLY IMPLEMENTED` (Captura inicial via Dora Assistant / tabela `leads` ativa; CRM 360, linha do tempo e automações planejadas para P3).

### 3.3 PAYMENTS (PAGAMENTOS ABSTRACT)
- **Escopo:** Domínio abstrato de pagamentos composto por entidades neutras (`Payment`, `PaymentStatus`, `PaymentAttempt`, `Transaction`, `Refund`, `WebhookEvent`, `IdempotencyKey`).
- **Provedor Primário:** Mercado Pago Adapter.
- **Status:** `PLANNED` (Checkout atual registra pedidos para cobrança manual/WhatsApp; integração completa Mercado Pago planejada para P4).

### 3.4 LOGISTICS (LOGÍSTICA & FULFILLMENT ABSTRACT)
- **Escopo:** Cotação de frete, pacotes, rastreamento, emissão de etiquetas, status de entrega e logística reversa.
- **Provedor Primário:** Melhor Envio Adapter.
- **Status:** `PLANNED` (Integração planejada para P5).

### 3.5 INVENTORY (ESTOQUE & MOVIMENTAÇÕES)
- **Escopo:** Controle de saldo de estoque, reservas de itens em checkout, movimentações de entrada/saída, ajustes e suporte futuro a múltiplos depósitos.
- **Status:** `PARTIALLY IMPLEMENTED` (Validação de saldo por produto ativa; reserva temporária e movimentações planejadas para P2/P9).

### 3.6 MARKETING & RETENÇÃO
- **Escopo:** Campanhas, cupons promocionais, rastreamento de origem de aquisição (UTM/source), recuperação de carrinho abandonado, segmentação por RFM (Recência, Frequência, Valor Monetário) e pós-venda.
- **Status:** `PLANNED` (Exibição de banners/preços promocionais ativa; engine de cupons e automação marketing planejados para P8).

### 3.7 IDENTITY & ACCESS (IAM & RBAC)
- **Escopo:** Autenticação via Supabase Auth + modelo de controle de acesso baseado em papéis (RBAC): `Admin`, `Sales`, `CustomerService`, `Inventory`, `Finance`, `Management`.
- **Status:** `PARTIALLY IMPLEMENTED` (Autenticação de cliente e verificação `assertAdmin` via DB ativas; matriz RBAC granulada planejada para P1.2/P6).

### 3.8 NOTIFICATIONS (NOTIFICAÇÕES MULTICANAL)
- **Escopo:** Provedor abstrato de notificações para envio transacional de e-mails (React Email / Resend), mensagens via WhatsApp API e notificações no painel.
- **Status:** `PARTIALLY IMPLEMENTED` (Templates React Email de autenticação configurados; envio transacional de pedidos e WhatsApp API planejados para P2/P7).

### 3.9 AUDIT & LGPD
- **Escopo:** Registro de consentimento (cookies/termos), trilha de auditoria para ações sensíveis, retenção de dados e direitos do titular (exportação/exclusão).
- **Status:** `PARTIALLY IMPLEMENTED` (Segurança RLS e documentação auditada; painel de privacidade LGPD planejado para P3).

### 3.10 ERP-READY FUTURE DOMAIN (EXPANSÃO FUTURA DE GESTÃO)
- **Escopo:** Limites delimitados para integração futura de módulos ERP sem reescrever a plataforma:
  - Cadastro de Fornecedores e Ordens de Compra
  - Contas a Pagar e Contas a Receber
  - Fluxo de Caixa e Reconciliação Financeira
  - Margens de Lucro e Custo da Mercadoria Vendida (CMV)
  - Emissão de Notas Fiscais (NF-e/NFC-e)
  - Relatórios Gerenciais e DRE
- **Status:** `PLANNED` (Fase P9 — Fronteiras delimitadas sem implementação prematura de código).

---

## 4. MODELO DE EVENTOS DE DOMÍNIO (DOMAIN EVENTS — TARGET ARCHITECTURE)

Para evitar o acoplamento rígido entre o Commerce Core, CRM, Pagamentos e Logística, a plataforma especifica o conceito conceitual de **Eventos de Domínio** (Target Event Model). Quando uma mudança importante no ciclo de vida ocorre, um evento é emitido, permitindo que outros módulos reajam de forma assíncrona.

### Principais Eventos do Ciclo de Vida (Alvo):

| Evento | Origem | Módulos Consumidores | Ação Desencadeada |
|---|---|---|---|
| `LeadCaptured` | Dora Assistant / Provador | CRM | Cria/atualiza perfil do Lead, inicia régua de engajamento |
| `CustomerRegistered` | Supabase Auth | CRM, Notificações | Reconcilia Lead -> User, envia e-mail de boas-vindas |
| `OrderCreated` | Commerce Core | Estoque, CRM, Pagamentos | Solicita reserva de estoque, registra ordem no CRM |
| `PaymentPending` | Pagamentos | Notificações | Envia instruções de pagamento (PIX/Cartão) |
| `PaymentApproved` | Pagamentos | Commerce, Logística, CRM | Altera status do pedido, libera solicitação de envio |
| `PaymentRejected` | Pagamentos | CRM, Estoque | Notifica cliente, libera reserva de estoque |
| `PaymentRefunded` | Pagamentos | Financeiro, Estoque | Registra estorno no CRM, analisa retorno ao estoque |
| `StockReserved` | Estoque | Commerce | Garante disponibilidade temporária durante checkout |
| `StockReleased` | Estoque | Commerce | Devolve saldo ao catálogo por tempo limite expirado |
| `ShipmentCreated` | Logística | Notificações | Gera código de rastreamento e prepara etiqueta |
| `ShipmentDispatched` | Logística | CRM, Notificações | Notifica cliente com link de rastreio |
| `OrderDelivered` | Logística | CRM, Marketing | Inicia régua de pós-venda e solicitação de avaliação |
| `CustomerFollowUpRequired`| CRM | Admin / Vendas | Cria tarefa no painel para contato humano |

---

## 5. MATRIZ DE ESTADO ATUAL vs. ESTADO ALVO

| Domínio | Estado Atual | Estado Alvo | Prioridade |
|---|---|---|---|
| **Commerce Core** | Pedidos criados no servidor via `createOrder` (`status: "novo"`) | Máquina de estados completa (Novo -> Pago -> Em Preparação -> Enviado -> Entregue -> Cancelado) | **P2** |
| **CRM** | Captura inicial de leads via assistente na tabela `leads` | CRM 360 unificado, linha do tempo de contatos, segmentação e acompanhamento de vendas | **P3** |
| **Pagamentos** | Registro de intenção de compra sem gateway automatizado | Mercado Pago Adapter isolado com webhooks idempotentes e reconciliação | **P4** |
| **Logística** | Sem cotação ou emissão de etiquetas integradas | Melhor Envio Adapter com cotação automática, etiquetas e rastreamento | **P5** |
| **Estoque** | Validação simples de quantidade disponível no banco | Controle de movimentação, reserva em tempo real e suporte a depósitos | **P2 / P9** |
| **Marketing** | Cupons estáticos e banners na vitrine | Engine de campanhas, cupons dinâmicos, rastreio de UTM e recuperação de carrinho | **P8** |
| **Identity & IAM** | Autenticação cliente + role `admin` básica no banco | Matriz RBAC completa para múltiplos papéis operacionais | **P1.2 / P6** |
| **Notificações** | Templates React Email de autenticação configurados | Disparos transacionais automáticos por e-mail e integração WhatsApp | **P2 / P7** |
| **ERP Readiness** | Nenhuma conexão financeira/fiscal | Fronteiras de domínio definidas para fornecedores, NFe e contas a pagar/receber | **P9** |
