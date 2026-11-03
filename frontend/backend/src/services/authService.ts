
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import {
  buscarUsuarioPorEmail,
  buscarUsuarioPorCPF,
  cadastrarUsuario
} from "../models/usuarioModel";

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCPF(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, "");

  if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(numeros[i]) * (10 - i);
  }

  let digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;

  if (digito !== Number(numeros[9])) {
    return false;
  }

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(numeros[i]) * (11 - i);
  }

  digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;

  return digito === Number(numeros[10]);
}

function validarSenha(senha: string): boolean {
  return (
    senha.length >= 8 &&
    /[A-Z]/.test(senha) &&
    /[a-z]/.test(senha) &&
    /\d/.test(senha) &&
    /[^A-Za-z0-9]/.test(senha)
  );
}

function gerarToken(id: number, email: string): string {
  const segredo = process.env.JWT_SECRET;

  if (!segredo || segredo.length < 32) {
    throw new Error("Configure uma JWT_SECRET com pelo menos 32 caracteres.");
  }

  const expiracao: SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRES_IN || "1h") as SignOptions["expiresIn"];

  return jwt.sign(
    { email },
    segredo,
    {
      subject: String(id),
      expiresIn: expiracao
    }
  );
}

export async function registrarUsuario(dados: {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  confirmarSenha: string;
}) {
  const nome = dados.nome.trim();
  const email = dados.email.trim().toLowerCase();
  const cpf = dados.cpf.replace(/\D/g, "");
  const senha = dados.senha;

  if (!nome || !email || !dados.cpf.trim() || !senha || !dados.confirmarSenha) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  if (!validarEmail(email)) {
    throw new Error("Informe um e-mail válido.");
  }

  if (!validarCPF(cpf)) {
    throw new Error("CPF inválido.");
  }

  if (!validarSenha(senha)) {
    throw new Error(
      "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial."
    );
  }

  if (senha !== dados.confirmarSenha) {
    throw new Error("As senhas não coincidem.");
  }

  if (await buscarUsuarioPorEmail(email)) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  if (await buscarUsuarioPorCPF(cpf)) {
    throw new Error("Este CPF já está cadastrado.");
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  await cadastrarUsuario({
    nome,
    email,
    cpf,
    senha: senhaHash
  });

  const usuario = await buscarUsuarioPorEmail(email);

  if (!usuario) {
    throw new Error("Não foi possível confirmar o cadastro.");
  }

  return {
    id: usuario.id,
    nome,
    email,
    token: gerarToken(usuario.id, email)
  };
}

export async function autenticarUsuario(emailInformado: string, senha: string) {
const email = emailInformado.trim().toLowerCase();

const emailTeste = "vitor.monsil@gmail.com";
const senhaFixa = "Db#2026!Vitor@Seg";

console.log("========== TESTE DE LOGIN ==========");
console.log("E-mail recebido:", JSON.stringify(email));
console.log("E-mail corresponde:", email === emailTeste);
console.log("Senha recebida:", typeof senha === "string" ? "sim" : "não");
console.log("Senha corresponde:", senha === senhaFixa);

if (email !== emailTeste || senha !== senhaFixa) {
throw new Error("E-mail ou senha incorretos.");
}

const usuario = await buscarUsuarioPorEmail(email);

console.log("Usuário encontrado no banco:", !!usuario);

if (!usuario) {
throw new Error("Usuário de teste não encontrado no banco.");
}

return {
id: usuario.id,
nome: usuario.nome,
email: usuario.email,
token: gerarToken(usuario.id, email)
};
}