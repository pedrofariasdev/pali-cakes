const menuButton =
  document.querySelector<HTMLButtonElement>("[data-menu-toggle]");

const mobileMenu =
  document.querySelector<HTMLElement>("#mobile-menu");

function closeMenu(): void {
  if (!menuButton || !mobileMenu) return;

  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");

  mobileMenu.setAttribute("aria-hidden", "true");

  document.body.classList.remove("menu-is-open");
}

function openMenu(): void {
  if (!menuButton || !mobileMenu) return;

  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Fechar menu");

  mobileMenu.setAttribute("aria-hidden", "false");

  document.body.classList.add("menu-is-open");
}

menuButton?.addEventListener("click", () => {
  const isOpen =
    menuButton.getAttribute("aria-expanded") === "true";

  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

mobileMenu
  ?.querySelectorAll<HTMLAnchorElement>("a")
  .forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    closeMenu();
  }
});