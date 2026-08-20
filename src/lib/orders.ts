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
  horarioPreferido: string;
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
    p_itens: input.itens,
    p_horario_preferido: input.horarioPreferido || null
  });

  if (error) {
    console.error("[criarEncomenda]", error.message);
    return {
      ok: false,
      erro: "Não foi possível enviar a encomenda. Tente novamente ou contacte-nos directamente."
    };
  }

  const referencia = data as string;

  // Aviso por email é "melhor esforço": a encomenda já está gravada,
  // por isso uma falha aqui não deve impedir a confirmação ao cliente.
  notificarEncomendaNova(referencia, input).catch((notificationError) => {
    console.error("[notificarEncomendaNova]", notificationError);
  });

  return { ok: true, referencia };
}

async function notificarEncomendaNova(
  referencia: string,
  input: OrderInput
): Promise<void> {
  const { error } = await supabase.functions.invoke("order-notification", {
    body: {
      referencia,
      clienteNome: input.clienteNome,
      clienteTelefone: input.clienteTelefone,
      clienteEmail: input.clienteEmail,
      metodoEntrega: input.metodoEntrega,
      morada: input.morada,
      codigoPostal: input.codigoPostal,
      localidade: input.localidade,
      dataEvento: input.dataEvento,
      tipoCelebracao: input.tipoCelebracao,
      observacoes: input.observacoes,
      horarioPreferido: input.horarioPreferido,
      itens: input.itens
    }
  });

  if (error) {
    console.error("[notificarEncomendaNova]", error.message);
  }
}