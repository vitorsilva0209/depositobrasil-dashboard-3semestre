
import { database } from "../config/database";

export interface NovoUsuario {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

export async function buscarUsuarioPorEmail(email: string) {
  const [resultado] = await database.execute(
    `SELECT id, nome, email, cpf, senha
     FROM usuarios
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  const usuarios = resultado as Array<{
    id: number;
    nome: string;
    email: string;
    cpf: string;
    senha: string;
  }>;

  return usuarios[0] ?? null;
}

export async function buscarUsuarioPorCPF(cpf: string) {
  const [resultado] = await database.execute(
    `SELECT id FROM usuarios WHERE cpf = ? LIMIT 1`,
    [cpf]
  );

  return (resultado as Array<{ id: number }>)[0] ?? null;
}

export async function cadastrarUsuario(usuario: NovoUsuario) {
  const [resultado] = await database.execute(
    `INSERT INTO usuarios (nome, email, cpf, usuario, senha)
     VALUES (?, ?, ?, ?, ?)`,
    [
      usuario.nome,
      usuario.email,
      usuario.cpf,
      usuario.email,
      usuario.senha
    ]
  );

  return resultado;
}
