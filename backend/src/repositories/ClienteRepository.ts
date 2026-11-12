
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { database } from "../config/database";
import { Cliente } from "../models/clienteModel";
import { BaseRepository } from "./BaseRepository";

interface ClienteRow extends RowDataPacket {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
}

export class ClienteRepository extends BaseRepository<Cliente> {
  private converterParaCliente(registro: ClienteRow): Cliente {
    return new Cliente(
      registro.nome,
      registro.email ?? "",
      registro.telefone ?? "",
      registro.id
    );
  }

  async buscarPorId(id: number): Promise<Cliente | null> {
    const [registros] = await database.execute<ClienteRow[]>(
      `SELECT id, nome, email, telefone
       FROM clientes
       WHERE id = ?`,
      [id]
    );

    if (registros.length === 0) {
      return null;
    }

    return this.converterParaCliente(registros[0]);
  }

  async listar(): Promise<Cliente[]> {
    const [registros] = await database.execute<ClienteRow[]>(
      `SELECT id, nome, email, telefone
       FROM clientes
       ORDER BY id DESC`
    );

    return registros.map((registro) =>
      this.converterParaCliente(registro)
    );
  }

  async criar(dados: Cliente): Promise<number> {
    dados.validar();

    const [resultado] = await database.execute<ResultSetHeader>(
      `INSERT INTO clientes (nome, email, telefone)
       VALUES (?, ?, ?)`,
      [
        dados.nome,
        dados.email || null,
        dados.telefone || null,
      ]
    );

    return resultado.insertId;
  }

  async atualizar(id: number, dados: Cliente): Promise<boolean> {
    dados.validar();

    const existente = await this.buscarPorId(id);

    if (!existente) {
      return false;
    }

    await database.execute<ResultSetHeader>(
      `UPDATE clientes
       SET nome = ?, email = ?, telefone = ?
       WHERE id = ?`,
      [
        dados.nome,
        dados.email || null,
        dados.telefone || null,
        id,
      ]
    );

    return true;
  }

  async excluir(id: number): Promise<boolean> {
    const [resultado] = await database.execute<ResultSetHeader>(
      "DELETE FROM clientes WHERE id = ?",
      [id]
    );

    return resultado.affectedRows > 0;
  }
}
