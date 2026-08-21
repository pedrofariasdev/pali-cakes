// Cursor personalizado (saco de pasteleiro) com rasto de glitter,
// activo apenas dentro da secção hero.

const GLITTER_COLORS = ["#a85d6b", "#e3b979", "#fffaf6"];
const GLITTER_INTERVAL_MS = 25;
const GLITTER_PER_TICK = 3;

function spawnGlitter(
  hero: HTMLElement,
  x: number,
  y: number
): void {
  const glitter = document.createElement("span");

  glitter.className = "hero-glitter";

  const size = 4 + Math.random() * 5;
  const offsetX = (Math.random() - 0.5) * 14;
  const drift = (Math.random() - 0.5) * 40;

  const color =
    GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)];

  glitter.style.setProperty("--size", `${size}px`);
  glitter.style.setProperty("--drift", `${drift}px`);
  glitter.style.left = `${x + offsetX}px`;
  glitter.style.top = `${y}px`;
  glitter.style.backgroundColor = color;

  hero.appendChild(glitter);

  glitter.addEventListener(
    "animationend",
    () => glitter.remove(),
    { once: true }
  );
}

function initHeroCursor(): void {
  const hero = document.querySelector<HTMLElement>(".hero");
  const cursor = document.querySelector<HTMLElement>("[data-hero-cursor]");

  if (!hero || !cursor) {
    return;
  }

  if (hero.dataset.cursorBound === "true") {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

  // Em ecrãs táteis ou com movimento reduzido, mantém o cursor normal.
  if (prefersReducedMotion || !hasFinePointer) {
    return;
  }

  hero.dataset.cursorBound = "true";

  let lastGlitterTime = 0;

  hero.addEventListener("mouseenter", () => {
    hero.classList.add("hero--custom-cursor");
    cursor.hidden = false;
  });

  hero.addEventListener("mouseleave", () => {
    hero.classList.remove("hero--custom-cursor");
    cursor.hidden = true;
  });

  hero.addEventListener("mousemove", (event) => {
    const heroRect = hero.getBoundingClientRect();
    const x = event.clientX - heroRect.left;
    const y = event.clientY - heroRect.top;

    cursor.style.transform = `translate(${x}px, ${y}px)`;

    const now = performance.now();

    if (now - lastGlitterTime > GLITTER_INTERVAL_MS) {
      lastGlitterTime = now;

      for (let i = 0; i < GLITTER_PER_TICK; i++) {
        spawnGlitter(hero, x, y);
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroCursor, {
    once: true
  });
} else {
  initHeroCursor();
}

document.addEventListener("astro:page-load", initHeroCursor);
