
import { Router } from "express";
import bcrypt from "bcrypt";
import { database } from "../config/database";
import {
  autenticarToken,
  RequisicaoAutenticada,
} from "../middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";

const router = Router();

router.use(autenticarToken);

function validarCPF(cpf: string): boolean {
  const numero = cpf.replace(/\D/g, "");

  if (numero.length !== 11 || /^(\d)\1{10}$/.test(numero)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(numero[i]) * (10 - i);
  }

  let digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;

  if (digito !== Number(numero[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(numero[i]) * (11 - i);
  }

  digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;

  return digito === Number(numero[10]);
}

function validarSenha(senha: string): boolean {
  return (
    senha.length >= 8 &&
    /[A-Z]/.test(senha) &&
    /[a-z]/.test(senha) &&
    /\d/.test(senha) &&
    /[^A-Za-z0-9]/.test(senha)
  );
}

// CONSULTAR O PRÓPRIO PERFIL
router.get("/me", async (req, res) => {
  try {
    const requisicao = req as RequisicaoAutenticada;
    const usuarioId = Number(requisicao.usuarioId);

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário não autenticado.",
      });
    }

    const [usuarios] = await database.execute<RowDataPacket[]>(
      `SELECT id, nome, email, cpf, usuario
       FROM usuarios
       WHERE id = ?`,
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Usuário não encontrado.",
      });
    }

    return res.status(200).json({
      sucesso: true,
      usuario: usuarios[0],
    });
  } catch (erro) {
    console.error("Erro ao consultar perfil:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao consultar perfil.",
    });
  }
});

// ATUALIZAR O PRÓPRIO PERFIL
router.put("/me", async (req, res) => {
  try {
    const requisicao = req as RequisicaoAutenticada;
    const usuarioId = Number(requisicao.usuarioId);

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário não autenticado.",
      });
    }

    const {
      nome,
      cpf,
      usuario,
      senhaAtual,
      novaSenha,
      confirmarSenha,
    } = req.body ?? {};

    if (typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe seu nome.",
      });
    }

    if (typeof cpf !== "string" || !validarCPF(cpf)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe um CPF válido.",
      });
    }

    if (
      usuario !== undefined &&
      usuario !== null &&
      typeof usuario !== "string"
    ) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Nome de usuário inválido.",
      });
    }

    const [usuariosEncontrados] = await database.execute<
      (RowDataPacket & { id: number; senha: string })[]
    >(
      `SELECT id, senha
       FROM usuarios
       WHERE id = ?`,
      [usuarioId]
    );

    if (usuariosEncontrados.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Usuário não encontrado.",
      });
    }

    const usuarioBanco = usuariosEncontrados[0];

    const usuarioAtualizado =
      typeof usuario === "string" && usuario.trim()
        ? usuario.trim()
        : null;

    // Só considera alteração de senha quando algum campo tem conteúdo.
    const camposSenha = [senhaAtual, novaSenha, confirmarSenha];

    const desejaAlterarSenha = camposSenha.some(
      (campo) =>
        typeof campo === "string" && campo.trim().length > 0
    );

    let novaSenhaHash: string | null = null;

    if (desejaAlterarSenha) {
      if (
        typeof senhaAtual !== "string" ||
        typeof novaSenha !== "string" ||
        typeof confirmarSenha !== "string" ||
        !senhaAtual.trim() ||
        !novaSenha.trim() ||
        !confirmarSenha.trim()
      ) {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "Para alterar sua senha, preencha os três campos.",
        });
      }

      const senhaAtualCorreta = await bcrypt.compare(
        senhaAtual,
        usuarioBanco.senha
      );

      if (!senhaAtualCorreta) {
        return res.status(401).json({
          sucesso: false,
          mensagem: "A senha atual está incorreta.",
        });
      }

      if (!validarSenha(novaSenha)) {
        return res.status(400).json({
          sucesso: false,
          mensagem:
            "A nova senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.",
        });
      }

      if (novaSenha !== confirmarSenha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "A confirmação da nova senha não corresponde.",
        });
      }

      if (novaSenha === senhaAtual) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "A nova senha deve ser diferente da senha atual.",
        });
      }

      novaSenhaHash = await bcrypt.hash(novaSenha, 12);
    }

    if (novaSenhaHash) {
      await database.execute(
        `UPDATE usuarios
         SET nome = ?, cpf = ?, usuario = ?, senha = ?
         WHERE id = ?`,
        [
          nome.trim(),
          cpf.replace(/\D/g, ""),
          usuarioAtualizado,
          novaSenhaHash,
          usuarioId,
        ]
      );
    } else {
      await database.execute(
        `UPDATE usuarios
         SET nome = ?, cpf = ?, usuario = ?
         WHERE id = ?`,
        [
          nome.trim(),
          cpf.replace(/\D/g, ""),
          usuarioAtualizado,
          usuarioId,
        ]
      );
    }

    const [usuariosAtualizados] = await database.execute<RowDataPacket[]>(
      `SELECT id, nome, email, cpf, usuario
       FROM usuarios
       WHERE id = ?`,
      [usuarioId]
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Perfil atualizado com sucesso!",
      usuario: usuariosAtualizados[0],
    });
  } catch (erro) {
    console.error("Erro ao atualizar perfil:", erro);

    const codigoErro = (erro as { code?: string }).code;

    if (codigoErro === "ER_DUP_ENTRY") {
      return res.status(409).json({
        sucesso: false,
        mensagem: "Este CPF ou nome de usuário já está cadastrado.",
      });
    }

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar perfil.",
    });
  }
});

export default router;
