export interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  description: string;
  image: string;
  price: number | null;
  priceLabel: string;
  active: boolean;
  featured: boolean;
}

export const products: Product[] = [

    {
  id: "pack-aniversario",
  name: "Pack Festa Aniversário",
  slug: "pack-aniversario",
  categorySlug: "packs-festa",
  description: "Uma seleção completa para tornar a sua festa especial.",
  image: "/images/products/pack-aniversario.png",
  price: null,
  priceLabel: "Sob consulta",
  active: true,
  featured: true
  },

{
  id: "pack-festa-infantil",
  name: "Pack Festa Infantil",
  slug: "pack-festa-infantil",
  categorySlug: "packs-festa",
  description:
    "Uma combinação de bolo e doces personalizados para tornar a festa infantil ainda mais especial.",
  image: "/images/products/pack-festa-infantil.png",
  price: null,
  priceLabel: "Sob consulta",
  active: true,
  featured: true
},

{
  id: "pack-mini-celebracao",
  name: "Pack Mini Celebração",
  slug: "pack-mini-celebracao",
  categorySlug: "packs-festa",
  description:
    "Uma opção compacta para pequenas celebrações, surpresas e momentos especiais.",
  image: "/images/products/pack-mini-celebracao.png",
  price: null,
  priceLabel: "Sob consulta",
  active: true,
  featured: true
},

{
  id: "pack-festa-premium",
  name: "Pack Festa Premium",
  slug: "pack-festa-premium",
  categorySlug: "packs-festa",
  description:
    "Uma seleção completa de bolo, doces e detalhes personalizados para uma celebração inesquecível.",
  image: "/images/products/pack-festa-premium.png",
  price: null,
  priceLabel: "Sob consulta",
  active: true,
  featured: true
},

  {
    id: "bolo-classico-personalizado",
    name: "Bolo clássico personalizado",
    slug: "bolo-classico-personalizado",
    categorySlug: "bolos-personalizados",
    description:
      "Bolo artesanal personalizado de acordo com o tema, as cores e os detalhes da celebração.",
    image: "/images/products/bolo-personalizado.png",
    price: null,
    priceLabel: "Sob consulta",
    active: true,
    featured: true
  },

{
  id: "bolo-infantil-personalizado",
  name: "Bolo infantil personalizado",
  slug: "bolo-infantil-personalizado",
  categorySlug: "bolos-personalizados",
  description:
    "Bolo infantil personalizado de acordo com o tema, as cores e os personagens escolhidos.",
  image: "/images/products/bolo-infantil.png",
  price: null,
  priceLabel: "Sob consulta",
  active: true,
  featured: false
},

{
  id: "bolo-aniversario-tematico",
  name: "Bolo de aniversário temático",
  slug: "bolo-aniversario-tematico",
  categorySlug: "bolos-personalizados",
  description:
    "Criação temática desenvolvida especialmente para aniversários e celebrações inesquecíveis.",
  image: "/images/products/bolo-aniversario.png",
  price: null,
  priceLabel: "Sob consulta",
  active: true,
  featured: false
},

{
  id: "bolo-elegante-personalizado",
  name: "Bolo elegante personalizado",
  slug: "bolo-elegante-personalizado",
  categorySlug: "bolos-personalizados",
  description:
    "Bolo com acabamento elegante e detalhes personalizados para celebrações especiais.",
  image: "/images/products/bolo-elegante.png",
  price: null,
  priceLabel: "Sob consulta",
  active: true,
  featured: false
},

  {
    id: "caixa-doces-festa",
    name: "Caixa de doces para festa",
    slug: "caixa-doces-festa",
    categorySlug: "doces",
    description:
      "Seleção de doces artesanais para complementar aniversários, festas e celebrações.",
    image: "/images/products/doces-festa.png",
    price: null,
    priceLabel: "Sob consulta",
    active: true,
    featured: true
  },

  {
    id: "box-cupcakes-personalizados",
    name: "Box de cupcakes personalizados",
    slug: "box-cupcakes-personalizados",
    categorySlug: "cupcakes",
    description:
      "Cupcakes personalizados com decoração, cores e sabores escolhidos para cada ocasião.",
    image: "/images/products/cupcakes.png",
    price: null,
    priceLabel: "Sob consulta",
    active: true,
    featured: true
  },

  {
    id: "bento-cake-personalizado",
    name: "Bento Cake personalizado",
    slug: "bento-cake-personalizado",
    categorySlug: "bento-cakes",
    description:
      "Mini bolo personalizado, ideal para presentear, surpreender ou celebrar a dois.",
    image: "/images/products/bento-cake.png",
    price: null,
    priceLabel: "Sob consulta",
    active: true,
    featured: true
  },

  {
    id: "caixa-chocolates-artesanais",
    name: "Caixa de chocolates artesanais",
    slug: "caixa-chocolates-artesanais",
    categorySlug: "chocolates",
    description:
      "Criações artesanais em chocolate preparadas para oferecer ou complementar uma celebração.",
    image: "/images/products/chocolates.png",
    price: null,
    priceLabel: "Sob consulta",
    active: true,
    featured: true
  },

  {
    id: "miniaturas-para-eventos",
    name: "Miniaturas para eventos",
    slug: "miniaturas-para-eventos",
    categorySlug: "miniaturas",
    description:
      "Pequenas criações doces para mesas de festa, eventos e momentos especiais.",
    image: "/images/products/miniaturas.png",
    price: null,
    priceLabel: "Sob consulta",
    active: true,
    featured: true
  },

  {
    id: "doces-tematicos",
    name: "Doces temáticos personalizados",
    slug: "doces-tematicos",
    categorySlug: "doces-personalizados",
    description:
      "Doces desenvolvidos de acordo com o tema, as cores e o estilo escolhido para a festa.",
    image: "/images/products/doces-personalizados.png",
    price: null,
    priceLabel: "Sob consulta",
    active: true,
    featured: true
  },

  {
    id: "conjunto-bolo-doces",
    name: "Conjunto de bolo e doces",
    slug: "conjunto-bolo-doces",
    categorySlug: "bolos-e-doces",
    description:
      "Combinação personalizada de bolo e doces para criar uma mesa harmoniosa e completa.",
    image: "/images/products/bolos-e-doces.png",
    price: null,
    priceLabel: "Sob consulta",
    active: true,
    featured: true
  }
];