import { Request, Response, NextFunction } from "express";
import { authService } from "../config/dependencies";
import { AppError } from "../errors/AppError";

export async function registrar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { nome, email, cpf, senha, confirmarSenha } = req.body ?? {};

    if (
      typeof nome !== "string" ||
      typeof email !== "string" ||
      typeof cpf !== "string" ||
      typeof senha !== "string" ||
      typeof confirmarSenha !== "string"
    ) {
      throw new AppError(
        "Informe todos os campos obrigatórios.",
        400
      );
    }

    const usuario = await authService.registrarUsuario({
      nome,
      email,
      cpf,
      senha,
      confirmarSenha,
    });

    res.status(201).json({
      sucesso: true,
      mensagem: "Usuário cadastrado com sucesso.",
      usuario,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, senha } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof senha !== "string"
    ) {
      throw new AppError(
        "Informe o e-mail e a senha.",
        400
      );
    }

    const usuario = await authService.autenticarUsuario(
      email,
      senha
    );

    res.status(200).json({
      sucesso: true,
      mensagem: "Login realizado com sucesso.",
      token: usuario.token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (erro) {
    next(erro);
  }
}