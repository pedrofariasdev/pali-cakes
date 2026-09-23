/**
 * Tamanhos com preço e mínimo próprios (ex.: brownie Mini / Normal /
 * Inteiro). Ao escolher um tamanho, mudam o preço mostrado, o preço que vai
 * para o carrinho e a quantidade mínima (o seletor salta para esse mínimo).
 */

const euro = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR"
});

function seleccionarTamanho(
  opcao: HTMLButtonElement,
  opcoes: HTMLButtonElement[]
): void {
  opcoes.forEach((outra) => {
    const seleccionada = outra === opcao;
    outra.classList.toggle("is-selected", seleccionada);
    outra.setAttribute("aria-pressed", seleccionada ? "true" : "false");
  });

  const nome = opcao.dataset.sizeName ?? "";
  const precoTexto = opcao.dataset.sizePrice ?? "";
  const preco = precoTexto.trim() !== "" ? Number(precoTexto) : null;
  const minimo = Math.max(1, Math.trunc(Number(opcao.dataset.sizeMin) || 1));

  const precoMostrado = document.querySelector<HTMLElement>("[data-price-display]");
  if (precoMostrado) {
    precoMostrado.textContent =
      preco !== null && Number.isFinite(preco)
        ? euro.format(preco)
        : precoMostrado.dataset.priceLabel || "Sob consulta";
  }

  const addToCartButton = document.querySelector<HTMLButtonElement>("[data-add-to-cart]");
  if (addToCartButton) {
    addToCartButton.dataset.productSize = nome;
    addToCartButton.dataset.productPrice =
      preco !== null && Number.isFinite(preco) ? String(preco) : "";
  }

  // Foto do tamanho (se tiver): troca a foto principal e a do carrinho.
  const imagem = opcao.dataset.sizeImage ?? "";
  if (imagem) {
    const fotoPrincipal = document.querySelector<HTMLImageElement>(
      "[data-product-image-display]"
    );

    if (fotoPrincipal) {
      fotoPrincipal.src = imagem;
      fotoPrincipal.alt = nome || fotoPrincipal.alt;
    }

    if (addToCartButton) {
      addToCartButton.dataset.productImage = imagem;
    }
  }

  // A quantidade volta ao mínimo do tamanho escolhido.
  const quantidade = document.querySelector<HTMLInputElement>("[data-quantity-input]");
  if (quantidade) {
    quantidade.min = String(minimo);
    quantidade.value = String(minimo);
    quantidade.dispatchEvent(new Event("change"));
  }
}

function bindSizeSelectors(): void {
  const grupo = document.querySelector<HTMLElement>("[data-size-group]");
  if (!grupo || grupo.dataset.sizeBound === "true") return;

  grupo.dataset.sizeBound = "true";

  const opcoes = Array.from(
    grupo.querySelectorAll<HTMLButtonElement>("[data-size-option]")
  );

  opcoes.forEach((opcao) => {
    opcao.addEventListener("click", () => seleccionarTamanho(opcao, opcoes));
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindSizeSelectors, { once: true });
} else {
  bindSizeSelectors();
}

document.addEventListener("astro:page-load", bindSizeSelectors);
