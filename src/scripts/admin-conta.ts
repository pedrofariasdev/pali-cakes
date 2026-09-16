import { exigirSessao, sair, alterarPassword } from "@/lib/auth";

function mostrarEstado(
  elemento: HTMLElement,
  texto: string,
  erro: boolean
): void {
  elemento.textContent = texto;
  elemento.hidden = false;
  elemento.classList.toggle("is-error", erro);
  elemento.classList.toggle("is-success", !erro);
}

async function handlePasswordSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  const form = event.currentTarget;

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const status = form.querySelector<HTMLElement>(
    "[data-password-status]"
  );

  const submitButton = form.querySelector<HTMLButtonElement>(
    "[data-password-submit]"
  );

  if (!status || !submitButton) {
    return;
  }

  const formData = new FormData(form);
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (password.length < 8) {
    mostrarEstado(
      status,
      "A palavra-passe deve ter pelo menos 8 caracteres.",
      true
    );
    return;
  }

  if (password !== passwordConfirm) {
    mostrarEstado(status, "As palavras-passe não coincidem.", true);
    return;
  }

  submitButton.disabled = true;
  mostrarEstado(status, "A guardar…", false);

  const resultado = await alterarPassword(password);

  submitButton.disabled = false;

  if (!resultado.ok) {
    mostrarEstado(status, resultado.erro, true);
    return;
  }

  form.reset();
  mostrarEstado(status, "Palavra-passe alterada com sucesso ✓", false);
}

async function iniciar(): Promise<void> {
  const form = document.querySelector<HTMLFormElement>(
    "[data-password-form]"
  );

  if (!form) {
    return;
  }

  const autorizado = await exigirSessao();
  if (!autorizado) return;

  document.querySelector("[data-logout]")?.addEventListener("click", sair);

  if (form.dataset.passwordBound !== "true") {
    form.dataset.passwordBound = "true";
    form.addEventListener("submit", handlePasswordSubmit);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar, { once: true });
} else {
  iniciar();
}
