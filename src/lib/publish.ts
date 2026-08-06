import { supabase } from "@/lib/supabase";

export type ResultadoPublicacao =
  | { ok: true }
  | { ok: false; erro: string };

export async function publicarSite(): Promise<ResultadoPublicacao> {
  const { data, error } = await supabase.functions.invoke("publicar-site");

  if (error) {
    console.error("[publicarSite]", error.message);
    return {
      ok: false,
      erro: "Não foi possível iniciar a publicação. Tente novamente."
    };
  }

  if (data?.erro) {
    return { ok: false, erro: data.erro };
  }

  return { ok: true };
}