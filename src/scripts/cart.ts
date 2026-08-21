export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number | null;
  priceLabel: string;
  quantity: number;
  categorySlug: string;
  productSlug: string;
}

type NewCartItem = Omit<CartItem, "quantity">;

const CART_STORAGE_KEY = "pali-cakes-cart";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normaliseCartItem(value: unknown): CartItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === "string" ? value.id.trim() : "";
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const image = typeof value.image === "string" ? value.image.trim() : "";
  const categorySlug =
    typeof value.categorySlug === "string" ? value.categorySlug.trim() : "";
  const productSlug =
    typeof value.productSlug === "string" ? value.productSlug.trim() : "";

  const isSafeImage =
    image.startsWith("/") ||
    image.startsWith("https://") ||
    image.startsWith("http://");

  if (
    !id ||
    !name ||
    !isSafeImage ||
    !categorySlug ||
    !productSlug
  ) {
    return null;
  }

  const quantity =
    typeof value.quantity === "number" && Number.isFinite(value.quantity)
      ? Math.min(99, Math.max(1, Math.trunc(value.quantity)))
      : 1;

  const price =
    typeof value.price === "number" &&
    Number.isFinite(value.price) &&
    value.price > 0
      ? value.price
      : null;

  const priceLabel =
    typeof value.priceLabel === "string" && value.priceLabel.trim()
      ? value.priceLabel.trim().slice(0, 120)
      : "Sob consulta";

  return {
    id: id.slice(0, 160),
    name: name.slice(0, 200),
    image: image.slice(0, 1000),
    price,
    priceLabel,
    quantity,
    categorySlug: categorySlug.slice(0, 160),
    productSlug: productSlug.slice(0, 160)
  };
}

export function getCart(): CartItem[] {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!storedCart) {
    return [];
  }

  try {
    const parsedCart: unknown = JSON.parse(storedCart);

    if (!Array.isArray(parsedCart)) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }

    const cart = parsedCart
      .map(normaliseCartItem)
      .filter((item): item is CartItem => item !== null)
      .slice(0, 100);

    if (cart.length !== parsedCart.length) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }

    return cart;
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartCounters([]);
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify(cart)
  );

  updateCartCounters(cart);
}

export function addToCart(item: NewCartItem): void {
  const cart = getCart();

  const existingItem = cart.find(
    (cartItem) => cartItem.id === item.id
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...item,
      quantity: 1
    });
  }

  saveCart(cart);
}

export function getCartQuantity(
  cart: CartItem[] = getCart()
): number {
  return cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
}

export function updateCartCounters(
  cart: CartItem[] = getCart()
): void {
  const quantity = getCartQuantity(cart);

  document
    .querySelectorAll<HTMLElement>("[data-cart-count]")
    .forEach((counter) => {
      counter.textContent = String(quantity);
    });

  document
    .querySelectorAll<HTMLAnchorElement>("a.navbar__cart")
    .forEach((cartLink) => {
      const itemLabel = quantity === 1 ? "artigo" : "artigos";
      cartLink.setAttribute(
        "aria-label",
        `Abrir carrinho de encomenda, ${quantity} ${itemLabel}`
      );
    });
}

function bindAddToCartButtons(): void {
  document
    .querySelectorAll<HTMLButtonElement>("[data-add-to-cart]")
    .forEach((button) => {
      if (button.dataset.cartBound === "true") {
        return;
      }

      button.dataset.cartBound = "true";

      button.addEventListener("click", () => {
        const {
          productId,
          productName,
          productImage,
          productPrice,
          productPriceLabel,
          categorySlug,
          productSlug
        } = button.dataset;

        if (
          !productId ||
          !productName ||
          !productImage ||
          !categorySlug ||
          !productSlug
        ) {
          console.error(
            "Não foi possível adicionar o produto: dados incompletos."
          );

          return;
        }

        const numericPrice =
          productPrice && productPrice.trim() !== ""
            ? Number(productPrice)
            : null;

        addToCart({
          id: productId,
          name: productName,
          image: productImage,
          price:
            numericPrice !== null && Number.isFinite(numericPrice)
              ? numericPrice
              : null,
          priceLabel:
            productPriceLabel || "Sob consulta",
          categorySlug,
          productSlug
        });

        const originalText = button.textContent;

        button.textContent = "Adicionado ✓";
        button.classList.add("is-added");

        window.setTimeout(() => {
          button.textContent =
            originalText || "Adicionar à encomenda";

          button.classList.remove("is-added");
        }, 1600);
      });
    });
}

function initialiseCart(): void {
  updateCartCounters();
  bindAddToCartButtons();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initialiseCart,
    { once: true }
  );
} else {
  initialiseCart();
}

document.addEventListener(
  "astro:page-load",
  initialiseCart
);
