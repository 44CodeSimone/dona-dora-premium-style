# ARQUITETURA DO DOMÍNIO CRM — DONA DORA BOUTIQUE PREMIUM

> **Status:** Especificação de Arquitetura de CRM Integrado
> **Repositório:** `dona-dora-premium-style`
> **Proprietária:** 44CODE — Simone
> **Escopo:** Gestão do Ciclo de Vida do Cliente, Unificação de Identidades e Inteligência de Vendas

---

## 1. VISÃO GERAL DO CRM

O domínio de **CRM (Customer Relationship Management)** do Dona Dora Boutique Premium foi projetado para transformar visitantes casuais e interações com assistentes virtuais em clientes recorrentes e de alto valor (LTV — Lifetime Value).

Ao contrário de sistemas tradicionais que separam o e-commerce do CRM, o Dona Dora adota um **modelo nativamente integrado**, onde cada interação na vitrine, no provador virtual ou no chat com a Dora alimenta em tempo real o perfil do cliente.

---

## 2. RECONCILIAÇÃO DE IDENTIDADE E CICLO DE VIDA DO CLIENTE

Para evitar duplicidade de registros (ex.: um lead cadastrado pelo chat e depois criando uma conta com e-mail diferente), a plataforma adota o modelo de **Identidade Reconciliada**:

```
+------------------+         +------------------+         +------------------+         +------------------+
|       LEAD       |  ---->  |       USER       |  ---->  |     CUSTOMER     |  ---->  |      BUYER       |
| Captura inicial  |         | Conta criada no  |         | Perfil completo  |         | Pedido realizado |
| Chat / Provador  |         | Supabase Auth    |         | no CRM 360       |         | & pago           |
+------------------+         +------------------+         +------------------+         +------------------+
```

### Fases do Ciclo de Vida:
1. **Lead (`PARTIALLY IMPLEMENTED`):**
   - Capturado via Dora Assistant ou Provador Virtual. Registra nome, WhatsApp, preferências estilísticas e intenção de compra.
2. **User (`VERIFIED`):**
   - Conta criada via Supabase Auth. Possui `user_id` (UUID), e-mail autenticado e credenciais salvas com segurança.
3. **Customer (`PLANNED — P3`):**
   - Registro unificado no CRM 360 associado ao `user_id`. Consolida dados pessoais, preferências, endereço e histórico de interações.
4. **Buyer (`VERIFIED`):**
   - Cliente que concluiu pelo menos um pedido autorizado e pago. Registra histórico financeiro, ticket médio e recência.

---

## 3. COMPONENTES ARQUITETURAIS DO CRM 360

### 3.1 Perfil 360° do Cliente (`Customer 360`)
Consolida em uma visão única no painel administrativo:
- Dados cadastrais (Nome, WhatsApp, E-mail, CPF, Aniversário).
- Medidas e preferências do Provador Virtual (tamanhos de preferência, paletas de cor, estilo).
- Métricas de consumo: Ticket Médio, LTV (Lifetime Value), Total de Pedidos, Maior Compra.
- Status do Relacionamento (`Novo`, `Ativo`, `VIP`, `Em Risco`, `Inativo`).

### 3.2 Linha do Tempo de Interações (`Timeline`)
Histórico cronológico de todos os pontos de contato:
- Captura inicial de lead pelo chat.
- Sessões no provador virtual.
- Trocas de mensagens e registros de atendimento humano.
- Alterações no status de pedidos.
- E-mails transacionais abertos ou clicados.

### 3.3 Segmentação Dinâmica e Tags (`Tags & Segmentation`)
Classificação automática e manual de clientes baseada em comportamento:
- **Tags de Estilo:** `Gosta de Dourado`, `Prefere Moda Festa`, `Tamanho P`.
- **Segmentos RFM:**
  - `VIP High-LTV`: Clientes com mais de 3 compras no ano.
  - `Carrinho Abandonado`: Clientes com intensão de compra não finalizada nas últimas 24h.
  - `Recompra Pendente`: Clientes sem compras há mais de 60 dias.

### 3.4 Tarefas e Acompanhamento de Vendas (`Follow-up & Tasks`)
- Alertas para a equipe de vendas entrar em contato via WhatsApp no aniversário do cliente ou em datas comemorativas.
- Tarefas de pós-venda 7 dias após a entrega do pedido para avaliar satisfação.

### 3.5 Consentimento e LGPD (`Consent & Privacy`)
- Registro estrito de aceite dos termos de privacidade e preferências de comunicação (Opt-in / Opt-out para WhatsApp e E-mail).
- Suporte a solicitações de exclusão ou exportação de dados conforme a LGPD.

---

## 4. EVENTOS INTEGRADOS DO CRM

O CRM consome eventos de domínio emitidos por outros módulos da plataforma:

```ts
// Exemplo de payload conceitual do evento LeadCaptured
export interface LeadCapturedEvent {
  event_id: string;
  timestamp: string;
  source: "dora_assistant" | "virtual_tryon" | "landing_page";
  contact: {
    name: string;
    whatsapp: string;
    email?: string;
  };
  metadata: {
    preferred_category?: string;
    preferred_size?: string;
    intent_notes?: string;
  };
}
```

---

## 5. REQUISITOS DE BANCO DE DADOS (MODELAGEM CONCEITUAL CRM)

As tabelas do CRM serão implementadas na Fase P3, vinculadas via chave estrangeira ao Supabase Auth:

- `public.crm_customers`: Tabela principal do perfil 360 (relacionada 1:1 com `auth.users` via `user_id`).
- `public.crm_timeline`: Eventos e interações registradas cronologicamente (`customer_id`, `event_type`, `description`, `created_at`).
- `public.crm_tags`: Catálogo de tags e vinculo `crm_customer_tags`.
- `public.crm_tasks`: Tarefas operacionais de vendas e pós-venda (`customer_id`, `assigned_to`, `due_date`, `status`).
