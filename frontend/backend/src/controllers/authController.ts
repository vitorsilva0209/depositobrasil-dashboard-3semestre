import { Request, Response } from "express";
import {
  registrarUsuario,
  autenticarUsuario
} from "../services/authService";
import jwt from "jsonwebtoken";

export async function registrar(req: Request, res: Response) {
  try {
    const usuario = await registrarUsuario(req.body);

    return res.status(201).json({
      sucesso: true,
      mensagem: "Usuário cadastrado com sucesso.",
      usuario
    });
  } catch (erro) {
    const mensagem =
      erro instanceof Error ? erro.message : "Erro ao cadastrar usuário.";

    const status = mensagem.includes("já está cadastrado") ? 409 : 400;

    return res.status(status).json({
      sucesso: false,
      mensagem
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;

    if (typeof email !== "string" || typeof senha !== "string") {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe o e-mail e a senha."
      });
    }

    const usuario = await autenticarUsuario(email, senha);

    return res.status(200).json({
      sucesso: true,
      mensagem: "Login realizado com sucesso.",
      token: usuario.token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (erro) {
    const mensagem =
      erro instanceof Error ? erro.message : "Erro ao realizar login.";

    const credenciaisInvalidas = mensagem === "E-mail ou senha incorretos.";

    return res.status(credenciaisInvalidas ? 401 : 400).json({
      sucesso: false,
      mensagem
    });
  }
}