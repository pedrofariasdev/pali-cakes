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

export function getCart(): CartItem[] {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!storedCart) {
    return [];
  }

  try {
    return JSON.parse(storedCart) as CartItem[];
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
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