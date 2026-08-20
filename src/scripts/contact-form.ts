import { enviarContacto } from "@/lib/contact";

function readTextValue(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);

  return typeof value === "string" ? value.trim() : "";
}

async function handleContactSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  const form = event.currentTarget;

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const submitButton =
    form.querySelector<HTMLButtonElement>("[data-contact-submit]");

  const helper =
    form.querySelector<HTMLElement>("[data-contact-helper]");

  if (!form.reportValidity()) {
    return;
  }

  const formData = new FormData(form);

  // Bloqueia envios duplicados enquanto aguarda resposta
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "A enviar…";
  }

  if (helper) {
    helper.textContent = "A enviar a sua mensagem…";
  }

  const resultado = await enviarContacto({
    name: readTextValue(formData, "name"),
    email: readTextValue(formData, "email"),
    phone: readTextValue(formData, "phone"),
    message: readTextValue(formData, "message")
  });

  if (!resultado.ok) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar mensagem";
    }

    if (helper) {
      helper.textContent = resultado.erro;
    }

    return;
  }

  if (submitButton) {
    submitButton.textContent = "Mensagem enviada ✓";
  }

  if (helper) {
    helper.textContent =
      "A sua mensagem foi enviada. A Pali Cakes entrará em contacto brevemente.";
  }

  form.reset();
}

function initialiseContactForm(): void {
  const form = document.querySelector<HTMLFormElement>(
    "[data-contact-form]"
  );

  if (!form) {
    return;
  }

  if (form.dataset.contactBound !== "true") {
    form.dataset.contactBound = "true";

    form.addEventListener("submit", handleContactSubmit);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiseContactForm, {
    once: true
  });
} else {
  initialiseContactForm();
}

document.addEventListener("astro:page-load", initialiseContactForm);
