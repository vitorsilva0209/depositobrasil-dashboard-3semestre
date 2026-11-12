
import { Entidade } from "../entities/Entidade";
import { ErroValidacao } from "../errors/AppError";

export class Produto extends Entidade {
  private _id?: number;
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
    estoque: number,
    id?: number
  ) {
    super();

    this._id = id;
    this._nome = "";
    this._categoria = "";
    this._preco = 0;
    this._descricao = descricao || "";
    this._imagemUrl = imagemUrl || "";
    this._estoque = 0;

    this.nome = nome;
    this.categoria = categoria;
    this.preco = preco;
    this.estoque = estoque;

    this.validar();
  }

  get id(): number | undefined {
    return this._id;
  }

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

  set nome(valor: string) {
    if (typeof valor !== "string" || !valor.trim()) {
      throw new ErroValidacao("O nome do produto é obrigatório.");
    }

    this._nome = valor.trim();
  }

  set categoria(valor: string) {
    if (typeof valor !== "string" || !valor.trim()) {
      throw new ErroValidacao("A categoria é obrigatória.");
    }

    this._categoria = valor.trim();
  }

  set preco(valor: number) {
    if (!Number.isFinite(valor) || valor < 0) {
      throw new ErroValidacao(
        "O preço deve ser um número válido e positivo."
      );
    }

    this._preco = valor;
  }

  set estoque(valor: number) {
    if (!Number.isInteger(valor) || valor < 0) {
      throw new ErroValidacao(
        "O estoque deve ser um número inteiro não negativo."
      );
    }

    this._estoque = valor;
  }

  validar(): void {
    if (
      this._id !== undefined &&
      (!Number.isInteger(this._id) || this._id <= 0)
    ) {
      throw new ErroValidacao("O ID do produto deve ser um inteiro positivo.");
    }

    if (!this._nome.trim()) {
      throw new ErroValidacao("O nome do produto é obrigatório.");
    }

    if (!this._categoria.trim()) {
      throw new ErroValidacao("A categoria do produto é obrigatória.");
    }

    if (!Number.isFinite(this._preco) || this._preco < 0) {
      throw new ErroValidacao("O preço do produto é inválido.");
    }

    if (!Number.isInteger(this._estoque) || this._estoque < 0) {
      throw new ErroValidacao("O estoque do produto é inválido.");
    }
  }

  obterTipo(): string {
    return "Produto";
  }

  atualizarEstoque(quantidade: number): void {
    this.estoque = quantidade;
    this.validar();
  }

  atualizarPreco(novoPreco: number): void {
    this.preco = novoPreco;
    this.validar();
  }
}
