import {
  getCart,
  saveCart,
  type CartItem
} from "./cart";

const currencyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR"
});

function formatItemPrice(item: CartItem): string {
  if (item.price === null) {
    return item.priceLabel;
  }

  return currencyFormatter.format(
    item.price * item.quantity
  );
}

function calculateKnownTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => {
    if (item.price === null) {
      return total;
    }

    return total + item.price * item.quantity;
  }, 0);
}

function renderCartPage(): void {
  const cartLayout =
    document.querySelector<HTMLElement>("[data-cart-layout]");

  const cartList =
    document.querySelector<HTMLElement>("[data-cart-list]");

  const emptyState =
    document.querySelector<HTMLElement>("[data-cart-empty]");

  const itemsCount =
    document.querySelector<HTMLElement>(
      "[data-cart-items-count]"
    );

  const totalElement =
    document.querySelector<HTMLElement>("[data-cart-total]");

  const summaryNote =
    document.querySelector<HTMLElement>(
      "[data-cart-summary-note]"
    );

  if (
    !cartLayout ||
    !cartList ||
    !emptyState ||
    !itemsCount ||
    !totalElement ||
    !summaryNote
  ) {
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    cartLayout.hidden = true;
    emptyState.hidden = false;
    cartList.innerHTML = "";
    return;
  }

  cartLayout.hidden = false;
  emptyState.hidden = true;

  cartList.innerHTML = cart
    .map(
      (item) => `
        <article
          class="cart-item"
          data-cart-item
          data-product-id="${item.id}"
        >
          <a
            href="${
              item.categorySlug === "packs-festa"
                ? `/packs-festa/${item.productSlug}`
                : `/catalogo/${item.categorySlug}/${item.productSlug}`
            }"
            class="cart-item__image"
          >
            <img
              src="${item.image}"
              alt="${item.name}"
            />
          </a>

          <div class="cart-item__content">
            <div>
              <span class="cart-item__eyebrow">
                Produto selecionado
              </span>

              <h2>
                <a
                  href="${
                    item.categorySlug === "packs-festa"
                      ? `/packs-festa/${item.productSlug}`
                      : `/catalogo/${item.categorySlug}/${item.productSlug}`
                  }"
                >
                  ${item.name}
                </a>
              </h2>

              <strong class="cart-item__price">
                ${formatItemPrice(item)}
              </strong>
            </div>

            <button
              type="button"
              class="cart-item__remove"
              data-cart-action="remove"
            >
              Remover
            </button>
          </div>

          <div
            class="cart-item__quantity"
            aria-label="Quantidade de ${item.name}"
          >
            <button
              type="button"
              aria-label="Diminuir quantidade"
              data-cart-action="decrease"
            >
              −
            </button>

            <span>${item.quantity}</span>

            <button
              type="button"
              aria-label="Aumentar quantidade"
              data-cart-action="increase"
            >
              +
            </button>
          </div>
        </article>
      `
    )
    .join("");

  const quantity = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  itemsCount.textContent = String(quantity);

  totalElement.textContent = currencyFormatter.format(
    calculateKnownTotal(cart)
  );

  const hasItemsUnderQuote = cart.some(
    (item) => item.price === null
  );

  summaryNote.textContent = hasItemsUnderQuote
    ? "Os produtos sob consulta serão orçamentados pela Pali Cakes. O total apresentado inclui apenas os itens com preço definido."
    : "O valor final será confirmado pela Pali Cakes após a análise dos detalhes da encomenda.";
}

function handleCartAction(event: MouseEvent): void {
  const target = event.target as HTMLElement;

  const button = target.closest<HTMLButtonElement>(
    "[data-cart-action]"
  );

  if (!button) {
    return;
  }

  const cartItem = button.closest<HTMLElement>(
    "[data-cart-item]"
  );

  const productId = cartItem?.dataset.productId;
  const action = button.dataset.cartAction;

  if (!productId || !action) {
    return;
  }

  const cart = getCart();

  const itemIndex = cart.findIndex(
    (item) => item.id === productId
  );

  if (itemIndex === -1) {
    return;
  }

  if (action === "increase") {
    cart[itemIndex].quantity += 1;
  }

  if (action === "decrease") {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1;
    } else {
      cart.splice(itemIndex, 1);
    }
  }

  if (action === "remove") {
    cart.splice(itemIndex, 1);
  }

  saveCart(cart);
  renderCartPage();
}

function initialiseCartPage(): void {
  const cartList =
    document.querySelector<HTMLElement>("[data-cart-list]");

  if (!cartList) {
    return;
  }

  cartList.addEventListener("click", handleCartAction);
  renderCartPage();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initialiseCartPage,
    { once: true }
  );
} else {
  initialiseCartPage();
}