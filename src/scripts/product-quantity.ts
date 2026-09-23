/**
 * Seletor de quantidade na página do produto. Começa na quantidade mínima
 * do produto e não deixa descer abaixo dela; o valor escolhido vai para o
 * botão "Adicionar à encomenda".
 */

const QUANTIDADE_MAXIMA = 99;

function bindQuantityPicker(): void {
  const picker = document.querySelector<HTMLElement>("[data-quantity-picker]");
  if (!picker || picker.dataset.quantityBound === "true") return;

  picker.dataset.quantityBound = "true";

  const input = picker.querySelector<HTMLInputElement>("[data-quantity-input]");
  const diminuir = picker.querySelector<HTMLButtonElement>("[data-quantity-decrease]");
  const aumentar = picker.querySelector<HTMLButtonElement>("[data-quantity-increase]");
  const addToCartButton = document.querySelector<HTMLButtonElement>("[data-add-to-cart]");

  if (!input) return;

  const minimo = Math.max(1, Math.trunc(Number(input.min) || 1));

  const aplicar = (valor: number): void => {
    const quantidade = Math.min(
      QUANTIDADE_MAXIMA,
      Math.max(minimo, Number.isFinite(valor) ? Math.trunc(valor) : minimo)
    );

    input.value = String(quantidade);

    if (diminuir) diminuir.disabled = quantidade <= minimo;
    if (aumentar) aumentar.disabled = quantidade >= QUANTIDADE_MAXIMA;

    if (addToCartButton) {
      addToCartButton.dataset.productQuantity = String(quantidade);
    }
  };

  diminuir?.addEventListener("click", () => aplicar(Number(input.value) - 1));
  aumentar?.addEventListener("click", () => aplicar(Number(input.value) + 1));
  input.addEventListener("change", () => aplicar(Number(input.value)));

  aplicar(Number(input.value));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindQuantityPicker, { once: true });
} else {
  bindQuantityPicker();
}

document.addEventListener("astro:page-load", bindQuantityPicker);
