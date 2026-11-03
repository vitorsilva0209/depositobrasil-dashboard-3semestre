import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface RequisicaoAutenticada extends Request {
  usuarioId?: string;
}

export function autenticarToken(
  req: RequisicaoAutenticada,
  res: Response,
  next: NextFunction
) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao || !autorizacao.startsWith("Bearer ")) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token de autenticação não informado."
    });
  }

  const token = autorizacao.split(" ")[1];
  const segredo = process.env.JWT_SECRET;

  if (!segredo || segredo.length < 32) {
    return res.status(500).json({
      sucesso: false,
      mensagem: "Configuração JWT inválida no servidor."
    });
  }

  try {
    const dados = jwt.verify(token, segredo);

    if (typeof dados === "string" || !dados.sub) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token inválido."
      });
    }

    req.usuarioId = dados.sub;
    next();
  } catch {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token inválido ou expirado."
    });
  }
}