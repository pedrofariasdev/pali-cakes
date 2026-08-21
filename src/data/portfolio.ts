export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  alt: string;
  featured: boolean;
  active: boolean;
}

export const portfolioItems: PortfolioItem[] = [
  // Bolos personalizados
  {
    id: "bolo-flores-drip",
    title: "Bolo com flores em pasta e drip dourado",
    category: "Bolos",
    image: "/images/portfolio/bolo-flores-drip.jpg",
    alt: "Bolo branco com flores em pasta de açúcar coral e drip dourado produzido pela Pali Cakes",
    featured: true,
    active: true
  },
  {
    id: "bolo-suculentas",
    title: "Bolo temático com suculentas",
    category: "Bolos",
    image: "/images/portfolio/bolo-suculentas.jpg",
    alt: "Bolo verde decorado com suculentas comestíveis e efeito de terra produzido pela Pali Cakes",
    featured: true,
    active: true
  },
  {
    id: "bolo-humor-aniversario",
    title: "Bolo coração com mensagem divertida",
    category: "Bolos",
    image: "/images/portfolio/bolo-humor-aniversario.jpg",
    alt: "Bolo em formato de coração com mensagem de aniversário bem-humorada produzido pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "bolo-finalistas-rosetas",
    title: "Bolo de finalistas com rosetas",
    category: "Bolos",
    image: "/images/portfolio/bolo-finalistas-rosetas.jpg",
    alt: "Bolo branco texturado com rosetas de chantilly e topo de finalista produzido pela Pali Cakes",
    featured: true,
    active: true
  },
  {
    id: "bolo-textura-flores-brancas",
    title: "Bolo minimalista com flores naturais",
    category: "Bolos",
    image: "/images/portfolio/bolo-textura-flores-brancas.jpg",
    alt: "Bolo branco texturado com coroa de flores naturais produzido pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "bolo-finalistas-frase",
    title: "Bolo de finalistas com frase divertida",
    category: "Bolos",
    image: "/images/portfolio/bolo-finalistas-frase.jpg",
    alt: "Bolo branco elegante com mensagem de finalistas e flores secas produzido pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "bolo-azulejos",
    title: "Bolo pintado à mão em estilo azulejo",
    category: "Bolos",
    image: "/images/portfolio/bolo-azulejos.jpg",
    alt: "Bolo branco pintado à mão com padrão floral azul inspirado em azulejos portugueses produzido pela Pali Cakes",
    featured: true,
    active: true
  },
  {
    id: "bolo-noivado-aliancas",
    title: "Bolo de noivado com alianças douradas",
    category: "Bolos",
    image: "/images/portfolio/bolo-noivado-aliancas.jpg",
    alt: "Bolo elegante com desenho de alianças douradas e pérolas produzido pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "bolo-floral-vintage-geode",
    title: "Bolo vintage com topo em efeito geode",
    category: "Bolos",
    image: "/images/portfolio/bolo-floral-vintage-geode.jpg",
    alt: "Bolo com padrão floral vintage, borda dourada e topo brilhante em efeito geode produzido pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "bolo-kintsugi-aniversario",
    title: "Bolo cinzento com efeito kintsugi",
    category: "Bolos",
    image: "/images/portfolio/bolo-kintsugi-aniversario.jpg",
    alt: "Bolo cinzento com linhas douradas em efeito kintsugi e topo dourado de aniversário produzido pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "bolo-50-fabulous",
    title: "Bolo com flores e frutos vermelhos",
    category: "Bolos",
    image: "/images/portfolio/bolo-50-fabulous.jpg",
    alt: "Bolo branco decorado com flores amarelas e frutos vermelhos frescos produzido pela Pali Cakes",
    featured: true,
    active: true
  },
  {
    id: "bolo-40-anos-frutos",
    title: "Bolo com frutos vermelhos e chocolate",
    category: "Bolos",
    image: "/images/portfolio/bolo-40-anos-frutos.jpg",
    alt: "Bolo branco com drip de chocolate e coroa de frutos vermelhos frescos produzido pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "bolo-metalico-borboletas",
    title: "Bolo metalizado com borboletas",
    category: "Bolos",
    image: "/images/portfolio/bolo-metalico-borboletas.jpg",
    alt: "Bolo em degradê metalizado rosa e vermelho com borboletas produzido pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "bolo-camisa-verde",
    title: "Bolo escultural em formato de camisa",
    category: "Bolos",
    image: "/images/portfolio/bolo-camisa-verde.jpg",
    alt: "Bolo esculpido em formato de camisa verde com botões produzido pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "bolo-chocolate-frutos-vermelhos",
    title: "Bolo de chocolate com frutos vermelhos",
    category: "Bolos",
    image: "/images/portfolio/bolo-chocolate-frutos-vermelhos.jpg",
    alt: "Bolo de chocolate coberto com frutos vermelhos frescos e hortelã produzido pela Pali Cakes",
    featured: true,
    active: true
  },
  {
    id: "bolo-unicornio",
    title: "Bolo de unicórnio",
    category: "Bolos",
    image: "/images/portfolio/bolo-unicornio.jpg",
    alt: "Bolo temático de unicórnio com corno dourado e rosetas cor-de-rosa produzido pela Pali Cakes",
    featured: false,
    active: true
  },

  // Bento cakes
  {
    id: "bento-cake-frase-humor",
    title: "Bento cake com mensagem divertida",
    category: "Bento Cakes",
    image: "/images/portfolio/bento-cake-frase-humor.jpg",
    alt: "Bento cake pequeno com mensagem bem-humorada produzido pela Pali Cakes",
    featured: true,
    active: true
  },
  {
    id: "bento-cake-super-pai",
    title: "Bento cake para o Dia do Pai",
    category: "Bento Cakes",
    image: "/images/portfolio/bento-cake-super-pai.jpg",
    alt: "Bento cake colorido com o tema Super Pai produzido pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "bento-cake-38-anos",
    title: "Bento cake elegante para aniversário",
    category: "Bento Cakes",
    image: "/images/portfolio/bento-cake-38-anos.jpg",
    alt: "Bento cake azul elegante com mensagem de aniversário produzido pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "bento-cake-maos-coracao",
    title: "Bento cake com corações",
    category: "Bento Cakes",
    image: "/images/portfolio/bento-cake-maos-coracao.jpg",
    alt: "Bento cake decorado com mãos a formar um coração produzido pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "bento-cake-calendario",
    title: "Bento cake de aniversário de namoro",
    category: "Bento Cakes",
    image: "/images/portfolio/bento-cake-calendario.jpg",
    alt: "Bento cake com tema de calendário para celebrar um ano de relação produzido pela Pali Cakes",
    featured: false,
    active: true
  },

  // Sobremesas
  {
    id: "sobremesa-cheesecake-frutos",
    title: "Cheesecake de frutos vermelhos",
    category: "Sobremesas",
    image: "/images/portfolio/sobremesa-cheesecake-frutos.jpg",
    alt: "Cheesecake artesanal coberto com frutos vermelhos frescos produzido pela Pali Cakes",
    featured: true,
    active: true
  },
  {
    id: "sobremesa-bolo-formigueiro",
    title: "Bolo com cobertura de chocolate crocante",
    category: "Sobremesas",
    image: "/images/portfolio/sobremesa-bolo-formigueiro.jpg",
    alt: "Bolo artesanal coberto com chocolate granulado produzido pela Pali Cakes",
    featured: false,
    active: true
  },

  // Chocolates
  {
    id: "chocolates-caixa-marca",
    title: "Caixa de chocolates Pali Cakes",
    category: "Chocolates",
    image: "/images/portfolio/chocolates-caixa-marca.jpg",
    alt: "Caixa de chocolates artesanais com a marca Pali Cakes",
    featured: true,
    active: true
  },
  {
    id: "chocolates-tabletes-frutas",
    title: "Tabletes de chocolate com frutas",
    category: "Chocolates",
    image: "/images/portfolio/chocolates-tabletes-frutas.jpg",
    alt: "Tabletes de chocolate artesanal decoradas com frutas produzidas pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "chocolates-crocante-framboesa",
    title: "Chocolate crocante com framboesa",
    category: "Chocolates",
    image: "/images/portfolio/chocolates-crocante-framboesa.jpg",
    alt: "Chocolate artesanal crocante decorado com framboesa produzido pela Pali Cakes",
    featured: false,
    active: true
  },

  // Miniaturas
  {
    id: "miniaturas-caixa-trufas",
    title: "Caixa de trufas e brigadeiros",
    category: "Miniaturas",
    image: "/images/portfolio/miniaturas-caixa-trufas.jpg",
    alt: "Caixa sortida de trufas e brigadeiros artesanais produzida pela Pali Cakes",
    featured: true,
    active: true
  },
  {
    id: "miniaturas-mesa-doces",
    title: "Mesa de doces sortidos",
    category: "Miniaturas",
    image: "/images/portfolio/miniaturas-mesa-doces.jpg",
    alt: "Mesa de doces sortidos para festa produzida pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "miniaturas-brownies",
    title: "Brownies artesanais",
    category: "Miniaturas",
    image: "/images/portfolio/miniaturas-brownies.jpg",
    alt: "Brownies artesanais com cobertura de chocolate produzidos pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "miniaturas-morangos-chocolate",
    title: "Morangos cobertos de chocolate",
    category: "Miniaturas",
    image: "/images/portfolio/miniaturas-morangos-chocolate.jpg",
    alt: "Morangos frescos cobertos com chocolate produzidos pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "miniaturas-brigadeiro-rolo",
    title: "Brigadeiros gourmet",
    category: "Miniaturas",
    image: "/images/portfolio/miniaturas-brigadeiro-rolo.jpg",
    alt: "Brigadeiros gourmet decorados produzidos pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "miniaturas-macro-detalhe",
    title: "Detalhe de doces sortidos",
    category: "Miniaturas",
    image: "/images/portfolio/miniaturas-macro-detalhe.jpg",
    alt: "Vista de detalhe de miniaturas doces produzidas pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "miniaturas-evento-tarteletes",
    title: "Tarteletes para evento",
    category: "Miniaturas",
    image: "/images/portfolio/miniaturas-evento-tarteletes.jpg",
    alt: "Mesa de tarteletes de frutos vermelhos montada para evento pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "miniaturas-cake-pops",
    title: "Cake pops decorados",
    category: "Miniaturas",
    image: "/images/portfolio/miniaturas-cake-pops.jpg",
    alt: "Cake pops decorados sobre base em forma de coração produzidos pela Pali Cakes",
    featured: false,
    active: true
  },
  {
    id: "miniaturas-cupcakes-rosa",
    title: "Cupcakes com rosetas",
    category: "Miniaturas",
    image: "/images/portfolio/miniaturas-cupcakes-rosa.jpg",
    alt: "Cupcakes com cobertura em roseta rosa e dourada produzidos pela Pali Cakes",
    featured: true,
    active: true
  },
  {
    id: "miniaturas-copos-brigadeiros",
    title: "Copos de sobremesa e brigadeiros",
    category: "Miniaturas",
    image: "/images/portfolio/miniaturas-copos-brigadeiros.jpg",
    alt: "Copos de sobremesa e brigadeiros com a marca Pali Cakes",
    featured: false,
    active: true
  }
];
