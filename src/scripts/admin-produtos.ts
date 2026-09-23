import { exigirSessao, sair } from "@/lib/auth";
import {
  listarProdutosAdmin,
  listarCategoriasAdmin,
  actualizarProduto,
  criarProduto,
  eliminarProduto,
  carregarImagem,
  TAMANHO_MAXIMO_FOTO
} from "@/lib/admin-products";
import type { Produto, Categoria, VarianteSabor, GrupoVariante } from "@/types/database";

let produtos: Produto[] = [];
let categorias: Categoria[] = [];

function nomeCategoria(slug: string): string {
  return categorias.find((c) => c.slug === slug)?.nome ?? slug;
}

function slugify(texto: string): string {
  const MARCAS_COMBINADAS = new RegExp("[\\u0300-\\u036f]", "g");

  return texto
    .normalize("NFD")
    .replace(MARCAS_COMBINADAS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Minúsculas e sem acentos, para pesquisa/comparação insensível a maiúsculas e acentos. */
function normalizar(texto: string): string {
  const MARCAS_COMBINADAS = new RegExp("[\\u0300-\\u036f]", "g");

  return texto.normalize("NFD").replace(MARCAS_COMBINADAS, "").toLowerCase();
}

function produtoVazio(): Produto {
  return {
    id: "",
    slug: "",
    nome: "",
    descricao: "",
    categoria_slug: categorias[0]?.slug ?? "",
    imagem_url: "",
    imagens: [],
    preco: null,
    preco_label: "Sob consulta",
    destaque: false,
    ativo: true,
    ordem: 0,
    opcoes: {},
    quantidade_minima: 1,
    criado_em: "",
    atualizado_em: ""
  };
}

function criarCartao(produto: Produto, isNovo = false): HTMLElement {
  const artigo = document.createElement("article");
  artigo.className = `admin-product${produto.ativo ? "" : " is-inactive"}${isNovo ? " is-novo" : ""}`;
  artigo.dataset.id = produto.id;
  if (isNovo) {
    artigo.dataset.novo = "true";
  } else {
    artigo.dataset.pesquisa = normalizar(
      `${produto.nome} ${nomeCategoria(produto.categoria_slug)}`
    );
  }

  const categoriaCampo = isNovo
    ? `
      <label class="form-field">
        <span>Categoria</span>
        <select data-campo="categoria_slug">
          ${categorias
            .map(
              (categoria) =>
                `<option value="${categoria.slug}" ${
                  categoria.slug === produto.categoria_slug ? "selected" : ""
                }>${categoria.nome}</option>`
            )
            .join("")}
        </select>
      </label>
    `
    : `<span class="admin-product__category">${nomeCategoria(produto.categoria_slug)}</span>`;

  const slugCampo = isNovo
    ? `
      <label class="form-field">
        <span>Slug (URL)</span>
        <input type="text" data-campo="slug" value="${produto.slug}" placeholder="gerado automaticamente a partir do nome" />
      </label>
    `
    : "";

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
      ${categoriaCampo}

      <label class="form-field">
        <span>Nome</span>
        <input type="text" data-campo="nome" value="${produto.nome}" />
      </label>

      ${slugCampo}

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
          <span>Qtd. mínima</span>
          <input
            type="number"
            min="1"
            max="99"
            step="1"
            data-campo="quantidade_minima"
            value="${produto.quantidade_minima ?? 1}"
          />
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
          Galeria de fotos
          <small>Fotos extra do produto, além da principal. Pode escolher várias de uma vez.</small>
        </span>

        <div class="admin-gallery" data-gallery-rows></div>

        <label class="button button--secondary button--small admin-gallery__add">
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple data-gallery-upload hidden />
          + Adicionar fotos
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

      <div class="admin-product__flavors">
        <span class="admin-product__flavors-label">
          Variantes adicionais (grupos)
          <small>Para produtos com várias escolhas, como massa, cobertura ou recheio. A foto do produto não muda com estas variantes.</small>
        </span>

        <div class="admin-flavor-rows" data-group-rows></div>

        <button type="button" class="button button--secondary button--small" data-add-group>
          + Adicionar grupo de variantes
        </button>
      </div>

      <div class="admin-product__actions">
        <button type="button" class="button button--primary" data-guardar>
          ${isNovo ? "Criar produto" : "Guardar"}
        </button>
        ${
          isNovo
            ? `<button type="button" class="button button--secondary" data-cancelar-novo>Cancelar</button>`
            : `<button type="button" class="admin-product__delete" data-eliminar>Eliminar produto</button>`
        }
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

interface GrupoVarianteEdicao {
  nome: string;
  /** Texto em edição, com as opções separadas por vírgula. */
  opcoesTexto: string;
}

function criarLinhaGrupo(grupo: GrupoVarianteEdicao, indice: number): string {
  return `
    <div class="admin-flavor-row admin-flavor-row--group" data-group-row data-indice="${indice}">
      <input
        type="text"
        class="admin-flavor-row__nome"
        data-group-nome
        value="${grupo.nome}"
        placeholder="Nome do grupo (ex: Tipo de massa)"
      />

      <input
        type="text"
        class="admin-flavor-row__nome"
        data-group-opcoes
        value="${grupo.opcoesTexto}"
        placeholder="Opções separadas por vírgula (ex: Chocolate, Baunilha, Red Velvet)"
      />

      <button type="button" class="admin-flavor-row__remove" data-remove-group aria-label="Remover grupo">
        ✕
      </button>
    </div>
  `;
}

function ligarEventos(artigo: HTMLElement, produto: Produto, isNovo = false): void {
  const status = artigo.querySelector<HTMLElement>("[data-status]");

  const mostrar = (texto: string, erro = false): void => {
    if (!status) return;
    status.textContent = texto;
    status.classList.toggle("is-error", erro);
    if (!erro) {
      window.setTimeout(() => { status.textContent = ""; }, 3000);
    }
  };

  // Só existe em cartões de produto novo.
  const campoNome = artigo.querySelector<HTMLInputElement>('[data-campo="nome"]');
  const campoSlug = artigo.querySelector<HTMLInputElement>('[data-campo="slug"]');

  const obterSlugActual = (): string => {
    const valorSlug = campoSlug?.value.trim();
    if (valorSlug) return slugify(valorSlug);
    return slugify(campoNome?.value.trim() ?? "");
  };

  if (isNovo && campoNome && campoSlug) {
    let slugEditadoManualmente = false;

    campoSlug.addEventListener("input", () => {
      slugEditadoManualmente = campoSlug.value.trim() !== "";
    });

    campoNome.addEventListener("input", () => {
      if (!slugEditadoManualmente) {
        campoSlug.value = slugify(campoNome.value);
      }
    });
  }

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

          if (ficheiro.size > TAMANHO_MAXIMO_FOTO) {
            mostrar("A imagem excede 20 MB.", true);
            input.value = "";
            return;
          }

          mostrar("A carregar foto do sabor…");

          const slugBase = isNovo ? obterSlugActual() || "novo-produto" : produto.slug;
          const url = await carregarImagem(ficheiro, `${slugBase}-sabor`);

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

  // Estado local dos grupos de variantes (massa, cobertura, recheio, etc.).
  const grupos: GrupoVarianteEdicao[] = (produto.opcoes?.grupos_variantes ?? []).map(
    (grupo) => ({ nome: grupo.nome, opcoesTexto: grupo.opcoes.join(", ") })
  );

  const gruposContainer = artigo.querySelector<HTMLElement>("[data-group-rows]");

  const renderizarGrupos = (): void => {
    if (!gruposContainer) return;

    gruposContainer.innerHTML = grupos
      .map((grupo, indice) => criarLinhaGrupo(grupo, indice))
      .join("");

    gruposContainer.querySelectorAll<HTMLElement>("[data-group-row]").forEach((linha) => {
      const indice = Number(linha.dataset.indice);

      linha.querySelector<HTMLInputElement>("[data-group-nome]")?.addEventListener(
        "input",
        (evento) => {
          grupos[indice].nome = (evento.target as HTMLInputElement).value;
        }
      );

      linha.querySelector<HTMLInputElement>("[data-group-opcoes]")?.addEventListener(
        "input",
        (evento) => {
          grupos[indice].opcoesTexto = (evento.target as HTMLInputElement).value;
        }
      );

      linha.querySelector<HTMLButtonElement>("[data-remove-group]")?.addEventListener(
        "click",
        () => {
          grupos.splice(indice, 1);
          renderizarGrupos();
        }
      );
    });
  };

  renderizarGrupos();

  artigo.querySelector("[data-add-group]")?.addEventListener("click", () => {
    grupos.push({ nome: "", opcoesTexto: "" });
    renderizarGrupos();
  });

  // Galeria de fotos extra, editada antes de "Guardar".
  const galeria: string[] = Array.isArray(produto.imagens) ? [...produto.imagens] : [];

  const galeriaContainer = artigo.querySelector<HTMLElement>("[data-gallery-rows]");

  const renderizarGaleria = (): void => {
    if (!galeriaContainer) return;

    galeriaContainer.innerHTML = galeria
      .map(
        (url, indice) => `
          <div class="admin-gallery__item" data-gallery-item data-indice="${indice}">
            <img src="${url}" alt="" onerror="this.onerror=null;this.classList.add('is-broken')" />
            <button type="button" class="admin-gallery__remove" data-remove-gallery aria-label="Remover foto">✕</button>
          </div>
        `
      )
      .join("");

    galeriaContainer.querySelectorAll<HTMLElement>("[data-gallery-item]").forEach((item) => {
      const indice = Number(item.dataset.indice);

      item.querySelector("[data-remove-gallery]")?.addEventListener("click", () => {
        galeria.splice(indice, 1);
        renderizarGaleria();
        mostrar("Foto removida. Não esqueça de Guardar.");
      });
    });
  };

  renderizarGaleria();

  artigo.querySelector<HTMLInputElement>("[data-gallery-upload]")?.addEventListener(
    "change",
    async (evento) => {
      const input = evento.target as HTMLInputElement;
      const ficheiros = Array.from(input.files ?? []);
      if (ficheiros.length === 0) return;

      const slugBase = isNovo ? obterSlugActual() || "novo-produto" : produto.slug;
      let carregadas = 0;
      let falhadas = 0;

      for (const [posicao, ficheiro] of ficheiros.entries()) {
        if (ficheiro.size > TAMANHO_MAXIMO_FOTO) {
          falhadas += 1;
          continue;
        }

        mostrar(`A carregar foto ${posicao + 1} de ${ficheiros.length}…`);

        const url = await carregarImagem(ficheiro, `${slugBase}-galeria`);

        if (url) {
          galeria.push(url);
          carregadas += 1;
          renderizarGaleria();
        } else {
          falhadas += 1;
        }
      }

      input.value = "";

      if (falhadas > 0) {
        mostrar(
          `${carregadas} foto(s) carregada(s), ${falhadas} falharam (máx. 20 MB cada). Não esqueça de Guardar.`,
          true
        );
      } else {
        mostrar(`${carregadas} foto(s) carregada(s). Não esqueça de Guardar.`);
      }
    }
  );

  // Imagem principal: em produtos novos ainda não há id, por isso a foto
  // fica em memória e só é gravada quando se clica em "Criar produto".
  let imagemUrl = produto.imagem_url ?? "";

  artigo.querySelector("[data-cancelar-novo]")?.addEventListener("click", () => {
    artigo.remove();
  });

  artigo.querySelector("[data-eliminar]")?.addEventListener("click", async () => {
    const confirmado = window.confirm(
      `Eliminar definitivamente "${produto.nome}"? Esta ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    mostrar("A eliminar…");

    const sucesso = await eliminarProduto(produto.id);

    mostrar(sucesso ? "Eliminado ✓" : "Não foi possível eliminar.", !sucesso);

    if (sucesso) await carregar();
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
        elemento instanceof HTMLSelectElement ||
        elemento instanceof HTMLInputElement ||
        elemento instanceof HTMLTextAreaElement
      ) {
        campos[campo] = elemento.value.trim();
      }
    });

    // A foto é opcional; só é preciso o nome do sabor.
    const saborIncompleto = sabores.some(
      (sabor) => sabor.nome.trim() === "" && sabor.imagem.trim() !== ""
    );

    if (saborIncompleto) {
      mostrar("Há um sabor com foto mas sem nome. Adicione o nome ou remova a foto.", true);
      return;
    }

    // Um grupo só é válido com nome e pelo menos uma opção.
    const grupoIncompleto = grupos.some((grupo) => {
      const nome = grupo.nome.trim();
      const opcoes = grupo.opcoesTexto.split(",").map((o) => o.trim()).filter(Boolean);
      return (nome !== "" && opcoes.length === 0) || (nome === "" && opcoes.length > 0);
    });

    if (grupoIncompleto) {
      mostrar("Há um grupo de variantes com nome mas sem opções (ou o contrário). Complete ou remova-o.", true);
      return;
    }

    const gruposVariantes: GrupoVariante[] = grupos
      .map((grupo) => ({
        nome: grupo.nome.trim(),
        opcoes: grupo.opcoesTexto.split(",").map((o) => o.trim()).filter(Boolean)
      }))
      .filter((grupo) => grupo.nome !== "" && grupo.opcoes.length > 0);

    campos.opcoes = {
      sabores: sabores
        .map((sabor) => ({ nome: sabor.nome.trim(), imagem: sabor.imagem.trim() }))
        .filter((sabor) => sabor.nome !== ""),
      grupos_variantes: gruposVariantes
    };

    campos.imagens = [...galeria];

    // Vazio ou inválido = sem mínimo (1). Limite de 99, como no carrinho.
    const minimo = Number(campos.quantidade_minima);
    campos.quantidade_minima =
      Number.isFinite(minimo) && minimo >= 1 ? Math.min(99, Math.trunc(minimo)) : 1;

    if (isNovo) {
      const nome = String(campos.nome ?? "").trim();
      const categoriaSlug = String(campos.categoria_slug ?? "").trim();
      const slug = obterSlugActual();

      if (!nome) {
        mostrar("Indique o nome do produto.", true);
        return;
      }

      if (!categoriaSlug) {
        mostrar("Escolha uma categoria.", true);
        return;
      }

      if (!slug) {
        mostrar("Indique um slug (ou preencha o nome para o gerar).", true);
        return;
      }

      if (produtos.some((existente) => existente.slug === slug)) {
        mostrar("Já existe um produto com este slug. Escolha outro.", true);
        return;
      }

      mostrar("A criar…");

      const novo = await criarProduto({
        nome,
        categoria_slug: categoriaSlug,
        slug,
        descricao: String(campos.descricao ?? ""),
        preco: (campos.preco as number | null) ?? null,
        preco_label: String(campos.preco_label ?? "Sob consulta"),
        imagem_url: imagemUrl,
        imagens: [...galeria],
        destaque: Boolean(campos.destaque),
        ativo: Boolean(campos.ativo),
        ordem: (campos.ordem as number | null) ?? 0,
        quantidade_minima: campos.quantidade_minima as number,
        opcoes: campos.opcoes as { sabores?: VarianteSabor[]; grupos_variantes?: GrupoVariante[] }
      });

      mostrar(novo ? "Produto criado ✓" : "Não foi possível criar o produto.", !novo);

      if (novo) await carregar();
      return;
    }

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

      if (ficheiro.size > TAMANHO_MAXIMO_FOTO) {
        mostrar("A imagem excede 20 MB.", true);
        input.value = "";
        return;
      }

      mostrar("A carregar imagem…");

      const slugBase = isNovo ? obterSlugActual() || "novo-produto" : produto.slug;
      const url = await carregarImagem(ficheiro, slugBase);

      if (!url) {
        mostrar("Não foi possível carregar a imagem.", true);
        input.value = "";
        return;
      }

      const imagemElemento = artigo.querySelector<HTMLImageElement>(".admin-product__image img");
      if (imagemElemento) {
        imagemElemento.classList.remove("is-broken");
        imagemElemento.src = url;
      }

      if (isNovo) {
        imagemUrl = url;
        mostrar("Foto carregada. Não esqueça de criar o produto.");
        return;
      }

      const guardado = await actualizarProduto(produto.id, { imagem_url: url });

      mostrar(guardado ? "Imagem actualizada ✓" : "Erro ao guardar.", !guardado);

      if (guardado) await carregar();
    }
  );
}

function filtrarProdutos(termo: string): void {
  const lista = document.querySelector<HTMLElement>("[data-products-list]");
  if (!lista) return;

  const termoNormalizado = normalizar(termo.trim());
  const cartoes = lista.querySelectorAll<HTMLElement>(".admin-product:not([data-novo])");

  let visiveis = 0;

  cartoes.forEach((cartao) => {
    const corresponde =
      !termoNormalizado || (cartao.dataset.pesquisa ?? "").includes(termoNormalizado);
    cartao.hidden = !corresponde;
    if (corresponde) visiveis += 1;
  });

  let semResultados = lista.querySelector<HTMLElement>("[data-sem-resultados]");

  if (visiveis === 0 && termoNormalizado && cartoes.length > 0) {
    if (!semResultados) {
      semResultados = document.createElement("p");
      semResultados.className = "admin-loading";
      semResultados.dataset.semResultados = "true";
      semResultados.textContent = "Nenhum produto encontrado.";
      lista.append(semResultados);
    }
  } else {
    semResultados?.remove();
  }
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

  const campoPesquisa = document.querySelector<HTMLInputElement>("[data-produto-pesquisa]");
  if (campoPesquisa?.value.trim()) {
    filtrarProdutos(campoPesquisa.value);
  }
}

async function carregar(): Promise<void> {
  [produtos, categorias] = await Promise.all([
    listarProdutosAdmin(),
    listarCategoriasAdmin()
  ]);

  renderizar();
}

function adicionarRascunho(): void {
  const lista = document.querySelector<HTMLElement>("[data-products-list]");
  if (!lista) return;

  // Só um rascunho de cada vez.
  const rascunhoExistente = lista.querySelector<HTMLElement>('[data-novo="true"]');
  if (rascunhoExistente) {
    rascunhoExistente.scrollIntoView({ behavior: "smooth", block: "start" });
    rascunhoExistente.querySelector<HTMLInputElement>('[data-campo="nome"]')?.focus();
    return;
  }

  lista.querySelector(".admin-loading")?.remove();

  const rascunho = produtoVazio();
  const artigo = criarCartao(rascunho, true);
  lista.prepend(artigo);
  ligarEventos(artigo, rascunho, true);

  artigo.scrollIntoView({ behavior: "smooth", block: "start" });
  artigo.querySelector<HTMLInputElement>('[data-campo="nome"]')?.focus();
}

async function iniciar(): Promise<void> {
  const lista = document.querySelector("[data-products-list]");
  if (!lista) return;

  const autorizado = await exigirSessao();
  if (!autorizado) return;

  document.querySelector("[data-logout]")?.addEventListener("click", sair);
  document.querySelector("[data-novo-produto]")?.addEventListener("click", adicionarRascunho);

  const campoPesquisa = document.querySelector<HTMLInputElement>("[data-produto-pesquisa]");
  campoPesquisa?.addEventListener("input", () => filtrarProdutos(campoPesquisa.value));

  await carregar();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar, { once: true });
} else {
  iniciar();
}