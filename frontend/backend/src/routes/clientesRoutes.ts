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

    const [clientes] = await database.execute<RowDataPacket[]>(
      `SELECT id, nome, email, telefone
       FROM clientes
       WHERE nome LIKE ? OR email LIKE ? OR telefone LIKE ?
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [`%${busca}%`, `%${busca}%`, `%${busca}%`, limite, offset]
    );

    const [total] = await database.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM clientes
       WHERE nome LIKE ? OR email LIKE ? OR telefone LIKE ?`,
      [`%${busca}%`, `%${busca}%`, `%${busca}%`]
    );

    return res.json({
      sucesso: true,
      clientes,
      pagina,
      limite,
      total: total[0].total,
      totalPaginas: Math.ceil(Number(total[0].total) / limite),
    });
  } catch (erro) {
    console.error("Erro ao listar clientes:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar clientes.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ sucesso: false, mensagem: "ID inválido." });
    }

    const [clientes] = await database.execute<RowDataPacket[]>(
      "SELECT id, nome, email, telefone FROM clientes WHERE id = ?",
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Cliente não encontrado.",
      });
    }

    return res.json({ sucesso: true, cliente: clientes[0] });
  } catch (erro) {
    console.error("Erro ao buscar cliente:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar cliente.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;

    if (typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe o nome do cliente.",
      });
    }

    const [resultado] = await database.execute<ResultSetHeader>(
      "INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)",
      [
        nome.trim(),
        email?.trim() || null,
        telefone?.trim() || null,
      ]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Cliente cadastrado com sucesso!",
      id: resultado.insertId,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar cliente:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar cliente.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, email, telefone } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ sucesso: false, mensagem: "ID inválido." });
    }

    if (typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe o nome do cliente.",
      });
    }

    const [resultado] = await database.execute<ResultSetHeader>(
      `UPDATE clientes
       SET nome = ?, email = ?, telefone = ?
       WHERE id = ?`,
      [nome.trim(), email?.trim() || null, telefone?.trim() || null, id]
    );

    if (resultado.affectedRows === 0) {
      const [existente] = await database.execute<RowDataPacket[]>(
        "SELECT id FROM clientes WHERE id = ?",
        [id]
      );

      if (existente.length === 0) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Cliente não encontrado.",
        });
      }
    }

    return res.json({
      sucesso: true,
      mensagem: "Cliente atualizado com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao atualizar cliente:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar cliente.",
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
      "DELETE FROM clientes WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Cliente não encontrado.",
      });
    }

    return res.json({
      sucesso: true,
      mensagem: "Cliente excluído com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao excluir cliente:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao excluir cliente.",
    });
  }
});

export default router;