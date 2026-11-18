import { ProdutoRepository } from "../repositories/ProdutoRepository";
import { ClienteRepository } from "../repositories/ClienteRepository";
import { FuncionarioRepository } from "../repositories/FuncionarioRepository";
import { VendaRepository } from "../repositories/VendaRepository";
import { UsuarioRepository } from "../repositories/UsuarioRepository";

import { ProdutoService } from "../services/produtoService";
import { ClienteService } from "../services/clienteService";
import { FuncionarioService } from "../services/funcionarioService";
import { VendaService } from "../services/vendaService";
import { AuthService } from "../services/authService";
import { UsuarioService } from "../services/usuarioService";

// Repositórios: acesso aos dados.
const produtoRepository = new ProdutoRepository();
const clienteRepository = new ClienteRepository();
const funcionarioRepository = new FuncionarioRepository();
const vendaRepository = new VendaRepository();
const usuarioRepository = new UsuarioRepository();

// Serviços: recebem suas dependências por injeção.
export const produtoService = new ProdutoService(produtoRepository);
export const clienteService = new ClienteService(clienteRepository);
export const funcionarioService =
  new FuncionarioService(funcionarioRepository);

export const vendaService = new VendaService(
  vendaRepository,
  produtoRepository
);

export const authService = new AuthService(usuarioRepository);
export const usuarioService = new UsuarioService(usuarioRepository);