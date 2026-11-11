import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AuthContext,
  type Usuario,
} from "./authContextCore";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string>(
    () => localStorage.getItem("token") || ""
  );

  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    const tokenSalvo = localStorage.getItem("token");

    if (!usuarioSalvo || !tokenSalvo) {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      return null;
    }

    try {
      return JSON.parse(usuarioSalvo) as Usuario;
    } catch {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      return null;
    }
  });

  const entrar = useCallback(
    (novoToken: string, dadosUsuario: Usuario) => {
      localStorage.setItem("token", novoToken);
      localStorage.setItem("usuario", JSON.stringify(dadosUsuario));

      setToken(novoToken);
      setUsuario(dadosUsuario);
    },
    []
  );

  const atualizarUsuario = useCallback(
    (dadosUsuario: Partial<Usuario>) => {
      setUsuario((atual) => {
        const atualizado = {
          ...atual,
          ...dadosUsuario,
        };

        localStorage.setItem("usuario", JSON.stringify(atualizado));

        return atualizado;
      });
    },
    []
  );

  const sair = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setToken("");
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      token,
      autenticado: Boolean(token && usuario),
      entrar,
      atualizarUsuario,
      sair,
    }),
    [usuario, token, entrar, atualizarUsuario, sair]
  );

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}