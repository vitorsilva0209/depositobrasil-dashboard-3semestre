import { ResultSetHeader, RowDataPacket } from "mysql2";
import { database } from "../config/database";
import {
  DadosAtualizacaoPerfil,
  IUsuarioRepository,
  NovoUsuario,
  UsuarioAutenticacao,
  UsuarioPerfil,
} from "../interfaces/IUsuarioRepository";

interface UsuarioAutenticacaoRow extends RowDataPacket {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

interface UsuarioPerfilRow extends RowDataPacket {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  usuario: string | null;
}

interface UsuarioIdRow extends RowDataPacket {
  id: number;
}

export class UsuarioRepository implements IUsuarioRepository {
  async buscarPorEmail(
    email: string
  ): Promise<UsuarioAutenticacao | null> {
    const [registros] = await database.execute<UsuarioAutenticacaoRow[]>(
      `SELECT id, nome, email, cpf, senha
       FROM usuarios
       WHERE LOWER(email) = LOWER(?)
       LIMIT 1`,
      [email.trim()]
    );

    return registros[0] ?? null;
  }

  async buscarPorCPF(
    cpf: string
  ): Promise<{ id: number } | null> {
    const [registros] = await database.execute<UsuarioIdRow[]>(
      `SELECT id
       FROM usuarios
       WHERE cpf = ?
       LIMIT 1`,
      [cpf]
    );

    return registros[0] ?? null;
  }

  async buscarPorId(
    id: number
  ): Promise<UsuarioAutenticacao | null> {
    const [registros] = await database.execute<UsuarioAutenticacaoRow[]>(
      `SELECT id, nome, email, cpf, senha
       FROM usuarios
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return registros[0] ?? null;
  }

  async buscarPerfilPorId(
    id: number
  ): Promise<UsuarioPerfil | null> {
    const [registros] = await database.execute<UsuarioPerfilRow[]>(
      `SELECT id, nome, email, cpf, usuario
       FROM usuarios
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return registros[0] ?? null;
  }

  async criar(dados: NovoUsuario): Promise<number> {
    const [resultado] = await database.execute<ResultSetHeader>(
      `INSERT INTO usuarios
       (nome, email, cpf, usuario, senha)
       VALUES (?, ?, ?, ?, ?)`,
      [
        dados.nome,
        dados.email,
        dados.cpf,
        dados.email,
        dados.senha,
      ]
    );

    return resultado.insertId;
  }

  async atualizarPerfil(
    id: number,
    dados: DadosAtualizacaoPerfil
  ): Promise<void> {
    if (dados.senha) {
      await database.execute<ResultSetHeader>(
        `UPDATE usuarios
         SET nome = ?, cpf = ?, usuario = ?, senha = ?
         WHERE id = ?`,
        [
          dados.nome,
          dados.cpf,
          dados.usuario,
          dados.senha,
          id,
        ]
      );

      return;
    }

    await database.execute<ResultSetHeader>(
      `UPDATE usuarios
       SET nome = ?, cpf = ?, usuario = ?
       WHERE id = ?`,
      [
        dados.nome,
        dados.cpf,
        dados.usuario,
        id,
      ]
    );
  }
}