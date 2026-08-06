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
  {
    id: "bolo-personalizado",
    title: "Bolo personalizado",
    category: "Bolos",
    image: "/images/products/bolo-personalizado.png",
    alt: "Bolo personalizado produzido pela Pali Cakes",
    featured: true,
    active: true
  },

  {
    id: "doces-festa",
    title: "Doces para celebração",
    category: "Doces",
    image: "/images/products/doces-festa.png",
    alt: "Doces artesanais para festa produzidos pela Pali Cakes",
    featured: true,
    active: true
  },

  {
    id: "cupcakes-personalizados",
    title: "Cupcakes personalizados",
    category: "Cupcakes",
    image: "/images/products/cupcakes.png",
    alt: "Cupcakes personalizados produzidos pela Pali Cakes",
    featured: true,
    active: true
  },

  {
    id: "bento-cake",
    title: "Bento Cake",
    category: "Bento Cakes",
    image: "/images/products/bento-cake.png",
    alt: "Bento Cake personalizado produzido pela Pali Cakes",
    featured: false,
    active: true
  },

  {
    id: "chocolates",
    title: "Chocolates artesanais",
    category: "Chocolates",
    image: "/images/products/chocolates.png",
    alt: "Chocolates artesanais produzidos pela Pali Cakes",
    featured: false,
    active: true
  },

  {
    id: "miniaturas",
    title: "Miniaturas para festa",
    category: "Miniaturas",
    image: "/images/products/miniaturas.png",
    alt: "Miniaturas doces produzidas pela Pali Cakes",
    featured: false,
    active: true
  },

  {
    id: "doces-personalizados",
    title: "Doces personalizados",
    category: "Doces personalizados",
    image: "/images/products/doces-personalizados.png",
    alt: "Doces temáticos personalizados produzidos pela Pali Cakes",
    featured: false,
    active: true
  },

  {
    id: "bolos-e-doces",
    title: "Conjunto de bolo e doces",
    category: "Bolos e Doces",
    image: "/images/products/bolos-e-doces.png",
    alt: "Conjunto personalizado de bolo e doces da Pali Cakes",
    featured: true,
    active: true
  }
];