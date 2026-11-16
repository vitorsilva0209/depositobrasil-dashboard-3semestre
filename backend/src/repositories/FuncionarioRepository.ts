
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { database } from "../config/database";
import { Funcionario } from "../models/funcionarioModel";
import { IRepository } from "../interfaces/IRepository";
import { FuncionarioListagem } from "../interfaces/FuncionarioListagem";
import {
  IPaginacaoRepository,
  ParametrosPaginacao,
  ResultadoPaginado,
} from "../interfaces/Paginacao";

interface FuncionarioRow extends RowDataPacket {
  id: number;
  nome: string;
  cargo: string;
  salario: number;
}

interface TotalRow extends RowDataPacket {
  total: number;
}

export class FuncionarioRepository
  implements IRepository<Funcionario>, IPaginacaoRepository<FuncionarioListagem>
{
  private converterParaFuncionario(
    registro: FuncionarioRow
  ): Funcionario {
    return new Funcionario(
      registro.nome,
      registro.cargo,
      Number(registro.salario),
      Number(registro.id)
    );
  }

  async buscarPorId(id: number): Promise<Funcionario | null> {
    const [registros] = await database.execute<FuncionarioRow[]>(
      `SELECT id, nome, cargo, salario
       FROM funcionarios
       WHERE id = ?`,
      [id]
    );

    if (registros.length === 0) {
      return null;
    }

    return this.converterParaFuncionario(registros[0]);
  }

  async listar(): Promise<Funcionario[]> {
    const [registros] = await database.execute<FuncionarioRow[]>(
      `SELECT id, nome, cargo, salario
       FROM funcionarios
       ORDER BY id DESC`
    );

    return registros.map((registro) =>
      this.converterParaFuncionario(registro)
    );
  }

  async listarPaginado(
    parametros: ParametrosPaginacao
  ): Promise<ResultadoPaginado<FuncionarioListagem>> {
    const { pagina, limite, busca } = parametros;
    const offset = (pagina - 1) * limite;
    const termo = `%${busca}%`;

    const condicao = `
      CAST(id AS CHAR) LIKE ?
      OR nome LIKE ?
      OR cargo LIKE ?
      OR CAST(salario AS CHAR) LIKE ?
    `;

    const parametrosBusca = [
      termo,
      termo,
      termo,
      termo,
    ];

    const [registros] = await database.execute<FuncionarioRow[]>(
      `SELECT id, nome, cargo, salario
       FROM funcionarios
       WHERE ${condicao}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...parametrosBusca, limite, offset]
    );

    const [total] = await database.execute<TotalRow[]>(
      `SELECT COUNT(*) AS total
       FROM funcionarios
       WHERE ${condicao}`,
      parametrosBusca
    );

    return {
      dados: registros.map((registro) => ({
        id: Number(registro.id),
        nome: registro.nome,
        cargo: registro.cargo,
        salario: Number(registro.salario),
      })),
      total: Number(total[0]?.total ?? 0),
    };
  }

  async criar(dados: Funcionario): Promise<number> {
    dados.validar();

    const [resultado] = await database.execute<ResultSetHeader>(
      `INSERT INTO funcionarios (nome, cargo, salario)
       VALUES (?, ?, ?)`,
      [dados.nome, dados.cargo, dados.salario]
    );

    return resultado.insertId;
  }

  async atualizar(
    id: number,
    dados: Funcionario
  ): Promise<boolean> {
    dados.validar();

    const [resultado] = await database.execute<ResultSetHeader>(
      `UPDATE funcionarios
       SET nome = ?, cargo = ?, salario = ?
       WHERE id = ?`,
      [dados.nome, dados.cargo, dados.salario, id]
    );

    return resultado.affectedRows > 0;
  }

  async excluir(id: number): Promise<boolean> {
    const [resultado] = await database.execute<ResultSetHeader>(
      `DELETE FROM funcionarios WHERE id = ?`,
      [id]
    );

    return resultado.affectedRows > 0;
  }
}
