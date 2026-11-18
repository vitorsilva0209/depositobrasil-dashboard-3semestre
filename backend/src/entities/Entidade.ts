
export abstract class Entidade {
  protected constructor() {}

  // Toda entidade deverá implementar suas próprias validações.
  abstract validar(): void;

  // Cada entidade deverá informar seu tipo.
  abstract obterTipo(): string;
}
