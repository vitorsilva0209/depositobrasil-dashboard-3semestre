
import { Router } from "express";
import { database } from "../config/database";
import { autenticarToken } from "../middlewares/authMiddleware";
import { RowDataPacket } from "mysql2";
import { Produto } from "../models/produtosModel";
import { ProdutoRepository } from "../repositories/ProdutoRepository";
import { ProdutoService } from "../services/produtoService";

const router = Router();

const produtoRepository = new ProdutoRepository();
const produtoService = new ProdutoService(produtoRepository);

// Todas as rotas exigem autenticação.
router.use(autenticarToken);

// LISTAR PRODUTOS COM PAGINAÇÃO E BUSCA
router.get("/", async (req, res, next) => {
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
    const totalPaginas = Math.max(
      1,
      Math.ceil(totalRegistros / limite)
    );

    return res.json({
      sucesso: true,
      produtos,
      pagina,
      limite,
      totalRegistros,
      totalPaginas,
    });
  } catch (erro) {
    return next(erro);
  }
});

// CADASTRAR PRODUTO
router.post("/", async (req, res, next) => {
  try {
    const {
      nome,
      categoria,
      preco,
      descricao,
      imagem_url,
      estoque,
    } = req.body;

    const produto = new Produto(
      nome,
      categoria,
      Number(preco),
      descricao,
      imagem_url,
      Number(estoque)
    );

    const id = await produtoService.cadastrar(produto);

    return res.status(201).json({
      sucesso: true,
      mensagem: "Produto cadastrado com sucesso!",
      id,
    });
  } catch (erro) {
    return next(erro);
  }
});

// BUSCAR PRODUTO POR ID
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const produto = await produtoService.buscarPorId(id);

    return res.json({
      sucesso: true,
      produto,
    });
  } catch (erro) {
    return next(erro);
  }
});

// EDITAR PRODUTO
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const {
      nome,
      categoria,
      preco,
      descricao,
      imagem_url,
      estoque,
    } = req.body;

    const produto = new Produto(
      nome,
      categoria,
      Number(preco),
      descricao,
      imagem_url,
      Number(estoque)
    );

    await produtoService.atualizar(id, produto);

    return res.json({
      sucesso: true,
      mensagem: "Produto atualizado com sucesso!",
    });
  } catch (erro) {
    return next(erro);
  }
});

// EXCLUIR PRODUTO
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await produtoService.excluir(id);

    return res.json({
      sucesso: true,
      mensagem: "Produto excluído com sucesso!",
    });
  } catch (erro) {
    return next(erro);
  }
});

export default router;
