
export class Produto {
  private _nome: string;
  private _categoria: string;
  private _preco: number;
  private _descricao: string;
  private _imagemUrl: string;
  private _estoque: number;

  constructor(
    nome: string,
    categoria: string,
    preco: number,
    descricao: string,
    imagemUrl: string,
    estoque: number
  ) {
    // Inicialização controlada pelo construtor
    this._nome = "";
    this._categoria = "";
    this._preco = 0;
    this._descricao = descricao || "";
    this._imagemUrl = imagemUrl || "";
    this._estoque = 0;

    // Utiliza setters para validar os dados
    this.nome = nome;
    this.categoria = categoria;
    this.preco = preco;
    this.estoque = estoque;
  }

  // GETTERS: permitem consultar os dados
  get nome(): string {
    return this._nome;
  }

  get categoria(): string {
    return this._categoria;
  }

  get preco(): number {
    return this._preco;
  }

  get descricao(): string {
    return this._descricao;
  }

  get imagemUrl(): string {
    return this._imagemUrl;
  }

  get estoque(): number {
    return this._estoque;
  }

  // SETTERS: permitem alterações com validação
  set nome(valor: string) {
    if (!valor || !valor.trim()) {
      throw new Error("O nome do produto é obrigatório.");
    }

    this._nome = valor.trim();
  }

  set categoria(valor: string) {
    if (!valor || !valor.trim()) {
      throw new Error("A categoria é obrigatória.");
    }

    this._categoria = valor.trim();
  }

  set preco(valor: number) {
    if (!Number.isFinite(valor) || valor < 0) {
      throw new Error("O preço deve ser um número válido e positivo.");
    }

    this._preco = valor;
  }

  set estoque(valor: number) {
    if (!Number.isInteger(valor) || valor < 0) {
      throw new Error("O estoque deve ser um número inteiro não negativo.");
    }

    this._estoque = valor;
  }

  // Métodos com regras de negócio
  atualizarEstoque(quantidade: number): void {
    this.estoque = quantidade;
  }

  atualizarPreco(novoPreco: number): void {
    this.preco = novoPreco;
  }
}
