begin;

-- Renomeia os packs existentes para refletirem o número de pessoas
update public.produtos set nome = 'Pack 10 Pessoas' where slug = 'pack-aniversario';
update public.produtos set nome = 'Pack 20 Pessoas' where slug = 'pack-festa-infantil';
update public.produtos set nome = 'Pack 30 Pessoas' where slug = 'pack-mini-celebracao';
update public.produtos set nome = 'Pack 40 Pessoas' where slug = 'pack-festa-premium';

-- Cria o 5º pack (50 pessoas). Imagem reutiliza a do Pack 40 como placeholder:
-- troque a foto e a descrição em /admin/produtos assim que tiver o conteúdo definitivo.
insert into public.produtos (
  slug, nome, descricao, categoria_slug, imagem_url, imagens,
  preco, preco_label, destaque, ativo, ordem, opcoes
)
select
  'pack-50-pessoas',
  'Pack 50 Pessoas',
  'Uma seleção completa de bolo, doces e detalhes personalizados para uma celebração ainda maior.',
  'packs-festa',
  '/images/products/pack-festa-premium.png',
  '[]'::jsonb,
  0.00,
  'Sob consulta',
  true,
  true,
  5,
  '{}'::jsonb
where not exists (
  select 1 from public.produtos where slug = 'pack-50-pessoas'
);

notify pgrst, 'reload schema';

commit;
