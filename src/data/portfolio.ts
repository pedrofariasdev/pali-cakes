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
    id: "bolos-e-doces",
    title: "Conjunto de bolo e doces",
    category: "Bolos e Doces",
    image: "/images/products/bolos-e-doces.png",
    alt: "Conjunto personalizado de bolo e doces da Pali Cakes",
    featured: true,
    active: true
  },

  {
    id: "bolo-hipopotamo",
    title: "Bolo hipopótamo 3D",
    category: "Bolos",
    image: "/images/portfolio/bolo-hipopotamo.png",
    alt: "Bolo esculpido em formato de hipopótamo produzido pela Pali Cakes",
    featured: false,
    active: true
  },

  {
    id: "bolo-natal-tronco",
    title: "Bolo de Natal tronco",
    category: "Bolos",
    image: "/images/portfolio/bolo-natal-tronco.png",
    alt: "Bolo temático de Natal em formato de tronco produzido pela Pali Cakes",
    featured: false,
    active: true
  },

  {
    id: "bolo-aniversario-rosa",
    title: "Bolo de aniversário rosa e laços",
    category: "Bolos",
    image: "/images/portfolio/bolo-aniversario-rosa.png",
    alt: "Bolo de aniversário decorado com laços e corações produzido pela Pali Cakes",
    featured: false,
    active: true
  },

  {
    id: "bolo-tiktok",
    title: "Bolo temático TikTok",
    category: "Bolos",
    image: "/images/portfolio/bolo-tiktok.png",
    alt: "Bolo temático TikTok produzido pela Pali Cakes",
    featured: false,
    active: true
  },

  {
    id: "bolo-stitch",
    title: "Bolo temático com balões",
    category: "Bolos",
    image: "/images/portfolio/bolo-stitch.png",
    alt: "Bolo temático com balões e personagem produzido pela Pali Cakes",
    featured: false,
    active: true
  }
];