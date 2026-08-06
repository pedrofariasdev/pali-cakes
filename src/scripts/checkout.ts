import {
  getCart,
  type CartItem
} from "./cart";

const ORDER_DRAFT_KEY = "pali-cakes-order-draft";

const currencyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR"
});

interface OrderDraft {
  id: string;
  createdAt: string;
  status: "draft";

  customer: {
    name: string;
    email: string;
    phone: string;
  };

  event: {
    date: string;
    type: string;
    notes: string;
  };

  fulfillment: {
    type: "pickup" | "delivery";
    address: string;
    postalCode: string;
    city: string;
  };

  items: CartItem[];
  knownTotal: number;
}

function calculateKnownTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => {
    if (item.price === null) {
      return total;
    }

    return total + item.price * item.quantity;
  }, 0);
}

function createSummaryItem(item: CartItem): HTMLElement {
  const article = document.createElement("article");

  article.className = "checkout-summary__item";

  const image = document.createElement("img");

  image.src = item.image;
  image.alt = item.name;

  const content = document.createElement("div");

  const name = document.createElement("strong");

  name.textContent = item.name;

  const details = document.createElement("span");

  details.textContent =
    `${item.quantity} × ${
      item.price === null
        ? item.priceLabel
        : currencyFormatter.format(item.price)
    }`;

  content.append(name, details);

  article.append(image, content);

  return article;
}

function renderCheckoutSummary(): CartItem[] {
  const itemsContainer =
    document.querySelector<HTMLElement>(
      "[data-checkout-items]"
    );

  const totalElement =
    document.querySelector<HTMLElement>(
      "[data-checkout-total]"
    );

  const submitButton =
    document.querySelector<HTMLButtonElement>(
      "[data-checkout-submit]"
    );

  if (
    !itemsContainer ||
    !totalElement ||
    !submitButton
  ) {
    return [];
  }

  const cart = getCart();

  itemsContainer.replaceChildren();

  if (cart.length === 0) {
    const message = document.createElement("p");

    message.textContent =
      "A sua encomenda está vazia. Volte ao catálogo para escolher os produtos.";

    itemsContainer.append(message);

    totalElement.textContent =
      currencyFormatter.format(0);

    submitButton.disabled = true;

    return [];
  }

  cart.forEach((item) => {
    itemsContainer.append(
      createSummaryItem(item)
    );
  });

  totalElement.textContent = currencyFormatter.format(
    calculateKnownTotal(cart)
  );

  submitButton.disabled = false;

  return cart;
}

function configureMinimumDate(): void {
  const dateInput =
    document.querySelector<HTMLInputElement>(
      'input[name="eventDate"]'
    );

  if (!dateInput) {
    return;
  }

  const today = new Date();

  const localDate = new Date(
    today.getTime() -
    today.getTimezoneOffset() * 60_000
  );

  dateInput.min =
    localDate.toISOString().split("T")[0];
}

function updateDeliveryFields(): void {
  const selectedOption =
    document.querySelector<HTMLInputElement>(
      'input[name="fulfillmentType"]:checked'
    );

  const deliveryFields =
    document.querySelector<HTMLElement>(
      "[data-delivery-fields]"
    );

  if (!selectedOption || !deliveryFields) {
    return;
  }

  const isDelivery =
    selectedOption.value === "delivery";

  deliveryFields.hidden = !isDelivery;

  deliveryFields
    .querySelectorAll<HTMLInputElement>("input")
    .forEach((input) => {
      input.required = isDelivery;
    });
}

function createDraftId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `draft-${Date.now()}`;
}

function readTextValue(
  formData: FormData,
  fieldName: string
): string {
  const value = formData.get(fieldName);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function handleCheckoutSubmit(
  event: SubmitEvent
): void {
  event.preventDefault();

  const form = event.currentTarget;

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const cart = getCart();

  const submitButton =
    form.querySelector<HTMLButtonElement>(
      "[data-checkout-submit]"
    );

  const helper =
    form.querySelector<HTMLElement>(
      "[data-checkout-helper]"
    );

  if (cart.length === 0) {
    if (helper) {
      helper.textContent =
        "A encomenda está vazia. Adicione pelo menos um produto.";
    }

    return;
  }

  if (!form.reportValidity()) {
    return;
  }

  const formData = new FormData(form);

  const fulfillmentValue =
    readTextValue(
      formData,
      "fulfillmentType"
    );

  const fulfillmentType:
    | "pickup"
    | "delivery" =
      fulfillmentValue === "delivery"
        ? "delivery"
        : "pickup";

  const draft: OrderDraft = {
    id: createDraftId(),
    createdAt: new Date().toISOString(),
    status: "draft",

    customer: {
      name: readTextValue(
        formData,
        "customerName"
      ),

      email: readTextValue(
        formData,
        "customerEmail"
      ),

      phone: readTextValue(
        formData,
        "customerPhone"
      )
    },

    event: {
      date: readTextValue(
        formData,
        "eventDate"
      ),

      type: readTextValue(
        formData,
        "eventType"
      ),

      notes: readTextValue(
        formData,
        "notes"
      )
    },

    fulfillment: {
      type: fulfillmentType,

      address:
        fulfillmentType === "delivery"
          ? readTextValue(
              formData,
              "deliveryAddress"
            )
          : "",

      postalCode:
        fulfillmentType === "delivery"
          ? readTextValue(
              formData,
              "postalCode"
            )
          : "",

      city:
        fulfillmentType === "delivery"
          ? readTextValue(
              formData,
              "city"
            )
          : ""
    },

    items: cart,
    knownTotal: calculateKnownTotal(cart)
  };

  localStorage.setItem(
    ORDER_DRAFT_KEY,
    JSON.stringify(draft)
  );

  if (submitButton) {
    submitButton.textContent =
      "Pedido preparado ✓";

    submitButton.disabled = true;
  }

  if (helper) {
    helper.textContent =
      "Os dados foram guardados com sucesso. No próximo passo ligaremos este pedido ao Supabase.";
  }
}

function initialiseCheckout(): void {
  const form =
    document.querySelector<HTMLFormElement>(
      "[data-checkout-form]"
    );

  if (!form) {
    return;
  }

  renderCheckoutSummary();
  configureMinimumDate();
  updateDeliveryFields();

  document
    .querySelectorAll<HTMLInputElement>(
      'input[name="fulfillmentType"]'
    )
    .forEach((option) => {
      option.addEventListener(
        "change",
        updateDeliveryFields
      );
    });

  if (form.dataset.checkoutBound !== "true") {
    form.dataset.checkoutBound = "true";

    form.addEventListener(
      "submit",
      handleCheckoutSubmit
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initialiseCheckout,
    { once: true }
  );
} else {
  initialiseCheckout();
}

document.addEventListener(
  "astro:page-load",
  initialiseCheckout
);