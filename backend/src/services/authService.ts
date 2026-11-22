import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { IUsuarioRepository } from "../interfaces/IUsuarioRepository";
import { AppError } from "../errors/AppError";
import {
  validarCPF,
  validarEmail,
  validarSenha,
} from "../utils/validacoes";

function erroDuplicidadeCadastro(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "code" in erro &&
    erro.code === "ER_DUP_ENTRY"
  );
}

export interface DadosRegistro {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  confirmarSenha: string;
}

export class AuthService {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository
  ) {}

  private gerarToken(id: number, email: string): string {
    const segredo = process.env.JWT_SECRET;

    if (!segredo || segredo.length < 32) {
      throw new AppError(
        "Configuração de autenticação indisponível.",
        500
      );
    }

    const expiracao: SignOptions["expiresIn"] =
      (process.env.JWT_EXPIRES_IN || "1h") as SignOptions["expiresIn"];

    return jwt.sign(
      { email },
      segredo,
      {
        subject: String(id),
        expiresIn: expiracao,
        algorithm: "HS256",
      }
    );
  }

  async registrarUsuario(dados: DadosRegistro) {
    const nome = dados.nome.trim();
    const email = dados.email.trim().toLowerCase();
    const cpf = dados.cpf.replace(/\D/g, "");
    const senha = dados.senha;

    if (
      !nome ||
      !email ||
      !dados.cpf.trim() ||
      !senha ||
      !dados.confirmarSenha
    ) {
      throw new AppError(
        "Preencha todos os campos obrigatórios.",
        400
      );
    }

    if (!validarEmail(email)) {
      throw new AppError("Informe um e-mail válido.", 400);
    }

    if (!validarCPF(cpf)) {
      throw new AppError("CPF inválido.", 400);
    }

    if (!validarSenha(senha)) {
      throw new AppError(
        "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.",
        400
      );
    }

    if (senha !== dados.confirmarSenha) {
      throw new AppError("As senhas não coincidem.", 400);
    }

    if (await this.usuarioRepository.buscarPorEmail(email)) {
      throw new AppError("Este e-mail já está cadastrado.", 409);
    }

    if (await this.usuarioRepository.buscarPorCPF(cpf)) {
      throw new AppError("Este CPF já está cadastrado.", 409);
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    let id: number;

    try {
      id = await this.usuarioRepository.criar({
        nome,
        email,
        cpf,
        senha: senhaHash,
      });
    } catch (erro) {
      // A checagem prévia melhora a mensagem; a constraint do banco
      // protege também contra cadastros simultâneos.
      if (erroDuplicidadeCadastro(erro)) {
        throw new AppError(
          "Este e-mail ou CPF já está cadastrado.",
          409
        );
      }
      throw erro;
    }

    return {
      id,
      nome,
      email,
      token: this.gerarToken(id, email),
    };
  }

  async autenticarUsuario(emailInformado: string, senha: string) {
    const email = emailInformado.trim().toLowerCase();

    if (!email || !senha || !validarEmail(email)) {
      throw new AppError(
        "Informe um e-mail e uma senha válidos.",
        400
      );
    }

    const usuario =
      await this.usuarioRepository.buscarPorEmail(email);

    if (!usuario) {
      throw new AppError(
        "E-mail ou senha incorretos.",
        401
      );
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      throw new AppError(
        "E-mail ou senha incorretos.",
        401
      );
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      token: this.gerarToken(usuario.id, usuario.email),
    };
  }
}