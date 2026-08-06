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
  grupo: string | null;
  descricao: string | null;
  imagem_url: string | null;
  href: string;
  preco: number | null;
  preco_label: string;
  destaque: boolean;
  ativa: boolean;
  ordem: number;
  criado_em: string;
}

export interface Produto {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  categoria_slug: string;
  imagem_url: string | null;
  imagens: string[];
  preco: number | null;
  preco_label: string;
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

export interface OrderItemPayload {
  slug: string;
  nome: string;
  categoria: string;
  quantidade: number;
  preco: number | null;
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
  tipo_celebracao: string | null;
  observacoes: string | null;
  total_estimado: number | null;
}

// Estrutura que o Supabase espera para tipar as queries
export interface Database {
  public: {
    Functions: {
      criar_encomenda: {
        Args: {
          p_cliente_nome: string;
          p_cliente_telefone: string;
          p_cliente_email: string | null;
          p_metodo_entrega: string;
          p_morada: string | null;
          p_codigo_postal: string | null;
          p_localidade: string | null;
          p_data_evento: string | null;
          p_tipo_celebracao: string | null;
          p_observacoes: string | null;
          p_itens: OrderItemPayload[];
        };
        Returns: string;
      };
    };
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
