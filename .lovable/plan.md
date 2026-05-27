# Plano — Dona Dora: Correções + Evolução

Escopo grande, dividido em 6 blocos. Sem recriar — apenas corrigir e adicionar.

## Bloco 1 — Efeitos visuais premium

- **Marquee** abaixo da hero: restaurar `Marquee.tsx` já existente (componente está no projeto) e plugar em `index.tsx` se foi removido. Textos: "Nova Coleção · Frete para todo o Brasil · Boutique Premium · Urubici/SC".
- **Header inteligente** (`Nav.tsx`): transparente no topo, `backdrop-blur` + bg semi-opaco após `scrollY > 40`.
- **Cards de produto** (`Produtos.tsx`): hover com `scale-105` na imagem, sombra suave, overlay "Ver peça" com fade.
- **Microanimações scroll**: hook `useInView` (IntersectionObserver) + classes `fade-in-up` em `styles.css`. Aplicar nas seções principais.
- **Shimmer sutil** nas bordas dos cards: utility CSS `.shimmer-border`.
- **Transições de página**: `view-transition` API + fallback CSS.
- **Ripple** nos botões: utility class adicionada ao `Button` variant.
- Cursor padrão mantido.

## Bloco 2 — Painel admin

Login já existe (`/login`) + admin protegido. Auditar e corrigir:

- Garantir que `/admin` checa `has_role(uid, 'admin')` via `checkIsAdmin` server fn e redireciona corretamente.
- **Esqueci minha senha** em `/login` (modal + `resetPasswordForEmail`).
- Criar rota `/reset-password` pública para concluir a redefinição.
- **Nova aba Dashboard**: cards com contagem (produtos ativos, pedidos novos, leads não lidas, conversas abertas). Server fn `getAdminStats`.
- **Produtos**: já existe — adicionar campo `allow_virtual_try_on` no form.
- **Marcas, Pedidos, Leads, Settings**: já existem. Verificar bugs e completar campos faltantes (topbar_text, benefits, payment_methods, policies, redes extras).
- **Provador Virtual** (nova aba): toggle global on/off (em `site_settings.virtual_tryon_enabled`) + stats (`virtual_try_on_sessions` count).

## Bloco 3 — E-commerce

- `Produtos.tsx`: já carrega do banco. Verificar filtros (Todos/Fem/Masc/Acc/Joias/Outlet/Promo), toggle destaques, busca, skeleton, empty state — todos já presentes; corrigir o que estiver bugado.
- **Carrinho** (`use-cart.ts` + `Cart.tsx`): tamanho/cor obrigatórios quando produto tiver; validar antes de adicionar. Drawer já existe.
- **Checkout WhatsApp**: server fn `createOrder` (anon insert) + abre `wa.me/5549991210083` com resumo formatado.
- **Área do cliente `/minha-conta`** (nova):
  - Layout com abas: Pedidos, Favoritos, Perfil.
  - Tabela nova `wishlist` (user_id, product_id).
  - Tabela nova `customer_profiles` (user_id, name, phone, address jsonb).
  - Cliente NUNCA acessa `/admin` (role check já existe).
  - Botão "Entrar / Minha conta" no Nav.

## Bloco 4 — Dora com catálogo real

Já implementado em `dora.functions.ts` (`buildCatalogContext`). Ajustar:
- Garantir frase exata de fallback.
- Botão "Continuar no WhatsApp" no `DoraFloat` (já existe — validar telefone `5549991210083`).
- Botão "Comprar agora" inline quando Dora sugerir produto específico (renderiza link `?add=<slug>` que abre carrinho).

## Bloco 5 — Provador Virtual

**Banco** (migration):
- `products.allow_virtual_try_on` boolean default false
- `site_settings.virtual_tryon_enabled` boolean default true
- Tabela `virtual_try_on_consents` (user_id, product_id, selected_size, selected_color, consent_text, accepted_at)
- Tabela `virtual_try_on_sessions` (user_id, product_id, selected_size, selected_color, original_image_url, generated_image_url, consent_accepted, status, expires_at, deleted_at)
- Bucket privado `virtual-tryon` + RLS: usuário só lê/escreve `<uid>/...`
- RLS tabelas: usuário só lê/escreve suas próprias sessões; admin pode contar (sem ver URLs)

**UI**: nova aba no `DoraFloat` ("Provador Virtual"):
- Se deslogado: CTA Entrar/Criar conta
- Logado: seleção de produto (lista de `allow_virtual_try_on=true`), cor, tamanho, checkbox consentimento, upload foto
- Server fn `createTryOnSession`: valida consentimento, faz upload privado, monta JSON técnico, chama AI Gateway `google/gemini-3.1-flash-image-preview` com prompt de preservação, salva URL assinada
- Resultado exibido só pra ela; botões Comprar/Outra cor/Outra peça

## Bloco 6 — Responsividade

- Menu mobile hambúrguer (`Sheet` shadcn) com animação suave
- Carrinho mobile full width
- Filtros produtos: `Collapsible` em `<md`
- DoraFloat: bottom-right, drawer não cobre footer essencial
- Provador Virtual mobile-first
- Touch targets ≥44px

---

## Ordem de execução

1. Migration (tabelas/colunas/bucket novos)
2. Bloco 1 (efeitos visuais — rápido, mais impacto)
3. Bloco 2 (admin: reset-password, dashboard, aba try-on)
4. Bloco 3 (área do cliente nova)
5. Bloco 5 (provador virtual completo)
6. Bloco 4 ajustes finais Dora
7. Bloco 6 QA responsivo

## Fora de escopo (confirmar se quer)

- Página individual de produto `/produto/[slug]`
- Pagamento online (Stripe/Pix) — `orders` já preparada
- E-mail transacional de pedido (precisa configurar domínio)

**Custos do Provador Virtual**: cada geração consome créditos da Lovable AI (Gemini image preview ~$0.02-0.04/imagem). Ok prosseguir?
