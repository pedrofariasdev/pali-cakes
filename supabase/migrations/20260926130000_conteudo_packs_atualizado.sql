begin;

-- Atualização do conteúdo dos packs de 30, 40 e 50 pessoas.
update public.produtos as p
   set opcoes = coalesce(p.opcoes, '{}'::jsonb) || jsonb_build_object('conteudo', c.conteudo)
  from (
    values
      ('pack-mini-celebracao', '[
        "Bolo — 3 kg",
        "Brigadeiros — 20 unidades",
        "Mini brownies — 20 unidades",
        "Cupcakes — 15 unidades",
        "Cakepops — 7 unidades",
        "Cakesicles — 8 unidades"
      ]'::jsonb),
      ('pack-festa-premium', '[
        "Bolo — 4 kg",
        "Brigadeiros — 25 unidades",
        "Mini brownies — 25 unidades",
        "Cupcakes — 30 unidades",
        "Cakesicles — 10 unidades"
      ]'::jsonb),
      ('pack-50-pessoas', '[
        "Bolo — 5 kg",
        "Brigadeiros — 30 unidades",
        "Mini brownies — 30 unidades",
        "Cupcakes — 25 unidades",
        "Cakepops — 12 unidades",
        "Cakesicles — 13 unidades"
      ]'::jsonb)
  ) as c(slug, conteudo)
 where p.slug = c.slug;

commit;
