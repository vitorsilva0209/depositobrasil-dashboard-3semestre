
import { Router } from "express";
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

  if (numero.length !== 11 || /^(\d)\1+$/.test(numero)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(numero[i]) * (10 - i);
  }

  let digito = (soma * 10) % 11;

  if (digito === 10) {
    digito = 0;
  }

  if (digito !== Number(numero[9])) {
    return false;
  }

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(numero[i]) * (11 - i);
  }

  digito = (soma * 10) % 11;

  if (digito === 10) {
    digito = 0;
  }

  return digito === Number(numero[10]);
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

    const { nome, cpf, usuario } = req.body;

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário não autenticado.",
      });
    }

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

    const usuarioAtualizado =
      typeof usuario === "string" && usuario.trim()
        ? usuario.trim()
        : null;

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
      mensagem: "Perfil atualizado com sucesso!",
      usuario: usuarios[0],
    });
  } catch (erro) {
    console.error("Erro ao atualizar perfil:", erro);

    const codigoErro = (erro as { code?: string }).code;

    if (codigoErro === "ER_DUP_ENTRY") {
      return res.status(409).json({
        sucesso: false,
        mensagem: "Este CPF já está cadastrado em outra conta.",
      });
    }

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar perfil.",
    });
  }
});

export default router;
