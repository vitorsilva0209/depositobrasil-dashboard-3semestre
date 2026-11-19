import { Entidade } from "../entities/Entidade";

/**
 * Demonstra polimorfismo:
 * recebe diferentes subclasses por meio da classe abstrata Entidade.
 */
export function validarEntidades(entidades: readonly Entidade[]): string[] {
  for (const entidade of entidades) {
    entidade.validar();
  }

  return entidades.map((entidade) => entidade.obterTipo());
}
