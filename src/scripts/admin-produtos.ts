import { exigirSessao, sair } from "@/lib/auth";
import {
  listarProdutosAdmin,
  listarCategoriasAdmin,
  actualizarProduto,
  carregarImagem
} from "@/lib/admin-products";
import type { Produto, Categoria, VarianteSabor } from "@/types/database";

let produtos: Produto[] = [];
let categorias: Categoria[] = [];

function nomeCategoria(slug: string): string {
  return categorias.find((c) => c.slug === slug)?.nome ?? slug;
}

function criarCartao(produto: Produto): HTMLElement {
  const artigo = document.createElement("article");
  artigo.className = `admin-product${produto.ativo ? "" : " is-inactive"}`;
  artigo.dataset.id = produto.id;

  artigo.innerHTML = `
    <div class="admin-product__image">
      <img
        src="${produto.imagem_url ?? ""}"
        alt="${produto.nome}"
        onerror="this.onerror=null;this.classList.add('is-broken')"
      />
      <label class="admin-product__upload">
        <input type="file" accept="image/jpeg,image/png,image/webp" data-upload hidden />
        <span>Trocar foto</span>
      </label>
    </div>

    <div class="admin-product__fields">
      <span class="admin-product__category">${nomeCategoria(produto.categoria_slug)}</span>

      <label class="form-field">
        <span>Nome</span>
        <input type="text" data-campo="nome" value="${produto.nome}" />
      </label>

      <label class="form-field">
        <span>Descrição</span>
        <textarea data-campo="descricao" rows="2">${produto.descricao ?? ""}</textarea>
      </label>

      <div class="admin-product__row">
        <label class="form-field">
          <span>Preço (€)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            data-campo="preco"
            value="${produto.preco ?? ""}"
            placeholder="Vazio = sob consulta"
          />
        </label>

        <label class="form-field">
          <span>Etiqueta de preço</span>
          <input type="text" data-campo="preco_label" value="${produto.preco_label}" />
        </label>

        <label class="form-field">
          <span>Ordem</span>
          <input type="number" data-campo="ordem" value="${produto.ordem}" />
        </label>
      </div>

      <div class="admin-product__toggles">
        <label>
          <input type="checkbox" data-campo="ativo" ${produto.ativo ? "checked" : ""} />
          Visível no site
        </label>

        <label>
          <input type="checkbox" data-campo="destaque" ${produto.destaque ? "checked" : ""} />
          Destaque na página inicial
        </label>
      </div>

      <div class="admin-product__flavors">
        <span class="admin-product__flavors-label">
          Sabores / variantes
          <small>Se este produto tiver sabores à escolha, adicione aqui um nome e uma foto para cada um.</small>
        </span>

        <div class="admin-flavor-rows" data-flavor-rows></div>

        <button type="button" class="button button--secondary button--small" data-add-flavor>
          + Adicionar sabor
        </button>
      </div>

      <div class="admin-product__actions">
        <button type="button" class="button button--primary" data-guardar>
          Guardar
        </button>
        <span class="admin-product__status" data-status></span>
      </div>
    </div>
  `;

  return artigo;
}

function criarLinhaSabor(sabor: VarianteSabor, indice: number): string {
  const semFoto = !sabor.imagem.trim();

  return `
    <div class="admin-flavor-row" data-flavor-row data-indice="${indice}">
      <div class="admin-flavor-row__image">
        <img
          src="${sabor.imagem}"
          alt=""
          class="${semFoto ? "is-broken" : ""}"
          onerror="this.onerror=null;this.classList.add('is-broken')"
        />
        <label class="admin-flavor-row__upload">
          <input type="file" accept="image/jpeg,image/png,image/webp" data-flavor-upload hidden />
          <span>Foto</span>
        </label>
      </div>

      <input
        type="text"
        class="admin-flavor-row__nome"
        data-flavor-nome
        value="${sabor.nome}"
        placeholder="Nome do sabor (ex: Ninho)"
      />

      <button type="button" class="admin-flavor-row__remove" data-remove-flavor aria-label="Remover sabor">
        ✕
      </button>
    </div>
  `;
}

