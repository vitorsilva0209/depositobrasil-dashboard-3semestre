
import { useEffect, useState } from "react";
import "./App.css";
const [produtoEditando, setProdutoEditando] = useState<number | null>(null);

const API_URL = "http://localhost:3000";

type Tela = "login" | "cadastro" | "dashboard";

type Usuario = {
  id?: number;
  nome?: string;
  usuarioId?: number;
};

type Produto = {
  id: number;
  nome: string;
  categoria: string;
  preco: number | string;
  descricao: string;
  imagem_url: string;
  estoque: number;
};

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCPF(cpf: string): boolean {
  const numero = cpf.replace(/\D/g, "");

  if (numero.length !== 11 || /^(\d)\1+$/.test(numero)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(numero[i]) * (10 - i);
  }

  let digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;

  if (digito !== Number(numero[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(numero[i]) * (11 - i);
  }

  digito = (soma * 10) % 11;
  if (digito === 10) digito = 0;

  return digito === Number(numero[10]);
}

async function requisicaoAPI(
  rota: string,
  metodo: string,
  dados?: object,
  token?: string
) {
  const resposta = await fetch(`${API_URL}${rota}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(dados ? { body: JSON.stringify(dados) } : {}),
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.mensagem || "Erro na requisição.");
  }

  return resultado;
}

function App() {
  const [tela, setTela] = useState<Tela>("login");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState("");

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [busca, setBusca] = useState("");

  const [mostrarCadastroProduto, setMostrarCadastroProduto] =
    useState(false);

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    categoria: "",
    preco: "",
    descricao: "",
    imagem_url: "",
    estoque: "",
  });

  async function fazerLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    setCarregando(true);

    try {
      if (!validarEmail(email)) {
        throw new Error("Digite um e-mail válido.");
      }

      const resultado = await requisicaoAPI(
        "/api/auth/login",
        "POST",
        { email, senha }
      );

      const tokenRecebido = resultado.token;

      if (!tokenRecebido) {
        throw new Error("A API não retornou o token de acesso.");
      }

      setToken(tokenRecebido);
      setUsuario(resultado.usuario || resultado.user || {});
      setTela("dashboard");
      setMensagem("Login realizado com sucesso!");
    } catch (erro) {
      setMensagem(
        erro instanceof Error ? erro.message : "Erro ao fazer login."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function fazerCadastro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    setCarregando(true);

    try {
      if (!nome.trim()) {
        throw new Error("Informe seu nome.");
      }

      if (!validarEmail(email)) {
        throw new Error("Digite um e-mail válido.");
      }

      if (senha.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
      }

      if (!validarCPF(cpf)) {
        throw new Error("CPF inválido.");
      }

      const resultado = await requisicaoAPI(
        "/api/auth/registrar",
        "POST",
        { nome, email, senha, cpf: cpf.replace(/\D/g, "") }
      );

      setMensagem(
        resultado.mensagem || "Cadastro realizado com sucesso!"
      );

      setTela("login");
      setNome("");
      setCpf("");
      setSenha("");
    } catch (erro) {
      setMensagem(
        erro instanceof Error ? erro.message : "Erro ao cadastrar."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarProdutos() {
    try {
      const resultado = await requisicaoAPI(
        "/api/produtos",
        "GET"
      );

      setProdutos(resultado.produtos || []);
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Erro ao carregar produtos."
      );
    }
  }

  async function cadastrarProduto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");

    try {
      if (!novoProduto.nome.trim()) {
        throw new Error("Informe o nome do produto.");
      }

      if (!novoProduto.categoria.trim()) {
        throw new Error("Informe a categoria.");
      }

      const resultado = await requisicaoAPI(
        "/api/produtos",
        "POST",
        {
          ...novoProduto,
          preco: Number(novoProduto.preco),
          estoque: Number(novoProduto.estoque),
        },
        token
      );

      setMensagem(
        resultado.mensagem || "Produto cadastrado com sucesso!"
      );

      setNovoProduto({
        nome: "",
        categoria: "",
        preco: "",
        descricao: "",
        imagem_url: "",
        estoque: "",
      });

      setMostrarCadastroProduto(false);
      await carregarProdutos();
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Erro ao cadastrar produto."
      );
    }
  }

  function sair() {
    setToken("");
    setUsuario(null);
    setProdutos([]);
    setEmail("");
    setSenha("");
    setMensagem("");
    setTela("login");
  }

  useEffect(() => {
    if (tela === "dashboard") {
      carregarProdutos();
    }
  }, [tela]);

  const produtosFiltrados = produtos.filter((produto) =>
    `${produto.nome} ${produto.categoria}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  return (
    <main className="app">
      <section className="painel">
        <header className="cabecalho">
          <div className="marca">
            <h1>DEPÓSITO BRASIL</h1>
            <p>Materiais de Construção</p>
          </div>
          <span className="status-online">Sistema online</span>
        </header>

        <div className="conteudo">
          {mensagem && (
            <div className="mensagem">
              {mensagem}
            </div>
          )}

          {tela === "login" && (
            <form onSubmit={fazerLogin}>
              <h2>Entrar no sistema</h2>

              <label>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                required
              />

              <label>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
              />

              <button type="submit" disabled={carregando}>
                {carregando ? "Entrando..." : "Entrar"}
              </button>

              <p>
                Não possui conta?{" "}
                <button
                  type="button"
                  onClick={() => setTela("cadastro")}
                >
                  Criar conta
                </button>
              </p>
            </form>
          )}

          {tela === "cadastro" && (
            <form onSubmit={fazerCadastro}>
              <h2>Criar conta</h2>

              <label>Nome completo</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome"
                required
              />

              <label>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                required
              />

              <label>CPF</label>
              <input
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="Digite seu CPF"
                maxLength={14}
                required
              />

              <label>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                required
              />

              <button type="submit" disabled={carregando}>
                {carregando ? "Cadastrando..." : "Cadastrar"}
              </button>

              <button
                type="button"
                onClick={() => setTela("login")}
              >
                Voltar ao login
              </button>
            </form>
          )}

          {tela === "dashboard" && (
            <div className="dashboard">
              <div className="dashboard-topo">
                <div>
                  <h2>Dashboard</h2>
                  <p>
                    Bem-vindo(a), {usuario?.nome || "usuário"}!
                  </p>
                </div>

                <button className="botao-sair" onClick={sair}>
                  Sair
                </button>
              </div>

              <div className="resumo">
                <div className="resumo-card">
                  <h3>{produtos.length}</h3>
                  <p>Produtos cadastrados</p>
                </div>

                <div className="resumo-card">
                  <h3>Depósito Brasil</h3>
                  <p>Materiais de construção</p>
                </div>
              </div>

              <div className="produtos-topo">
                <h2>Produtos</h2>

                <button
                  className="botao-atualizar"
                  onClick={carregarProdutos}
                >
                  Atualizar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarCadastroProduto(!mostrarCadastroProduto)
                  }
                >
                  {mostrarCadastroProduto
                    ? "Fechar cadastro"
                    : "Novo produto"}
                </button>
              </div>

              {mostrarCadastroProduto && (
                <form onSubmit={cadastrarProduto}>
                  <h3>Cadastrar produto</h3>

                  <label>Nome</label>
                  <input
                    value={novoProduto.nome}
                    onChange={(e) =>
                      setNovoProduto({
                        ...novoProduto,
                        nome: e.target.value,
                      })
                    }
                    required
                  />

                  <label>Categoria</label>
                  <input
                    value={novoProduto.categoria}
                    onChange={(e) =>
                      setNovoProduto({
                        ...novoProduto,
                        categoria: e.target.value,
                      })
                    }
                    required
                  />

                  <label>Preço</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={novoProduto.preco}
                    onChange={(e) =>
                      setNovoProduto({
                        ...novoProduto,
                        preco: e.target.value,
                      })
                    }
                    required
                  />

                  <label>Descrição</label>
                  <textarea
                    value={novoProduto.descricao}
                    onChange={(e) =>
                      setNovoProduto({
                        ...novoProduto,
                        descricao: e.target.value,
                      })
                    }
                  />

                  <label>Imagem (caminho)</label>
                  <input
                    value={novoProduto.imagem_url}
                    onChange={(e) =>
                      setNovoProduto({
                        ...novoProduto,
                        imagem_url: e.target.value,
                      })
                    }
                    placeholder="imagens/img/produtos/produto.jpg"
                  />

                  <label>Estoque</label>
                  <input
                    type="number"
                    min="0"
                    value={novoProduto.estoque}
                    onChange={(e) =>
                      setNovoProduto({
                        ...novoProduto,
                        estoque: e.target.value,
                      })
                    }
                    required
                  />

                  <button type="submit">
                    Salvar produto
                  </button>
                </form>
              )}

              <input
                className="campo-busca"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produto..."
              />

              <div className="grade-produtos">
                {produtosFiltrados.map((produto) => (
                  <article className="produto-card" key={produto.id}>
                    <img
                      className="produto-imagem"
                      src={
                        produto.imagem_url.startsWith("http")
                          ? produto.imagem_url
                          : `http://localhost:3000/${produto.imagem_url.replace(/^\/+/, "")}`
                      }
                      alt={produto.nome}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="produto-info">
                      <span className="produto-categoria">
                        {produto.categoria}
                      </span>

                      <h3>{produto.nome}</h3>

                      <p className="produto-descricao">
                        {produto.descricao}
                      </p>

                      <div className="produto-dados">
                        <strong>
                          R$ {Number(produto.preco).toFixed(2)}
                        </strong>

                        <span>Estoque: {produto.estoque}</span>
                      </div>
                    </div>
                  </article>
                ))}

                {produtosFiltrados.length === 0 && (
                  <p className="estado-lista">
                    Nenhum produto encontrado.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;

