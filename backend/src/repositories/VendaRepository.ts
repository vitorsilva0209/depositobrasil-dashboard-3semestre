
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { database } from "../config/database";
import { Venda } from "../models/vendaModel";
import { BaseRepository } from "./BaseRepository";

interface VendaRow extends RowDataPacket {
  id: number;
  produto_id: number;
  produto?: string;
  quantidade: number;
  data_venda: string;
}

export class VendaRepository extends BaseRepository<Venda> {
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

  async criar(dados: Venda): Promise<number> {
    dados.validar();

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
    dados.validar();

    const existente = await this.buscarPorId(id);

    if (!existente) {
      return false;
    }

    if (dados.dataVenda) {
      await database.execute<ResultSetHeader>(
        `UPDATE vendas
         SET produto_id = ?, quantidade = ?, data_venda = ?
         WHERE id = ?`,
        [
          dados.produtoId,
          dados.quantidade,
          dados.dataVenda,
          id,
        ]
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
