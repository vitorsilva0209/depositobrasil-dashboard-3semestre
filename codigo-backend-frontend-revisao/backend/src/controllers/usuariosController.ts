import { Request, Response, NextFunction } from "express";
import { usuarioService } from "../config/dependencies";
import { RequisicaoAutenticada } from "../middlewares/authMiddleware";
import { AppError } from "../errors/AppError";

function obterUsuarioId(req: Request): number {
  const requisicao = req as RequisicaoAutenticada;
  const usuarioId = Number(requisicao.usuarioId);

  if (
    !Number.isSafeInteger(usuarioId) ||
    usuarioId <= 0
  ) {
    throw new AppError("Usuário não autenticado.", 401);
  }

  return usuarioId;
}

export async function obterMeuPerfil(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuarioId = obterUsuarioId(req);
    const usuario = await usuarioService.buscarMeuPerfil(usuarioId);

    res.status(200).json({
      sucesso: true,
      usuario,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarMeuPerfil(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuarioId = obterUsuarioId(req);

    const usuario = await usuarioService.atualizarMeuPerfil(
      usuarioId,
      req.body ?? {}
    );

    res.status(200).json({
      sucesso: true,
      mensagem: "Perfil atualizado com sucesso!",
      usuario,
    });
  } catch (erro) {
    next(erro);
  }
}