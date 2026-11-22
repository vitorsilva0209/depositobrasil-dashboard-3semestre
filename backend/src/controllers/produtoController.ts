
import { Request, Response, NextFunction } from "express";
import { Produto } from "../models/produtosModel";
import { produtoService as service } from "../config/dependencies";
import { normalizarPaginacao } from "../utils/paginacao";
import { numeroObrigatorio } from "../utils/numero";

export async function listarOpcoesProdutos(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const produtos = await service.listar();
    res.json({
      sucesso: true,
      produtos: produtos.flatMap((produto) =>
        produto.id === undefined
          ? []
          : [{ id: produto.id, nome: produto.nome }]
      ),
    });
  } catch (erro) {
    next(erro);
  }
}

export async function listarProdutos(req: Request, res: Response, next: NextFunction) {
  try {
    const { pagina, limite } = normalizarPaginacao(
      req.query.pagina,
      req.query.limite,
      5
    );
    const busca = typeof req.query.busca === "string"
      ? req.query.busca.trim()
      : "";

    const resultado = await service.listarPaginado({ pagina, limite, busca });

    res.json({
      sucesso: true,
      produtos: resultado.dados,
      pagina,
      limite,
      totalRegistros: resultado.total,
      totalPaginas: Math.max(1, Math.ceil(resultado.total / limite)),
    });
  } catch (erro) {
    next(erro);
  }
}

export async function buscarProduto(req: Request, res: Response, next: NextFunction) {
  try {
    const produto = await service.buscarPorId(Number(req.params.id));
    res.json({ sucesso: true, produto });
  } catch (erro) {
    next(erro);
  }
}

export async function cadastrarProduto(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome, categoria, preco, descricao, imagem_url, estoque } = req.body ?? {};

    const produto = new Produto(
      nome,
      categoria,
      numeroObrigatorio(preco, "o preço"),
      descricao,
      imagem_url,
      numeroObrigatorio(estoque, "o estoque")
    );

    const id = await service.cadastrar(produto);

    res.status(201).json({
      sucesso: true,
      mensagem: "Produto cadastrado com sucesso!",
      id,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarProduto(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome, categoria, preco, descricao, imagem_url, estoque } = req.body ?? {};

    const produto = new Produto(
      nome,
      categoria,
      numeroObrigatorio(preco, "o preço"),
      descricao,
      imagem_url,
      numeroObrigatorio(estoque, "o estoque")
    );

    await service.atualizar(Number(req.params.id), produto);

    res.json({
      sucesso: true,
      mensagem: "Produto atualizado com sucesso!",
    });
  } catch (erro) {
    next(erro);
  }
}

export async function excluirProduto(req: Request, res: Response, next: NextFunction) {
  try {
    await service.excluir(Number(req.params.id));

    res.json({
      sucesso: true,
      mensagem: "Produto excluído com sucesso!",
    });
  } catch (erro) {
    next(erro);
  }
}
