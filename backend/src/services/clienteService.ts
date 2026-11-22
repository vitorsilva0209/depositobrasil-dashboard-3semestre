
import { Cliente } from "../models/clienteModel";
import { ClienteListagem } from "../interfaces/ClienteListagem";
import { IRepository } from "../interfaces/IRepository";
import {
  IPaginacaoRepository,
  ParametrosPaginacao,
  ResultadoPaginado,
} from "../interfaces/Paginacao";
import {
  RecursoNaoEncontradoError,
  ErroValidacao,
} from "../errors/AppError";

export class ClienteService {
  constructor(
    private readonly clienteRepository:
      IRepository<Cliente> &
      IPaginacaoRepository<ClienteListagem>
  ) {}

  async listar(): Promise<Cliente[]> {
    return this.clienteRepository.listar();
  }

  async listarPaginado(
    parametros: ParametrosPaginacao
  ): Promise<ResultadoPaginado<ClienteListagem>> {
    return this.clienteRepository.listarPaginado(parametros);
  }

  async buscarPorId(id: number): Promise<Cliente> {
    this.validarId(id);

    const cliente = await this.clienteRepository.buscarPorId(id);

    if (!cliente) {
      throw new RecursoNaoEncontradoError("Cliente");
    }

    return cliente;
  }

  async cadastrar(dados: Cliente): Promise<number> {
    dados.validar();

    return this.clienteRepository.criar(dados);
  }

  async atualizar(id: number, dados: Cliente): Promise<void> {
    this.validarId(id);
    dados.validar();

    const atualizado = await this.clienteRepository.atualizar(id, dados);

    if (!atualizado) {
      throw new RecursoNaoEncontradoError("Cliente");
    }
  }

  async excluir(id: number): Promise<void> {
    this.validarId(id);

    const excluido = await this.clienteRepository.excluir(id);

    if (!excluido) {
      throw new RecursoNaoEncontradoError("Cliente");
    }
  }

  private validarId(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new ErroValidacao("ID do cliente inválido.");
    }
  }
}
