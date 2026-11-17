
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { database } from "../config/database";
import { Produto } from "../models/produtosModel";
import { IRepository } from "../interfaces/IRepository";
import { ProdutoListagem } from "../interfaces/ProdutoListagem";
import {
  IPaginacaoRepository,
  ParametrosPaginacao,
  ResultadoPaginado,
} from "../interfaces/Paginacao";

interface ProdutoRow extends RowDataPacket {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  descricao: string;
  imagem_url: string;
  estoque: number;
}

interface TotalRow extends RowDataPacket {
  total: number;
}

export class ProdutoRepository
  implements IRepository<Produto>, IPaginacaoRepository<ProdutoListagem>
{
  private converterParaProduto(registro: ProdutoRow): Produto {
    return new Produto(
      registro.nome,
      registro.categoria,
      Number(registro.preco),
      registro.descricao ?? "",
      registro.imagem_url ?? "",
      Number(registro.estoque),
      Number(registro.id)
    );
  }

  async buscarPorId(id: number): Promise<Produto | null> {
    const [registros] = await database.execute<ProdutoRow[]>(
      `SELECT id, nome, categoria, preco, descricao, imagem_url, estoque
       FROM produtos
       WHERE id = ?`,
      [id]
    );

    if (registros.length === 0) {
      return null;
    }

    return this.converterParaProduto(registros[0]);
  }

  async listar(): Promise<Produto[]> {
    const [registros] = await database.execute<ProdutoRow[]>(
      `SELECT id, nome, categoria, preco, descricao, imagem_url, estoque
       FROM produtos
       ORDER BY id DESC`
    );

    return registros.map((registro) =>
      this.converterParaProduto(registro)
    );
  }

  async listarPaginado(
    parametros: ParametrosPaginacao
  ): Promise<ResultadoPaginado<ProdutoListagem>> {
    const { pagina, limite, busca } = parametros;
    const offset = (pagina - 1) * limite;
    const termo = `%${busca}%`;

    const condicao = `
      CAST(id AS CHAR) LIKE ?
      OR nome LIKE ?
      OR categoria LIKE ?
      OR descricao LIKE ?
    `;

    const parametrosBusca = [
      termo,
      termo,
      termo,
      termo,
    ];

    const [registros] = await database.execute<ProdutoRow[]>(
      `SELECT id, nome, categoria, preco, descricao, imagem_url, estoque
       FROM produtos
       WHERE ${condicao}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...parametrosBusca, limite, offset]
    );

    const [total] = await database.execute<TotalRow[]>(
      `SELECT COUNT(*) AS total
       FROM produtos
       WHERE ${condicao}`,
      parametrosBusca
    );

    return {
      dados: registros.map((registro) => ({
        id: Number(registro.id),
        nome: registro.nome,
        categoria: registro.categoria,
        preco: Number(registro.preco),
        descricao: registro.descricao,
        imagem_url: registro.imagem_url,
        estoque: Number(registro.estoque),
      })),
      total: Number(total[0]?.total ?? 0),
    };
  }

  async criar(dados: Produto): Promise<number> {
    const [resultado] = await database.execute<ResultSetHeader>(
      `INSERT INTO produtos
       (nome, categoria, preco, descricao, imagem_url, estoque)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        dados.nome,
        dados.categoria,
        dados.preco,
        dados.descricao,
        dados.imagemUrl,
        dados.estoque,
      ]
    );

    return resultado.insertId;
  }

  async atualizar(id: number, dados: Produto): Promise<boolean> {
    const [resultado] = await database.execute<ResultSetHeader>(
      `UPDATE produtos
       SET nome = ?, categoria = ?, preco = ?,
           descricao = ?, imagem_url = ?, estoque = ?
       WHERE id = ?`,
      [
        dados.nome,
        dados.categoria,
        dados.preco,
        dados.descricao,
        dados.imagemUrl,
        dados.estoque,
        id,
      ]
    );

    if (resultado.affectedRows > 0) {
      return true;
    }

    // Diferencia registro inexistente de atualização sem alterações.
    const [registros] = await database.execute<ProdutoRow[]>(
      `SELECT id
       FROM produtos
       WHERE id = ?`,
      [id]
    );

    return registros.length > 0;
  }

  async excluir(id: number): Promise<boolean> {
    const [resultado] = await database.execute<ResultSetHeader>(
      `DELETE FROM produtos WHERE id = ?`,
      [id]
    );

    return resultado.affectedRows > 0;
  }
}
