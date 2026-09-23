import { exigirSessao, sair } from "@/lib/auth";
import {
  listarEncomendas,
  actualizarEstado,
  obterUrlsAssinadas,
  listarCuponsAvaliacoes,
  type EncomendaComItens,
  type CupaoAvaliacao
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

const moedaFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR"
});

let todasEncomendas: EncomendaComItens[] = [];
let cuponsPorCodigo = new Map<string, CupaoAvaliacao>();
let filtroActivo = "todos";

/** Linha com o cupão usado, a quem pertence e se já foi usado noutra encomenda. */
function criarLinhaCupao(encomenda: EncomendaComItens): HTMLElement | null {
  if (!encomenda.cupao) return null;

  const linha = document.createElement("p");
  linha.className = "admin-order__coupon";

  const rotulo = document.createElement("strong");
  rotulo.textContent = `Cupão: ${encomenda.cupao}`;
  linha.append(rotulo);

  if (encomenda.desconto_percentagem) {
    const partes = [`−${Number(encomenda.desconto_percentagem)}%`];

    if (encomenda.desconto_valor) {
      partes.push(`−${moedaFormatter.format(Number(encomenda.desconto_valor))} já descontados`);
    }

    if (encomenda.total_estimado) {
      partes.push(`total estimado ${moedaFormatter.format(Number(encomenda.total_estimado))}`);
    }

    linha.append(document.createTextNode(` (${partes.join(" · ")})`));
  }

  const origem = cuponsPorCodigo.get(encomenda.cupao);
  if (origem) {
    linha.append(document.createTextNode(` — avaliação de ${origem.nome}`));
  }

  const outrasEncomendas = todasEncomendas.filter(
    (outra) =>
      outra.id !== encomenda.id &&
      outra.cupao === encomenda.cupao &&
      outra.estado !== "cancelado"
  );

  if (outrasEncomendas.length > 0) {
    const aviso = document.createElement("span");
    aviso.className = "admin-order__coupon-warning";
    aviso.textContent = ` ⚠ também usado em: ${outrasEncomendas
      .map((outra) => outra.referencia)
      .join(", ")}`;
    linha.append(aviso);
  }

  return linha;
}

function criarCartao(encomenda: EncomendaComItens): HTMLElement {
  const estado = Object.hasOwn(ESTADOS, encomenda.estado)
    ? encomenda.estado
    : "novo";

  const artigo = document.createElement("article");
  artigo.className = `admin-order admin-order--${estado}`;

  const cabecalho = document.createElement("header");
  cabecalho.className = "admin-order__header";

  const identificacao = document.createElement("div");
  const referencia = document.createElement("strong");
  referencia.textContent = encomenda.referencia;

  const criadoEm = document.createElement("span");
  criadoEm.textContent = dataFormatter.format(new Date(encomenda.criado_em));
  identificacao.append(referencia, criadoEm);

  const etiquetaEstado = document.createElement("span");
  etiquetaEstado.className = "admin-order__badge";
  etiquetaEstado.textContent = ESTADOS[estado];
  cabecalho.append(identificacao, etiquetaEstado);

  const corpo = document.createElement("div");
  corpo.className = "admin-order__body";

  const cliente = document.createElement("div");
  const nome = document.createElement("h3");
  nome.textContent = encomenda.cliente_nome;

  const contacto = document.createElement("p");
  const telefone = document.createElement("a");
  telefone.href = `tel:${encomenda.cliente_telefone}`;
  telefone.textContent = encomenda.cliente_telefone;
  contacto.append(telefone);

  if (encomenda.cliente_email) {
    const email = document.createElement("a");
    email.href = `mailto:${encomenda.cliente_email}`;
    email.textContent = encomenda.cliente_email;
    contacto.append(document.createTextNode(" · "), email);
  }

  const entrega =
    encomenda.metodo_entrega === "entrega"
      ? `Entrega — ${encomenda.morada ?? ""}, ${encomenda.codigo_postal ?? ""} ${encomenda.localidade ?? ""}`
      : "Levantamento";

  const metodoEntrega = document.createElement("p");
  metodoEntrega.textContent = entrega;
  cliente.append(nome, contacto, metodoEntrega);

  if (encomenda.data_evento) {
    const dataEvento = document.createElement("p");
    const rotulo = document.createElement("strong");
    rotulo.textContent = "Data: ";
    dataEvento.append(
      rotulo,
      document.createTextNode(
        dataCurtaFormatter.format(new Date(encomenda.data_evento))
      )
    );
    cliente.append(dataEvento);
  }

  if (encomenda.tipo_celebracao) {
    const ocasiao = document.createElement("p");
    const rotulo = document.createElement("strong");
    rotulo.textContent = "Ocasião: ";
    ocasiao.append(rotulo, document.createTextNode(encomenda.tipo_celebracao));
    cliente.append(ocasiao);
  }

  const listaItens = document.createElement("ul");
  listaItens.className = "admin-order__items";
  encomenda.itens.forEach((item) => {
    const linha = document.createElement("li");
    const sabor =
      typeof item.personalizacao?.sabor === "string"
        ? item.personalizacao.sabor.trim()
        : "";
    linha.textContent = sabor
      ? `${item.quantidade} × ${item.produto_nome} — ${sabor}`
      : `${item.quantidade} × ${item.produto_nome}`;
    listaItens.append(linha);
  });
  corpo.append(cliente, listaItens);

  artigo.append(cabecalho, corpo);

  if (encomenda.observacoes) {
    const observacoes = document.createElement("p");
    observacoes.className = "admin-order__notes";
    observacoes.textContent = encomenda.observacoes;
    artigo.append(observacoes);
  }

  const linhaCupao = criarLinhaCupao(encomenda);
  if (linhaCupao) {
    artigo.append(linhaCupao);
  }

  if (encomenda.imagens_referencia && encomenda.imagens_referencia.length > 0) {
    const referencias = document.createElement("div");
    referencias.className = "admin-order__references";

    const rotulo = document.createElement("strong");
    rotulo.textContent = "Fotos de referência";
    referencias.append(rotulo);

    const galeria = document.createElement("div");
    galeria.className = "admin-order__references-gallery";
    galeria.textContent = "A carregar…";
    referencias.append(galeria);

    artigo.append(referencias);

    obterUrlsAssinadas(encomenda.imagens_referencia).then((urls) => {
      galeria.replaceChildren();

      if (urls.length === 0) {
        galeria.textContent = "Não foi possível carregar as fotos.";
        return;
      }

      urls.forEach((url) => {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const imagem = document.createElement("img");
        imagem.src = url;
        imagem.alt = "Foto de referência enviada pelo cliente";
        imagem.loading = "lazy";

        link.append(imagem);
        galeria.append(link);
      });
    });
  }

  const rodape = document.createElement("footer");
  rodape.className = "admin-order__footer";
  const label = document.createElement("label");
  label.append(document.createTextNode("Estado "));

  const select = document.createElement("select");
  select.dataset.estado = "";
  select.dataset.id = encomenda.id;
  Object.entries(ESTADOS).forEach(([valor, texto]) => {
    const option = document.createElement("option");
    option.value = valor;
    option.textContent = texto;
    option.selected = valor === estado;
    select.append(option);
  });

  label.append(select);
  rodape.append(label);
  artigo.append(rodape);

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
  const [encomendas, cupoes] = await Promise.all([
    listarEncomendas(),
    listarCuponsAvaliacoes()
  ]);

  todasEncomendas = encomendas;
  cuponsPorCodigo = new Map(cupoes.map((cupao) => [cupao.cupao, cupao]));
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
