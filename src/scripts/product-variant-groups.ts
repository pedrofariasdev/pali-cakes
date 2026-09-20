/**
 * Grupos de variantes sem foto (ex: massa, cobertura, recheio). Ao contrário
 * do seletor de sabor, a foto do produto não muda — só exigimos que o
 * cliente escolha uma opção em cada grupo antes de poder adicionar à
 * encomenda.
 */

function actualizarSeleccao(
  grupos: HTMLElement[],
  addToCartButton: HTMLButtonElement | null
): void {
  if (!addToCartButton) return;

  const seleccoes = grupos.map((grupo) =>
    grupo.querySelector<HTMLButtonElement>(
      "[data-variant-option].is-selected"
    )
  );

  const tudoSeleccionado = seleccoes.every((opcao) => opcao !== null);

  addToCartButton.disabled = !tudoSeleccionado;

  if (!tudoSeleccionado) {
    addToCartButton.dataset.productFlavor = "";
    return;
  }

  const partes = grupos.map((grupo, indice) => {
    const nomeGrupo = grupo.dataset.groupName ?? "";
    const valor = seleccoes[indice]?.dataset.optionValue ?? "";
    return `${nomeGrupo}: ${valor}`;
  });

  addToCartButton.dataset.productFlavor = partes.join(" • ");
}

function bindVariantGroups(): void {
  const container = document.querySelector<HTMLElement>(
    "[data-variant-groups]"
  );

  if (!container || container.dataset.variantGroupsBound === "true") {
    return;
  }

  container.dataset.variantGroupsBound = "true";

  const grupos = Array.from(
    container.querySelectorAll<HTMLElement>("[data-variant-group]")
  );

  const addToCartButton = document.querySelector<HTMLButtonElement>(
    "[data-add-to-cart]"
  );

  grupos.forEach((grupo) => {
    const opcoes = Array.from(
      grupo.querySelectorAll<HTMLButtonElement>("[data-variant-option]")
    );

    opcoes.forEach((opcao) => {
      opcao.addEventListener("click", () => {
        opcoes.forEach((outra) => {
          const seleccionada = outra === opcao;
          outra.classList.toggle("is-selected", seleccionada);
          outra.setAttribute(
            "aria-pressed",
            seleccionada ? "true" : "false"
          );
        });

        actualizarSeleccao(grupos, addToCartButton);
      });
    });
  });

  actualizarSeleccao(grupos, addToCartButton);
}

function initialiseProductVariantGroups(): void {
  bindVariantGroups();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initialiseProductVariantGroups,
    { once: true }
  );
} else {
  initialiseProductVariantGroups();
}

document.addEventListener(
  "astro:page-load",
  initialiseProductVariantGroups
);
