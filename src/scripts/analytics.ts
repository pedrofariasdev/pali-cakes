/**
 * Google Analytics (GA4) com consentimento prévio.
 *
 * - Nada é carregado nem nenhum cookie é criado antes de o visitante
 *   clicar em "Aceitar".
 * - A escolha fica guardada no navegador; "Preferências de cookies" no
 *   rodapé volta a mostrar o aviso para mudar de ideias.
 * - Ao recusar depois de ter aceitado, o Analytics é desligado e os
 *   cookies _ga apagados.
 */

const GA_ID = "G-2QYF0K5W24";
const CHAVE_CONSENTIMENTO = "pali-cookies";

type Escolha = "aceite" | "recusado";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function lerEscolha(): Escolha | null {
  try {
    const valor = localStorage.getItem(CHAVE_CONSENTIMENTO);
    return valor === "aceite" || valor === "recusado" ? valor : null;
  } catch {
    return null;
  }
}

function guardarEscolha(escolha: Escolha): void {
  try {
    localStorage.setItem(CHAVE_CONSENTIMENTO, escolha);
  } catch {
    // Sem armazenamento disponível: a escolha vale só para esta página.
  }
}

let analyticsCarregado = false;

function carregarAnalytics(): void {
  if (analyticsCarregado) {
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    return;
  }

  analyticsCarregado = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.append(script);
}

function apagarCookiesAnalytics(): void {
  const dominios = ["", location.hostname, `.${location.hostname.replace(/^www\./, "")}`];

  document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((nome) => nome === "_ga" || nome.startsWith("_ga_") || nome === "_gid")
    .forEach((nome) => {
      dominios.forEach((dominio) => {
        document.cookie =
          `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` +
          (dominio ? `; domain=${dominio}` : "");
      });
    });
}

function desligarAnalytics(): void {
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  apagarCookiesAnalytics();
}

function mostrarAviso(visivel: boolean): void {
  const aviso = document.querySelector<HTMLElement>("[data-cookie-banner]");
  if (aviso) aviso.hidden = !visivel;
}

function iniciar(): void {
  const aviso = document.querySelector<HTMLElement>("[data-cookie-banner]");

  // Páginas sem aviso (ex.: admin) não carregam o Analytics.
  if (!aviso) return;

  if (aviso.dataset.cookieBound !== "true") {
    aviso.dataset.cookieBound = "true";

    aviso.querySelector("[data-cookie-accept]")?.addEventListener("click", () => {
      guardarEscolha("aceite");
      mostrarAviso(false);
      carregarAnalytics();
    });

    aviso.querySelector("[data-cookie-reject]")?.addEventListener("click", () => {
      guardarEscolha("recusado");
      mostrarAviso(false);
      desligarAnalytics();
    });
  }

  document.querySelectorAll<HTMLButtonElement>("[data-cookie-preferences]").forEach((botao) => {
    if (botao.dataset.cookieBound === "true") return;
    botao.dataset.cookieBound = "true";
    botao.addEventListener("click", () => mostrarAviso(true));
  });

  const escolha = lerEscolha();

  if (escolha === "aceite") {
    carregarAnalytics();
  } else if (escolha === null) {
    mostrarAviso(true);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar, { once: true });
} else {
  iniciar();
}

export {};
