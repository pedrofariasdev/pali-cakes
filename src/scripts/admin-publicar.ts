import { publicarSite } from "@/lib/publish";

function ligarBotao(): void {
  const botao = document.querySelector<HTMLButtonElement>("[data-publicar]");
  const estado = document.querySelector<HTMLElement>("[data-publicar-estado]");

  if (!botao || botao.dataset.publicarBound === "true") return;

  botao.dataset.publicarBound = "true";

  botao.addEventListener("click", async () => {
    const textoOriginal = botao.textContent;

    botao.disabled = true;
    botao.textContent = "A publicar…";

    if (estado) {
      estado.textContent = "";
      estado.hidden = true;
    }

    const resultado = await publicarSite();

    if (!resultado.ok) {
      botao.disabled = false;
      botao.textContent = textoOriginal ?? "Publicar alterações";

      if (estado) {
        estado.textContent = resultado.erro;
        estado.className = "admin-publish__status is-error";
        estado.hidden = false;
      }

      return;
    }

    botao.textContent = "Publicação iniciada ✓";

    if (estado) {
      estado.textContent =
        "As alterações estarão visíveis no site dentro de 2 a 3 minutos.";
      estado.className = "admin-publish__status is-success";
      estado.hidden = false;
    }

    // Permitir nova publicação passado um minuto
    window.setTimeout(() => {
      botao.disabled = false;
      botao.textContent = textoOriginal ?? "Publicar alterações";
    }, 60_000);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ligarBotao, { once: true });
} else {
  ligarBotao();
}