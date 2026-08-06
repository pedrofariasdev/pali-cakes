import { supabase } from "@/lib/supabase";
import type { Avaliacao } from "@/lib/reviews";

export async function listarAvaliacoesAdmin(): Promise<Avaliacao[]> {
  const { data, error } = await supabase
    .from("avaliacoes")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("[listarAvaliacoesAdmin]", error.message);
    return [];
  }

  return (data as Avaliacao[]) ?? [];
}

export async function moderarAvaliacao(
  id: string,
  estado: "aprovada" | "rejeitada" | "pendente"
): Promise<boolean> {
  const campos: Record<string, unknown> = { estado };

  campos.aprovada_em = estado === "aprovada" ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("avaliacoes")
    .update(campos as never)
    .eq("id", id);

  if (error) {
    console.error("[moderarAvaliacao]", error.message);
    return false;
  }

  return true;
}

export async function apagarAvaliacao(id: string): Promise<boolean> {
  const { error } = await supabase.from("avaliacoes").delete().eq("id", id);

  if (error) {
    console.error("[apagarAvaliacao]", error.message);
    return false;
  }

  return true;
}