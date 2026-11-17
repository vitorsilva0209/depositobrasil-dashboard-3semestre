


import { Request, Response, NextFunction } from "express";
import { Cliente } from "../models/clienteModel";
import { clienteService as service } from "../config/dependencies";

export async function listarClientes(req: Request, res: Response, next: NextFunction) {
  try {
    const pagina = Math.max(1, Number(req.query.pagina) || 1);
    const limite = Math.min(100, Math.max(1, Number(req.query.limite) || 10));
    const busca = String(req.query.busca || "").trim();

    const resultado = await service.listarPaginado({ pagina, limite, busca });

    res.json({
      sucesso: true,
      clientes: resultado.dados,
      pagina,
      limite,
      total: resultado.total,
      totalPaginas: Math.ceil(resultado.total / limite),
    });
  } catch (erro) {
    next(erro);
  }
}

export async function buscarCliente(req: Request, res: Response, next: NextFunction) {
  try {
    const cliente = await service.buscarPorId(Number(req.params.id));
    res.json({ sucesso: true, cliente });
  } catch (erro) {
    next(erro);
  }
}

export async function cadastrarCliente(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome, email, telefone } = req.body;

    const cliente = new Cliente(nome, email ?? "", telefone ?? "");
    const id = await service.cadastrar(cliente);

    res.status(201).json({
      sucesso: true,
      mensagem: "Cliente cadastrado com sucesso!",
      id,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarCliente(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome, email, telefone } = req.body;

    const cliente = new Cliente(nome, email ?? "", telefone ?? "");
    await service.atualizar(Number(req.params.id), cliente);

    res.json({
      sucesso: true,
      mensagem: "Cliente atualizado com sucesso!",
    });
  } catch (erro) {
    next(erro);
  }
}

export async function excluirCliente(req: Request, res: Response, next: NextFunction) {
  try {
    await service.excluir(Number(req.params.id));

    res.json({
      sucesso: true,
      mensagem: "Cliente excluído com sucesso!",
    });
  } catch (erro) {
    next(erro);
  }
}
