export interface UsuarioAutenticacao {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

export interface UsuarioPerfil {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  usuario: string | null;
}

export interface NovoUsuario {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

export interface DadosAtualizacaoPerfil {
  nome: string;
  cpf: string;
  usuario: string | null;
  senha?: string;
}

export interface IUsuarioRepository {
  buscarPorEmail(email: string): Promise<UsuarioAutenticacao | null>;
  buscarPorCPF(cpf: string): Promise<{ id: number } | null>;
  buscarPorId(id: number): Promise<UsuarioAutenticacao | null>;
  buscarPerfilPorId(id: number): Promise<UsuarioPerfil | null>;
  criar(dados: NovoUsuario): Promise<number>;
  atualizarPerfil(
    id: number,
    dados: DadosAtualizacaoPerfil
  ): Promise<void>;
}