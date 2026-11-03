import { database } from "../config/database";

export interface NovoUsuario {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

export interface UsuarioBanco {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

export async function buscarUsuarioPorEmail(
  email: string
): Promise<UsuarioBanco | null> {
  const [resultado] = await database.execute(
    `SELECT id, nome, email, cpf, senha
     FROM usuarios
     WHERE LOWER(email) = LOWER(?)
     LIMIT 1`,
    [email.trim()]
  );

  const usuarios = resultado as UsuarioBanco[];

  return usuarios[0] ?? null;
}

export async function buscarUsuarioPorCPF(
  cpf: string
): Promise<{ id: number } | null> {
  const [resultado] = await database.execute(
    `SELECT id
     FROM usuarios
     WHERE cpf = ?
     LIMIT 1`,
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
      usuario.email.trim().toLowerCase(),
      usuario.cpf,
      usuario.email.trim().toLowerCase(),
      usuario.senha
    ]
  );

  return resultado;
}