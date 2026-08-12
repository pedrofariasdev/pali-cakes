 # Análise do site Pali Cakes — 12/08/2026

Análise feita comparando o código-fonte (`pedrofariasdev/pali-cakes`) com o site publicado em palicakes.pt e o histórico de deploys no GitHub Actions.

## 1. Bugs críticos (afetam o site ao vivo agora)

**Deploy desatualizado.** O último deploy com sucesso publicou o commit `900c90d`, um commit antes de `1187435`, que adicionou a moderação de avaliações. Resultado: `/admin/avaliacoes` não existe na versão publicada. Isso já foi te explicado e você vai rodar o "Run workflow" manualmente — mas dado o próximo ponto, recomendo conferir o site inteiro depois desse novo deploy.

**Página `/contactos` não existe.** Navbar, footer e o botão final do FAQ ("Contactar a Pali Cakes") linkam para `/contactos`, mas não há `src/pages/contactos.astro` no repositório. É um link morto em todas as páginas do site.

**Portfólio servindo versão antiga/inconsistente.** `/portfolio` ao vivo está visivelmente desatualizado em relação ao resto do site: usa links `http://` (não `https://`), não tem nenhuma meta tag de SEO/Open Graph (as outras páginas têm todas), e o menu de catálogo mostra só 4 categorias antigas com slugs que não existem mais (ex.: `/catalogo/bolos` — testei e dá vazio/404; o slug atual é `/catalogo/bolos-personalizados`). Parece cache de uma versão anterior ao commit de SEO. Vale invalidar cache / forçar novo deploy e conferir essa página especificamente depois.

**Imagem de Open Graph quebrada.** O código referencia `/images/og-pali-cakes.png` em todas as páginas (`MainLayout.astro`), mas o arquivo real é `og-pali-cakes.jpg`. Isso quebra a pré-visualização do link quando alguém compartilha o site no WhatsApp, Instagram ou Facebook — vai aparecer sem imagem. Correção rápida: trocar a extensão default no layout ou renomear o arquivo.

**Contatos do rodapé não funcionam.** No `Footer.astro`: o link de email é `<a href="mailto:">` (vazio — abre o cliente de email sem destinatário) e o link do Instagram é `<a href="#">` (não vai a lugar nenhum). Precisa do email real e do link do Instagram da Bruna.

**Texto de placeholder visível para o cliente no checkout.** Em `finalizar-encomenda.astro`, o texto de ajuda abaixo do botão de enviar diz: *"Os dados serão guardados neste navegador até ligarmos o envio ao Supabase."* Isso é uma frase de desenvolvimento que ficou esquecida — o envio para o Supabase já está implementado e funcionando (`checkout.ts` chama `criarEncomenda` normalmente), só o texto estático não foi atualizado. Como está, confunde o cliente sobre se o pedido foi realmente enviado.

## 2. Risco legal — imagens com personagens/marcas protegidas

- **Hero da home** (`hero-cake.png`): bolo com toppers dos personagens de "KPop Demon Hunters" (propriedade licenciada). Já estava anotado como pendente — confirmado que ainda está no ar.
- **Thumbnail da categoria "Bolo personalizado"** (usada no catálogo *e* no portfólio): foto de um bolo com o escudo oficial do Sporting CP. Mesmo risco — uso comercial de marca de clube de futebol sem licença.

Recomendo substituir essas duas por fotos reais de trabalhos sem elementos de terceiros protegidos assim que a Bruna enviar material próprio.

## 3. Conteúdo/negócio ainda pendente (confirmado no código atual)

- **Preços:** todo o catálogo e todos os Packs Festa mostram "Sob consulta" — nenhum preço fixo definido ainda.
- **Catálogo raso:** cada categoria tem apenas 1 produto cadastrado (dado de exemplo/seed) — falta a Bruna alimentar o catálogo real.
- **Zonas de entrega:** lógica pronta (`delivery.ts`, tabela `zonas_entrega`), mas depende da Bruna validar zonas e preços reais.
- **Prazo mínimo de encomenda:** o FAQ promete "pelo menos uma semana de antecedência", mas o formulário de checkout (`configureMinimumDate` em `checkout.ts`) só bloqueia datas passadas — não impede alguém de marcar para amanhã. Se a regra de 1 semana for mesmo a política, vale implementar a validação.
- **Fotos reais dos produtos:** além do hero e do bolo do Sporting, vale revisar as outras imagens de produto para confirmar que já são fotos reais da Pali Cakes.
- **Alergénios por produto:** o texto legal genérico está bem escrito na FAQ, mas a composição detalhada por produto ainda depende de resposta manual — não está no banco de dados.

## 4. Melhorias técnicas menores

- `robots.txt` e o filtro do sitemap não excluem `/admin/*`. As páginas admin já têm `noindex` na meta tag (o que evita indexação no Google), mas por boa prática vale bloquear o crawling explicitamente também no `robots.txt` e tirar do sitemap.
- Vale rodar uma checagem geral de links quebrados no site inteiro depois do próximo deploy, já que encontramos padrão de páginas dessincronizadas (portfólio vs. resto do site).

## Resumo do que fazer primeiro

1. Rodar o deploy manual no GitHub Actions (branch `main`).
2. Depois do deploy, conferir principalmente `/portfolio` e `/admin/avaliacoes` — se o portfólio continuar com a versão antiga, pode ser cache do GitHub Pages e vale investigar mais.
3. Criar a página `/contactos` (ou trocar os links para apontar a algo que já existe, como uma seção de contacto na home).
4. Corrigir a extensão da imagem de Open Graph.
5. Preencher email e Instagram reais no rodapé.
6. Remover o texto de placeholder do checkout.
7. Trocar as duas imagens com personagens/marcas licenciadas.
8. Levar preços, zonas de entrega, regras do Pack Festa, prazo mínimo e fotos reais para a reunião de quarta com a Bruna (já estava na pauta).
