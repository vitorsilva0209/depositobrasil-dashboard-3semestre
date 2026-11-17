

import { Request, Response, NextFunction } from "express";
import { Funcionario } from "../models/funcionarioModel";
import { funcionarioService as service } from "../config/dependencies";

export async function listarFuncionarios(req: Request, res: Response, next: NextFunction) {
  try {
    const pagina = Math.max(1, Number(req.query.pagina) || 1);
    const limite = Math.min(100, Math.max(1, Number(req.query.limite) || 10));
    const busca = String(req.query.busca || "").trim();

    const resultado = await service.listarPaginado({ pagina, limite, busca });

    res.json({
      sucesso: true,
      funcionarios: resultado.dados,
      pagina,
      limite,
      total: resultado.total,
      totalPaginas: Math.ceil(resultado.total / limite),
    });
  } catch (erro) {
    next(erro);
  }
}

export async function buscarFuncionario(req: Request, res: Response, next: NextFunction) {
  try {
    const funcionario = await service.buscarPorId(Number(req.params.id));
    res.json({ sucesso: true, funcionario });
  } catch (erro) {
    next(erro);
  }
}

export async function cadastrarFuncionario(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome, cargo, salario } = req.body;

    const funcionario = new Funcionario(nome, cargo, Number(salario));
    const id = await service.cadastrar(funcionario);

    res.status(201).json({
      sucesso: true,
      mensagem: "Funcionário cadastrado com sucesso!",
      id,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarFuncionario(req: Request, res: Response, next: NextFunction) {
  try {
    const { nome, cargo, salario } = req.body;

    const funcionario = new Funcionario(nome, cargo, Number(salario));
    await service.atualizar(Number(req.params.id), funcionario);

    res.json({
      sucesso: true,
      mensagem: "Funcionário atualizado com sucesso!",
    });
  } catch (erro) {
    next(erro);
  }
}

export async function excluirFuncionario(req: Request, res: Response, next: NextFunction) {
  try {
    await service.excluir(Number(req.params.id));

    res.json({
      sucesso: true,
      mensagem: "Funcionário excluído com sucesso!",
    });
  } catch (erro) {
    next(erro);
  }
}
