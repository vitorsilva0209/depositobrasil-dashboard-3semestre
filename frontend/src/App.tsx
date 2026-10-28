
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000";

type Tela = "login" | "cadastro" | "dashboard";

type Usuario = {
  id?: number;
  nome?: string;
  usuarioId?: number;
};

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCPF(cpf: string) {
  const numero = cpf.replace(/\D/g, "");

  if (numero.length !== 11 || /^(\d)\1{10}$/.test(numero)) {
    return false;
  }

  const calcularDigito = (base: string, pesoInicial: number) => {
    let soma = 0;

    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }

    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return (
    calcularDigito(numero.substring(0, 9), 10) === Number(numero[9]) &&
    calcularDigito(numero.substring(0, 10), 11) === Number(numero[10])
  );
}

function validarSenha(senha: string) {
  return (
    senha.length >= 8 &&
    /[A-Z]/.test(senha) &&
    /[a-z]/.test(senha) &&
    /\d/.test(senha) &&
    /[^A-Za-z0-9]/.test(senha)
  );
}

async function requisicaoAPI(
  rota: string,
  dados?: Record<string, string>,
  token?: string
) {
  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}${rota}`, {
      method: dados ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(dados ? { body: JSON.stringify(dados) } : {}),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar à API. Confira se o backend está rodando na porta 3000."
    );
  }

  const resultado = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(
      resultado.mensagem ||
        resultado.message ||
        resultado.erro ||
        "Não foi possível concluir a operação."
    );
  }

  return resultado;
}

function App() {
  const [tela, setTela] = useState<Tela>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(false);

  function informar(texto: string, houveErro = false) {
    setMensagem(texto);
    setErro(houveErro);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    requisicaoAPI("/api/protegido", undefined, token)
      .then((dados) => {
        setUsuario(dados.usuario ?? dados);
        setTela("dashboard");
      })
      .catch(() => {
        localStorage.removeItem("token");
      });
  }, []);

  function limparFormulario() {
    setNome("");
    setEmail("");
    setCpf("");
    setSenha("");
    setConfirmarSenha("");
    informar("");
  }

  async function cadastrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    informar("");

    if (!nome.trim() || !email.trim() || !senha || !cpf.trim()) {
      informar("Preencha todos os campos obrigatórios.", true);
      return;
    }

    if (!validarEmail(email)) {
      informar("Digite um e-mail válido.", true);
      return;
    }

    if (!validarCPF(cpf)) {
      informar("O CPF informado é inválido.", true);
      return;
    }

    if (!validarSenha(senha)) {
      informar(
        "A senha precisa ter 8 caracteres, letra maiúscula, minúscula, número e símbolo.",
        true
      );
      return;
    }

    if (senha !== confirmarSenha) {
      informar("As senhas não são iguais.", true);
      return;
    }

    setCarregando(true);

    try {
      await requisicaoAPI("/api/auth/registrar", {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        cpf: cpf.replace(/\D/g, ""),
      });

      const emailCadastrado = email.trim();
      limparFormulario();
      setEmail(emailCadastrado);
      setTela("login");
      informar("Cadastro realizado! Agora entre com seu e-mail e senha.");
    } catch (e) {
      informar(
        e instanceof Error ? e.message : "Erro ao cadastrar usuário.",
        true
      );
    } finally {
      setCarregando(false);
    }
  }

  async function entrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    informar("");

    if (!validarEmail(email)) {
      informar("Digite um e-mail válido.", true);
      return;
    }

    if (!senha) {
      informar("Digite sua senha.", true);
      return;
    }

    setCarregando(true);

    try {
      const dados = await requisicaoAPI("/api/auth/login", {
        email: email.trim(),
        senha,
      });

      const token = dados.token ?? dados.accessToken;

      if (!token) {
        throw new Error("A API não retornou o token de autenticação.");
      }

      localStorage.setItem("token", token);

      try {
        const protegido = await requisicaoAPI(
          "/api/protegido",
          undefined,
          token
        );
        setUsuario(protegido.usuario ?? protegido);
      } catch {
        setUsuario(dados.usuario ?? null);
      }

      setSenha("");
      setTela("dashboard");
      informar("");
    } catch (e) {
      informar(
        e instanceof Error ? e.message : "Não foi possível fazer login.",
        true
      );
    } finally {
      setCarregando(false);
    }
  }

  function sair() {
    localStorage.removeItem("token");
    setUsuario(null);
    limparFormulario();
    setTela("login");
    informar("Você saiu da sua conta.");
  }

  return (
    <main className="app">
      <section className="painel">
        <header className="cabecalho">
          <div className="marca">DB</div>
          <div>
            <h1>Depósito Brasil</h1>
            <p>Materiais de construção</p>
          </div>
        </header>

        {tela === "login" && (
          <section className="conteudo">
            <span className="etiqueta">BEM-VINDO DE VOLTA</span>
            <h2>Entrar na sua conta</h2>
            <p className="descricao">Acesse sua conta para continuar.</p>

            <form onSubmit={entrar}>
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              {mensagem && (
                <p className={erro ? "mensagem erro" : "mensagem sucesso"}>
                  {mensagem}
                </p>
              )}

              <button type="submit" disabled={carregando}>
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="alternativa">
              Ainda não tem conta?{" "}
              <button
                className="link"
                type="button"
                onClick={() => {
                  limparFormulario();
                  setTela("cadastro");
                }}
              >
                Criar conta
              </button>
            </p>
          </section>
        )}

        {tela === "cadastro" && (
          <section className="conteudo">
            <span className="etiqueta">NOVO CADASTRO</span>
            <h2>Crie sua conta</h2>
            <p className="descricao">Preencha os dados para se cadastrar.</p>

            <form onSubmit={cadastrar}>
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                type="text"
                autoComplete="name"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <label htmlFor="email-cadastro">E-mail</label>
              <input
                id="email-cadastro"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label htmlFor="cpf">CPF</label>
              <input
                id="cpf"
                type="text"
                inputMode="numeric"
                placeholder="Somente números ou CPF formatado"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />

              <label htmlFor="senha-cadastro">Senha</label>
              <input
                id="senha-cadastro"
                type="password"
                autoComplete="new-password"
                placeholder="Crie uma senha forte"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              <small className="ajuda">
                Mínimo de 8 caracteres, maiúscula, minúscula, número e símbolo.
              </small>

              <label htmlFor="confirmar-senha">Confirmar senha</label>
              <input
                id="confirmar-senha"
                type="password"
                autoComplete="new-password"
                placeholder="Digite a senha novamente"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />

              {mensagem && (
                <p className={erro ? "mensagem erro" : "mensagem sucesso"}>
                  {mensagem}
                </p>
              )}

              <button type="submit" disabled={carregando}>
                {carregando ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>

            <p className="alternativa">
              Já tem conta?{" "}
              <button
                className="link"
                type="button"
                onClick={() => {
                  limparFormulario();
                  setTela("login");
                }}
              >
                Fazer login
              </button>
            </p>
          </section>
        )}

        {tela === "dashboard" && (
          <section className="conteudo dashboard">
            <span className="etiqueta">ÁREA RESTRITA</span>
            <h2>Login realizado!</h2>
            <p className="descricao">
              Você está autenticado no Depósito Brasil.
            </p>

            <div className="cartao-bemvindo">
              <span className="icone">✓</span>
              <div>
                <strong>{usuario?.nome ?? "Usuário autenticado"}</strong>
                <p>Seu acesso foi autorizado.</p>
              </div>
            </div>

            <p className="descricao">
              O token de autenticação está armazenado no navegador.
            </p>

            <button
              type="button"
              className="botao-secundario"
              onClick={sair}
            >
              Sair da conta
            </button>
          </section>
        )}

        <footer>
          <span>Depósito Brasil</span>
          <span>Segurança e praticidade</span>
        </footer>
      </section>
    </main>
  );
}

export default App;
