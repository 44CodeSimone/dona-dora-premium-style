# Plano — Dona Dora E-commerce Administrável

Adaptar o site atual (sem recriar) para virar uma loja online completa, com catálogo real vindo do banco, carrinho, checkout via WhatsApp, painel admin expandido e IA Dora consultando o catálogo.

## 1. Banco de dados (migration)

Expandir o schema atual sem quebrar dados existentes.

**Tabela `products`** (alterar):
- `stock` (int, default 0)
- `pix_price` (numeric, nullable) — preço no Pix
- `installments` (int, default 1) — nº de parcelas sem juros
- `brand` (text, nullable)
- `slug` (text, unique)
- Expandir enum `category` para incluir: `lancamentos`, `outlet`, `souvenirs`, `outros` (manter os já existentes)

**Nova tabela `brands`**: `id`, `name`, `slug`, `logo_url`, `description`, `featured`, `order_index`, `active`.
RLS: leitura pública (active=true), escrita só admin.

**Nova tabela `orders`** (pedidos via WhatsApp): `id`, `customer_name`, `customer_whatsapp`, `customer_email`, `items` (jsonb: [{product_id, name, size, color, qty, price}]), `subtotal`, `notes`, `status` ('novo'|'em_atendimento'|'concluido'|'cancelado'), `created_at`.
RLS: INSERT público (anon), SELECT/UPDATE apenas admin.

**`site_settings`** (alterar):
- Trocar default `whatsapp` para `5549991210083` e `whatsapp_display` para `(49) 99121-0083`
- Adicionar: `topbar_text`, `payment_methods` (jsonb array), `policies` (jsonb: trocas, envio, privacidade), `benefits` (jsonb: 4 cards), `facebook_url`, `tiktok_url`
- UPDATE existente para limpar 5549991540421 → 5549991210083

## 2. Painel admin (`/admin`)

Adicionar abas ao painel existente:
- **Produtos** (expandir form): stock, pix_price, installments, brand (select), slug auto, upload múltiplo já existe
- **Marcas**: CRUD com upload de logo
- **Pedidos**: lista com filtro por status, marcar como atendido
- **Configurações** (expandir): topbar, benefícios (4), formas de pagamento, políticas, redes sociais extras
- Tudo via `createServerFn` com `requireSupabaseAuth` + `assertAdmin`

## 3. Site público — adaptações

**Topbar nova** (acima da Nav): texto editável "Faça seu pedido — enviamos para todo o Brasil" + busca.

**Nav**: adicionar item "Marcas", manter Categorias/Coleção/VIP/Contato.

**Produtos.tsx** (já carrega do banco): adicionar exibição de:
- preço Pix ("R$ X no Pix")
- parcelamento ("ou Yx de R$ Z sem juros")
- badge de estoque baixo / esgotado
- botão "Adicionar ao carrinho" (além do WhatsApp direto)
- novas categorias nos filtros

**Nova seção `Marcas`**: grid de logos administráveis (componente novo, carrega de `brands`).

**Nova seção `Beneficios`** (4 cards editáveis): envio nacional, SSL, promoções, garantia.

**Carrinho** (novo):
- Context/Zustand-style hook `useCart` com persistência em `localStorage`
- Drawer lateral (Sheet shadcn) acessível pelo ícone no header
- Itens: imagem, nome, tamanho/cor, qty, subtotal
- Botão "Finalizar pedido" → modal com nome + observações → grava em `orders` + abre WhatsApp com resumo formatado

## 4. IA Dora conectada ao catálogo

Modificar `src/lib/dora.functions.ts`:
- Antes de chamar o modelo, buscar até 30 produtos ativos + marcas do banco
- Injetar como contexto no system prompt: lista resumida (nome, categoria, marca, preço, pix, estoque, tamanhos, cores)
- Reforçar regra: "Se não encontrar no catálogo, responda exatamente: 'Não encontrei essa informação no catálogo no momento, mas posso te encaminhar para o atendimento pelo WhatsApp.' e ofereça o botão"
- Botão "Continuar no WhatsApp" no `DoraFloat` apontando para `5549991210083`

## 5. Limpeza de telefones antigos

Grep no projeto por `5549991540421` e `99154-0421` → substituir por `5549991210083` / `(49) 99121-0083` em todos os componentes (Nav, Hero, Footer, GrupoVip, Contato, etc.).

## 6. Responsividade & polimento

Verificar topbar, carrinho drawer, grid de marcas e cards de benefícios em mobile.

---

## Detalhes técnicos

- **Stack**: TanStack Start + Supabase (Lovable Cloud), shadcn/ui já em uso.
- **Carrinho**: hook `useCart` em `src/hooks/use-cart.ts` com `localStorage` (sem backend até checkout).
- **Checkout WhatsApp**: server fn `createOrder` (anon insert em `orders`) retorna ID; client monta `https://wa.me/5549991210083?text=...` com resumo.
- **Slugs**: gerados no upsert (slugify do nome + sufixo curto se colisão).
- **Migrations**: 1 migration adicionando colunas, tabelas, RLS, e UPDATE para corrigir whatsapp e defaults.
- **Sem pagamento online agora**: estrutura de `orders` já suporta adicionar `payment_status`/`payment_provider` depois sem refactor.

## Fora de escopo desta entrega

- Páginas de produto individuais (`/produto/[slug]`) — fica para próxima iteração se solicitado.
- Gateway de pagamento real (Stripe/Paddle/Pix) — estrutura preparada, ativação posterior.
- Sistema de cupons.
