
import {
  useCallback,
  useEffect,
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

type SessaoInicial = {
  token: string;
  usuario: Usuario | null;
};

/**
 * Recupera a sessão armazenada no navegador.
 * Se os dados estiverem ausentes ou inválidos,
 * limpa o armazenamento e inicia sem autenticação.
 */
function recuperarSessao(): SessaoInicial {
  const tokenSalvo = localStorage.getItem("token");
  const usuarioSalvo = localStorage.getItem("usuario");

  if (!tokenSalvo?.trim() || !usuarioSalvo) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    return {
      token: "",
      usuario: null,
    };
  }

  try {
    const dadosUsuario: unknown = JSON.parse(usuarioSalvo);

    if (
      typeof dadosUsuario !== "object" ||
      dadosUsuario === null ||
      Array.isArray(dadosUsuario) ||
      !("id" in dadosUsuario) ||
      typeof dadosUsuario.id !== "number" ||
      !Number.isSafeInteger(dadosUsuario.id) ||
      dadosUsuario.id <= 0 ||
      !("nome" in dadosUsuario) ||
      typeof dadosUsuario.nome !== "string" ||
      !("email" in dadosUsuario) ||
      typeof dadosUsuario.email !== "string"
    ) {
      throw new Error("Dados de usuário inválidos.");
    }

    return {
      token: tokenSalvo,
      usuario: dadosUsuario as Usuario,
    };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    return {
      token: "",
      usuario: null,
    };
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [sessaoInicial] = useState<SessaoInicial>(
    recuperarSessao
  );

  const [token, setToken] = useState<string>(
    sessaoInicial.token
  );

  const [usuario, setUsuario] = useState<Usuario | null>(
    sessaoInicial.usuario
  );

  /**
   * Salva o token e os dados do usuário após o login.
   */
  const entrar = useCallback(
    (novoToken: string, dadosUsuario: Usuario) => {
      if (!novoToken.trim()) {
        throw new Error("Token de autenticação inválido.");
      }

      localStorage.setItem("token", novoToken);
      localStorage.setItem(
        "usuario",
        JSON.stringify(dadosUsuario)
      );

      setToken(novoToken);
      setUsuario(dadosUsuario);
    },
    []
  );

  /**
   * Atualiza os dados do usuário no estado e no navegador.
   */
  const atualizarUsuario = useCallback(
    (dadosUsuario: Partial<Usuario>) => {
      if (!usuario) return;

      const atualizado: Usuario = {
        ...usuario,
        ...dadosUsuario,
      };

      localStorage.setItem("usuario", JSON.stringify(atualizado));
      setUsuario(atualizado);
    },
    [usuario]
  );

  /**
   * Encerra a sessão e remove os dados armazenados.
   */
  const sair = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setToken("");
    setUsuario(null);
  }, []);

  const autenticado = Boolean(token && usuario);

  useEffect(() => {
    function sincronizarAbas(event: StorageEvent) {
      if (event.key === "token" || event.key === "usuario" || event.key === null) {
        const novaSessao = recuperarSessao();
        setToken(novaSessao.token);
        setUsuario(novaSessao.usuario);
      }
    }

    window.addEventListener("storage", sincronizarAbas);
    return () => window.removeEventListener("storage", sincronizarAbas);
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      token,
      autenticado,
      entrar,
      atualizarUsuario,
      sair,
    }),
    [
      usuario,
      token,
      autenticado,
      entrar,
      atualizarUsuario,
      sair,
    ]
  );

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}
