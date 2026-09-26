begin;

-- =====================================================================
-- 1. Descrições curtas para os produtos que ainda não tinham.
--    Só preenche onde a descrição está vazia (não apaga texto já escrito).
-- =====================================================================
update public.produtos as p
   set descricao = d.descricao
  from (
    values
      ('tarte-de-amendoa',
       'Tarte de amêndoa artesanal, disponível nos sabores tradicional e maçã.'),
      ('cheesecake-frutos-vermelhos',
       'Cheesecake cremoso com cobertura de frutos vermelhos.'),
      ('bolo-artistico-personalizado',
       'Bolo personalizado com decoração artística, criado de acordo com o tema e as cores da celebração.'),
      ('bolo-frutos-vermelhos-personalizado',
       'Bolo personalizado decorado com frutos vermelhos.'),
      ('hamburguer-dubai',
       'Hambúrguer doce ao estilo Dubai, disponível nos sabores brownie e tradicional.'),
      ('tabletes-chocolate-frutas',
       'Tabletes de chocolate artesanais com frutas.'),
      ('chocolate-crocante-framboesa',
       'Chocolate artesanal crocante com framboesa.'),
      ('brownies-artesanais',
       'Brownies artesanais nos tamanhos mini, normal e inteiro, em vários sabores.'),
      ('brigadeiros',
       'Brigadeiros artesanais em vários sabores, ideais para festas e mesas de doces.'),
      ('morango-do-amor',
       'Morangos cobertos com a tradicional calda vermelha e crocante do morango do amor.'),
      ('coxinhas-de-morango',
       'Morango envolvido em brigadeiro, disponível nos sabores Nido e brigadeiro.'),
      ('cake-pops',
       'Cake pops decorados de acordo com o tema da sua celebração.')
  ) as d(slug, descricao)
 where p.slug = d.slug
   and coalesce(trim(p.descricao), '') = '';

-- =====================================================================
-- 2. Brownies passam para Bolos e Sobremesas.
-- =====================================================================
update public.produtos
   set categoria_slug = 'bolos-e-sobremesas'
 where slug = 'brownies-artesanais';

-- =====================================================================
-- 3. Packs: retirar as descrições antigas (o conteúdo de cada pack já
--    aparece na lista "O que inclui").
-- =====================================================================
update public.produtos
   set descricao = ''
 where categoria_slug = 'packs-festa';

-- =====================================================================
-- 4. Lançamento a 27 de setembro de 2026: os cupões são gerados nas
--    primeiras 24 horas (todo o dia 27) e valem até 30 de setembro.
--    Cupões de teste gerados antes do lançamento são limpos e a
--    numeração recomeça em PALI01 — mas só se ainda não houver cupões
--    do lançamento (seguro correr esta migração mesmo já no dia 27).
-- =====================================================================
update public.definicoes_lancamento
   set lancamento_em = '2026-09-27 00:00:00+01';

do $$
begin
  if not exists (
    select 1
      from public.avaliacoes
     where cupao is not null
       and criado_em >= '2026-09-27 00:00:00+01'
  ) then
    update public.avaliacoes
       set cupao = null,
           cupao_valido_ate = null
     where cupao is not null;

    -- Encomendas de teste que usaram esses códigos deixariam o PALI01,
    -- PALI02… "já usados" para os clientes reais. O cupão sai dessas
    -- encomendas de teste (o resto da encomenda fica igual).
    update public.encomendas
       set cupao = null
     where cupao is not null
       and criado_em < '2026-09-27 00:00:00+01';

    alter sequence public.avaliacoes_cupao_seq restart with 1;
  end if;
end
$$;

commit;
