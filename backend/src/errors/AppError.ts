
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly detalhes?: unknown;

  constructor(
    mensagem: string,
    statusCode = 400,
    detalhes?: unknown
  ) {
    super(mensagem);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.detalhes = detalhes;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class RecursoNaoEncontradoError extends AppError {
  constructor(recurso: string) {
    super(`${recurso} não encontrado.`, 404);
    this.name = "RecursoNaoEncontradoError";
  }
}

export class ErroValidacao extends AppError {
  constructor(mensagem: string) {
    super(mensagem, 422);
    this.name = "ErroValidacao";
  }
}
