
import { Router } from "express";
import { database } from "../config/database";
import { autenticarToken } from "../middlewares/authMiddleware";
import { ResultSetHeader } from "mysql2";
import { Produto } from "../models/produtosModel";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [produtos] = await database.query(`
      SELECT id, nome, categoria, preco, descricao, imagem_url, estoque
      FROM produtos
      ORDER BY id DESC
    `);

    return res.json({
      sucesso: true,
      produtos,
    });
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao carregar produtos.",
    });
  }
});

router.post("/", autenticarToken, async (req, res) => {
  const {
    nome,
    categoria,
    preco,
    descricao,
    imagem_url,
    estoque,
  } = req.body;

  try {
    const produto = new Produto(
      nome,
      categoria,
      Number(preco),
      descricao,
      imagem_url,
      Number(estoque)
    );

    const [resultado] = await database.execute<ResultSetHeader>(
      `INSERT INTO produtos
      (nome, categoria, preco, descricao, imagem_url, estoque)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        produto.nome,
        produto.categoria,
        produto.preco,
        produto.descricao,
        produto.imagemUrl,
        produto.estoque,
      ]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Produto cadastrado com sucesso!",
      id: resultado.insertId,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar produto:", erro);

    return res.status(400).json({
      sucesso: false,
      mensagem:
        erro instanceof Error
          ? erro.message
          : "Erro ao cadastrar produto.",
    });
  }
});

router.put("/:id", autenticarToken, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "ID do produto inválido.",
    });
  }

  const {
    nome,
    categoria,
    preco,
    descricao,
    imagem_url,
    estoque,
  } = req.body;

  try {
    const produto = new Produto(
      nome,
      categoria,
      Number(preco),
      descricao,
      imagem_url,
      Number(estoque)
    );

    const [existentes] = await database.query(
      "SELECT id FROM produtos WHERE id = ?",
      [id]
    );

    if (!Array.isArray(existentes) || existentes.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Produto não encontrado.",
      });
    }

    await database.execute<ResultSetHeader>(
      `UPDATE produtos
       SET nome = ?, categoria = ?, preco = ?,
           descricao = ?, imagem_url = ?, estoque = ?
       WHERE id = ?`,
      [
        produto.nome,
        produto.categoria,
        produto.preco,
        produto.descricao,
        produto.imagemUrl,
        produto.estoque,
        id,
      ]
    );

    return res.json({
      sucesso: true,
      mensagem: "Produto atualizado com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao atualizar produto:", erro);

    return res.status(400).json({
      sucesso: false,
      mensagem:
        erro instanceof Error
          ? erro.message
          : "Erro ao atualizar produto.",
    });
  }
});

router.delete("/:id", autenticarToken, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "ID do produto inválido.",
    });
  }

  try {
    const [resultado] = await database.execute<ResultSetHeader>(
      "DELETE FROM produtos WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Produto não encontrado.",
      });
    }

    return res.json({
      sucesso: true,
      mensagem: "Produto excluído com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao excluir produto:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao excluir produto.",
    });
  }
});

export default router;
