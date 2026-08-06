function initialisePortfolio(): void {
  const filterButtons =
    document.querySelectorAll<HTMLButtonElement>(
      "[data-portfolio-filter]"
    );

  const portfolioItems =
    document.querySelectorAll<HTMLElement>(
      "[data-portfolio-item]"
    );

  const modal =
    document.querySelector<HTMLDialogElement>(
      "[data-portfolio-modal]"
    );

  const modalImage =
    document.querySelector<HTMLImageElement>(
      "[data-portfolio-modal-image]"
    );

  const modalTitle =
    document.querySelector<HTMLElement>(
      "[data-portfolio-modal-title]"
    );

  const modalCategory =
    document.querySelector<HTMLElement>(
      "[data-portfolio-modal-category]"
    );

  const closeButton =
    document.querySelector<HTMLButtonElement>(
      "[data-portfolio-close]"
    );

  function filterPortfolio(
    selectedCategory: string
  ): void {
    portfolioItems.forEach((item) => {
      const itemCategory = item.dataset.category;

      const shouldShow =
        selectedCategory === "Todos" ||
        itemCategory === selectedCategory;

      item.hidden = !shouldShow;
    });
  }

  filterButtons.forEach((button) => {
    if (button.dataset.filterBound === "true") {
      return;
    }

    button.dataset.filterBound = "true";

    button.addEventListener("click", () => {
      const selectedCategory =
        button.dataset.portfolioFilter;

      if (!selectedCategory) {
        return;
      }

      filterButtons.forEach((item) => {
        item.classList.remove("is-active");
      });

      button.classList.add("is-active");

      filterPortfolio(selectedCategory);
    });
  });

  function closeModal(): void {
    if (!modal?.open) {
      return;
    }

    modal.close();
    document.body.classList.remove(
      "portfolio-modal-is-open"
    );
  }

  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-portfolio-open]"
    )
    .forEach((button) => {
      if (button.dataset.modalBound === "true") {
        return;
      }

      button.dataset.modalBound = "true";

      button.addEventListener("click", () => {
        if (
          !modal ||
          !modalImage ||
          !modalTitle ||
          !modalCategory
        ) {
          return;
        }

        const image = button.dataset.image;
        const title = button.dataset.title;
        const category = button.dataset.category;
        const alt = button.dataset.alt;

        if (!image || !title) {
          return;
        }

        modalImage.src = image;
        modalImage.alt = alt || title;

        modalTitle.textContent = title;
        modalCategory.textContent =
          category || "Pali Cakes";

        modal.showModal();

        document.body.classList.add(
          "portfolio-modal-is-open"
        );
      });
    });

  if (
    closeButton &&
    closeButton.dataset.modalBound !== "true"
  ) {
    closeButton.dataset.modalBound = "true";
    closeButton.addEventListener(
      "click",
      closeModal
    );
  }

  if (
    modal &&
    modal.dataset.modalBound !== "true"
  ) {
    modal.dataset.modalBound = "true";

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    modal.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeModal();
    });

    modal.addEventListener("close", () => {
      document.body.classList.remove(
        "portfolio-modal-is-open"
      );
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initialisePortfolio,
    { once: true }
  );
} else {
  initialisePortfolio();
}

document.addEventListener(
  "astro:page-load",
  initialisePortfolio
);