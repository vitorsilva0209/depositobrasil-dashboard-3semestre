
import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError";

export const errorMiddleware: ErrorRequestHandler = (
  erro,
  _req,
  res,
  _next
) => {
  // Mantém a assinatura de quatro parâmetros exigida pelo Express.
  void _next;

  if (erro instanceof AppError) {
    res.status(erro.statusCode).json({
      sucesso: false,
      mensagem: erro.message,
      detalhes: erro.detalhes,
    });
    return;
  }

  console.error("Erro inesperado:", erro);

  res.status(500).json({
    sucesso: false,
    mensagem: "Erro interno do servidor.",
  });
};
