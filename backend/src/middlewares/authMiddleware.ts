import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface RequisicaoAutenticada extends Request {
  usuarioId?: string;
}

export function autenticarToken(
  req: RequisicaoAutenticada,
  res: Response,
  next: NextFunction
): void {
  const autorizacao = req.headers.authorization;

  if (!autorizacao || !/^Bearer [^\s]+$/.test(autorizacao)) {
    res.status(401).json({
      sucesso: false,
      mensagem: "Token de autenticação não informado.",
    });
    return;
  }

  const token = autorizacao.slice(7);
  const segredo = process.env.JWT_SECRET;

  if (!segredo || segredo.length < 32) {
    res.status(500).json({
      sucesso: false,
      mensagem: "Configuração JWT inválida no servidor.",
    });
    return;
  }

  try {
    const dados = jwt.verify(token, segredo, {
      algorithms: ["HS256"],
    });

    if (
      typeof dados === "string" ||
      typeof dados.sub !== "string" ||
      !/^[1-9]\d*$/.test(dados.sub) ||
      !Number.isSafeInteger(Number(dados.sub))
    ) {
      res.status(401).json({
        sucesso: false,
        mensagem: "Token inválido.",
      });
      return;
    }

    req.usuarioId = dados.sub;
    next();
  } catch {
    res.status(401).json({
      sucesso: false,
      mensagem: "Token inválido ou expirado.",
    });
  }
}