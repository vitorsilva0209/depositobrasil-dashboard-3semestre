export class AppError extends Error {
  public readonly statusCode: number;
  public readonly detalhes?: unknown;

  constructor(
    mensagem: string,
    statusCode = 400,
    detalhes?: unknown
  ) {
    super(mensagem);

    this.name = new.target.name;
    this.statusCode = statusCode;
    this.detalhes = detalhes;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RecursoNaoEncontradoError extends AppError {
  constructor(recurso: string) {
    super(`${recurso} não encontrado.`, 404);
  }
}

export class ErroValidacao extends AppError {
  constructor(mensagem: string) {
    super(mensagem, 422);
  }
}