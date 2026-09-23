import { supabase } from "@/lib/supabase";
import type { Produto, Categoria, OpcoesProduto } from "@/types/database";

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
  /** Fotos extra da galeria (a principal continua em imagem_url). */
  imagens: string[];
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  opcoes: OpcoesProduto;
  quantidade_minima: number;
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

export interface ProdutoNovo extends ProdutoEdicao {
  slug: string;
  categoria_slug: string;
  imagens: string[];
}

/** Cria um novo produto. Devolve a linha criada (com o id gerado) ou null em caso de erro. */
export async function criarProduto(
  campos: ProdutoNovo
): Promise<Produto | null> {
  const { data, error } = await supabase
    .from("produtos")
    .insert(campos)
    .select()
    .single();

  if (error) {
    console.error("[criarProduto]", error.message);
    return null;
  }

  return data as Produto;
}

/** Elimina um produto de forma permanente. */
export async function eliminarProduto(id: string): Promise<boolean> {
  const { error } = await supabase.from("produtos").delete().eq("id", id);

  if (error) {
    console.error("[eliminarProduto]", error.message);
    return false;
  }

  return true;
}

/** Tamanho máximo aceite antes da compressão (fotos de telemóvel são grandes). */
export const TAMANHO_MAXIMO_FOTO = 20 * 1024 * 1024;

const LADO_MAXIMO = 1800;
const QUALIDADE_JPEG = 0.85;

/**
 * Reduz fotos grandes para no máximo 1800px no lado maior, em JPEG. Fotos de
 * telemóvel com vários MB ficam com poucas centenas de KB — o upload é mais
 * rápido e o site carrega mais depressa. Se algo falhar, usa o original.
 */
async function comprimirImagem(ficheiro: File): Promise<File> {
  if (!ficheiro.type.startsWith("image/") || ficheiro.type === "image/gif") {
    return ficheiro;
  }

  try {
    const bitmap = await createImageBitmap(ficheiro);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));

    if (escala === 1 && ficheiro.size <= 1_500_000) {
      bitmap.close();
      return ficheiro;
    }

    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;

    const contexto = canvas.getContext("2d");
    if (!contexto) {
      bitmap.close();
      return ficheiro;
    }

    // Fundo branco para PNGs com transparência (o JPEG não tem transparência).
    contexto.fillStyle = "#ffffff";
    contexto.fillRect(0, 0, largura, altura);
    contexto.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolver) =>
      canvas.toBlob(resolver, "image/jpeg", QUALIDADE_JPEG)
    );

    if (!blob || blob.size >= ficheiro.size) {
      return ficheiro;
    }

    const nomeBase = ficheiro.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${nomeBase}.jpg`, { type: "image/jpeg" });
  } catch (erro) {
    console.warn("[comprimirImagem] a usar o ficheiro original", erro);
    return ficheiro;
  }
}

/**
 * Carrega uma imagem para o Storage e devolve o URL público.
 * O nome do ficheiro inclui timestamp para evitar cache antiga.
 */
export async function carregarImagem(
  ficheiroOriginal: File,
  slug: string
): Promise<string | null> {
  const ficheiro = await comprimirImagem(ficheiroOriginal);
  const extensao = ficheiro.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const sufixo = Math.random().toString(36).slice(2, 6);
  const caminho = `${slug}-${Date.now()}-${sufixo}.${extensao}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, ficheiro, {
      cacheControl: "3600",
      contentType: ficheiro.type || undefined,
      upsert: false
    });

  if (error) {
    console.error("[carregarImagem]", error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho);

  return data.publicUrl;
}