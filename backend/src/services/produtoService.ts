
import { Produto } from "../models/produtosModel";
import { IRepository } from "../interfaces/IRepository";
import { ProdutoListagem } from "../interfaces/ProdutoListagem";
import {
  IPaginacaoRepository,
  ParametrosPaginacao,
  ResultadoPaginado,
} from "../interfaces/Paginacao";
import {
  RecursoNaoEncontradoError,
  ErroValidacao,
} from "../errors/AppError";

export class ProdutoService {
  constructor(
    private readonly produtoRepository:
      IRepository<Produto> &
      IPaginacaoRepository<ProdutoListagem>
  ) {}

  async listar(): Promise<Produto[]> {
    return this.produtoRepository.listar();
  }

  async listarPaginado(
    parametros: ParametrosPaginacao
  ): Promise<ResultadoPaginado<ProdutoListagem>> {
    return this.produtoRepository.listarPaginado(parametros);
  }

  async buscarPorId(id: number): Promise<Produto> {
    this.validarId(id);

    const produto = await this.produtoRepository.buscarPorId(id);

    if (!produto) {
      throw new RecursoNaoEncontradoError("Produto");
    }

    return produto;
  }

  async cadastrar(dados: Produto): Promise<number> {
    dados.validar();
    return this.produtoRepository.criar(dados);
  }

  async atualizar(id: number, dados: Produto): Promise<void> {
    this.validarId(id);
    dados.validar();

    const atualizado =
      await this.produtoRepository.atualizar(id, dados);

    if (!atualizado) {
      throw new RecursoNaoEncontradoError("Produto");
    }
  }

  async excluir(id: number): Promise<void> {
    this.validarId(id);

    const excluido = await this.produtoRepository.excluir(id);

    if (!excluido) {
      throw new RecursoNaoEncontradoError("Produto");
    }
  }

  private validarId(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new ErroValidacao("ID do produto inválido.");
    }
  }
}