function ligarEventos(artigo: HTMLElement, produto: Produto): void {
  const status = artigo.querySelector<HTMLElement>("[data-status]");

  const mostrar = (texto: string, erro = false): void => {
    if (!status) return;
    status.textContent = texto;
    status.classList.toggle("is-error", erro);
    if (!erro) {
      window.setTimeout(() => { status.textContent = ""; }, 3000);
    }
  };

  // Estado local dos sabores/variantes, editado antes de "Guardar".
  const sabores: VarianteSabor[] = (produto.opcoes?.sabores ?? []).map(
    (sabor) => ({ ...sabor })
  );

  const linhasContainer = artigo.querySelector<HTMLElement>("[data-flavor-rows]");

  const renderizarSabores = (): void => {
    if (!linhasContainer) return;

    linhasContainer.innerHTML = sabores
      .map((sabor, indice) => criarLinhaSabor(sabor, indice))
      .join("");

    linhasContainer.querySelectorAll<HTMLElement>("[data-flavor-row]").forEach((linha) => {
      const indice = Number(linha.dataset.indice);

      linha.querySelector<HTMLInputElement>("[data-flavor-nome]")?.addEventListener(
        "input",
        (evento) => {
          sabores[indice].nome = (evento.target as HTMLInputElement).value;
        }
      );

      linha.querySelector<HTMLButtonElement>("[data-remove-flavor]")?.addEventListener(
        "click",
        () => {
          sabores.splice(indice, 1);
          renderizarSabores();
        }
      );

      linha.querySelector<HTMLInputElement>("[data-flavor-upload]")?.addEventListener(
        "change",
        async (evento) => {
          const input = evento.target as HTMLInputElement;
          const ficheiro = input.files?.[0];
          if (!ficheiro) return;

          if (ficheiro.size > 5 * 1024 * 1024) {
            mostrar("A imagem excede 5 MB.", true);
            input.value = "";
            return;
          }

          mostrar("A carregar foto do sabor…");

          const url = await carregarImagem(ficheiro, `${produto.slug}-sabor`);

          if (!url) {
            mostrar("Não foi possível carregar a foto.", true);
            input.value = "";
            return;
          }

          sabores[indice].imagem = url;
          mostrar("Foto carregada. Não esqueça de Guardar.");
          renderizarSabores();
        }
      );
    });
  };

  renderizarSabores();

  artigo.querySelector("[data-add-flavor]")?.addEventListener("click", () => {
    sabores.push({ nome: "", imagem: "" });
    renderizarSabores();
  });

  // Guardar alterações
  artigo.querySelector("[data-guardar]")?.addEventListener("click", async () => {
    const campos: Record<string, unknown> = {};

    artigo.querySelectorAll<HTMLElement>("[data-campo]").forEach((elemento) => {
      const campo = elemento.dataset.campo;
      if (!campo) return;

      if (elemento instanceof HTMLInputElement && elemento.type === "checkbox") {
        campos[campo] = elemento.checked;
      } else if (elemento instanceof HTMLInputElement && elemento.type === "number") {
        const valor = elemento.value.trim();
        campos[campo] = valor === "" ? null : Number(valor);
      } else if (
        elemento instanceof HTMLInputElement ||
        elemento instanceof HTMLTextAreaElement
      ) {
        campos[campo] = elemento.value.trim();
      }
    });

    const saborIncompleto = sabores.some(
      (sabor) =>
        (sabor.nome.trim() !== "" && sabor.imagem.trim() === "") ||
        (sabor.nome.trim() === "" && sabor.imagem.trim() !== "")
    );

    if (saborIncompleto) {
      mostrar("Cada sabor precisa de nome e foto. Complete ou remova o sabor incompleto.", true);
      return;
    }

    campos.opcoes = {
      sabores: sabores
        .map((sabor) => ({ nome: sabor.nome.trim(), imagem: sabor.imagem.trim() }))
        .filter((sabor) => sabor.nome !== "" && sabor.imagem !== "")
    };

    mostrar("A guardar…");

    const sucesso = await actualizarProduto(produto.id, campos);

    mostrar(sucesso ? "Guardado ✓" : "Não foi possível guardar.", !sucesso);

    if (sucesso) await carregar();
  });

  // Upload de imagem
  artigo.querySelector<HTMLInputElement>("[data-upload]")?.addEventListener(
    "change",
    async (evento) => {
      const input = evento.target as HTMLInputElement;
      const ficheiro = input.files?.[0];
      if (!ficheiro) return;

      if (ficheiro.size > 5 * 1024 * 1024) {
        mostrar("A imagem excede 5 MB.", true);
        input.value = "";
        return;
      }

      mostrar("A carregar imagem…");

      const url = await carregarImagem(ficheiro, produto.slug);

      if (!url) {
        mostrar("Não foi possível carregar a imagem.", true);
        input.value = "";
        return;
      }

      const guardado = await actualizarProduto(produto.id, { imagem_url: url });

      mostrar(guardado ? "Imagem actualizada ✓" : "Erro ao guardar.", !guardado);

      if (guardado) await carregar();
    }
  );
}

function renderizar(): void {
  const lista = document.querySelector<HTMLElement>("[data-products-list]");
  if (!lista) return;

  lista.replaceChildren();

  if (produtos.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "admin-loading";
    vazio.textContent = "Ainda não há produtos.";
    lista.append(vazio);
    return;
  }

  produtos.forEach((produto) => {
    const artigo = criarCartao(produto);
    lista.append(artigo);
    ligarEventos(artigo, produto);
  });
}

async function carregar(): Promise<void> {
  [produtos, categorias] = await Promise.all([
    listarProdutosAdmin(),
    listarCategoriasAdmin()
  ]);

  renderizar();
}

async function iniciar(): Promise<void> {
  const lista = document.querySelector("[data-products-list]");
  if (!lista) return;

  const autorizado = await exigirSessao();
  if (!autorizado) return;

  document.querySelector("[data-logout]")?.addEventListener("click", sair);

  await carregar();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar, { once: true });
} else {
  iniciar();
}