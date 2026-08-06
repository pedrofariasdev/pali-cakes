export type EstadoEncomenda =
  | "novo"
  | "confirmado"
  | "em_producao"
  | "pronto"
  | "entregue"
  | "cancelado";

export type MetodoEntrega = "levantamento" | "entrega";

export interface Categoria {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  imagem_url: string | null;
  ordem: number;
  ativa: boolean;
  criado_em: string;
}

export interface Produto {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  categoria_id: string | null;
  preco: number | null;
  preco_nota: string | null;
  imagem_url: string | null;
  imagens: string[];
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  opcoes: Record<string, unknown>;
  criado_em: string;
  atualizado_em: string;
}

export interface Encomenda {
  id: string;
  referencia: string;
  criado_em: string;
  estado: EstadoEncomenda;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email: string | null;
  metodo_entrega: MetodoEntrega;
  morada: string | null;
  codigo_postal: string | null;
  localidade: string | null;
  data_evento: string | null;
  observacoes: string | null;
  total_estimado: number | null;
}

export interface EncomendaItem {
  id: string;
  encomenda_id: string;
  produto_slug: string;
  produto_nome: string;
  categoria: string | null;
  quantidade: number;
  preco_unitario: number | null;
  personalizacao: Record<string, unknown>;
}

// Estrutura que o Supabase espera para tipar as queries
export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: Categoria;
        Insert: Omit<Categoria, "id" | "criado_em">;
        Update: Partial<Categoria>;
      };
      produtos: {
        Row: Produto;
        Insert: Omit<Produto, "id" | "criado_em" | "atualizado_em">;
        Update: Partial<Produto>;
      };
      encomendas: {
        Row: Encomenda;
        Insert: Omit<Encomenda, "id" | "referencia" | "criado_em" | "estado">;
        Update: Partial<Encomenda>;
      };
      encomenda_itens: {
        Row: EncomendaItem;
        Insert: Omit<EncomendaItem, "id">;
        Update: Partial<EncomendaItem>;
      };
    };
  };
}