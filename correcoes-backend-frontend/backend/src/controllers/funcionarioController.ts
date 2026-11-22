

import { Request, Response, NextFunction } from "express";
import { Funcionario } from "../models/funcionarioModel";
import { funcionarioService as service } from "../config/dependencies";
import { normalizarPaginacao } from "../utils/paginacao";
import { numeroObrigatorio } from "../utils/numero";

export async function listarFuncionarios(req: Request, res: Response, next: NextFunction) {
  try {
    const { pagina, limite } = normalizarPaginacao(
      req.query.pagina,
      req.query.limite,
      10
    );
    const busca = typeof req.query.busca === "string"
      ? req.query.busca.trim()
      : "";

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
    const { nome, cargo, salario } = req.body ?? {};

    const funcionario = new Funcionario(nome, cargo, numeroObrigatorio(salario, "o salário"));
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
    const { nome, cargo, salario } = req.body ?? {};

    const funcionario = new Funcionario(nome, cargo, numeroObrigatorio(salario, "o salário"));
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
