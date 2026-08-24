# DONA DORA BOUTIQUE PREMIUM — FASE 2: QUALITY ENGINEERING PLAN

**Repositório:** `dona-dora-premium-style`  
**Proprietária:** 44CODE — Simone  
**Status Baseline:** Safe Baseline Protected (`main = db21148`)  
**Branch Atual:** `quality/p1-order-tests`  
**Status P1.1:** IMPLEMENTADO E AUDITADO — PRONTO PARA COMMIT LOCAL  

---

## 1. RESUMO DA FASE P1.1 — INFRAESTRUTURA DE TESTES E INVARIANTES DE PEDIDOS

Nesta etapa, estabelecemos a fundação de testes unitários automatizados no ecossistema TanStack Start + Vitest 3, sem introduzir regressões ou alterar regras de negócio preexistentes.

### Conquistas Principais:
1. **Configuração Determinística de Testes (Vitest 3):**
   - Script `"test": "vitest run"` adicionado em `package.json`.
   - Inclusão da dependência `"vitest": "^3.0.7"` em `devDependencies`.
   - **`bun.lock` sincronizado:** Arquivo canonical atualizado e validado (`bun install --ignore-scripts`).
2. **Refatoração Pura para Testabilidade:**
   - Extração da função pura `processOrderItems` em `src/lib/site.functions.ts` preservando o handler `createOrder`, validações do Zod (`orderItemSchema`, `orderSchema`) e o middleware de autenticação Supabase (`requireSupabaseAuth`).
3. **Suite Completa de Invariantes Críticas:**
   - Criação de `src/lib/__tests__/createOrder.test.ts` cobrindo diretamente as 14 invariantes críticas de checkout e pedidos.

---

## 2. MATRIZ DE INVARIANTES COBERTAS (14/14 TESTES DIRETOS APROVADOS)

| ID | Invariante de Negócio | Tipo de Teste | Força | Status |
|---|---|---|---|---|
| **INV-01** | Cliente não pode estipular preço no payload público | Direto (`processOrderItems`) | **STRONG** | PASS |
| **INV-02** | Preço autoritativo do catálogo é aplicado para produtos normais | Direto (`processOrderItems`) | **STRONG** | PASS |
| **INV-03** | Preço promocional aplicado apenas se `promo = true` e `promo_price` válido | Direto (`processOrderItems`) | **STRONG** | PASS |
| **INV-04** | Produtos inexistentes no banco são rejeitados com erro legível | Direto (`processOrderItems`) | **STRONG** | PASS |
| **INV-05** | Produtos com `available = false` são rejeitados | Direto (`processOrderItems`) | **STRONG** | PASS |
| **INV-06** | Quantidade inválida (`qty <= 0`, decimal ou > 99) é rejeitada | Direto (`orderItemSchema`) | **STRONG** | PASS |
| **INV-07** | Pedidos com quantidade superior ao estoque em catálogo são bloqueados | Direto (`processOrderItems`) | **STRONG** | PASS |
| **INV-08** | Seleção de tamanho indisponível no produto é rejeitada | Direto (`processOrderItems`) | **STRONG** | PASS |
| **INV-09** | Seleção de cor indisponível no produto é rejeitada | Direto (`processOrderItems`) | **STRONG** | PASS |
| **INV-10** | Subtotal de item único é calculado de forma exata e arredondada | Direto (`processOrderItems`) | **STRONG** | PASS |
| **INV-11** | Subtotal de múltiplos itens com/sem promoção é calculado corretamente | Direto (`processOrderItems`) | **STRONG** | PASS |
| **INV-12** | Criação de pedidos não autenticados é rejeitada no limite de autenticação | Direto (Middleware / Claims) | **STRONG** | PASS |
| **INV-13** | E-mail do comprador vinculado estritamente às claims JWT autenticadas | Direto (`orderSchema` + Claims) | **STRONG** | PASS |
| **INV-14** | Subtotais e preços enviados no payload pelo cliente são descartados e ignorados | Direto (`orderSchema` + `processOrderItems`) | **STRONG** | PASS |

---

## 3. STATUS DA PIPELINE DE VERIFICAÇÃO

- **Vitest Suite:** 14/14 testes aprovados (`✓ 14 passed`).
- **TypeScript Compiler (`bun x tsc --noEmit`):** 0 erros.
- **Production Build (`bun run build`):** Sucesso (`✓ built in 20.48s`, presets `.output/server` e `.output/public`).
- **Verificação de Diff (`git diff --check`):** Clean (sem trailing whitespace).
- **ESLint nos arquivos P1.1:** Clean (zero erros nos testes criados).
- **Canonical Lockfile (`bun.lock`):** Sincronizado e reproduzível.

---

## 4. PRÓXIMAS FASES (PLANEJADAS — AINDA NÃO INICIADAS)

- **P1.2 — Invariantes Admin e Gestão de Sessão:** FUTURO (Pendente).
- **P1.3 — Invariantes de IA e Provador Virtual / Dora Assistant:** FUTURO (Pendente).
- **P1.4 — Invariantes de Checkout e Carrinho:** FUTURO (Pendente).
- **P1.5 — Invariantes de Resiliência de Rede e Supabase:** FUTURO (Pendente).

---

> [!NOTE]
> Nenhum commit ou push foi realizado nesta etapa. As alterações permanecem locais no branch `quality/p1-order-tests` aguardando aprovação explícita para commit.
