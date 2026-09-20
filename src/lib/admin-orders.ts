import { supabase } from "@/lib/supabase";
import type { Encomenda, EncomendaItem, EstadoEncomenda } from "@/types/database";

export interface EncomendaComItens extends Encomenda {
  itens: EncomendaItem[];
}

export async function listarEncomendas(): Promise<EncomendaComItens[]> {
  const { data, error } = await supabase
    .from("encomendas")
    .select("*, itens:encomenda_itens(*)")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("[listarEncomendas]", error.message);
    return [];
  }

  return (data as EncomendaComItens[]) ?? [];
}

export async function actualizarEstado(
  id: string,
  estado: EstadoEncomenda
): Promise<boolean> {
  const { error } = await supabase
    .from("encomendas")
    .update({ estado })
    .eq("id", id);

  if (error) {
    console.error("[actualizarEstado]", error.message);
    return false;
  }

  return true;
}

const REFERENCE_BUCKET = "encomendas-referencias";

/**
 * Gera links temporários (1 hora) para as fotos de referência que o
 * cliente enviou no checkout — o bucket é privado, por isso o admin
 * precisa de um URL assinado para as poder ver.
 */
export async function obterUrlsAssinadas(
  caminhos: string[]
): Promise<string[]> {
  if (caminhos.length === 0) {
    return [];
  }

  const { data, error } = await supabase.storage
    .from(REFERENCE_BUCKET)
    .createSignedUrls(caminhos, 3600);

  if (error) {
    console.error("[obterUrlsAssinadas]", error.message);
    return [];
  }

  return data
    .map((item) => item.signedUrl)
    .filter((url): url is string => typeof url === "string" && url !== "");
}