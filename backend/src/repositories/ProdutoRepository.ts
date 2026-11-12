
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { database } from "../config/database";
import { Produto } from "../models/produtosModel";
import { BaseRepository } from "./BaseRepository";

interface ProdutoRow extends RowDataPacket {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  descricao: string | null;
  imagem_url: string | null;
  estoque: number;
}

export class ProdutoRepository extends BaseRepository<Produto> {
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

  async criar(dados: Produto): Promise<number> {
    dados.validar();

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
    dados.validar();

    const produtoExistente = await this.buscarPorId(id);

    if (!produtoExistente) {
      return false;
    }

    await database.execute<ResultSetHeader>(
      `UPDATE produtos
       SET nome = ?,
           categoria = ?,
           preco = ?,
           descricao = ?,
           imagem_url = ?,
           estoque = ?
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

    return true;
  }

  async excluir(id: number): Promise<boolean> {
    const [resultado] = await database.execute<ResultSetHeader>(
      "DELETE FROM produtos WHERE id = ?",
      [id]
    );

    return resultado.affectedRows > 0;
  }
}
