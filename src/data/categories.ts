export interface CatalogCategory {

  id: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  image: string;
  href: string;
  price: number | null;
  priceLabel: string;
  featured: boolean;
  active: boolean;
}

export const categories: CatalogCategory[] = [
  {
    id: "bolo-personalizado",
    name: "Bolo personalizado",
    category: "Bolos",
    categorySlug: "bolos-personalizados",
    description:
      "Bolos artesanais personalizados para aniversários, celebrações e momentos especiais.",
    image: "/images/products/bolo-personalizado.png",
    href: "/catalogo/bolos-personalizados",
    price: null,
    priceLabel: "Sob consulta",
    featured: true,
    active: true
  },

  {
    id: "doces-festa",
    name: "Doces para festa",
    category: "Doces",
    categorySlug: "doces",
    description:
      "Doces artesanais preparados para complementar festas e celebrações.",
    image: "/images/products/doces-festa.png",
    href: "/catalogo/doces",
    price: null,
    priceLabel: "Sob consulta",
    featured: true,
    active: true
  },

  {
    id: "cupcakes-personalizados",
    name: "Cupcakes personalizados",
    category: "Cupcakes",
    categorySlug: "cupcakes",
    description:
      "Cupcakes personalizados com cores, sabores e decoração escolhidos para a ocasião.",
    image: "/images/products/cupcakes.png",
    href: "/catalogo/cupcakes",
    price: null,
    priceLabel: "Sob consulta",
    featured: true,
    active: true
  },

  {
    id: "bento-cakes",
    name: "Bento Cakes",
    category: "Bento Cakes",
    categorySlug: "bento-cakes",
    description:
      "Pequenos bolos personalizados, ideais para presentear ou celebrar a dois.",
    image: "/images/products/bento-cake.png",
    href: "/catalogo/bento-cakes",
    price: null,
    priceLabel: "Sob consulta",
    featured: true,
    active: true
  },

  {
    id: "chocolates",
    name: "Chocolates",
    category: "Chocolates",
    categorySlug: "chocolates",
    description:
      "Criações em chocolate preparadas artesanalmente para diferentes ocasiões.",
    image: "/images/products/chocolates.png",
    href: "/catalogo/chocolates",
    price: null,
    priceLabel: "Sob consulta",
    featured: true,
    active: true
  },

  {
    id: "pack-festa",
    name: "Pack Festa",
    category: "Packs",
    categorySlug: "packs",
    description:
      "Combinações de bolos e doces para tornar a organização da festa mais prática.",
    image: "/images/products/pack-festa.png",
    href: "/packs-festa",
    price: null,
    priceLabel: "Ver opções",
    featured: true,
    active: true
  },

  {
    id: "miniaturas",
    name: "Miniaturas",
    category: "Miniaturas",
    categorySlug: "miniaturas",
    description:
      "Versões em miniatura preparadas para festas, eventos e mesas de doces.",
    image: "/images/products/miniaturas.png",
    href: "/catalogo/miniaturas",
    price: null,
    priceLabel: "Ver opções",
    featured: true,
    active: true
  },

  {
    id: "doces-personalizados",
    name: "Doces personalizados",
    category: "Doces personalizados",
    categorySlug: "doces-personalizados",
    description:
      "Doces desenvolvidos de acordo com o tema, as cores e o estilo da celebração.",
    image: "/images/products/doces-personalizados.png",
    href: "/catalogo/doces-personalizados",
    price: null,
    priceLabel: "Ver opções",
    featured: true,
    active: true
  },

  {
    id: "bolos-e-doces",
    name: "Bolos e Doces",
    category: "Bolos e Doces",
    categorySlug: "bolos-e-doces",
    description:
      "Combinações personalizadas de bolos e doces para uma celebração completa.",
    image: "/images/products/bolos-e-doces.png",
    href: "/catalogo/bolos-e-doces",
    price: null,
    priceLabel: "Ver opções",
    featured: true,
    active: true
  }
];