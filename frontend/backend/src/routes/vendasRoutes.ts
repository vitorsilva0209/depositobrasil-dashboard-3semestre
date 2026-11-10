
import { Router } from "express";
import { database } from "../config/database";
import { autenticarToken } from "../middlewares/authMiddleware";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const router = Router();

router.use(autenticarToken);

function normalizarDataVenda(valor: unknown): string | undefined | null {
  if (valor === undefined || valor === null || valor === "") {
    return undefined;
  }

  if (typeof valor !== "string") {
    return null;
  }

  const correspondencia = valor.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (!correspondencia) {
    return null;
  }

  const [, ano, mes, dia, hora, minuto, segundo = "00"] =
    correspondencia;

  const data = new Date(
    Date.UTC(
      Number(ano),
      Number(mes) - 1,
      Number(dia),
      Number(hora),
      Number(minuto),
      Number(segundo)
    )
  );

  if (
    data.getUTCFullYear() !== Number(ano) ||
    data.getUTCMonth() + 1 !== Number(mes) ||
    data.getUTCDate() !== Number(dia) ||
    Number(hora) > 23 ||
    Number(minuto) > 59 ||
    Number(segundo) > 59
  ) {
    return null;
  }

  return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}

router.get("/", async (req, res) => {
  try {
    const pagina = Math.max(1, Math.floor(Number(req.query.pagina) || 1));
    const limite = Math.min(
      100,
      Math.max(1, Math.floor(Number(req.query.limite) || 10))
    );

    const offset = (pagina - 1) * limite;

    const [vendas] = await database.execute<RowDataPacket[]>(
      `SELECT
         v.id,
         v.produto_id,
         p.nome AS produto,
         v.quantidade,
         v.data_venda
       FROM vendas v
       INNER JOIN produtos p ON p.id = v.produto_id
       ORDER BY v.id DESC
       LIMIT ? OFFSET ?`,
      [limite, offset]
    );

    const [total] = await database.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM vendas"
    );

    const quantidadeTotal = Number(total[0].total);

    return res.json({
      sucesso: true,
      vendas,
      pagina,
      limite,
      total: quantidadeTotal,
      totalPaginas: Math.ceil(quantidadeTotal / limite),
    });
  } catch (erro) {
    console.error("Erro ao listar vendas:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar vendas.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "ID inválido.",
      });
    }

    const [vendas] = await database.execute<RowDataPacket[]>(
      `SELECT
         v.id,
         v.produto_id,
         p.nome AS produto,
         v.quantidade,
         v.data_venda
       FROM vendas v
       INNER JOIN produtos p ON p.id = v.produto_id
       WHERE v.id = ?`,
      [id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Venda não encontrada.",
      });
    }

    return res.json({
      sucesso: true,
      venda: vendas[0],
    });
  } catch (erro) {
    console.error("Erro ao buscar venda:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar venda.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const produtoId = Number(req.body.produto_id);
    const quantidade = Number(req.body.quantidade);
    const dataVenda = normalizarDataVenda(req.body.data_venda);

    if (!Number.isInteger(produtoId) || produtoId <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Selecione um produto válido.",
      });
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "A quantidade deve ser um número inteiro maior que zero.",
      });
    }

    if (dataVenda === null) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe uma data de venda válida.",
      });
    }

    const [produtos] = await database.execute<RowDataPacket[]>(
      "SELECT id FROM produtos WHERE id = ?",
      [produtoId]
    );

    if (produtos.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Produto não encontrado.",
      });
    }

    let resultado: ResultSetHeader;

    if (dataVenda) {
      [resultado] = await database.execute<ResultSetHeader>(
        `INSERT INTO vendas
         (produto_id, quantidade, data_venda)
         VALUES (?, ?, ?)`,
        [produtoId, quantidade, dataVenda]
      );
    } else {
      [resultado] = await database.execute<ResultSetHeader>(
        `INSERT INTO vendas
         (produto_id, quantidade, data_venda)
         VALUES (?, ?, NOW())`,
        [produtoId, quantidade]
      );
    }

    return res.status(201).json({
      sucesso: true,
      mensagem: "Venda cadastrada com sucesso!",
      id: resultado.insertId,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar venda:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar venda.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const produtoId = Number(req.body.produto_id);
    const quantidade = Number(req.body.quantidade);
    const dataVenda = normalizarDataVenda(req.body.data_venda);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "ID inválido.",
      });
    }

    if (
      !Number.isInteger(produtoId) ||
      produtoId <= 0 ||
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe produto e quantidade válidos.",
      });
    }

    if (dataVenda === null) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe uma data de venda válida.",
      });
    }

    const [vendaExistente] = await database.execute<RowDataPacket[]>(
      "SELECT id FROM vendas WHERE id = ?",
      [id]
    );

    if (vendaExistente.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Venda não encontrada.",
      });
    }

    const [produtoExistente] = await database.execute<RowDataPacket[]>(
      "SELECT id FROM produtos WHERE id = ?",
      [produtoId]
    );

    if (produtoExistente.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Produto não encontrado.",
      });
    }

    if (dataVenda) {
      await database.execute(
        `UPDATE vendas
         SET produto_id = ?, quantidade = ?, data_venda = ?
         WHERE id = ?`,
        [produtoId, quantidade, dataVenda, id]
      );
    } else {
      await database.execute(
        `UPDATE vendas
         SET produto_id = ?, quantidade = ?, data_venda = NOW()
         WHERE id = ?`,
        [produtoId, quantidade, id]
      );
    }

    return res.json({
      sucesso: true,
      mensagem: "Venda atualizada com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao atualizar venda:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar venda.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "ID inválido.",
      });
    }

    const [resultado] = await database.execute<ResultSetHeader>(
      "DELETE FROM vendas WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Venda não encontrada.",
      });
    }

    return res.json({
      sucesso: true,
      mensagem: "Venda excluída com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao excluir venda:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao excluir venda.",
    });
  }
});

export default router;
