begin;

-- =====================================================================
-- Conteúdo de cada pack (opcoes.conteudo): uma linha por item, no formato
-- "Item — quantidade". É mostrado na página de cada pack e na FAQ, e pode
-- ser editado no admin (campo "Conteúdo do pack").
-- =====================================================================

update public.produtos as p
   set opcoes = coalesce(p.opcoes, '{}'::jsonb) || jsonb_build_object('conteudo', c.conteudo)
  from (
    values
      ('pack-aniversario', '[
        "Bolo — 1 kg",
        "Brigadeiros — 6 unidades",
        "Cupcakes — 6 unidades",
        "Cakesicles / Cakepops — 6 unidades"
      ]'::jsonb),
      ('pack-festa-infantil', '[
        "Bolo — 2 kg",
        "Brigadeiros — 15 unidades",
        "Mini brownies — 15 unidades",
        "Cupcakes — 10 unidades",
        "Cakepops — 5 unidades",
        "Cakesicles — 5 unidades"
      ]'::jsonb),
      ('pack-mini-celebracao', '[
        "Bolo — 3 kg",
        "Brigadeiros — 20 unidades",
        "Mini brownies — 20 unidades",
        "Cupcakes — 15 unidades",
        "Cakesicles — 7 unidades"
      ]'::jsonb),
      ('pack-festa-premium', '[
        "Bolo — 4 kg",
        "Brigadeiros — 25 unidades",
        "Mini brownies — 25 unidades",
        "Cupcakes — 20 unidades",
        "Cakesicles — 10 unidades"
      ]'::jsonb),
      ('pack-50-pessoas', '[
        "Bolo — 5 kg",
        "Brigadeiros — 30 unidades",
        "Mini brownies — 30 unidades",
        "Cupcakes — 25 unidades",
        "Cakesicles — 12 unidades"
      ]'::jsonb)
  ) as c(slug, conteudo)
 where p.slug = c.slug;

commit;
