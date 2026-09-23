import { enviarAvaliacao } from "@/lib/reviews";

function lerTexto(dados: FormData, campo: string): string {
  const valor = dados.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

async function tratarSubmit(evento: SubmitEvent): Promise<void> {
  evento.preventDefault();

  const form = evento.currentTarget;
  if (!(form instanceof HTMLFormElement)) return;

  const botao = form.querySelector<HTMLButtonElement>("[data-review-submit]");
  const estado = form.querySelector<HTMLElement>("[data-review-status]");

  if (!form.reportValidity()) return;

  const dados = new FormData(form);

  if (botao) {
    botao.disabled = true;
    botao.textContent = "A enviar…";
  }

  const resultado = await enviarAvaliacao({
    nome: lerTexto(dados, "nome"),
    email: lerTexto(dados, "email"),
    localidade: lerTexto(dados, "localidade"),
    classificacao: Number(dados.get("classificacao") ?? 0),
    comentario: lerTexto(dados, "comentario"),
    produtoSlug: "",
    ocasiao: lerTexto(dados, "ocasiao")
  });

  if (!resultado.ok) {
    if (botao) {
      botao.disabled = false;
      botao.textContent = "Enviar avaliação";
    }

    if (estado) {
      estado.textContent = resultado.erro;
      estado.className = "reviews-form__status is-error";
      estado.hidden = false;
    }

    return;
  }

  form.reset();

  if (botao) {
    botao.textContent = "Avaliação enviada ✓";
  }

  if (estado) {
    estado.replaceChildren();

    const agradecimento = document.createElement("p");
    agradecimento.textContent = resultado.publicada
      ? "Obrigado por partilhar a sua experiência! A sua avaliação vai aparecer no site em breve."
      : "Obrigado por partilhar a sua experiência. A avaliação será publicada após revisão.";
    estado.append(agradecimento);

    if (resultado.cupao) {
      const cupao = document.createElement("div");
      cupao.className = "reviews-coupon";

      const titulo = document.createElement("span");
      titulo.className = "reviews-coupon__label";
      titulo.textContent = "Como agradecimento, aqui está o seu cupão de 6% de desconto:";

      const codigo = document.createElement("strong");
      codigo.className = "reviews-coupon__code";
      codigo.textContent = resultado.cupao;

      const nota = document.createElement("small");
      nota.textContent =
        "Guarde este código: é válido para uma encomenda, durante 1 ano. Ao finalizar a encomenda, escreva-o no campo \"Cupão de desconto\" e use o mesmo email desta avaliação.";

      cupao.append(titulo, codigo, nota);
      estado.append(cupao);
    }

    estado.className = "reviews-form__status is-success";
    estado.hidden = false;
  }

  form
    .querySelectorAll<HTMLElement>(
      ".reviews-form__grid, .reviews-form__rating, .form-field, .reviews-consent"
    )
    .forEach((bloco) => {
      bloco.hidden = true;
    });
}

function iniciar(): void {
  const form = document.querySelector<HTMLFormElement>("[data-review-form]");
  if (!form) return;

  if (form.dataset.reviewBound !== "true") {
    form.dataset.reviewBound = "true";
    form.addEventListener("submit", tratarSubmit);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar, { once: true });
} else {
  iniciar();
}
