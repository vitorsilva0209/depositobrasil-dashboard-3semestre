export interface ProdutoListagem {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  descricao: string | null;
  imagem_url: string | null;
  estoque: number;
}