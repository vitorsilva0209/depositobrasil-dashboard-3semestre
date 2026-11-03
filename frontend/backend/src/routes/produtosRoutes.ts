import { Router } from "express";
import { database } from "../config/database";
import { autenticarToken } from "../middlewares/authMiddleware";
import { ResultSetHeader } from "mysql2";

const router = Router();

// LISTAR PRODUTOS
router.get("/", async (_req, res) => {
  try {
    const [produtos] = await database.query(`
      SELECT
        id,
        nome,
        categoria,
        preco,
        descricao,
        imagem_url,
        estoque
      FROM produtos
      ORDER BY id DESC
    `);

    res.json({
      sucesso: true,
      produtos
    });
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao carregar produtos."
    });
  }
});

// CADASTRAR PRODUTO
router.post("/", autenticarToken, async (req, res) => {
  try {
    const {
      nome,
      categoria,
      preco,
      descricao,
      imagem_url,
      estoque
    } = req.body;

    if (!nome?.trim() || !categoria?.trim()) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe o nome e a categoria do produto."
      });
    }

    const precoNumerico = Number(preco);
    const estoqueNumerico = Number(estoque);

    if (
      !Number.isFinite(precoNumerico) ||
      precoNumerico < 0 ||
      !Number.isInteger(estoqueNumerico) ||
      estoqueNumerico < 0
    ) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe um preço e um estoque válidos."
      });
    }

    const [resultado] = await database.execute<ResultSetHeader>(
      `INSERT INTO produtos
        (nome, categoria, preco, descricao, imagem_url, estoque)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nome.trim(),
        categoria.trim(),
        precoNumerico,
        descricao || "",
        imagem_url || "",
        estoqueNumerico
      ]
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Produto cadastrado com sucesso!",
      id: resultado.insertId
    });

  } catch (erro) {
    console.error("Erro ao cadastrar produto:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar produto."
    });
  }
});

export default router;