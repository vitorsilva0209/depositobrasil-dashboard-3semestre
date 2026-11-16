
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { database } from "../config/database";
import { Cliente } from "../models/clienteModel";
import { ClienteListagem } from "../interfaces/ClienteListagem";
import { IRepository } from "../interfaces/IRepository";
import {
  IPaginacaoRepository,
  ParametrosPaginacao,
  ResultadoPaginado,
} from "../interfaces/Paginacao";

interface ClienteRow extends RowDataPacket {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
}

interface TotalRow extends RowDataPacket {
  total: number;
}

export class ClienteRepository
  implements IRepository<Cliente>, IPaginacaoRepository<ClienteListagem>
{
  private converterParaCliente(registro: ClienteRow): Cliente {
    return new Cliente(
      registro.nome,
      registro.email ?? "",
      registro.telefone ?? "",
      Number(registro.id)
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

  async listarPaginado(
    parametros: ParametrosPaginacao
  ): Promise<ResultadoPaginado<ClienteListagem>> {
    const { pagina, limite, busca } = parametros;
    const offset = (pagina - 1) * limite;
    const termo = `%${busca}%`;

    const condicao = `
      CAST(id AS CHAR) LIKE ?
      OR nome LIKE ?
      OR email LIKE ?
      OR telefone LIKE ?
    `;

    const parametrosBusca = [
      termo,
      termo,
      termo,
      termo,
    ];

    const [registros] = await database.execute<ClienteRow[]>(
      `SELECT id, nome, email, telefone
       FROM clientes
       WHERE ${condicao}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...parametrosBusca, limite, offset]
    );

    const [total] = await database.execute<TotalRow[]>(
      `SELECT COUNT(*) AS total
       FROM clientes
       WHERE ${condicao}`,
      parametrosBusca
    );

    return {
      dados: registros.map((registro) => ({
        id: Number(registro.id),
        nome: registro.nome,
        email: registro.email,
        telefone: registro.telefone,
      })),
      total: Number(total[0]?.total ?? 0),
    };
  }

  async criar(dados: Cliente): Promise<number> {
    dados.validar();

    const [resultado] = await database.execute<ResultSetHeader>(
      `INSERT INTO clientes (nome, email, telefone)
       VALUES (?, ?, ?)`,
      [dados.nome, dados.email, dados.telefone]
    );

    return resultado.insertId;
  }

  async atualizar(id: number, dados: Cliente): Promise<boolean> {
    dados.validar();

    const [resultado] = await database.execute<ResultSetHeader>(
      `UPDATE clientes
       SET nome = ?, email = ?, telefone = ?
       WHERE id = ?`,
      [dados.nome, dados.email, dados.telefone, id]
    );

    return resultado.affectedRows > 0;
  }

  async excluir(id: number): Promise<boolean> {
    const [resultado] = await database.execute<ResultSetHeader>(
      `DELETE FROM clientes WHERE id = ?`,
      [id]
    );

    return resultado.affectedRows > 0;
  }
}
