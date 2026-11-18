
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { database } from "../config/database";
import { Venda } from "../models/vendaModel";
import { IRepository } from "../interfaces/IRepository";
import { VendaListagem } from "../interfaces/VendaListagem";
import {
  IPaginacaoRepository,
  ParametrosPaginacao,
  ResultadoPaginado,
} from "../interfaces/Paginacao";

interface VendaRow extends RowDataPacket {
  id: number;
  produto_id: number;
  produto?: string;
  quantidade: number;
  data_venda: string;
}

interface TotalRow extends RowDataPacket {
  total: number;
}

export class VendaRepository
  implements IRepository<Venda>, IPaginacaoRepository<VendaListagem>
{
  private converterParaVenda(registro: VendaRow): Venda {
    return new Venda(
      Number(registro.produto_id),
      Number(registro.quantidade),
      registro.data_venda,
      Number(registro.id),
      registro.produto
    );
  }

  async buscarPorId(id: number): Promise<Venda | null> {
    const [registros] = await database.execute<VendaRow[]>(
      `SELECT
         v.id,
         v.produto_id,
         p.nome AS produto,
         v.quantidade,
         DATE_FORMAT(v.data_venda, '%Y-%m-%d %H:%i:%s') AS data_venda
       FROM vendas v
       INNER JOIN produtos p ON p.id = v.produto_id
       WHERE v.id = ?`,
      [id]
    );

    if (registros.length === 0) {
      return null;
    }

    return this.converterParaVenda(registros[0]);
  }

  async listar(): Promise<Venda[]> {
    const [registros] = await database.execute<VendaRow[]>(
      `SELECT
         v.id,
         v.produto_id,
         p.nome AS produto,
         v.quantidade,
         DATE_FORMAT(v.data_venda, '%Y-%m-%d %H:%i:%s') AS data_venda
       FROM vendas v
       INNER JOIN produtos p ON p.id = v.produto_id
       ORDER BY v.id DESC`
    );

    return registros.map((registro) =>
      this.converterParaVenda(registro)
    );
  }

  async listarPaginado(
    parametros: ParametrosPaginacao
  ): Promise<ResultadoPaginado<VendaListagem>> {
    const { pagina, limite, busca } = parametros;
    const offset = (pagina - 1) * limite;
    const termo = `%${busca}%`;

    const condicao = `
      CAST(v.id AS CHAR) LIKE ?
      OR p.nome LIKE ?
      OR CAST(v.quantidade AS CHAR) LIKE ?
      OR DATE_FORMAT(v.data_venda, '%d/%m/%Y') LIKE ?
      OR DATE_FORMAT(v.data_venda, '%Y-%m-%d') LIKE ?
    `;

    const parametrosBusca = [
      termo,
      termo,
      termo,
      termo,
      termo,
    ];

    const [registros] = await database.execute<VendaRow[]>(
      `SELECT
         v.id,
         v.produto_id,
         p.nome AS produto,
         v.quantidade,
         DATE_FORMAT(v.data_venda, '%Y-%m-%d %H:%i:%s') AS data_venda
       FROM vendas v
       INNER JOIN produtos p ON p.id = v.produto_id
       WHERE ${condicao}
       ORDER BY v.id DESC
       LIMIT ? OFFSET ?`,
      [...parametrosBusca, limite, offset]
    );

    const [total] = await database.execute<TotalRow[]>(
      `SELECT COUNT(*) AS total
       FROM vendas v
       INNER JOIN produtos p ON p.id = v.produto_id
       WHERE ${condicao}`,
      parametrosBusca
    );

    return {
      dados: registros.map((registro) => ({
        id: Number(registro.id),
        produto_id: Number(registro.produto_id),
        produto: registro.produto ?? "",
        quantidade: Number(registro.quantidade),
        data_venda: registro.data_venda,
      })),
      total: Number(total[0]?.total ?? 0),
    };
  }

  async criar(dados: Venda): Promise<number> {
    let resultado: ResultSetHeader;

    if (dados.dataVenda) {
      [resultado] = await database.execute<ResultSetHeader>(
        `INSERT INTO vendas (produto_id, quantidade, data_venda)
         VALUES (?, ?, ?)`,
        [dados.produtoId, dados.quantidade, dados.dataVenda]
      );
    } else {
      [resultado] = await database.execute<ResultSetHeader>(
        `INSERT INTO vendas (produto_id, quantidade, data_venda)
         VALUES (?, ?, NOW())`,
        [dados.produtoId, dados.quantidade]
      );
    }

    return resultado.insertId;
  }

  async atualizar(id: number, dados: Venda): Promise<boolean> {
    const existente = await this.buscarPorId(id);

    if (!existente) {
      return false;
    }

    if (dados.dataVenda) {
      await database.execute<ResultSetHeader>(
        `UPDATE vendas
         SET produto_id = ?, quantidade = ?, data_venda = ?
         WHERE id = ?`,
        [dados.produtoId, dados.quantidade, dados.dataVenda, id]
      );
    } else {
      await database.execute<ResultSetHeader>(
        `UPDATE vendas
         SET produto_id = ?, quantidade = ?
         WHERE id = ?`,
        [dados.produtoId, dados.quantidade, id]
      );
    }

    return true;
  }

  async excluir(id: number): Promise<boolean> {
    const [resultado] = await database.execute<ResultSetHeader>(
      "DELETE FROM vendas WHERE id = ?",
      [id]
    );

    return resultado.affectedRows > 0;
  }
}
