
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { database } from "../config/database";
import { Funcionario } from "../models/funcionarioModel";
import { BaseRepository } from "./BaseRepository";

interface FuncionarioRow extends RowDataPacket {
  id: number;
  nome: string;
  cargo: string;
  salario: number | string;
}

export class FuncionarioRepository extends BaseRepository<Funcionario> {
  private converterParaFuncionario(
    registro: FuncionarioRow
  ): Funcionario {
    return new Funcionario(
      registro.nome,
      registro.cargo,
      Number(registro.salario),
      registro.id
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

    const existente = await this.buscarPorId(id);

    if (!existente) {
      return false;
    }

    await database.execute<ResultSetHeader>(
      `UPDATE funcionarios
       SET nome = ?, cargo = ?, salario = ?
       WHERE id = ?`,
      [dados.nome, dados.cargo, dados.salario, id]
    );

    return true;
  }

  async excluir(id: number): Promise<boolean> {
    const [resultado] = await database.execute<ResultSetHeader>(
      "DELETE FROM funcionarios WHERE id = ?",
      [id]
    );

    return resultado.affectedRows > 0;
  }
}
