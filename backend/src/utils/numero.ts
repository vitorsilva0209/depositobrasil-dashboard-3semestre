import { ErroValidacao } from "../errors/AppError";

export function numeroObrigatorio(valor: unknown, campo: string): number {
  if (
    (typeof valor !== "number" && typeof valor !== "string") ||
    (typeof valor === "string" && !valor.trim())
  ) {
    throw new ErroValidacao(`Informe ${campo}.`);
  }

  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    throw new ErroValidacao(`Informe um valor numérico válido para ${campo}.`);
  }

  return numero;
}
