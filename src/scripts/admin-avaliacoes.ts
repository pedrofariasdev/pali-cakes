import { exigirSessao, sair } from "@/lib/auth";
import {
  listarAvaliacoesAdmin,
  moderarAvaliacao,
  apagarAvaliacao
} from "@/lib/admin-reviews";
import type { Avaliacao } from "@/lib/reviews";

const ESTADOS: Record<string, string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada"
};

const dataFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "short",
  timeStyle: "short"
});

let todas: Avaliacao[] = [];
let filtroActivo = "pendente";

function estrelas(n: number): string {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function escapar(texto: string): string {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function criarCartao(review: Avaliacao): HTMLElement {
  const artigo = document.createElement("article");
  artigo.className = `admin-review admin-review--${review.estado}`;

  artigo.innerHTML = `
    <header class="admin-review__header">
      <div>
        <strong>${escapar(review.nome)}</strong>
        <span>
          ${dataFormatter.format(new Date(review.criado_em))}
          ${review.localidade ? ` · ${escapar(review.localidade)}` : ""}
          ${review.ocasiao ? ` · ${escapar(review.ocasiao)}` : ""}
        </span>
      </div>

      <div class="admin-review__meta">
        <span class="admin-review__stars">${estrelas(review.classificacao)}</span>
        <span class="admin-order__badge">${ESTADOS[review.estado]}</span>
      </div>
    </header>

    <blockquote class="admin-review__comment">${escapar(review.comentario)}</blockquote>

    ${review.email ? `<p class="admin-review__email">${escapar(review.email)}</p>` : ""}

    <footer class="admin-review__actions">
      ${
        review.estado !== "aprovada"
          ? `<button type="button" class="button button--primary" data-aprovar="${review.id}">Aprovar</button>`
          : ""
      }
      ${
        review.estado !== "rejeitada"
          ? `<button type="button" class="button button--secondary" data-rejeitar="${review.id}">Rejeitar</button>`
          : ""
      }
      <button type="button" class="admin-review__delete" data-apagar="${review.id}">
        Apagar
      </button>
    </footer>
  `;

  return artigo;
}

function renderizar(): void {
  const lista = document.querySelector<HTMLElement>("[data-reviews-list]");
  if (!lista) return;

  const filtradas =
    filtroActivo === "todos"
      ? todas
      : todas.filter((r) => r.estado === filtroActivo);

  lista.replaceChildren();

  if (filtradas.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "admin-loading";
    vazio.textContent =
      filtroActivo === "pendente"
        ? "Não há avaliações à espera de revisão."
        : "Sem avaliações nesta categoria.";
    lista.append(vazio);
    return;
  }

  filtradas.forEach((review) => lista.append(criarCartao(review)));

  lista.querySelectorAll<HTMLButtonElement>("[data-aprovar]").forEach((botao) => {
    botao.addEventListener("click", async () => {
      botao.disabled = true;
      const ok = await moderarAvaliacao(botao.dataset.aprovar!, "aprovada");
      if (ok) await carregar();
      else {
        botao.disabled = false;
        alert("Não foi possível aprovar.");
      }
    });
  });

  lista.querySelectorAll<HTMLButtonElement>("[data-rejeitar]").forEach((botao) => {
    botao.addEventListener("click", async () => {
      botao.disabled = true;
      const ok = await moderarAvaliacao(botao.dataset.rejeitar!, "rejeitada");
      if (ok) await carregar();
      else {
        botao.disabled = false;
        alert("Não foi possível rejeitar.");
      }
    });
  });

  lista.querySelectorAll<HTMLButtonElement>("[data-apagar]").forEach((botao) => {
    botao.addEventListener("click", async () => {
      if (!confirm("Apagar esta avaliação definitivamente?")) return;

      botao.disabled = true;
      const ok = await apagarAvaliacao(botao.dataset.apagar!);
      if (ok) await carregar();
      else {
        botao.disabled = false;
        alert("Não foi possível apagar.");
      }
    });
  });
}

async function carregar(): Promise<void> {
  todas = await listarAvaliacoesAdmin();
  renderizar();
}

async function iniciar(): Promise<void> {
  const lista = document.querySelector("[data-reviews-list]");
  if (!lista) return;

  const autorizado = await exigirSessao();
  if (!autorizado) return;

  document.querySelector("[data-logout]")?.addEventListener("click", sair);

  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((botao) => {
    botao.addEventListener("click", () => {
      filtroActivo = botao.dataset.filter ?? "pendente";

      document
        .querySelectorAll("[data-filter]")
        .forEach((b) => b.classList.remove("is-active"));

      botao.classList.add("is-active");
      renderizar();
    });
  });

  await carregar();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar, { once: true });
} else {
  iniciar();
}