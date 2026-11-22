
import { Request, Response, NextFunction } from "express";
import { ErroValidacao } from "../errors/AppError";
import { Venda } from "../models/vendaModel";
import { vendaService as service } from "../config/dependencies";
import { normalizarPaginacao } from "../utils/paginacao";
import { numeroObrigatorio } from "../utils/numero";

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
    ano < 1000 ||
    ano > 9999 ||
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

export async function listarVendas(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { pagina, limite } = normalizarPaginacao(
      req.query.pagina,
      req.query.limite,
      10
    );
    const busca = typeof req.query.busca === "string"
      ? req.query.busca.trim()
      : "";

    const resultado = await service.listarPaginado({
      pagina,
      limite,
      busca,
    });

    res.json({
      sucesso: true,
      vendas: resultado.dados,
      pagina,
      limite,
      total: resultado.total,
      totalPaginas: Math.ceil(resultado.total / limite),
    });
  } catch (erro) {
    next(erro);
  }
}

export async function buscarVenda(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const venda = await service.buscarPorId(
      Number(req.params.id)
    );

    res.json({
      sucesso: true,
      venda,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function cadastrarVenda(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dataVenda = normalizarDataVenda(
      req.body?.data_venda
    );

    if (dataVenda === null) {
      throw new ErroValidacao(
        "Informe uma data de venda válida."
      );
    }

    const venda = new Venda(
      numeroObrigatorio(req.body?.produto_id, "o produto"),
      numeroObrigatorio(req.body?.quantidade, "a quantidade"),
      dataVenda
    );

    const id = await service.cadastrar(venda);

    res.status(201).json({
      sucesso: true,
      mensagem: "Venda cadastrada com sucesso!",
      id,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarVenda(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dataVenda = normalizarDataVenda(
      req.body?.data_venda
    );

    if (dataVenda === null) {
      throw new ErroValidacao(
        "Informe uma data de venda válida."
      );
    }

    const venda = new Venda(
      numeroObrigatorio(req.body?.produto_id, "o produto"),
      numeroObrigatorio(req.body?.quantidade, "a quantidade"),
      dataVenda
    );

    await service.atualizar(
      Number(req.params.id),
      venda
    );

    res.json({
      sucesso: true,
      mensagem: "Venda atualizada com sucesso!",
    });
  } catch (erro) {
    next(erro);
  }
}

export async function excluirVenda(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await service.excluir(Number(req.params.id));

    res.json({
      sucesso: true,
      mensagem: "Venda excluída com sucesso!",
    });
  } catch (erro) {
    next(erro);
  }
}
