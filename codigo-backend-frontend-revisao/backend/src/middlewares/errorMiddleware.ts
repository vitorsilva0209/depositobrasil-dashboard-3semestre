import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError";

export const errorMiddleware: ErrorRequestHandler = (
  erro,
  _req,
  res,
  _next
) => {
  void _next;

  if (erro instanceof AppError) {
      res.status(erro.statusCode).json({
      sucesso: false,
      mensagem: erro.message,
    });
    return;
  }

  // Não registrar dados de usuários, senhas ou detalhes do banco.
  console.error("Erro interno não tratado na API.");

  res.status(500).json({
    sucesso: false,
    mensagem: "Erro interno do servidor.",
  });
};