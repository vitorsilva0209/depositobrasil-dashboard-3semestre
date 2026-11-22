
import { Funcionario } from "../models/funcionarioModel";
import { IRepository } from "../interfaces/IRepository";
import { FuncionarioListagem } from "../interfaces/FuncionarioListagem";
import {
  IPaginacaoRepository,
  ParametrosPaginacao,
  ResultadoPaginado,
} from "../interfaces/Paginacao";
import {
  RecursoNaoEncontradoError,
  ErroValidacao,
} from "../errors/AppError";

export class FuncionarioService {
  constructor(
    private readonly funcionarioRepository:
      IRepository<Funcionario> &
      IPaginacaoRepository<FuncionarioListagem>
  ) {}

  async listar(): Promise<Funcionario[]> {
    return this.funcionarioRepository.listar();
  }

  async listarPaginado(
    parametros: ParametrosPaginacao
  ): Promise<ResultadoPaginado<FuncionarioListagem>> {
    return this.funcionarioRepository.listarPaginado(parametros);
  }

  async buscarPorId(id: number): Promise<Funcionario> {
    this.validarId(id);

    const funcionario =
      await this.funcionarioRepository.buscarPorId(id);

    if (!funcionario) {
      throw new RecursoNaoEncontradoError("Funcionário");
    }

    return funcionario;
  }

  async cadastrar(dados: Funcionario): Promise<number> {
    dados.validar();
    return this.funcionarioRepository.criar(dados);
  }

  async atualizar(id: number, dados: Funcionario): Promise<void> {
    this.validarId(id);
    dados.validar();

    const atualizado =
      await this.funcionarioRepository.atualizar(id, dados);

    if (!atualizado) {
      throw new RecursoNaoEncontradoError("Funcionário");
    }
  }

  async excluir(id: number): Promise<void> {
    this.validarId(id);

    const excluido =
      await this.funcionarioRepository.excluir(id);

    if (!excluido) {
      throw new RecursoNaoEncontradoError("Funcionário");
    }
  }

  private validarId(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new ErroValidacao("ID do funcionário inválido.");
    }
  }
}
