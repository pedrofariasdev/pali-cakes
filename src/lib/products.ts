import { supabase } from "@/lib/supabase";
import type { VarianteSabor } from "@/types/database";

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
}

interface ProdutoRow {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  categoria_slug: string;
  imagem_url: string | null;
  preco: number | null;
  preco_label: string;
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  opcoes: { sabores?: VarianteSabor[] } | null;
}

function toFlavors(opcoes: ProdutoRow["opcoes"]): VarianteSabor[] {
  const sabores = opcoes?.sabores;

  if (!Array.isArray(sabores)) {
    return [];
  }

  return sabores.filter(
    (item): item is VarianteSabor =>
      !!item &&
      typeof item.nome === "string" &&
      item.nome.trim() !== "" &&
      typeof item.imagem === "string" &&
      item.imagem.trim() !== ""
  );
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
    flavors: toFlavors(row.opcoes)
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
