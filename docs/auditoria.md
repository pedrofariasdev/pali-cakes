# Auditoria — Pali Cakes (Astro)

**Data:** 2026-08-21
**Método:** `astro check`, `astro build` (49 páginas), inspeção estática do código-fonte,
consultas diretas ao Supabase (produção), e testes ao vivo no navegador em 375px, 768px e 1440px.

**Resumo:** o site compila e constrói sem erros, e a navegação/links internos estão
íntegros. O problema mais grave é um conjunto de 4 imagens de produto em falta (404 reais)
na secção de Packs Festa. O resto são itens de limpeza e pequenos ajustes de acessibilidade/conteúdo.

---

## 🔴 Gravidade alta

### 1. Imagens em falta (404 reais) nos Packs Festa
Os 4 produtos da categoria "Packs Festa" apontam para ficheiros que nunca existiram em
`public/images/products/`:

| Produto | URL da imagem (404) |
|---|---|
| Pack Festa Aniversário | `/images/products/pack-aniversario.png` |
| Pack Festa Infantil | `/images/products/pack-festa-infantil.png` |
| Pack Mini Celebração | `/images/products/pack-mini-celebracao.png` |
| Pack Festa Premium | `/images/products/pack-festa-premium.png` |

Confirmado ao vivo (pedido HTTP real): as 4 URLs devolvem **404 Not Found**. Afeta a
página `/packs-festa` (grelha) e as 4 páginas de produto individuais — o visitante vê um
ícone de imagem partida em vez do pack.

**Causa:** estes produtos nunca receberam fotos reais (só a categoria "Pack Festa" em si
tem uma imagem genérica, `pack-festa.png`, que funciona).

**Correção:** carregar 4 fotos reais dos packs e atualizar `imagem_url` na tabela
`produtos` do Supabase (mesmo processo já usado para as outras categorias).

---

## 🟠 Gravidade média

### 2. Referência órfã: categoria desativada aponta para imagem já apagada
A categoria `doces-personalizados` (desativada, `ativa=false`) ainda tem
`imagem_url = /images/products/doces-personalizados.png` na base de dados, mas esse
ficheiro foi removido do projeto. Não é visível agora (a categoria está desligada), mas
se alguém a reativar sem reparar, a imagem voltará a estar partida.
**Correção:** limpar o campo `imagem_url` dessa linha, ou apagar a linha se a categoria
não vai voltar.

### 3. Contraste potencialmente insuficiente no botão "Fazer encomenda" do Hero
O botão `.button--ghost` (usado só no Hero da home) não tem fundo sólido — é só
texto branco + contorno + `blur`, apoiado inteiramente na foto de fundo e no overlay
escuro para legibilidade. Como o overlay é propositadamente mais claro no centro (onde
o texto está centrado) para deixar a foto visível, em fotos mais claras o contraste
calculado cai para ~3.7:1 no pior caso — abaixo do mínimo AA (4.5:1) para texto normal.
**Correção sugerida:** dar ao `.button--ghost` um fundo semi-opaco (ex.
`background-color: rgba(54,36,33,.35)`) em vez de depender só do `blur`.

### 4. Redes sociais no rodapé/contactos: 2 de 3 são placeholders
- **Instagram:** link real (`instagram.com/palicakes`) ✅
- **Facebook e TikTok:** ainda são links genéricos/temporários, com nota no código
  a dizer "substituir pelos links oficiais assim que a Bruna os enviar".
- **Telefone/WhatsApp:** não aparece em lado nenhum do site (nem rodapé, nem
  `/contactos`) — só existe um formulário de contacto e o Instagram.

Ou seja: a resposta a "o rodapé tem contactos reais?" é **parcial** — sem
telefone, e com 2 das 3 redes sociais por confirmar.

### 5. ~18 MB de ficheiros não usados em `public/images/`
Ficheiros que não são referenciados em nenhum lugar do código nem da base de dados:

- **11 MB** — 8 fotos `.HEIC` originais (não processadas) em
  `public/images/products/bento-cakes/` — cópias brutas que ficaram lá por engano
  (o formato HEIC nem sequer renderiza na maioria dos navegadores).
- Placeholders antigos substituídos pelas fotos reais: `bolo-personalizado.png`,
  `bolos-e-doces.png`, `chocolates.png`, `cupcakes.png`, `doces-festa.png`,
  `miniaturas.png`, `bento-cake.png` (×2).
- Fotos descartadas de iterações anteriores: `about-bruna-home.jpg`, `IMG_0643.JPG`,
  `hero-cake.png` (hero antigo antes do mosaico atual).
