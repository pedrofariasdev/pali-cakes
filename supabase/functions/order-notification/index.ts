// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFICATION_TO_EMAIL = "geral@palicakes.pt";
// Cópia para o email pessoal da Bruna, além do geral@palicakes.pt.
const NOTIFICATION_CC_EMAIL = "brunapaliotes@hotmail.com";
const NOTIFICATION_FROM_EMAIL = "Pali Cakes <contacto@palicakes.pt>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

function escapeHtml(value: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  return value.replace(/[&<>"']/g, (char) => map[char] ?? char);
}

interface OrderItemPayload {
  nome?: string;
  quantidade?: number;
  preco?: number | null;
}

interface OrderNotificationPayload {
  referencia?: string;
  clienteNome?: string;
  clienteTelefone?: string;
  clienteEmail?: string;
  metodoEntrega?: string;
  morada?: string;
  codigoPostal?: string;
  localidade?: string;
  dataEvento?: string;
  tipoCelebracao?: string;
  observacoes?: string;
  horarioPreferido?: string;
  itens?: OrderItemPayload[];
}

const currencyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR"
});

function formatPreco(preco: number | null | undefined): string {
  return typeof preco === "number"
    ? currencyFormatter.format(preco)
    : "Sob consulta";
}

// Chamado pelo site imediatamente após uma encomenda ser gravada com
// sucesso, para avisar a Pali Cakes por email de que há uma encomenda nova.
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Método não permitido." }, 405);
    }

    let payload: OrderNotificationPayload;

    try {
      payload = await req.json();
    } catch {
      return jsonResponse({ error: "Pedido inválido." }, 400);
    }

    const referencia = (payload.referencia ?? "").trim();

    if (!referencia) {
      return jsonResponse({ error: "Referência em falta." }, 400);
    }

    if (!RESEND_API_KEY) {
      console.error("[order-notification] RESEND_API_KEY não configurada.");
      return jsonResponse({ error: "Serviço de email não configurado." }, 500);
    }

    const clienteNome = (payload.clienteNome ?? "").trim();
    const clienteTelefone = (payload.clienteTelefone ?? "").trim();
    const clienteEmail = (payload.clienteEmail ?? "").trim();
    const metodoEntrega =
      payload.metodoEntrega === "entrega" ? "Entrega" : "Levantamento";
    const morada = (payload.morada ?? "").trim();
    const codigoPostal = (payload.codigoPostal ?? "").trim();
    const localidade = (payload.localidade ?? "").trim();
    const dataEvento = (payload.dataEvento ?? "").trim();
    const tipoCelebracao = (payload.tipoCelebracao ?? "").trim();
    const observacoes = (payload.observacoes ?? "").trim();
    const horarioPreferido = (payload.horarioPreferido ?? "").trim();
    const itens = Array.isArray(payload.itens) ? payload.itens : [];

    const itensHtml = itens
      .map((item) => {
        const nome = escapeHtml(item.nome ?? "Produto");
        const quantidade = item.quantidade ?? 1;
        const preco = formatPreco(item.preco);

        return `<li>${quantidade} × ${nome} — ${preco}</li>`;
      })
      .join("");

    const enderecoHtml =
      metodoEntrega === "Entrega"
        ? `<p><strong>Morada:</strong> ${escapeHtml(morada)}, ${escapeHtml(codigoPostal)} ${escapeHtml(localidade)}</p>`
        : "";

    const html = `
      <h2>Nova encomenda recebida — ${escapeHtml(referencia)}</h2>
      <p><strong>Cliente:</strong> ${escapeHtml(clienteNome)}</p>
      <p><strong>Telefone:</strong> ${escapeHtml(clienteTelefone)}</p>
      ${clienteEmail ? `<p><strong>Email:</strong> ${escapeHtml(clienteEmail)}</p>` : ""}
      <p><strong>Data do evento:</strong> ${escapeHtml(dataEvento)}</p>
      ${tipoCelebracao ? `<p><strong>Tipo de celebração:</strong> ${escapeHtml(tipoCelebracao)}</p>` : ""}
      <p><strong>Receção:</strong> ${metodoEntrega}</p>
      ${enderecoHtml}
      ${horarioPreferido ? `<p><strong>Horário preferido:</strong> ${escapeHtml(horarioPreferido)}</p>` : ""}
      <p><strong>Itens:</strong></p>
      <ul>${itensHtml}</ul>
      ${observacoes ? `<p><strong>Observações:</strong><br>${escapeHtml(observacoes).replace(/\n/g, "<br>")}</p>` : ""}
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: NOTIFICATION_FROM_EMAIL,
        to: [NOTIFICATION_TO_EMAIL],
        cc: [NOTIFICATION_CC_EMAIL],
        reply_to: clienteEmail || undefined,
        subject: `Nova encomenda — ${referencia}`,
        html
      })
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error(
        "[order-notification] Resend error",
        resendResponse.status,
        errorBody
      );

      return jsonResponse({ error: "Não foi possível enviar o aviso." }, 502);
    }

    return jsonResponse({ ok: true });
  })
};

/* Para testar localmente:

  1. Run `supabase start`
  2. Fazer um pedido HTTP:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/order-notification' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --header 'Content-Type: application/json' \
    --data '{"referencia":"PC-0001","clienteNome":"Teste","clienteTelefone":"912345678","dataEvento":"2026-09-01","itens":[{"nome":"Bolo","quantidade":1,"preco":null}]}'

*/
