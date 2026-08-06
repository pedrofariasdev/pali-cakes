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
    estado.textContent =
      "Obrigado por partilhar a sua experiência. A avaliação será publicada após revisão.";
    estado.className = "reviews-form__status is-success";
    estado.hidden = false;
  }

  form
    .querySelectorAll<HTMLElement>(".reviews-form__grid, .reviews-form__rating, .form-field")
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