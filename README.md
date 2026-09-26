# Pali Cakes — palicakes.pt

Site da Pali Cakes (bolos personalizados e doces artesanais, by Bruna Paliotes):
catálogo, packs de festa, portfólio, avaliações e pedido de encomenda, com
painel de administração.

## Tecnologia

- **Astro** — site estático gerado no build (bom para SEO e velocidade).
- **Supabase** — base de dados (produtos, encomendas, avaliações), autenticação
  do admin, armazenamento de fotos e funções (email de encomenda, formulário de
  contacto, publicação do site).
- **GitHub Pages** — alojamento; cada `push` para `main` publica o site
  (`.github/workflows/deploy.yml`).

## Comandos

| Comando           | O que faz                                   |
| :---------------- | :------------------------------------------ |
| `npm install`     | Instala as dependências                     |
| `npm run dev`     | Servidor local em `localhost:4321`          |
| `npm run build`   | Gera o site em `./dist/`                    |
| `npm run check`   | Verifica tipos e erros do Astro             |
| `npm run preview` | Pré-visualiza o build localmente            |

É preciso um ficheiro `.env` (não vai para o Git) com:

```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

## Estrutura

```
public/                 imagens, favicon, robots.txt e CNAME
src/
  components/           home, layout (navbar, rodapé, cookies), produtos, avaliações
  data/portfolio.ts     fotos e categorias do portfólio
  layouts/              MainLayout (SEO, navbar, rodapé, Analytics com consentimento)
  lib/                  acesso ao Supabase (produtos, encomendas, avaliações, admin…)
  pages/                páginas do site; admin/ = painel de administração
  scripts/              comportamento no navegador (carrinho, checkout, variantes…)
  styles/               CSS global, componentes, admin e responsivo
  types/database.ts     tipos das tabelas
supabase/
  functions/            order-notification, contact-form
  migrations/           alterações à base de dados, por ordem de data
```

## Como funciona o dia a dia

- **Produtos** são geridos em `/admin/produtos` (fotos, galeria, sabores com ou
  sem preço, variantes, tamanhos com preço e mínimo, quantidade mínima, conteúdo
  dos packs). Como o site é estático, as alterações só aparecem depois de
  **Publicar alterações** (cerca de 2 minutos).
- **Encomendas** chegam por email e ficam em `/admin/encomendas`, com cupão,
  desconto e fotos de referência.
- **Avaliações** em `/admin/avaliacoes`. As regras de lançamento (publicação
  automática, cupões PALI01…, janela de 24 horas e validade) estão na tabela
  `definicoes_lancamento`; ver os comentários das migrações `2026092313*`,
  `2026092314*`, `2026092411*` e `2026092612*`.

## Alterações à base de dados

Cada alteração fica num ficheiro em `supabase/migrations/`, a correr no SQL
Editor do Supabase **por ordem** e **antes** do `git push` do código que dela
depende.

A função do email de encomenda é publicada à parte:

```
npx supabase functions deploy order-notification --project-ref yhruqmfmcbsukezjrgcl
```

O botão **Publicar alterações** usa o secret `GITHUB_TOKEN` (Supabase → Edge
Functions → Secrets). Se aparecer um erro 401, o token do GitHub expirou: gerar
um novo e atualizar o secret.
