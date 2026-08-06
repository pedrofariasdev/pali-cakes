import { supabase } from "@/lib/supabase";

export interface Avaliacao {
  id: string;
  criado_em: string;
  nome: string;
  email: string | null;
  localidade: string | null;
  classificacao: number;
  comentario: string;
  produto_slug: string | null;
  ocasiao: string | null;
  estado: "pendente" | "aprovada" | "rejeitada";
  aprovada_em: string | null;
}

export interface NovaAvaliacao {
  nome: string;
  email: string;
  localidade: string;
  classificacao: number;
  comentario: string;
  produtoSlug: string;
  ocasiao: string;
}

export type ResultadoAvaliacao =
  | { ok: true }
  | { ok: false; erro: string };

/** Avaliações aprovadas — usado no build para a home. */
export async function getAvaliacoesAprovadas(
  limite = 6
): Promise<Avaliacao[]> {
  const { data, error } = await supabase
    .from("avaliacoes")
    .select("*")
    .eq("estado", "aprovada")
    .order("aprovada_em", { ascending: false })
    .limit(limite);

  if (error) {
    console.error("[getAvaliacoesAprovadas]", error.message);
    return [];
  }

  return (data as Avaliacao[]) ?? [];
}

export async function enviarAvaliacao(
  dados: NovaAvaliacao
): Promise<ResultadoAvaliacao> {
  const { error } = await supabase.rpc("criar_avaliacao", {
    p_nome: dados.nome,
    p_email: dados.email || null,
    p_localidade: dados.localidade || null,
    p_classificacao: dados.classificacao,
    p_comentario: dados.comentario,
    p_produto_slug: dados.produtoSlug || null,
    p_ocasiao: dados.ocasiao || null
  });

  if (error) {
    console.error("[enviarAvaliacao]", error.message);

    if (error.message.includes("Demasiadas")) {
      return {
        ok: false,
        erro: "Recebemos muitas avaliações neste momento. Tente novamente daqui a pouco."
      };
    }

    if (error.message.includes("curto")) {
      return {
        ok: false,
        erro: "O comentário é demasiado curto. Conte-nos um pouco mais."
      };
    }

    return {
      ok: false,
      erro: "Não foi possível enviar a sua avaliação. Tente novamente."
    };
  }

  return { ok: true };
}