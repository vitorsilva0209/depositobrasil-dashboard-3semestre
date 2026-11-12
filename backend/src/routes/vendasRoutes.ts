
import { Router } from "express";
import { RowDataPacket } from "mysql2";

import { database } from "../config/database";
import { autenticarToken } from "../middlewares/authMiddleware";
import { ErroValidacao } from "../errors/AppError";

import { Venda } from "../models/vendaModel";
import { VendaRepository } from "../repositories/VendaRepository";
import { ProdutoRepository } from "../repositories/ProdutoRepository";
import { VendaService } from "../services/vendaService";

const router = Router();

const vendaRepository = new VendaRepository();
const produtoRepository = new ProdutoRepository();

const vendaService = new VendaService(
  vendaRepository,
  produtoRepository
);

router.use(autenticarToken);

// NORMALIZAR DATA DA VENDA
function normalizarDataVenda(
  valor: unknown
): string | undefined | null {
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

// LISTAR VENDAS COM PAGINAÇÃO
router.get("/", async (req, res, next) => {
  try {
    const pagina = Math.max(
      1,
      Math.floor(Number(req.query.pagina) || 1)
    );

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
    return next(erro);
  }
});

// BUSCAR VENDA POR ID
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const venda = await vendaService.buscarPorId(id);

    return res.json({
      sucesso: true,
      venda,
    });
  } catch (erro) {
    return next(erro);
  }
});

// CADASTRAR VENDA
router.post("/", async (req, res, next) => {
  try {
    const produtoId = Number(req.body.produto_id);
    const quantidade = Number(req.body.quantidade);
    const dataVenda = normalizarDataVenda(req.body.data_venda);

    if (dataVenda === null) {
      throw new ErroValidacao(
        "Informe uma data de venda válida."
      );
    }

    const venda = new Venda(
      produtoId,
      quantidade,
      dataVenda
    );

    const id = await vendaService.cadastrar(venda);

    return res.status(201).json({
      sucesso: true,
      mensagem: "Venda cadastrada com sucesso!",
      id,
    });
  } catch (erro) {
    return next(erro);
  }
});

// ATUALIZAR VENDA
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const produtoId = Number(req.body.produto_id);
    const quantidade = Number(req.body.quantidade);
    const dataVenda = normalizarDataVenda(req.body.data_venda);

    if (dataVenda === null) {
      throw new ErroValidacao(
        "Informe uma data de venda válida."
      );
    }

    const venda = new Venda(
      produtoId,
      quantidade,
      dataVenda
    );

    await vendaService.atualizar(id, venda);

    return res.json({
      sucesso: true,
      mensagem: "Venda atualizada com sucesso!",
    });
  } catch (erro) {
    return next(erro);
  }
});

// EXCLUIR VENDA
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await vendaService.excluir(id);

    return res.json({
      sucesso: true,
      mensagem: "Venda excluída com sucesso!",
    });
  } catch (erro) {
    return next(erro);
  }
});

export default router;
