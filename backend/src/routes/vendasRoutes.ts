
import { Router } from "express";
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

// NORMALIZAR E VALIDAR DATA DA VENDA
function normalizarDataVenda(
  valor: unknown
): string | undefined | null {
  if (valor === undefined || valor === null || valor === "") {
    return undefined;
  }

  if (typeof valor !== "string") {
    return null;
  }

  const correspondencia = valor.trim().match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (!correspondencia) {
    return null;
  }

  const [
    ,
    anoTexto,
    mesTexto,
    diaTexto,
    horaTexto,
    minutoTexto,
    segundoTexto = "00",
  ] = correspondencia;

  const ano = Number(anoTexto);
  const mes = Number(mesTexto);
  const dia = Number(diaTexto);
  const hora = Number(horaTexto);
  const minuto = Number(minutoTexto);
  const segundo = Number(segundoTexto);

  if (
    mes < 1 ||
    mes > 12 ||
    hora > 23 ||
    minuto > 59 ||
    segundo > 59
  ) {
    return null;
  }

  const ultimoDiaMes = new Date(
    Date.UTC(ano, mes, 0)
  ).getUTCDate();

  if (dia < 1 || dia > ultimoDiaMes) {
    return null;
  }

  return `${anoTexto}-${mesTexto}-${diaTexto} ${horaTexto}:${minutoTexto}:${segundoTexto}`;
}

// LISTAR VENDAS COM PESQUISA E PAGINAÇÃO
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

    const busca = String(req.query.busca || "").trim();

    const resultado = await vendaService.listarPaginado({
      pagina,
      limite,
      busca,
    });

    return res.json({
      sucesso: true,
      vendas: resultado.dados,
      pagina,
      limite,
      total: resultado.total,
      totalPaginas: Math.ceil(resultado.total / limite),
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
