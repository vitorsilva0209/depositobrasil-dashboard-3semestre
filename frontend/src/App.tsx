import { useEffect, useState } from "react";
import "./App.css";

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

type RespostaAPI = {
  token?: string;
  accessToken?: string;
  mensagem?: string;
  message?: string;
  erro?: string;
  usuario?: Usuario;
  produtos?: Produto[];
  [chave: string]: any;
};

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCPF(cpf: string): boolean {
  const numero = cpf.replace(/\D/g, "");

  if (numero.length !== 11 || /^(\d)\1{10}$/.test(numero)) {
    return false;
  }

  const calcularDigito = (base: string, pesoInicial: number): number => {
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

function validarSenha(senha: string): boolean {
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
): Promise<RespostaAPI> {
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

  const resultado: RespostaAPI = await resposta.json().catch(() => ({}));

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

function formatarPreco(preco: number | string): string {
  return Number(preco).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function App() {
  const [tela, setTela] = useState<Tela>("login");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);

  function informar(texto: string, houveErro = false) {
    setMensagem(texto);
    setErro(houveErro);
  }

  async function carregarProdutos() {
    const token = localStorage.getItem("token");

    if (!token) return;

    setCarregandoProdutos(true);

    try {
      const dados = await requisicaoAPI(
        "/api/produtos",
        undefined,
        token
      );

      setProdutos(Array.isArray(dados.produtos) ? dados.produtos : []);
    } catch (e) {
      informar(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar os produtos.",
        true
      );
    } finally {
      setCarregandoProdutos(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    requisicaoAPI("/api/protegido", undefined, token)
      .then((dados) => {
        if (dados.usuario && typeof dados.usuario === "object") {
          setUsuario({
            id: dados.usuario.id,
            nome: dados.usuario.nome,
            usuarioId: dados.usuario.usuarioId,
          });
        } else {
          setUsuario(null);
        }

        setTela("dashboard");
      })
      .catch(() => {
        localStorage.removeItem("token");
      });
  }, []);

  useEffect(() => {
    if (tela === "dashboard") {
      carregarProdutos();
    }
  }, [tela]);

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

    if (
      !nome.trim() ||
      !email.trim() ||
      !senha ||
      !confirmarSenha ||
      !cpf.trim()
    ) {
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
        "A senha precisa ter pelo menos 8 caracteres, letra maiúscula, minúscula, número e símbolo.",
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
        confirmarSenha,
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

        setUsuario(protegido.usuario ?? dados.usuario ?? null);
      } catch {
        localStorage.removeItem("token");
        setUsuario(null);

        throw new Error(
          "Não foi possível validar sua autenticação. Faça login novamente."
        );
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
    setProdutos([]);
    limparFormulario();
    setTela("login");
    informar("Você saiu da sua conta.");
  }

  const produtosFiltrados = produtos.filter((produto) => {
    const termo = busca.toLowerCase();

    return (
      produto.nome.toLowerCase().includes(termo) ||
      produto.categoria.toLowerCase().includes(termo)
    );
  });

  const totalEstoque = produtos.reduce(
    (total, produto) => total + Number(produto.estoque || 0),
    0
  );

  const valorEstoque = produtos.reduce(
    (total, produto) =>
      total + Number(produto.preco || 0) * Number(produto.estoque || 0),
    0
  );

  return (
    <main className={tela === "dashboard" ? "app app-dashboard" : "app"}>
      <section className={tela === "dashboard" ? "painel painel-dashboard" : "painel"}>
        <header className="cabecalho">
          <div className="marca">DB</div>

          <div>
            <h1>Depósito Brasil</h1>
            <p>Materiais de construção</p>
          </div>

          {tela === "dashboard" && (
            <span className="status-online">● Online</span>
          )}
        </header>

        {tela === "login" && (
          <section className="conteudo">
            <span className="etiqueta">BEM-VINDO DE VOLTA</span>

            <h2>Entrar na sua conta</h2>

            <p className="descricao">
              Acesse sua conta para continuar.
            </p>

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

            <p className="descricao">
              Preencha os dados para se cadastrar.
            </p>

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
                autoComplete="off"
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
          <section className="dashboard">
            <div className="dashboard-topo">
              <div>
                <span className="etiqueta">PAINEL ADMINISTRATIVO</span>
                <h2>Visão geral</h2>
                <p className="descricao">
                  Bem-vindo, {usuario?.nome ?? "usuário"}! Aqui estão os dados
                  dos produtos do Depósito Brasil.
                </p>
              </div>

              <button className="botao-sair" onClick={sair} type="button">
                Sair da conta
              </button>
            </div>

            {mensagem && (
              <p className={erro ? "mensagem erro" : "mensagem sucesso"}>
                {mensagem}
              </p>
            )}

            <div className="resumo">
              <article className="resumo-card">
                <span className="resumo-icone">▦</span>
                <div>
                  <p>Produtos cadastrados</p>
                  <strong>{produtos.length}</strong>
                </div>
              </article>

              <article className="resumo-card">
                <span className="resumo-icone">▤</span>
                <div>
                  <p>Unidades em estoque</p>
                  <strong>{totalEstoque}</strong>
                </div>
              </article>

              <article className="resumo-card">
                <span className="resumo-icone">R$</span>
                <div>
                  <p>Valor do estoque</p>
                  <strong>{formatarPreco(valorEstoque)}</strong>
                </div>
              </article>
            </div>

            <div className="produtos-topo">
              <div>
                <h3>Produtos cadastrados</h3>
                <p>Produtos carregados diretamente do banco de dados.</p>
              </div>

              <button
                className="botao-atualizar"
                type="button"
                onClick={carregarProdutos}
                disabled={carregandoProdutos}
              >
                {carregandoProdutos ? "Atualizando..." : "↻ Atualizar"}
              </button>
            </div>

            <input
              className="campo-busca"
              type="search"
              placeholder="Buscar por nome ou categoria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            {carregandoProdutos ? (
              <div className="estado-lista">Carregando produtos...</div>
            ) : produtosFiltrados.length === 0 ? (
              <div className="estado-lista">
                {produtos.length === 0
                  ? "Nenhum produto encontrado."
                  : "Nenhum produto corresponde à sua busca."}
              </div>
            ) : (
              <div className="grade-produtos">
                {produtosFiltrados.map((produto) => {
                  const imagem = produto.imagem_url
                    ? produto.imagem_url.startsWith("http")
                      ? produto.imagem_url
                      : `${API_URL}/${produto.imagem_url.replace(/^\/+/, "")}`
                    : "";

                  return (
                    <article className="produto-card" key={produto.id}>
                      <div className="produto-imagem">
                        {imagem ? (
                          <img
                            src={imagem}
                            alt={produto.nome}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span>Sem imagem</span>
                        )}
                      </div>

                      <div className="produto-info">
                        <span className="produto-categoria">
                          {produto.categoria}
                        </span>

                        <h4>{produto.nome}</h4>

                        <p className="produto-descricao">
                          {produto.descricao || "Sem descrição cadastrada."}
                        </p>

                        <div className="produto-dados">
                          <strong>{formatarPreco(produto.preco)}</strong>
                          <span>
                            Estoque: {Number(produto.estoque || 0)}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {tela !== "dashboard" && (
          <footer>
            <span>Depósito Brasil</span>
            <span>Segurança e praticidade</span>
          </footer>
        )}
      </section>
    </main>
  );
}

export default App;