# Plano — DONA DORA: Painel Admin Real + Refinos

Não recriar do zero. Aproveitar o que já existe (tabelas `products`, `leads`, `site_settings`, `user_roles`, `profiles`, função `has_role`) e estender.

## 1. Banco de dados (migração única)

**Estender `site_settings`** com colunas para tudo que será administrável:
- `logo_url`, `brand_name`, `primary_color`, `accent_color`, `bg_color`
- `hero_image_url`, `hero_cta_text`, `hero_cta_link`
- `instagram_url`, `instagram_handle`
- `address`, `hours_weekday`, `hours_saturday`
- `vip_title`, `vip_subtitle`, `vip_benefits` (jsonb array), `vip_link`, `vip_image_url`
- `seo_keywords`, `seo_og_image`
- `dora_welcome_message`

**Estender `products`** com:
- `promo_price` (numeric), `sizes` (text[]), `colors` (text[]), `images` (text[]), `available` (bool), `alt_text` (text)
- Atualizar enum/check de `category` para aceitar: feminina, masculina, acessorios, joias, oculos, bones, presentes, promocoes

**Estender `leads`** com:
- `email`, `last_message`, ajustes em campos existentes

**Storage bucket** `dona-dora` (público, leitura pública, write apenas admin) para uploads de logo/banners/produtos.

**Criar usuário admin** via SQL: `donadoraecommerce@gmail.com` / `1981@ju2512`, inserir em `auth.users` com `crypt()` + `email_confirmed_at`, criar profile e `user_roles` com role `admin`.

**RLS**: produtos públicos já leem ativos; admin escreve via `has_role`. Leads: insert público (anônimo cria lead via chat Dora), select/update só admin. Site_settings: select público, update só admin.

## 2. Autenticação

- Página `/login` — email + senha (Supabase auth). Após login, redireciona para `/admin`.
- Listener `onAuthStateChange` no root para invalidar cache.
- Rota `_admin` (pathless layout) com `beforeLoad`: verifica sessão + role `admin` via server fn; senão redireciona para `/login`.

## 3. Painel `/admin`

Layout sidebar com seções:

1. **Dashboard** — contagem de produtos, leads não lidos, últimos leads.
2. **Identidade** — formulário que edita `site_settings`: logo (upload), nome, cores (color picker), hero, contatos, endereço, horários, e-mail leads.
3. **Produtos** — tabela + modal:
   - Listar com filtros (categoria, ativo, destaque, promo)
   - Criar/editar: nome, descrição, preço, preço promo, categoria (select com as 8 categorias), tamanhos (tags), cores (tags), múltiplas imagens (upload + URL), destaque, promoção, ativo, alt text
   - Excluir / ativar-desativar
4. **Grupo VIP** — edita campos `vip_*` do `site_settings`, incluindo upload de imagem e benefícios (lista editável).
5. **Leads** — tabela com todos os campos + data; marcar como lido; exportar CSV; ver mensagem completa.
6. **SEO** — edita `seo_title`, `seo_description`, `seo_keywords`, `seo_og_image`.
7. **Dora IA** — edita `dora_system_prompt` e `dora_welcome_message`.

Toda mutação usa `createServerFn` com `requireSupabaseAuth` + checagem `has_role('admin')`.

## 4. Site público — refatoração

**Renomear Nexa → Dora** em todo lugar.

**Remover**: seção "Desde/Urubici/Curadoria/Atendimento/Estilo" (Sobre atual) + WhatsApp float atual + botão "Falar com a Nexa".

**Criar**:
- Nova seção premium "Diferenciais" com 4 cards: Moda feminina e masculina · Curadoria de peças · Atendimento próximo · Grupo VIP Dona Dora.
- Seção **Grupo VIP** com banner, benefícios e CTA para o link do grupo (vem do `site_settings`).
- **Botão flutuante "Falar com a Dora"** — abre drawer/dialog com chat real:
  - Mensagens trocadas com Dora via server fn → AI Gateway (`google/gemini-2.5-flash`) usando `dora_system_prompt` do `site_settings`
  - Coleta: nome, WhatsApp, interesse, produto, tamanho, faixa de preço, mensagem (formulário inline + extração da conversa)
  - Salva `conversation` + `messages` + cria `lead` no banco
  - Ao final mostra botão "Continuar no WhatsApp" → wa.me/5549991540421 com mensagem pré-preenchida

**Produtos no site público** — buscar de `products` (ativos) via server fn pública, não mais hardcoded. Filtrar por destaque na home; categorias ligam para `/categoria/$slug`.

**Paleta**: ajustar `styles.css` para preto + branco + dourado discreto. Remover bege/rosa/marrom.

**Dados dinâmicos**: todos os componentes (`Hero`, `Footer`, `Contato`, `Categorias`, `Produtos`, `GrupoVip`, `Dora`) consomem `site_settings` + `products` via loader/server fn pública.

## 5. Envio de leads por e-mail

Estrutura pronta: server fn `notifyLead` que será chamada após inserir lead. Implementação real exige configurar domínio de e-mail (Lovable Emails) — vou deixar o gancho funcionando salvando 100% no admin e marcar como TODO o envio efetivo após o domínio estar configurado. Aviso ao final.

## 6. Responsividade & QA

Revisar Hero, sidebar admin, tabelas (scroll horizontal mobile), drawer Dora, grids de produto em mobile/tablet/desktop.

## Detalhes técnicos

- **Server fns** em `src/lib/*.functions.ts`: `admin.functions.ts` (CRUD produtos, settings, leads), `public.functions.ts` (getSettings, getProducts), `dora.functions.ts` (chat streaming + criar lead).
- **Upload de imagem**: server fn que recebe base64/file, valida MIME (jpg/png/webp), envia para Storage bucket `dona-dora` e retorna URL pública.
- **Validação**: Zod em todas as server fns.
- **UI admin**: shadcn (Table, Dialog, Form, Tabs, Card, Switch, Input, Textarea, Select).
- **Chat Dora**: AI Gateway streaming via `async function*` no server fn (sem Edge Function).

## Ordem de execução

1. Migração (schema + bucket + admin user) — pedir aprovação
2. Server fns (admin + public + dora)
3. Auth (login + guard `_admin`)
4. Páginas admin (dashboard, identidade, produtos, VIP, leads, SEO, Dora)
5. Refator site público (paleta, Dora, GrupoVip, Diferenciais, dados dinâmicos)
6. Float "Falar com a Dora" + chat
7. QA responsivo

Pronto para começar? Após aprovação, rodo a migração primeiro (vai pedir sua confirmação separada) e em seguida implemento tudo.
