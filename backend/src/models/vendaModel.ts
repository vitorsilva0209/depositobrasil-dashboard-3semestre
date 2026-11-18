
import { Entidade } from "../entities/Entidade";
import { ErroValidacao } from "../errors/AppError";

export class Venda extends Entidade {
  private _id?: number;
  private _produtoId: number;
  private _quantidade: number;
  private _dataVenda?: string;
  private _produtoNome?: string;

  constructor(
    produtoId: number,
    quantidade: number,
    dataVenda?: string,
    id?: number,
    produtoNome?: string
  ) {
    super();

    this._produtoId = 0;
    this._quantidade = 0;
    this._dataVenda = dataVenda;
    this._id = id;
    this._produtoNome = produtoNome;

    this.produtoId = produtoId;
    this.quantidade = quantidade;

    this.validar();
  }

  get id(): number | undefined {
    return this._id;
  }

  get produtoId(): number {
    return this._produtoId;
  }

  get quantidade(): number {
    return this._quantidade;
  }

  get dataVenda(): string | undefined {
    return this._dataVenda;
  }

  get produtoNome(): string | undefined {
    return this._produtoNome;
  }

  set produtoId(valor: number) {
    if (!Number.isInteger(valor) || valor <= 0) {
      throw new ErroValidacao("Selecione um produto válido.");
    }

    this._produtoId = valor;
  }

  set quantidade(valor: number) {
    if (!Number.isInteger(valor) || valor <= 0) {
      throw new ErroValidacao(
        "A quantidade deve ser um número inteiro maior que zero."
      );
    }

    this._quantidade = valor;
  }

  validar(): void {
    if (!Number.isInteger(this._produtoId) || this._produtoId <= 0) {
      throw new ErroValidacao("Selecione um produto válido.");
    }

    if (!Number.isInteger(this._quantidade) || this._quantidade <= 0) {
      throw new ErroValidacao(
        "A quantidade deve ser um número inteiro maior que zero."
      );
    }

    if (
      this._dataVenda !== undefined &&
      !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(this._dataVenda)
    ) {
      throw new ErroValidacao("Informe uma data de venda válida.");
    }
  }

  obterTipo(): string {
    return "Venda";
  }
}
