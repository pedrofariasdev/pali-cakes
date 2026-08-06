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