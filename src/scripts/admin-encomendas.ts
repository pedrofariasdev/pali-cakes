import { exigirSessao, sair } from "@/lib/auth";
import {
  listarEncomendas,
  actualizarEstado,
  type EncomendaComItens
} from "@/lib/admin-orders";
import type { EstadoEncomenda } from "@/types/database";

const ESTADOS: Record<EstadoEncomenda, string> = {
  novo: "Nova",
  confirmado: "Confirmada",
  em_producao: "Em produção",
  pronto: "Pronta",
  entregue: "Entregue",
  cancelado: "Cancelada"
};

const dataFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "short",
  timeStyle: "short"
});

const dataCurtaFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "long"
});

let todasEncomendas: EncomendaComItens[] = [];
let filtroActivo = "todos";

function criarCartao(encomenda: EncomendaComItens): HTMLElement {
  const artigo = document.createElement("article");
  artigo.className = `admin-order admin-order--${encomenda.estado}`;

  const entrega =
    encomenda.metodo_entrega === "entrega"
      ? `Entrega — ${encomenda.morada ?? ""}, ${encomenda.codigo_postal ?? ""} ${encomenda.localidade ?? ""}`
      : "Levantamento";

  const itens = encomenda.itens
    .map((item) => `<li>${item.quantidade} × ${item.produto_nome}</li>`)
    .join("");

  artigo.innerHTML = `
    <header class="admin-order__header">
      <div>
        <strong>${encomenda.referencia}</strong>
        <span>${dataFormatter.format(new Date(encomenda.criado_em))}</span>
      </div>
      <span class="admin-order__badge">${ESTADOS[encomenda.estado]}</span>
    </header>

    <div class="admin-order__body">
      <div>
        <h3>${encomenda.cliente_nome}</h3>
        <p>
          <a href="tel:${encomenda.cliente_telefone}">${encomenda.cliente_telefone}</a>
          ${encomenda.cliente_email ? ` · <a href="mailto:${encomenda.cliente_email}">${encomenda.cliente_email}</a>` : ""}
        </p>
        <p>${entrega}</p>
        ${encomenda.data_evento ? `<p><strong>Data:</strong> ${dataCurtaFormatter.format(new Date(encomenda.data_evento))}</p>` : ""}
        ${encomenda.tipo_celebracao ? `<p><strong>Ocasião:</strong> ${encomenda.tipo_celebracao}</p>` : ""}
      </div>

      <ul class="admin-order__items">${itens}</ul>
    </div>

    ${encomenda.observacoes ? `<p class="admin-order__notes">${encomenda.observacoes}</p>` : ""}

    <footer class="admin-order__footer">
      <label>
        Estado
        <select data-estado data-id="${encomenda.id}">
          ${Object.entries(ESTADOS)
            .map(
              ([valor, texto]) =>
                `<option value="${valor}" ${valor === encomenda.estado ? "selected" : ""}>${texto}</option>`
            )
            .join("")}
        </select>
      </label>
    </footer>
  `;

  return artigo;
}

function renderizar(): void {
  const lista = document.querySelector<HTMLElement>("[data-orders-list]");
  if (!lista) return;

  const filtradas =
    filtroActivo === "todos"
      ? todasEncomendas
      : todasEncomendas.filter((e) => e.estado === filtroActivo);

  lista.replaceChildren();

  if (filtradas.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "admin-loading";
    vazio.textContent = "Sem encomendas nesta categoria.";
    lista.append(vazio);
    return;
  }

  filtradas.forEach((encomenda) => {
    lista.append(criarCartao(encomenda));
  });

  lista.querySelectorAll<HTMLSelectElement>("[data-estado]").forEach((select) => {
    select.addEventListener("change", async () => {
      const id = select.dataset.id;
      if (!id) return;

      select.disabled = true;
      const sucesso = await actualizarEstado(id, select.value as EstadoEncomenda);
      select.disabled = false;

      if (sucesso) {
        await carregar();
      } else {
        alert("Não foi possível actualizar o estado.");
      }
    });
  });
}

async function carregar(): Promise<void> {
  todasEncomendas = await listarEncomendas();
  renderizar();
}

async function iniciar(): Promise<void> {
  const lista = document.querySelector("[data-orders-list]");
  if (!lista) return;

  const autorizado = await exigirSessao();
  if (!autorizado) return;

  document.querySelector("[data-logout]")?.addEventListener("click", sair);

  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((botao) => {
    botao.addEventListener("click", () => {
      filtroActivo = botao.dataset.filter ?? "todos";

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