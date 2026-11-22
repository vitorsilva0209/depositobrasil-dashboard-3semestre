/** Normaliza parâmetros de paginação vindos da query string. */
export function normalizarPaginacao(
  paginaInformada: unknown,
  limiteInformado: unknown,
  limitePadrao = 10
): { pagina: number; limite: number } {
  const converter = (valor: unknown): number => {
    if (typeof valor !== "string" && typeof valor !== "number") {
      return Number.NaN;
    }

    if (typeof valor === "string" && !valor.trim()) {
      return Number.NaN;
    }

    return Number(valor);
  };

  const paginaNumero = converter(paginaInformada);
  const limiteNumero = converter(limiteInformado);

  const pagina = Number.isFinite(paginaNumero) && paginaNumero >= 1
    ? Math.min(Math.floor(paginaNumero), 1_000_000_000)
    : 1;

  const limite = Number.isFinite(limiteNumero) && limiteNumero >= 1
    ? Math.min(Math.floor(limiteNumero), 100)
    : limitePadrao;

  return { pagina, limite: Math.max(1, limite) };
}
