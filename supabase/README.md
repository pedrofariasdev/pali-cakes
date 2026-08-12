# Supabase — Pali Cakes

Esta pasta contém a configuração local e as alterações de base de dados que
devem acompanhar o código da aplicação.

## Aplicar num ambiente autorizado

1. Confirmar que o projeto ligado é o Supabase da Pali Cakes.
2. Rever a migração e criar uma cópia de segurança antes da primeira aplicação.
3. Confirmar que o registo público de utilizadores está desativado e que apenas
   as contas administrativas autorizadas existem no Auth.
4. Executar `npx supabase db push` e `npx supabase config push`.
5. Executar `npx supabase db lint --linked --level warning`.
6. Testar como visitante que apenas avaliações aprovadas são devolvidas e que a
   coluna `email` recebe uma resposta de permissão negada.
7. Testar como visitante a criação de uma encomenda e confirmar que não é
   possível consultar as tabelas de encomendas.
8. Testar como administrador a listagem e moderação das avaliações e encomendas.

## Autorização administrativa

- O acesso administrativo exige `app_metadata.role = "admin"`; não usar
  `user_metadata` para autorizações, porque o próprio utilizador pode alterá-lo.
- Depois de atribuir ou retirar esta função, terminar sessão e entrar novamente
  para o token JWT receber as claims atualizadas.
- As funções `calcular_entrega`, `criar_avaliacao` e `criar_encomenda` são
  endpoints públicos intencionais. Mantêm `SECURITY DEFINER` para disponibilizar
  apenas essas operações sem conceder acesso direto às tabelas.
- A proteção contra palavras-passe comprometidas deve ser ativada quando o
  projeto estiver num plano Supabase Pro ou superior.

As chaves, palavras-passe e tokens não devem ser guardados nesta pasta nem
adicionados ao Git.
