import { supabase } from "@/lib/supabase";

export interface ZonaEntrega {
  id: string;
  nome: string;
  prefixos: string[];
  distancia_max: number;
  preco: number;
  ativa: boolean;
  ordem: number;
}

export interface ResultadoEntrega {
  encontrada: boolean;
  zona?: string;
  preco?: number;
}

let cacheZonas: ZonaEntrega[] | null = null;

async function obterZonas(): Promise<ZonaEntrega[]> {
  if (cacheZonas) return cacheZonas;

  const { data, error } = await supabase
    .from("zonas_entrega")
    .select("*")
    .eq("ativa", true)
    .order("ordem");

  if (error) {
    console.error("[obterZonas]", error.message);
    return [];
  }

  cacheZonas = (data as ZonaEntrega[]) ?? [];
  return cacheZonas;
}

/** Extrai os 4 primeiros dígitos de um código postal português. */
export function extrairPrefixo(codigoPostal: string): string | null {
  const digitos = codigoPostal.replace(/\D/g, "");
  return digitos.length >= 4 ? digitos.slice(0, 4) : null;
}

export async function calcularEntrega(
  codigoPostal: string
): Promise<ResultadoEntrega> {
  const prefixo = extrairPrefixo(codigoPostal);

  if (!prefixo) return { encontrada: false };

  const zonas = await obterZonas();
  const zona = zonas.find((z) => z.prefixos.includes(prefixo));

  if (!zona) return { encontrada: false };

  return {
    encontrada: true,
    zona: zona.nome,
    preco: Number(zona.preco)
  };
}