import { entrar, obterSessao } from "@/lib/auth";

async function redirecionarSeAutenticado(): Promise<void> {
  const sessao = await obterSessao();

  if (sessao) {
    window.location.replace("/admin/encomendas");
  }
}

async function tratarSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  const form = event.currentTarget;

  if (!(form instanceof HTMLFormElement)) return;

  const botao = form.querySelector<HTMLButtonElement>("[data-login-submit]");
  const erro = form.querySelector<HTMLElement>("[data-login-error]");

  if (!form.reportValidity()) return;

  const dados = new FormData(form);
  const email = String(dados.get("email") ?? "").trim();
  const password = String(dados.get("password") ?? "");

  if (botao) {
    botao.disabled = true;
    botao.textContent = "A entrar…";
  }

  if (erro) erro.hidden = true;

  const resultado = await entrar(email, password);

  if (!resultado.ok) {
    if (botao) {
      botao.disabled = false;
      botao.textContent = "Entrar";
    }

    if (erro) {
      erro.textContent = resultado.erro;
      erro.hidden = false;
    }

    return;
  }

  window.location.replace("/admin/encomendas");
}

function iniciar(): void {
  const form = document.querySelector<HTMLFormElement>("[data-login-form]");

  if (!form) return;

  redirecionarSeAutenticado();

  if (form.dataset.loginBound !== "true") {
    form.dataset.loginBound = "true";
    form.addEventListener("submit", tratarSubmit);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar, { once: true });
} else {
  iniciar();
}
