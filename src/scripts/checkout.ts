
import { criarEncomenda, type OrderItemInput } from "@/lib/orders";
import { getCart, clearCart, type CartItem } from "./cart";

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


function toOrderItems(cart: CartItem[]): OrderItemInput[] {
  return cart.map((item) => ({
    slug: item.productSlug,
    nome: item.name,
    categoria: item.categorySlug,
    quantidade: item.quantity,
    preco: item.price
  }));
}


async function handleCheckoutSubmit(
  event: SubmitEvent
): Promise<void> {
  event.preventDefault();

  const form = event.currentTarget;

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const cart = getCart();

  const submitButton =
    form.querySelector<HTMLButtonElement>("[data-checkout-submit]");

  const helper =
    form.querySelector<HTMLElement>("[data-checkout-helper]");

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

  const fulfillmentValue = readTextValue(formData, "fulfillmentType");
  const isDelivery = fulfillmentValue === "delivery";

  // Bloqueia envios duplicados enquanto aguarda resposta
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "A enviar…";
  }

  if (helper) {
    helper.textContent = "A enviar a sua encomenda…";
  }

  const resultado = await criarEncomenda({
    clienteNome: readTextValue(formData, "customerName"),
    clienteTelefone: readTextValue(formData, "customerPhone"),
    clienteEmail: readTextValue(formData, "customerEmail"),
    metodoEntrega: isDelivery ? "entrega" : "levantamento",
    morada: isDelivery ? readTextValue(formData, "deliveryAddress") : "",
    codigoPostal: isDelivery ? readTextValue(formData, "postalCode") : "",
    localidade: isDelivery ? readTextValue(formData, "city") : "",
    dataEvento: readTextValue(formData, "eventDate"),
    tipoCelebracao: readTextValue(formData, "eventType"),
    observacoes: readTextValue(formData, "notes"),
    itens: toOrderItems(cart)
  });

  if (!resultado.ok) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar pedido de encomenda";
    }

    if (helper) {
      helper.textContent = resultado.erro;
    }

    return;
  }

  clearCart();

  if (submitButton) {
    submitButton.textContent = "Encomenda enviada ✓";
  }

  if (helper) {
    helper.innerHTML =
      `A sua encomenda foi registada com a referência <strong>${resultado.referencia}</strong>. ` +
      `A Pali Cakes entrará em contacto para confirmar os detalhes e o orçamento.`;
  }

  form
    .querySelectorAll<HTMLElement>(".checkout-form__section, .checkout-consent")
    .forEach((section) => {
      section.hidden = true;
    });
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