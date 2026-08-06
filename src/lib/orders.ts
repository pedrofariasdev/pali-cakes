import { supabase } from "@/lib/supabase";

export interface OrderItemInput {
  slug: string;
  nome: string;
  categoria: string;
  quantidade: number;
  preco: number | null;
}

export interface OrderInput {
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string;
  metodoEntrega: "levantamento" | "entrega";
  morada: string;
  codigoPostal: string;
  localidade: string;
  dataEvento: string;
  tipoCelebracao: string;
  observacoes: string;
  itens: OrderItemInput[];
}

export type OrderResult =
  | { ok: true; referencia: string }
  | { ok: false; erro: string };

export async function criarEncomenda(
  input: OrderInput
): Promise<OrderResult> {
  const { data, error } = await (supabase.rpc as any)("criar_encomenda", {
    p_cliente_nome: input.clienteNome,
    p_cliente_telefone: input.clienteTelefone,
    p_cliente_email: input.clienteEmail || null,
    p_metodo_entrega: input.metodoEntrega,
    p_morada: input.morada || null,
    p_codigo_postal: input.codigoPostal || null,
    p_localidade: input.localidade || null,
    p_data_evento: input.dataEvento || null,
    p_tipo_celebracao: input.tipoCelebracao || null,
    p_observacoes: input.observacoes || null,
    p_itens: input.itens
  });

  if (error) {
    console.error("[criarEncomenda]", error.message);
    return {
      ok: false,
      erro: "Não foi possível enviar a encomenda. Tente novamente ou contacte-nos directamente."
    };
  }

  return { ok: true, referencia: data as string };
}