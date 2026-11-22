
import bcrypt from "bcrypt";
import { IUsuarioRepository } from "../interfaces/IUsuarioRepository";
import { AppError } from "../errors/AppError";
import {
  validarCPF,
  validarSenha,
} from "../utils/validacoes";

export interface DadosPerfil {
  nome?: unknown;
  cpf?: unknown;
  usuario?: unknown;
  senhaAtual?: unknown;
  novaSenha?: unknown;
  confirmarSenha?: unknown;
}

function erroDuplicidade(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "code" in erro &&
    erro.code === "ER_DUP_ENTRY"
  );
}

export class UsuarioService {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository
  ) {}

  async buscarMeuPerfil(usuarioId: number) {
    const usuario =
      await this.usuarioRepository.buscarPerfilPorId(usuarioId);

    if (!usuario) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    return usuario;
  }

  async atualizarMeuPerfil(
    usuarioId: number,
    dados: DadosPerfil
  ) {
    if (
      typeof dados.nome !== "string" ||
      !dados.nome.trim()
    ) {
      throw new AppError("Informe seu nome.", 400);
    }

    if (
      typeof dados.cpf !== "string" ||
      !validarCPF(dados.cpf)
    ) {
      throw new AppError("Informe um CPF válido.", 400);
    }

    if (
      dados.usuario !== undefined &&
      dados.usuario !== null &&
      typeof dados.usuario !== "string"
    ) {
      throw new AppError("Nome de usuário inválido.", 400);
    }

    // Guarda os valores já validados antes das operações assíncronas.
    const nome = dados.nome.trim();
    const cpf = dados.cpf.replace(/\D/g, "");

    const usuarioBanco =
      await this.usuarioRepository.buscarPorId(usuarioId);

    if (!usuarioBanco) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    const usuarioAtualizado =
      typeof dados.usuario === "string" && dados.usuario.trim()
        ? dados.usuario.trim()
        : null;

    const camposSenha = [
      dados.senhaAtual,
      dados.novaSenha,
      dados.confirmarSenha,
    ];

    const desejaAlterarSenha = camposSenha.some(
      (campo) =>
        typeof campo === "string" && campo.trim().length > 0
    );

    let senhaHash: string | undefined;

    if (desejaAlterarSenha) {
      if (
        typeof dados.senhaAtual !== "string" ||
        typeof dados.novaSenha !== "string" ||
        typeof dados.confirmarSenha !== "string" ||
        !dados.senhaAtual.trim() ||
        !dados.novaSenha.trim() ||
        !dados.confirmarSenha.trim()
      ) {
        throw new AppError(
          "Para alterar sua senha, preencha os três campos.",
          400
        );
      }

      const senhaAtualCorreta = await bcrypt.compare(
        dados.senhaAtual,
        usuarioBanco.senha
      );

      if (!senhaAtualCorreta) {
        throw new AppError(
          "A senha atual está incorreta.",
          401
        );
      }

      if (!validarSenha(dados.novaSenha)) {
        throw new AppError(
          "A nova senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.",
          400
        );
      }

      if (dados.novaSenha !== dados.confirmarSenha) {
        throw new AppError(
          "A confirmação da nova senha não corresponde.",
          400
        );
      }

      if (dados.novaSenha === dados.senhaAtual) {
        throw new AppError(
          "A nova senha deve ser diferente da senha atual.",
          400
        );
      }

      senhaHash = await bcrypt.hash(dados.novaSenha, 12);
    }

    try {
      await this.usuarioRepository.atualizarPerfil(usuarioId, {
        nome,
        cpf,
        usuario: usuarioAtualizado,
        senha: senhaHash,
      });
    } catch (erro) {
      if (erroDuplicidade(erro)) {
        throw new AppError(
          "Este CPF ou nome de usuário já está cadastrado.",
          409
        );
      }

      throw erro;
    }

    const usuarioAtualizadoBanco =
      await this.usuarioRepository.buscarPerfilPorId(usuarioId);

    if (!usuarioAtualizadoBanco) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    return usuarioAtualizadoBanco;
  }
}
