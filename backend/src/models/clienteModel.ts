
import { ErroValidacao } from "../errors/AppError";
import { Entidade } from "../entities/Entidade";

export class Cliente extends Entidade {
  private _id?: number;
  private _nome: string;
  private _email: string;
  private _telefone: string;

  constructor(
    nome: string,
    email: string = "",
    telefone: string = "",
    id?: number
  ) {
    super();

    this._nome = "";
    this._email = "";
    this._telefone = "";
    this._id = id;

    this.nome = nome;
    this.email = email;
    this.telefone = telefone;

    this.validar();
  }

  get id(): number | undefined {
    return this._id;
  }

  get nome(): string {
    return this._nome;
  }

  get email(): string {
    return this._email;
  }

  get telefone(): string {
    return this._telefone;
  }

  set nome(valor: string) {
    if (typeof valor !== "string" || !valor.trim()) {
      throw new ErroValidacao("O nome do cliente é obrigatório.");
    }

    this._nome = valor.trim();
  }

  set email(valor: string) {
    if (typeof valor !== "string") {
      throw new ErroValidacao("O e-mail do cliente é inválido.");
    }

    const emailLimpo = valor.trim();

    if (
      emailLimpo &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)
    ) {
      throw new ErroValidacao("Informe um e-mail válido.");
    }

    this._email = emailLimpo;
  }

  set telefone(valor: string) {
    if (typeof valor !== "string") {
      throw new ErroValidacao("O telefone do cliente é inválido.");
    }

    this._telefone = valor.trim();
  }

  validar(): void {
    if (!this._nome.trim()) {
      throw new ErroValidacao("O nome do cliente é obrigatório.");
    }

    if (
      this._email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this._email)
    ) {
      throw new ErroValidacao("O e-mail do cliente é inválido.");
    }
  }

  obterTipo(): string {
    return "Cliente";
  }
}
