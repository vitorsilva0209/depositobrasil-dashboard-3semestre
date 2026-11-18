
import { Entidade } from "../entities/Entidade";
import { ErroValidacao } from "../errors/AppError";

export class Funcionario extends Entidade {
  private _id?: number;
  private _nome: string;
  private _cargo: string;
  private _salario: number;

  constructor(
    nome: string,
    cargo: string,
    salario: number,
    id?: number
  ) {
    super();

    this._nome = "";
    this._cargo = "";
    this._salario = 0;
    this._id = id;

    this.nome = nome;
    this.cargo = cargo;
    this.salario = salario;

    this.validar();
  }

  get id(): number | undefined {
    return this._id;
  }

  get nome(): string {
    return this._nome;
  }

  get cargo(): string {
    return this._cargo;
  }

  get salario(): number {
    return this._salario;
  }

  set nome(valor: string) {
    if (typeof valor !== "string" || !valor.trim()) {
      throw new ErroValidacao("O nome do funcionário é obrigatório.");
    }

    this._nome = valor.trim();
  }

  set cargo(valor: string) {
    if (typeof valor !== "string" || !valor.trim()) {
      throw new ErroValidacao("O cargo do funcionário é obrigatório.");
    }

    this._cargo = valor.trim();
  }

  set salario(valor: number) {
    if (!Number.isFinite(valor) || valor < 0) {
      throw new ErroValidacao("Informe um salário válido.");
    }

    this._salario = valor;
  }

  validar(): void {
    if (!this._nome.trim()) {
      throw new ErroValidacao("O nome do funcionário é obrigatório.");
    }

    if (!this._cargo.trim()) {
      throw new ErroValidacao("O cargo do funcionário é obrigatório.");
    }

    if (!Number.isFinite(this._salario) || this._salario < 0) {
      throw new ErroValidacao("O salário do funcionário é inválido.");
    }
  }

  obterTipo(): string {
    return "Funcionário";
  }
}
