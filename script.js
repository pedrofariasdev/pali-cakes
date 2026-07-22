const header = document.querySelector("#header");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");
const navigationLinks = document.querySelectorAll(".navigation a");
const currentYear = document.querySelector("#current-year");

function openMenu() {
  navigation.classList.add("is-open");
  menuButton.classList.add("is-active");
  document.body.classList.add("menu-open");

  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Fechar menu");
}

function closeMenu() {
  navigation.classList.remove("is-open");
  menuButton.classList.remove("is-active");
  document.body.classList.remove("menu-open");

  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");
}

function toggleMenu() {
  const menuIsOpen = navigation.classList.contains("is-open");

  if (menuIsOpen) {
    closeMenu();
    return;
  }

  openMenu();
}

function updateHeaderOnScroll() {
  const pageHasScrolled = window.scrollY > 20;

  header.classList.toggle("is-scrolled", pageHasScrolled);
}

menuButton.addEventListener("click", toggleMenu);

navigationLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("scroll", updateHeaderOnScroll);

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    closeMenu();
  }
});

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

updateHeaderOnScroll();

const menuTabs = document.querySelectorAll("[data-menu-tab]");
const menuPanels = document.querySelectorAll("[data-menu-panel]");

function changeMenuPanel(selectedCategory) {
  menuTabs.forEach((tab) => {
    const isSelected = tab.dataset.menuTab === selectedCategory;

    tab.classList.toggle("is-active", isSelected);
    tab.setAttribute("aria-selected", String(isSelected));
  });

  menuPanels.forEach((panel) => {
    const isSelected = panel.dataset.menuPanel === selectedCategory;

    panel.classList.toggle("is-active", isSelected);
    panel.hidden = !isSelected;
  });
}

menuTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    changeMenuPanel(tab.dataset.menuTab);
  });
});

const galleryItems = document.querySelectorAll("[data-gallery-index]");
const lightbox = document.querySelector("#gallery-lightbox");
const lightboxImage = lightbox?.querySelector(".lightbox__image");
const lightboxCaption = lightbox?.querySelector(".lightbox__caption");
const lightboxCloseButton = lightbox?.querySelector(".lightbox__close");
const lightboxPreviousButton = lightbox?.querySelector(
  ".lightbox__navigation--previous"
);
const lightboxNextButton = lightbox?.querySelector(
  ".lightbox__navigation--next"
);

const galleryImages = Array.from(galleryItems).map((item) => {
  const image = item.querySelector("img");

  return {
    src: image.src,
    alt: image.alt
  };
});

let currentGalleryIndex = 0;

function updateLightboxImage() {
  const selectedImage = galleryImages[currentGalleryIndex];

  lightboxImage.src = selectedImage.src;
  lightboxImage.alt = selectedImage.alt;
  lightboxCaption.textContent = selectedImage.alt;
}

function openLightbox(index) {
  currentGalleryIndex = index;

  updateLightboxImage();

  lightbox.hidden = false;
  document.body.classList.add("gallery-open");

  lightboxCloseButton.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove("gallery-open");
}

function showPreviousImage() {
  currentGalleryIndex =
    (currentGalleryIndex - 1 + galleryImages.length) %
    galleryImages.length;

  updateLightboxImage();
}

function showNextImage() {
  currentGalleryIndex =
    (currentGalleryIndex + 1) %
    galleryImages.length;

  updateLightboxImage();
}

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    openLightbox(Number(item.dataset.galleryIndex));
  });
});

lightboxCloseButton?.addEventListener("click", closeLightbox);
lightboxPreviousButton?.addEventListener("click", showPreviousImage);
lightboxNextButton?.addEventListener("click", showNextImage);

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (!lightbox || lightbox.hidden) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    showPreviousImage();
  }

  if (event.key === "ArrowRight") {
    showNextImage();
  }
});