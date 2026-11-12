
import { Router } from "express";
import { database } from "../config/database";
import { autenticarToken } from "../middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";

import { Funcionario } from "../models/funcionarioModel";
import { FuncionarioRepository } from "../repositories/FuncionarioRepository";
import { FuncionarioService } from "../services/funcionarioService";

const router = Router();

const funcionarioRepository = new FuncionarioRepository();
const funcionarioService = new FuncionarioService(funcionarioRepository);

router.use(autenticarToken);

// LISTAR FUNCIONÁRIOS COM BUSCA E PAGINAÇÃO
router.get("/", async (req, res, next) => {
  try {
    const pagina = Math.max(1, Number(req.query.pagina) || 1);
    const limite = Math.min(
      100,
      Math.max(1, Number(req.query.limite) || 10)
    );

    const offset = (pagina - 1) * limite;
    const busca = String(req.query.busca || "").trim();

    const [funcionarios] = await database.execute<RowDataPacket[]>(
      `SELECT id, nome, cargo, salario
       FROM funcionarios
       WHERE nome LIKE ? OR cargo LIKE ?
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [`%${busca}%`, `%${busca}%`, limite, offset]
    );

    const [total] = await database.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM funcionarios
       WHERE nome LIKE ? OR cargo LIKE ?`,
      [`%${busca}%`, `%${busca}%`]
    );

    const totalRegistros = Number(total[0].total);

    return res.json({
      sucesso: true,
      funcionarios,
      pagina,
      limite,
      total: totalRegistros,
      totalPaginas: Math.ceil(totalRegistros / limite),
    });
  } catch (erro) {
    return next(erro);
  }
});

// BUSCAR FUNCIONÁRIO POR ID
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const funcionario =
      await funcionarioService.buscarPorId(id);

    return res.json({
      sucesso: true,
      funcionario,
    });
  } catch (erro) {
    return next(erro);
  }
});

// CADASTRAR FUNCIONÁRIO
router.post("/", async (req, res, next) => {
  try {
    const { nome, cargo, salario } = req.body;

    const funcionario = new Funcionario(
      nome,
      cargo,
      Number(salario)
    );

    const id = await funcionarioService.cadastrar(funcionario);

    return res.status(201).json({
      sucesso: true,
      mensagem: "Funcionário cadastrado com sucesso!",
      id,
    });
  } catch (erro) {
    return next(erro);
  }
});

// ATUALIZAR FUNCIONÁRIO
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nome, cargo, salario } = req.body;

    const funcionario = new Funcionario(
      nome,
      cargo,
      Number(salario)
    );

    await funcionarioService.atualizar(id, funcionario);

    return res.json({
      sucesso: true,
      mensagem: "Funcionário atualizado com sucesso!",
    });
  } catch (erro) {
    return next(erro);
  }
});

// EXCLUIR FUNCIONÁRIO
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await funcionarioService.excluir(id);

    return res.json({
      sucesso: true,
      mensagem: "Funcionário excluído com sucesso!",
    });
  } catch (erro) {
    return next(erro);
  }
});

export default router;
