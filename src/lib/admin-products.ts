import { supabase } from "@/lib/supabase";
import type { Produto, Categoria } from "@/types/database";

const BUCKET = "produtos";

/** Todos os produtos, incluindo inativos (só admin vê). */
export async function listarProdutosAdmin(): Promise<Produto[]> {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .order("categoria_slug")
    .order("ordem");

  if (error) {
    console.error("[listarProdutosAdmin]", error.message);
    return [];
  }

  return (data as Produto[]) ?? [];
}

export async function listarCategoriasAdmin(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("ordem");

  if (error) {
    console.error("[listarCategoriasAdmin]", error.message);
    return [];
  }

  return (data as Categoria[]) ?? [];
}

export interface ProdutoEdicao {
  nome: string;
  descricao: string;
  preco: number | null;
  preco_label: string;
  imagem_url: string;
  destaque: boolean;
  ativo: boolean;
  ordem: number;
}

export async function actualizarProduto(
  id: string,
  campos: Partial<ProdutoEdicao>
): Promise<boolean> {
  const { error } = await supabase
    .from("produtos")
    .update(campos)
    .eq("id", id);

  if (error) {
    console.error("[actualizarProduto]", error.message);
    return false;
  }

  return true;
}

/**
 * Carrega uma imagem para o Storage e devolve o URL público.
 * O nome do ficheiro inclui timestamp para evitar cache antiga.
 */
export async function carregarImagem(
  ficheiro: File,
  slug: string
): Promise<string | null> {
  const extensao = ficheiro.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const caminho = `${slug}-${Date.now()}.${extensao}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, ficheiro, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    console.error("[carregarImagem]", error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho);

  return data.publicUrl;
}