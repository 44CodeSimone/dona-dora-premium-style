# Plano de ajustes — DONA DORA

Vou ajustar o site atual (sem recriar) em 3 frentes: **visual**, **chat IA Dora** e **backend/admin**.

## 1. Identidade visual (preto / branco / dourado)
- Atualizar `src/styles.css`: remover tons rosa/nude/bege da paleta principal. Manter apenas preto profundo, off-white, branco puro e dourado discreto como único acento.
- Remover `--rose`, `--nude` e gradientes coloridos (`gradient-rose`, `gradient-nexa`) das seções. Manter dourado sutil.
- Inserir o **logo oficial** (já em `src/assets/logo-dona-dora.png`) no Hero como marca central, além do Nav e Footer.
- Refinar cards de categoria, depoimentos e seção "Sobre" para visual mais clean (bordas finas, mais respiro, sem fundos coloridos).

## 2. Renomear Nexa → Dora
- Renomear arquivo `Nexa.tsx` → `Dora.tsx`, componente `<Nexa />` → `<Dora />`.
- Atualizar todos os textos, links âncora (`#nexa` → `#dora`), menu, footer, SEO e o asset `nexa-glow.jpg` (manter arquivo, renomear referência conceitual).
- Remover botão "Falar com a Nexa" do Hero — manter só "Falar no WhatsApp".

## 3. Bloco "Desde / Urubici SC"
- Remover o bloco atual e substituir por uma seção premium "Por que Dona Dora" com 4 pilares: *Moda feminina e masculina · Atendimento próximo · Curadoria de peças · WhatsApp da loja*.

## 4. Chat flutuante da Dora (IA real)
- Remover `WhatsappFloat.tsx`. Criar `DoraFloat.tsx` (botão dourado/preto elegante "Falar com a Dora") que abre um **chat drawer** no canto da tela.
- Chat usa **AI SDK + Lovable AI Gateway** (modelo `google/gemini-3-flash-preview`) via server route `src/routes/api/dora.ts`.
- System prompt: consultora de moda, educada, persuasiva sem insistir, especialista em moda feminina/masculina/acessórios/presentes. Recomenda produtos do catálogo (passados como contexto).
- Coleta natural: nome, WhatsApp, interesse, produto, faixa de preço, tamanho, estilo, mensagem.
- Botão fixo no chat: **"Continuar no WhatsApp"** → abre `wa.me/5549991540421` com resumo da conversa.

## 5. Backend (requer **Lovable Cloud**)
Vou ativar o Lovable Cloud para suportar:
- **Tabelas**: `products` (catálogo), `leads` (capturas da Dora), `conversations` + `messages` (histórico para aprendizado/LGPD), `site_settings` (textos, banners, WhatsApp, e-mail destino, cores, mensagens da Dora, SEO).
- **Autenticação**: login admin (e-mail/senha) com tabela `user_roles` (enum `admin`) + função `has_role` (padrão seguro).
- **Envio de e-mail dos leads** para `donadoraecommerce@gmail.com`: server route que envia via **Resend** (vou pedir a `RESEND_API_KEY` depois que o Cloud estiver ativo) com todos os campos + data/hora + origem "Chat Dora no site".
- RLS: leitura pública de `products` e `site_settings`; escrita só para admins; `leads`/`conversations` só admins leem, inserção pública controlada via server route.

## 6. Painel Admin (`/admin`)
Rotas protegidas (`_authenticated` + checagem de role admin):
- `/admin/produtos` — CRUD de produtos (nome, categoria, preço, fotos, destaque, promoção)
- `/admin/leads` — lista de leads capturados pela Dora, com filtros e exportação
- `/admin/conversas` — histórico de conversas da Dora
- `/admin/configuracoes` — textos do site, banner do hero, logo, cores (dourado), WhatsApp, e-mail destino, system prompt da Dora, categorias, destaques, SEO (title/description/OG)
- `/admin/login` — login

Frontend público lê de `site_settings` e `products` para renderizar textos/produtos editáveis.

## 7. Responsividade
Revisar Hero, Categorias, Dora chat, Footer e painel admin em mobile (677px), tablet e desktop. Garantir que botão flutuante, chat drawer e formulários não cortem em telas pequenas.

## Detalhes técnicos
- Storage: upload de imagens de produtos/banners para bucket Supabase `public-assets`.
- AI: streaming via `toUIMessageStreamResponse`, render com `message.parts`.
- Leads: persistir no DB **e** disparar e-mail (não-bloqueante; falha de e-mail não derruba captura).
- LGPD: aviso curto no início do chat ("ao continuar você concorda com o uso dos dados para atendimento"), opção de excluir conversa via admin.
- Sem alterar nome da marca, sem recriar do zero.

## Ordem de execução
1. Ativar Lovable Cloud + criar tabelas/RLS/auth
2. Ajustes visuais (paleta, logo, remoção rosa/nude, bloco "Desde")
3. Renomear Nexa → Dora em todo o código
4. Server route + chat drawer da Dora
5. Painel admin (login → produtos → leads → configurações)
6. Conectar frontend público às `site_settings` / `products`
7. Integração Resend para e-mail dos leads (pedirei a chave após Cloud ativo)
8. QA responsivo

Confirma para eu iniciar pelo passo 1 (ativar Cloud)?
