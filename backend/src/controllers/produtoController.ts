
import { Request, Response, NextFunction } from "express";
import { Produto } from "../models/produtosModel";
import { produtoService as service } from "../config/dependencies";

export async function listarProdutos(req: Request, res: Response, next: NextFunction) {
  try {
    const pagina = Math.max(1, Number(req.query.pagina) || 1);
    const limite = Math.min(100, Math.max(1, Number(req.query.limite) || 5));
    const busca = String(req.query.busca || "").trim();

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
    const { nome, categoria, preco, descricao, imagem_url, estoque } = req.body;

    const produto = new Produto(
      nome,
      categoria,
      Number(preco),
      descricao,
      imagem_url,
      Number(estoque)
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
    const { nome, categoria, preco, descricao, imagem_url, estoque } = req.body;

    const produto = new Produto(
      nome,
      categoria,
      Number(preco),
      descricao,
      imagem_url,
      Number(estoque)
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