- 5 variantes de favicon nunca ligadas ao HTML (`favicon-16.png`, `favicon-32.png`,
  `favicon-48.png`, `favicon-180.png`, `favicon.png`) — só `favicon.svg`,
  `favicon.ico` e `apple-touch-icon.png` estão em uso.

**Correção:** apagar estes ficheiros (nenhum está em uso; confirmar antes se algum é
cópia de segurança que queiram manter fora do repositório).

### 6. Prova social ainda escassa
O sistema de avaliações está ligado e a funcionar (ver secção Supabase abaixo), mas
neste momento só existe **1 avaliação aprovada** publicada. Não é um erro técnico,
mas vale a pena pedir a mais clientes para avaliar.

---

## 🟡 Gravidade baixa

### 7. Componentes Astro nunca usados
- `src/components/products/ProductFilter.astro`
- `src/components/ui/Badge.astro`

Não são importados em nenhuma página. Seguros para apagar.

### 8. Scripts vazios (0 bytes) nunca usados
`src/scripts/carousel.ts`, `src/scripts/delivery.ts`, `src/scripts/reviews.ts` — ficheiros
vazios desde o scaffold inicial do projeto (30 de julho), nunca preenchidos nem
importados. (Não confundir com `src/lib/delivery.ts` e `src/lib/reviews.ts`, que são
os ficheiros reais e estão em uso.)

### 9. Pequena inconsistência de acessibilidade
Em `AboutPreview.astro` (secção "Sobre a Bruna" da home), a foto tem um `alt`
descritivo ("Bruna Paliotes, fundadora da Pali Cakes"), mas está dentro de um
contentor com `aria-hidden="true"` — ou seja, esse texto nunca chega a um leitor de
ecrã. Não é um problema funcional (o mesmo conteúdo já está no texto ao lado, em
`<h2>`/`<p>` normais), mas o `alt` devia passar a `alt=""` para refletir que é
tratada como decorativa.

---

## ✅ O que está bem (confirmado)

- **Build:** `astro build` — 0 erros, 49 páginas geradas com sucesso.
- **`astro check`:** 0 erros, 0 avisos, 0 sugestões.
- **Links internos:** nenhum link partido — todos os `href` fixos no código
  correspondem a rotas reais.
- **Nenhuma página órfã:** todas as páginas públicas têm pelo menos um link a
  apontar para elas (exceto `/404` e `/admin`, que são intencionalmente não-linkadas).
- **Alt text:** 100% das tags `<img>` têm atributo `alt`.
- **Formulários:** checkout, contacto e avaliações têm todos os campos corretamente
  associados a `<label>`; a classificação por estrelas usa `<fieldset>` + `<legend>`
  + texto `.sr-only`, um padrão exemplar.
- **Hierarquia de títulos:** exatamente um `<h1>` por página, em todas as páginas.
- **Contraste de cor:** texto do corpo, links, botão primário e rodapé — todos
  passam WCAG AA (rácios entre 4.7:1 e 9.1:1).
- **`lang="pt-PT"`** definido e **"saltar para o conteúdo"** (skip link) presente
  e a apontar para um alvo válido.
- **Responsivo (375px, 768px, 1440px):** testado em home, catálogo (listagem e
  produto), checkout, carrinho, portfólio e sobre — sem scroll horizontal em
  nenhum dos três tamanhos; grelha do catálogo confirma 1 → 2 → 4 colunas
  corretamente; menu hambúrguer aparece/funciona em mobile sem sobrepor o logótipo.
- **Sistema de avaliações ligado ao Supabase (real, não simulado):**
  `getAvaliacoesAprovadas()` consulta a tabela `avaliacoes` filtrando por
  `estado='aprovada'`; o envio usa a função `criar_avaliacao` (RPC) com
  limitação de spam e validação de tamanho mínimo do comentário; confirmado
  na base de dados em produção: 1 avaliação aprovada + 1 rejeitada, fluxo de
  moderação a funcionar.
- **Autenticação da área reservada:** guarda client-side (`exigirSessao`) que
  confirma `role="admin"` e redireciona para `/admin` caso contrário, reforçada
  por políticas RLS no Supabase (não depende só do JavaScript do browser).

---

## Resumo por prioridade de ação

1. Repor as 4 fotos dos Packs Festa (alta).
2. Limpar a referência de imagem da categoria desativada (média).
3. Dar fundo sólido ao botão "Fazer encomenda" do Hero (média).
4. Obter os links reais de Facebook/TikTok e um contacto telefónico (média).
5. Apagar os ~18 MB de ficheiros não usados (média/limpeza).
6. Apagar os 2 componentes e os 3 scripts vazios não usados (baixa).
7. Ajustar o `alt` decorativo em AboutPreview (baixa).
