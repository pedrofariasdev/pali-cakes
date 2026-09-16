function selectFlavor(
  option: HTMLButtonElement,
  allOptions: HTMLButtonElement[],
  productImage: HTMLImageElement | null,
  addToCartButton: HTMLButtonElement | null
): void {
  const flavorName = option.dataset.flavorName ?? "";
  const flavorImage = option.dataset.flavorImage ?? "";

  allOptions.forEach((otherOption) => {
    const isSelected = otherOption === option;

    otherOption.classList.toggle("is-selected", isSelected);
    otherOption.setAttribute(
      "aria-pressed",
      isSelected ? "true" : "false"
    );
  });

  if (productImage && flavorImage) {
    productImage.src = flavorImage;
    productImage.alt = flavorName || productImage.alt;
  }

  if (addToCartButton) {
    addToCartButton.dataset.productFlavor = flavorName;

    if (flavorImage) {
      addToCartButton.dataset.productImage = flavorImage;
    }
  }
}

function bindFlavorSelectors(): void {
  document
    .querySelectorAll<HTMLElement>("[data-flavor-group]")
    .forEach((group) => {
      if (group.dataset.flavorBound === "true") {
        return;
      }

      group.dataset.flavorBound = "true";

      const options = Array.from(
        group.querySelectorAll<HTMLButtonElement>("[data-flavor-option]")
      );

      const productImage = document.querySelector<HTMLImageElement>(
        "[data-product-image-display]"
      );

      const addToCartButton = document.querySelector<HTMLButtonElement>(
        "[data-add-to-cart]"
      );

      options.forEach((option) => {
        option.addEventListener("click", () => {
          selectFlavor(option, options, productImage, addToCartButton);
        });
      });
    });
}

function initialiseProductFlavors(): void {
  bindFlavorSelectors();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initialiseProductFlavors,
    { once: true }
  );
} else {
  initialiseProductFlavors();
}

document.addEventListener(
  "astro:page-load",
  initialiseProductFlavors
);
