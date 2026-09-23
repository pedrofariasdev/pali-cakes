import { supabase } from "@/lib/supabase";
import type { VarianteSabor, GrupoVariante } from "@/types/database";

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
  /** Opções de sabor, cada uma com a sua própria foto. Vazio quando o produto não tem variantes. */
  flavors: VarianteSabor[];
  /** Grupos de variantes sem foto (ex: massa, cobertura, recheio). Vazio quando não se aplica. */
  variantGroups: GrupoVariante[];
  /** Todas as fotos do produto: a principal primeiro, seguida das fotos extra da galeria. */
  gallery: string[];
  /** Quantidade mínima por encomenda (1 quando não há mínimo). */
  minQuantity: number;
}

interface ProdutoRow {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  categoria_slug: string;
  imagem_url: string | null;
  imagens: string[] | null;
  preco: number | null;
  preco_label: string;
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  opcoes: { sabores?: VarianteSabor[]; grupos_variantes?: GrupoVariante[] } | null;
  quantidade_minima?: number | null;
}

function toFlavors(opcoes: ProdutoRow["opcoes"]): VarianteSabor[] {
  const sabores = opcoes?.sabores;

  if (!Array.isArray(sabores)) {
    return [];
  }

  // A foto é opcional: um sabor só precisa de nome para aparecer no site.
  return sabores
    .filter(
      (item): item is VarianteSabor =>
        !!item && typeof item.nome === "string" && item.nome.trim() !== ""
    )
    .map((item) => ({
      nome: item.nome,
      imagem: typeof item.imagem === "string" ? item.imagem : ""
    }));
}

function toVariantGroups(opcoes: ProdutoRow["opcoes"]): GrupoVariante[] {
  const grupos = opcoes?.grupos_variantes;

  if (!Array.isArray(grupos)) {
    return [];
  }

  return grupos
    .filter(
      (grupo): grupo is GrupoVariante =>
        !!grupo &&
        typeof grupo.nome === "string" &&
        grupo.nome.trim() !== "" &&
        Array.isArray(grupo.opcoes) &&
        grupo.opcoes.some(
          (opcao) => typeof opcao === "string" && opcao.trim() !== ""
        )
    )
    .map((grupo) => ({
      nome: grupo.nome,
      opcoes: grupo.opcoes
        .filter(
          (opcao): opcao is string =>
            typeof opcao === "string" && opcao.trim() !== ""
        )
        .map((opcao) => opcao.trim())
    }));
}

function toGallery(row: ProdutoRow): string[] {
  const extras = Array.isArray(row.imagens) ? row.imagens : [];

  const todas = [row.imagem_url ?? "", ...extras]
    .filter((url): url is string => typeof url === "string")
    .map((url) => url.trim())
    .filter((url) => url !== "");

  return Array.from(new Set(todas));
}

function toProduct(row: ProdutoRow): Product {
  return {
    id: row.slug,
    name: row.nome,
    slug: row.slug,
    categorySlug: row.categoria_slug,
    description: row.descricao ?? "",
    image: row.imagem_url ?? "",
    price:
      typeof row.preco === "number" && row.preco > 0
        ? row.preco
        : null,
    priceLabel: row.preco_label?.trim() || "Sob consulta",
    active: row.ativo,
    featured: row.destaque,
    flavors: toFlavors(row.opcoes),
    variantGroups: toVariantGroups(row.opcoes),
    gallery: toGallery(row),
    minQuantity:
      typeof row.quantidade_minima === "number" && row.quantidade_minima > 1
        ? Math.min(99, Math.trunc(row.quantidade_minima))
        : 1
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .order("ordem");

  if (error) {
    console.error("[getProducts]", error.message);
    return [];
  }

  return (data as ProdutoRow[]).map(toProduct);
}

export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .eq("categoria_slug", categorySlug)
    .order("ordem");

  if (error) {
    console.error("[getProductsByCategory]", error.message);
    return [];
  }

  return (data as ProdutoRow[]).map(toProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .eq("destaque", true)
    .order("ordem");

  if (error) {
    console.error("[getFeaturedProducts]", error.message);
    return [];
  }

  return (data as ProdutoRow[]).map(toProduct);
}

export async function getProductBySlug(
  categorySlug: string,
  productSlug: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("categoria_slug", categorySlug)
    .eq("slug", productSlug)
    .eq("ativo", true)
    .maybeSingle();

  if (error || !data) return null;
  return toProduct(data as ProdutoRow);
}
