import { supabase } from "@/lib/supabase";

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

interface CategoriaRow {
  id: string;
  slug: string;
  nome: string;
  grupo: string | null;
  descricao: string | null;
  imagem_url: string | null;
  href: string;
  preco: number | null;
  preco_label: string;
  destaque: boolean;
  ativa: boolean;
  ordem: number;
}

function toCategory(row: CategoriaRow): CatalogCategory {
  return {
    id: row.slug,
    name: row.nome,
    category: row.grupo ?? row.nome,
    categorySlug: row.slug,
    description: row.descricao ?? "",
    image: row.imagem_url ?? "",
    href: row.href,
    price: row.preco,
    priceLabel: row.preco_label,
    featured: row.destaque,
    active: row.ativa
  };
}

export async function getCategories(): Promise<CatalogCategory[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("ativa", true)
    .order("ordem");

  if (error) {
    console.error("[getCategories]", error.message);
    return [];
  }

  return (data as CategoriaRow[]).map(toCategory);
}

export async function getCategoryBySlug(
  slug: string
): Promise<CatalogCategory | null> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("slug", slug)
    .eq("ativa", true)
    .maybeSingle();

  if (error || !data) return null;
  return toCategory(data as CategoriaRow);
}