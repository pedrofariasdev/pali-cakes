/**
 * Galeria de fotos na página do produto: miniaturas por baixo da foto
 * principal e setas sobre a foto para avançar/recuar entre elas.
 */

function bindGallery(): void {
  document
    .querySelectorAll<HTMLElement>("[data-gallery]")
    .forEach((galeria) => {
      if (galeria.dataset.galleryBound === "true") {
        return;
      }

      galeria.dataset.galleryBound = "true";

      const imagem = galeria.querySelector<HTMLImageElement>(
        "[data-gallery-image]"
      );

      const miniaturas = Array.from(
        galeria.querySelectorAll<HTMLButtonElement>("[data-gallery-thumb]")
      );

      if (!imagem || miniaturas.length < 2) {
        return;
      }

      const mostrar = (indice: number): void => {
        const src = miniaturas[indice]?.dataset.galleryThumb ?? "";
        if (!src) return;

        imagem.src = src;

        miniaturas.forEach((miniatura, i) => {
          const activa = i === indice;
          miniatura.classList.toggle("is-active", activa);
          miniatura.setAttribute("aria-current", activa ? "true" : "false");
        });
      };

      const indiceActual = (): number => {
        const indice = miniaturas.findIndex((miniatura) =>
          miniatura.classList.contains("is-active")
        );
        return indice === -1 ? 0 : indice;
      };

      const avancar = (deslocamento: number): void => {
        const total = miniaturas.length;
        mostrar((indiceActual() + deslocamento + total) % total);
      };

      miniaturas.forEach((miniatura, indice) => {
        miniatura.addEventListener("click", () => mostrar(indice));
      });

      galeria
        .querySelector<HTMLButtonElement>("[data-gallery-prev]")
        ?.addEventListener("click", () => avancar(-1));

      galeria
        .querySelector<HTMLButtonElement>("[data-gallery-next]")
        ?.addEventListener("click", () => avancar(1));
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindGallery, { once: true });
} else {
  bindGallery();
}

document.addEventListener("astro:page-load", bindGallery);
