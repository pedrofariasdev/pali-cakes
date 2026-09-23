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
  /** Cupão de desconto atribuído a quem avaliou (só visível no admin). */
  cupao: string | null;
}

export type AvaliacaoPublica = Omit<Avaliacao, "email" | "cupao">;

const COLUNAS_PUBLICAS_AVALIACAO =
  "id,criado_em,nome,localidade,classificacao,comentario,produto_slug,ocasiao,estado,aprovada_em" as const;

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
  | { ok: true; cupao: string | null; validoAte: string | null; publicada: boolean }
  | { ok: false; erro: string };

/** Avaliações aprovadas — usado no build para a home. */
export async function getAvaliacoesAprovadas(
  limite = 6
): Promise<AvaliacaoPublica[]> {
  const { data, error } = await supabase
    .from("avaliacoes")
    .select(COLUNAS_PUBLICAS_AVALIACAO)
    .eq("estado", "aprovada")
    .order("aprovada_em", { ascending: false })
    .limit(limite);

  if (error) {
    console.error("[getAvaliacoesAprovadas]", error.message);
    return [];
  }

  return (data as AvaliacaoPublica[]) ?? [];
}

export async function enviarAvaliacao(
  dados: NovaAvaliacao
): Promise<ResultadoAvaliacao> {
  const { data, error } = await supabase.rpc("criar_avaliacao_com_cupao", {
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

  const resposta = (data ?? {}) as {
    cupao?: unknown;
    valido_ate?: unknown;
    publicada?: unknown;
  };

  return {
    ok: true,
    cupao:
      typeof resposta.cupao === "string" && resposta.cupao.trim() !== ""
        ? resposta.cupao
        : null,
    validoAte: typeof resposta.valido_ate === "string" ? resposta.valido_ate : null,
    publicada: resposta.publicada === true
  };
}
