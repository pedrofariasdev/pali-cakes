const menuButton =
  document.querySelector<HTMLButtonElement>("[data-menu-toggle]");

const mobileMenu =
  document.querySelector<HTMLElement>("#mobile-menu");

let focoAnterior: HTMLElement | null = null;

const selectorFoco =
  'a[href], button:not([disabled]), summary, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function elementosFocaveis(): HTMLElement[] {
  if (!mobileMenu || !menuButton) return [];

  return [menuButton, ...mobileMenu.querySelectorAll<HTMLElement>(selectorFoco)]
    .filter((elemento) => elemento.getClientRects().length > 0);
}

function closeMenu(restaurarFoco = true): void {
  if (!menuButton || !mobileMenu) return;

  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");

  mobileMenu.setAttribute("aria-hidden", "true");
  mobileMenu.inert = true;

  document.body.classList.remove("menu-is-open");

  if (restaurarFoco) {
    (focoAnterior ?? menuButton).focus();
  }
}

function openMenu(): void {
  if (!menuButton || !mobileMenu) return;

  focoAnterior = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : menuButton;

  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Fechar menu");

  mobileMenu.setAttribute("aria-hidden", "false");
  mobileMenu.inert = false;

  document.body.classList.add("menu-is-open");

  requestAnimationFrame(() => {
    mobileMenu.querySelector<HTMLElement>(selectorFoco)?.focus();
  });
}

menuButton?.addEventListener("click", () => {
  const isOpen =
    menuButton.getAttribute("aria-expanded") === "true";

  if (isOpen) {
    closeMenu(true);
  } else {
    openMenu();
  }
});

mobileMenu
  ?.querySelectorAll<HTMLAnchorElement>("a")
  .forEach((link) => {
    link.addEventListener("click", () => closeMenu(false));
  });

document.addEventListener("keydown", (event) => {
  if (menuButton?.getAttribute("aria-expanded") !== "true") return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu(true);
    return;
  }

  if (event.key !== "Tab") return;

  const focaveis = elementosFocaveis();
  if (focaveis.length === 0) return;

  const primeiro = focaveis[0];
  const ultimo = focaveis[focaveis.length - 1];

  if (event.shiftKey && document.activeElement === primeiro) {
    event.preventDefault();
    ultimo.focus();
  } else if (!event.shiftKey && document.activeElement === ultimo) {
    event.preventDefault();
    primeiro.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    closeMenu(false);
  }
});
