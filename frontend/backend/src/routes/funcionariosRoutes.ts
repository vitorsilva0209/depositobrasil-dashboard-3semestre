import { Router } from "express";
import { database } from "../config/database";
import { autenticarToken } from "../middlewares/authMiddleware";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const router = Router();

router.use(autenticarToken);

router.get("/", async (req, res) => {
  try {
    const pagina = Math.max(1, Number(req.query.pagina) || 1);
    const limite = Math.min(100, Math.max(1, Number(req.query.limite) || 10));
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

    return res.json({
      sucesso: true,
      funcionarios,
      pagina,
      limite,
      total: total[0].total,
      totalPaginas: Math.ceil(Number(total[0].total) / limite),
    });
  } catch (erro) {
    console.error("Erro ao listar funcionários:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar funcionários.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ sucesso: false, mensagem: "ID inválido." });
    }

    const [funcionarios] = await database.execute<RowDataPacket[]>(
      "SELECT id, nome, cargo, salario FROM funcionarios WHERE id = ?",
      [id]
    );

    if (funcionarios.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Funcionário não encontrado.",
      });
    }

    return res.json({ sucesso: true, funcionario: funcionarios[0] });
  } catch (erro) {
    console.error("Erro ao buscar funcionário:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar funcionário.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nome, cargo, salario } = req.body;
    const valorSalario = Number(salario);

    if (typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe o nome do funcionário.",
      });
    }

    if (typeof cargo !== "string" || !cargo.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe o cargo do funcionário.",
      });
    }

    if (!Number.isFinite(valorSalario) || valorSalario < 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe um salário válido.",
      });
    }

    const [resultado] = await database.execute<ResultSetHeader>(
      "INSERT INTO funcionarios (nome, cargo, salario) VALUES (?, ?, ?)",
      [nome.trim(), cargo.trim(), valorSalario]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Funcionário cadastrado com sucesso!",
      id: resultado.insertId,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar funcionário:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar funcionário.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, cargo, salario } = req.body;
    const valorSalario = Number(salario);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ sucesso: false, mensagem: "ID inválido." });
    }

    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      typeof cargo !== "string" ||
      !cargo.trim() ||
      !Number.isFinite(valorSalario) ||
      valorSalario < 0
    ) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe nome, cargo e salário válidos.",
      });
    }

    const [resultado] = await database.execute<ResultSetHeader>(
      `UPDATE funcionarios
       SET nome = ?, cargo = ?, salario = ?
       WHERE id = ?`,
      [nome.trim(), cargo.trim(), valorSalario, id]
    );

    if (resultado.affectedRows === 0) {
      const [existente] = await database.execute<RowDataPacket[]>(
        "SELECT id FROM funcionarios WHERE id = ?",
        [id]
      );

      if (existente.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Funcionário não encontrado.",
        });
      }
    }

    return res.json({
      sucesso: true,
      mensagem: "Funcionário atualizado com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao atualizar funcionário:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar funcionário.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ sucesso: false, mensagem: "ID inválido." });
    }

    const [resultado] = await database.execute<ResultSetHeader>(
      "DELETE FROM funcionarios WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Funcionário não encontrado.",
      });
    }

    return res.json({
      sucesso: true,
      mensagem: "Funcionário excluído com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao excluir funcionário:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao excluir funcionário.",
    });
  }
});

export default router;