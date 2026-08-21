# Dona Dora — proposta de remediação do banco

> Documento de execução controlada. Não aplicar automaticamente em produção.

## Objetivo

O checkout agora grava pedidos por meio da função server-side, que reconsulta o catálogo e calcula o subtotal. A política atual `orders_public_insert` ainda permite que qualquer cliente anônimo ou autenticado insira linhas diretamente em `public.orders`, contornando essa validação.

## Mudança proposta

Depois de confirmar o projeto Supabase correto, fazer backup/validação e revisar os fluxos administrativos, aplicar uma nova migration (sem alterar migrations já aplicadas):

```sql
drop policy if exists orders_public_insert on public.orders;

-- A função createOrder usa a chave server-side e continua funcionando.
-- Não reabrir INSERT direto para anon/authenticated.
```

Se algum fluxo legítimo precisar criar pedido diretamente pelo cliente, ele deve ser substituído por uma função server-side equivalente antes de remover a política. A migration deve ser criada pelo Supabase CLI no ambiente correto e revisada antes de execução.

## Validações obrigatórias antes de aplicar

1. Confirmar o `project_ref` do ambiente de produção; o ref encontrado no arquivo local não foi assumido como válido.
2. Verificar se há integrações externas que inserem pedidos diretamente.
3. Testar checkout autenticado, painel administrativo e notificações em staging.
4. Monitorar falhas de inserção após a mudança.
5. Nunca colocar `service_role` no navegador nem em variáveis públicas.

