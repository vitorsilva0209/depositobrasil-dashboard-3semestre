import { createContext } from "react";

export type Usuario = {
  id?: number;
  nome?: string;
  email?: string;
  cpf?: string;
  usuario?: string;
};

export type AuthContexto = {
  usuario: Usuario | null;
  token: string;
  autenticado: boolean;
  entrar: (novoToken: string, dadosUsuario: Usuario) => void;
  atualizarUsuario: (dadosUsuario: Partial<Usuario>) => void;
  sair: () => void;
};

export const AuthContext = createContext<AuthContexto | undefined>(
  undefined
);