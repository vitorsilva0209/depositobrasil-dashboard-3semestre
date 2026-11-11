
import { Router } from "express";
import { database } from "../config/database";
import { autenticarToken } from "../middlewares/authMiddleware";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Produto } from "../models/produtosModel";

const router = Router();

// Todas as rotas de produtos exigem autenticação.
router.use(autenticarToken);

// LISTAR PRODUTOS COM PAGINAÇÃO E BUSCA
router.get("/", async (req, res) => {
  try {
    const pagina = Math.max(1, Number(req.query.pagina) || 1);
    const limiteSolicitado = Number(req.query.limite) || 5;
    const limite = Math.min(100, Math.max(1, limiteSolicitado));
    const offset = (pagina - 1) * limite;
    const busca = String(req.query.busca || "").trim();

    const [produtos] = await database.execute<RowDataPacket[]>(
      `SELECT id, nome, categoria, preco, descricao, imagem_url, estoque
       FROM produtos
       WHERE nome LIKE ? OR categoria LIKE ?
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [`%${busca}%`, `%${busca}%`, limite, offset]
    );

    const [contagem] = await database.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM produtos
       WHERE nome LIKE ? OR categoria LIKE ?`,
      [`%${busca}%`, `%${busca}%`]
    );

    const totalRegistros = Number(contagem[0]?.total || 0);
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limite));

    return res.json({
      sucesso: true,
      produtos,
      pagina,
      limite,
      totalRegistros,
      totalPaginas,
    });
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao carregar produtos.",
    });
  }
});

// CADASTRAR PRODUTO
router.post("/", async (req, res) => {
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

// EDITAR PRODUTO
router.put("/:id", async (req, res) => {
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

    const [existentes] = await database.execute<RowDataPacket[]>(
      "SELECT id FROM produtos WHERE id = ?",
      [id]
    );

    if (existentes.length === 0) {
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

// EXCLUIR PRODUTO
router.delete("/:id", async (req, res) => {
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
