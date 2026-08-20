// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const CONTACT_TO_EMAIL = "geral@palicakes.pt";
// Cópia para o email pessoal da Bruna, além do geral@palicakes.pt.
const CONTACT_CC_EMAIL = "brunapaliotes@hotmail.com";
const CONTACT_FROM_EMAIL = "Pali Cakes <contacto@palicakes.pt>";

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

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

// This endpoint uses 'publishable' access — chamado directamente pelo
// formulário de contactos do site com a chave pública do Supabase.
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Método não permitido." }, 405);
    }

    let payload: ContactPayload;

    try {
      payload = await req.json();
    } catch {
      return jsonResponse({ error: "Pedido inválido." }, 400);
    }

    const name = (payload.name ?? "").trim();
    const email = (payload.email ?? "").trim();
    const phone = (payload.phone ?? "").trim();
    const message = (payload.message ?? "").trim();

    if (!name || !email || !message) {
      return jsonResponse(
        { error: "Preencha nome, email e mensagem." },
        400
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return jsonResponse({ error: "Indique um email válido." }, 400);
    }

    if (!RESEND_API_KEY) {
      console.error("[contact-form] RESEND_API_KEY não configurada.");
      return jsonResponse(
        {
          error:
            "Não foi possível enviar a mensagem. Tente novamente mais tarde."
        },
        500
      );
    }

    const html = `
      <h2>Nova mensagem do formulário de contacto</h2>
      <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${phone ? `<p><strong>Telefone:</strong> ${escapeHtml(phone)}</p>` : ""}
      <p><strong>Mensagem:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        cc: [CONTACT_CC_EMAIL],
        reply_to: email,
        subject: `Nova mensagem de contacto — ${name}`,
        html
      })
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error(
        "[contact-form] Resend error",
        resendResponse.status,
        errorBody
      );

      return jsonResponse(
        {
          error:
            "Não foi possível enviar a mensagem. Tente novamente mais tarde."
        },
        502
      );
    }

    return jsonResponse({ ok: true });
  })
};

/* Para testar localmente:

  1. Run `supabase start`
  2. Fazer um pedido HTTP:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/contact-form' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Teste","email":"teste@example.com","message":"Olá!"}'

*/
