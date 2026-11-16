
import { Venda } from "../models/vendaModel";
import { Produto } from "../models/produtosModel";
import { IReadRepository } from "../interfaces/IReadRepository";
import { IWriteRepository } from "../interfaces/IWriteRepository";
import { VendaListagem } from "../interfaces/VendaListagem";
import {
  IPaginacaoRepository,
  ParametrosPaginacao,
  ResultadoPaginado,
} from "../interfaces/Paginacao";
import {
  RecursoNaoEncontradoError,
  ErroValidacao,
} from "../errors/AppError";

export class VendaService {
  constructor(
    private readonly vendaRepository:
      IReadRepository<Venda> &
      IWriteRepository<Venda> &
      IPaginacaoRepository<VendaListagem>,
    private readonly produtoRepository: IReadRepository<Produto>
  ) {}

  async listar(): Promise<Venda[]> {
    return this.vendaRepository.listar();
  }

  async listarPaginado(
    parametros: ParametrosPaginacao
  ): Promise<ResultadoPaginado<VendaListagem>> {
    return this.vendaRepository.listarPaginado(parametros);
  }

  async buscarPorId(id: number): Promise<Venda> {
    this.validarId(id);

    const venda = await this.vendaRepository.buscarPorId(id);

    if (!venda) {
      throw new RecursoNaoEncontradoError("Venda");
    }

    return venda;
  }

  async cadastrar(dados: Venda): Promise<number> {
    dados.validar();
    await this.validarProduto(dados.produtoId);

    return this.vendaRepository.criar(dados);
  }

  async atualizar(id: number, dados: Venda): Promise<void> {
    this.validarId(id);
    dados.validar();
    await this.validarProduto(dados.produtoId);

    const atualizado = await this.vendaRepository.atualizar(id, dados);

    if (!atualizado) {
      throw new RecursoNaoEncontradoError("Venda");
    }
  }

  async excluir(id: number): Promise<void> {
    this.validarId(id);

    const excluido = await this.vendaRepository.excluir(id);

    if (!excluido) {
      throw new RecursoNaoEncontradoError("Venda");
    }
  }

  private async validarProduto(produtoId: number): Promise<void> {
    const produto = await this.produtoRepository.buscarPorId(produtoId);

    if (!produto) {
      throw new RecursoNaoEncontradoError("Produto");
    }
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ErroValidacao("ID da venda inválido.");
    }
  }
}
