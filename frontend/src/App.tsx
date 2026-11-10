
import { useEffect, useState, type FormEvent } from "react";
import "./App.css";

const API_URL = "http://localhost:3000";

type Tela = "login" | "cadastro" | "dashboard";
type Modulo = "produtos" | "clientes" | "funcionarios" | "vendas" | "perfil";

type Usuario = {
  id?: number;
  nome?: string;
  email?: string;
  cpf?: string;
  usuario?: string;
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

type Registro = {
  id: number;
  produto?: string;
  produto_nome?: string;
  produto_id?: number;
  data_venda?: string;
  [chave: string]: string | number | null | undefined;
};

type DadosFormulario = Record<string, string | number>;

const formularios: Record<Exclude<Modulo, "perfil">, Record<string, string>> = {
  produtos: {
    nome: "",
    categoria: "",
    preco: "",
    descricao: "",
    imagem_url: "",
    estoque: "",
  },
  clientes: {
    nome: "",
    email: "",
    telefone: "",
  },
  funcionarios: {
    nome: "",
    cargo: "",
    salario: "",
  },
  vendas: {
    produto_id: "",
    quantidade: "",
    data_venda: "",
  },
};

const rotas: Record<Exclude<Modulo, "perfil">, string> = {
  produtos: "/api/produtos",
  clientes: "/api/clientes",
  funcionarios: "/api/funcionarios",
  vendas: "/api/vendas",
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

function formatarData(data: string | undefined): string {
  if (!data) return "-";

  const dataFormatada = new Date(data);

  if (isNaN(dataFormatada.getTime())) return "-";

  return dataFormatada.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarDataParaInput(data: string | undefined): string {
  if (!data) return "";

  const dataFormatada = new Date(data);

  if (isNaN(dataFormatada.getTime())) return "";

  const ano = dataFormatada.getFullYear();
  const mes = String(dataFormatada.getMonth() + 1).padStart(2, "0");
  const dia = String(dataFormatada.getDate()).padStart(2, "0");
  const hora = String(dataFormatada.getHours()).padStart(2, "0");
  const minuto = String(dataFormatada.getMinutes()).padStart(2, "0");

  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
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

  const resultado = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(resultado.mensagem || "Erro na requisição.");
  }

  return resultado;
}

function App() {
  const [tela, setTela] = useState<Tela>("login");
  const [modulo, setModulo] = useState<Modulo>("produtos");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState("");

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [registros, setRegistros] = useState<Registro[]>([]);

  const [perfil, setPerfil] = useState<Usuario>({
    nome: "",
    email: "",
    cpf: "",
    usuario: "",
  });

  const [formulario, setFormulario] = useState<Record<string, string>>({});
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  async function fazerLogin(e: FormEvent<HTMLFormElement>) {
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

      if (!resultado.token) {
        throw new Error("A API não retornou o token de acesso.");
      }

      setToken(resultado.token);
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

  async function fazerCadastro(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    setCarregando(true);

    try {
      if (!nome.trim()) throw new Error("Informe seu nome.");
      if (!validarEmail(email)) throw new Error("Digite um e-mail válido.");

      const senhaForte =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

      if (!senhaForte.test(senha)) {
        throw new Error(
          "A senha deve ter pelo menos 8 caracteres, letra maiúscula, minúscula, número e caractere especial."
        );
      }

      if (!validarCPF(cpf)) throw new Error("CPF inválido.");

      const resultado = await requisicaoAPI(
        "/api/auth/registrar",
        "POST",
        { nome, email, senha, cpf: cpf.replace(/\D/g, "") }
      );

      setMensagem(resultado.mensagem || "Cadastro realizado com sucesso!");
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
      const resultado = await requisicaoAPI("/api/produtos", "GET");
      setProdutos(resultado.produtos || []);
    } catch (erro) {
      setMensagem(
        erro instanceof Error ? erro.message : "Erro ao carregar produtos."
      );
    }
  }

  async function carregarModulo(alvo: Modulo = modulo) {
    if (alvo === "perfil") {
      await carregarPerfil();
      return;
    }

    try {
      setCarregando(true);

      const resultado = await requisicaoAPI(
        `${rotas[alvo]}?pagina=1&limite=100`,
        "GET",
        undefined,
        token
      );

      const lista =
        resultado[alvo] ||
        resultado.registros ||
        resultado.dados ||
        [];

      setRegistros(Array.isArray(lista) ? lista : []);

      if (alvo === "produtos") {
        setProdutos(Array.isArray(lista) ? lista : []);
      }
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : `Erro ao carregar ${alvo}.`
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarPerfil() {
    try {
      const resultado = await requisicaoAPI(
        "/api/usuarios/me",
        "GET",
        undefined,
        token
      );

      const dados = resultado.usuario || resultado;

      setPerfil({
        nome: dados.nome || "",
        email: dados.email || "",
        cpf: dados.cpf || "",
        usuario: dados.usuario || "",
      });
    } catch (erro) {
      setMensagem(
        erro instanceof Error ? erro.message : "Erro ao carregar perfil."
      );
    }
  }

  function abrirModulo(alvo: Modulo) {
    setModulo(alvo);
    setBusca("");
    setMensagem("");
    setEditandoId(null);
    setMostrarFormulario(false);

    if (alvo === "perfil") {
      carregarPerfil();
    } else {
      carregarModulo(alvo);
    }
  }

  function abrirNovoRegistro() {
    if (modulo === "perfil") return;

    setFormulario({ ...formularios[modulo] });
    setEditandoId(null);
    setMostrarFormulario(true);
    setMensagem("");
  }

  function editarRegistro(registro: Registro) {
    if (modulo === "perfil") return;

    const valores: Record<string, string> = {};

    Object.keys(formularios[modulo]).forEach((campo) => {
      if (campo === "data_venda") {
        valores[campo] = formatarDataParaInput(
          registro[campo] as string | undefined
        );
      } else {
        valores[campo] = String(registro[campo] ?? "");
      }
    });

    setFormulario(valores);
    setEditandoId(registro.id);
    setMostrarFormulario(true);
    setMensagem("");
  }

  async function salvarRegistro(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");

    if (modulo === "perfil") return;

    try {
      setCarregando(true);

      const dados: DadosFormulario = { ...formulario };

      if (modulo === "produtos") {
        dados.preco = Number(dados.preco);
        dados.estoque = Number(dados.estoque);
      }

      if (modulo === "funcionarios") {
        dados.salario = Number(dados.salario);
      }

      if (modulo === "vendas") {
        dados.produto_id = Number(dados.produto_id);
        dados.quantidade = Number(dados.quantidade);
      }

      const rota = rotas[modulo];

      const resultado = await requisicaoAPI(
        editandoId ? `${rota}/${editandoId}` : rota,
        editandoId ? "PUT" : "POST",
        dados,
        token
      );

      setMensagem(
        resultado.mensagem ||
          (editandoId
            ? "Registro atualizado com sucesso!"
            : "Registro cadastrado com sucesso!")
      );

      setMostrarFormulario(false);
      setEditandoId(null);

      await carregarModulo(modulo);
      await carregarProdutos();
    } catch (erro) {
      setMensagem(
        erro instanceof Error ? erro.message : "Erro ao salvar registro."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function excluirRegistro(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este registro?")) {
      return;
    }

    try {
      setCarregando(true);

      const resultado = await requisicaoAPI(
        `${rotas[modulo as Exclude<Modulo, "perfil">]}/${id}`,
        "DELETE",
        undefined,
        token
      );

      setMensagem(resultado.mensagem || "Registro excluído com sucesso!");

      await carregarModulo(modulo);
      await carregarProdutos();
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Erro ao excluir registro."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function salvarPerfil(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");

    try {
      const nomeAtualizado = perfil.nome?.trim();

      if (!nomeAtualizado) {
        throw new Error("Informe seu nome.");
      }

      if (!validarCPF(perfil.cpf || "")) {
        throw new Error("CPF inválido.");
      }

      const resultado = await requisicaoAPI(
        "/api/usuarios/me",
        "PUT",
        {
          nome: nomeAtualizado,
          cpf: perfil.cpf?.replace(/\D/g, ""),
          usuario: perfil.usuario,
        },
        token
      );

      const nomeConfirmado =
        resultado.usuario?.nome ||
        resultado.nome ||
        nomeAtualizado;

      setUsuario((atual) => ({
        ...atual,
        nome: nomeConfirmado,
      }));

      setPerfil((atual) => ({
        ...atual,
        nome: nomeConfirmado,
      }));

      setMensagem(resultado.mensagem || "Perfil atualizado com sucesso!");
    } catch (erro) {
      setMensagem(
        erro instanceof Error ? erro.message : "Erro ao atualizar perfil."
      );
    }
  }

  function sair() {
    setToken("");
    setUsuario(null);
    setProdutos([]);
    setRegistros([]);
    setEmail("");
    setSenha("");
    setMensagem("");
    setModulo("produtos");
    setMostrarFormulario(false);
    setEditandoId(null);
    setTela("login");
  }

  useEffect(() => {
    if (tela === "dashboard") {
      carregarProdutos();
      carregarModulo("produtos");
    }
  }, [tela]);

  const produtosFiltrados = produtos.filter((produto) =>
    `${produto.nome} ${produto.categoria}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const registrosFiltrados = registros.filter((registro) =>
    Object.values(registro)
      .map((valor) => String(valor ?? ""))
      .join(" ")
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const titulos: Record<Modulo, string> = {
    produtos: "Produtos",
    clientes: "Clientes",
    funcionarios: "Funcionários",
    vendas: "Vendas",
    perfil: "Meu perfil",
  };

  function campoFormulario(campo: string) {
    const nomes: Record<string, string> = {
      nome: "Nome",
      categoria: "Categoria",
      preco: "Preço",
      descricao: "Descrição",
      imagem_url: "Caminho da imagem",
      estoque: "Estoque",
      email: "E-mail",
      telefone: "Telefone",
      cargo: "Cargo",
      salario: "Salário",
      produto_id: "Produto",
      quantidade: "Quantidade",
      data_venda: "Data da venda",
    };

    if (campo === "produto_id") {
      return (
        <label key={campo}>
          {nomes[campo]}
          <select
            value={formulario[campo] || ""}
            onChange={(e) =>
              setFormulario({ ...formulario, [campo]: e.target.value })
            }
            required
          >
            <option value="">Selecione um produto</option>

            {produtos.map((produto) => (
              <option key={produto.id} value={produto.id}>
                {produto.nome}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (campo === "descricao") {
      return (
        <label key={campo}>
          {nomes[campo]}
          <textarea
            value={formulario[campo] || ""}
            onChange={(e) =>
              setFormulario({ ...formulario, [campo]: e.target.value })
            }
          />
        </label>
      );
    }

    return (
      <label key={campo}>
        {nomes[campo] || campo}

        <input
          type={
            campo === "preco" || campo === "salario"
              ? "number"
              : campo === "estoque" ||
                  campo === "quantidade" ||
                  campo === "produto_id"
                ? "number"
                : campo === "data_venda"
                  ? "datetime-local"
                  : campo === "email"
                    ? "email"
                    : "text"
          }
          min={
            ["preco", "salario", "estoque", "quantidade"].includes(campo)
              ? "0"
              : undefined
          }
          step={["preco", "salario"].includes(campo) ? "0.01" : undefined}
          value={formulario[campo] || ""}
          onChange={(e) =>
            setFormulario({ ...formulario, [campo]: e.target.value })
          }
          required={campo !== "descricao" && campo !== "imagem_url"}
        />
      </label>
    );
  }

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
          {mensagem && <div className="mensagem">{mensagem}</div>}

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
                <button type="button" onClick={() => setTela("cadastro")}>
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
                required
              />

              <label>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>CPF</label>
              <input
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                maxLength={14}
                placeholder="000.000.000-00"
                required
              />

              <label>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
              />

              <button type="submit" disabled={carregando}>
                {carregando ? "Cadastrando..." : "Cadastrar"}
              </button>

              <button type="button" onClick={() => setTela("login")}>
                Voltar ao login
              </button>
            </form>
          )}

          {tela === "dashboard" && (
            <div className="dashboard">
              <div className="dashboard-topo">
                <div>
                  <h2>Dashboard</h2>
                  <p>Bem-vindo(a), {usuario?.nome || "usuário"}!</p>
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

              <nav className="menu-crud">
                {(
                  [
                    "produtos",
                    "clientes",
                    "funcionarios",
                    "vendas",
                    "perfil",
                  ] as Modulo[]
                ).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={modulo === item ? "menu-ativo" : ""}
                    onClick={() => abrirModulo(item)}
                  >
                    {titulos[item]}
                  </button>
                ))}
              </nav>

              <div className="produtos-topo">
                <h2>{titulos[modulo]}</h2>

                {modulo !== "perfil" && (
                  <>
                    <button
                      className="botao-atualizar"
                      type="button"
                      onClick={() => carregarModulo(modulo)}
                    >
                      Atualizar
                    </button>

                    <button type="button" onClick={abrirNovoRegistro}>
                      Novo cadastro
                    </button>
                  </>
                )}
              </div>

              {modulo === "perfil" && (
                <form onSubmit={salvarPerfil}>
                  <h3>Editar meus dados</h3>

                  <label>Nome</label>
                  <input
                    value={perfil.nome || ""}
                    onChange={(e) =>
                      setPerfil({ ...perfil, nome: e.target.value })
                    }
                    required
                  />

                  <label>E-mail (não pode ser alterado)</label>
                  <input value={perfil.email || ""} disabled />

                  <label>CPF</label>
                  <input
                    value={perfil.cpf || ""}
                    onChange={(e) =>
                      setPerfil({ ...perfil, cpf: e.target.value })
                    }
                    required
                  />

                  <label>Usuário</label>
                  <input
                    value={perfil.usuario || ""}
                    onChange={(e) =>
                      setPerfil({ ...perfil, usuario: e.target.value })
                    }
                  />

                  <button type="submit">Salvar perfil</button>
                </form>
              )}

              {modulo !== "perfil" && mostrarFormulario && (
                <form onSubmit={salvarRegistro}>
                  <h3>
                    {editandoId ? "Editar registro" : "Novo cadastro"}
                  </h3>

                  {Object.keys(formularios[modulo]).map((campo) =>
                    campoFormulario(campo)
                  )}

                  <button type="submit" disabled={carregando}>
                    {carregando
                      ? "Salvando..."
                      : editandoId
                        ? "Salvar alterações"
                        : "Cadastrar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setEditandoId(null);
                    }}
                  >
                    Cancelar
                  </button>
                </form>
              )}

              {modulo === "produtos" && !mostrarFormulario && (
                <>
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
                            produto.imagem_url?.startsWith("http")
                              ? produto.imagem_url
                              : `${API_URL}/${(produto.imagem_url || "").replace(/^\/+/, "")}`
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

                          <div className="acoes-registro">
                            <button
                              type="button"
                              onClick={() => editarRegistro(produto)}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => excluirRegistro(produto.id)}
                            >
                              Excluir
                            </button>
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
                </>
              )}

              {modulo !== "produtos" &&
                modulo !== "perfil" &&
                !mostrarFormulario && (
                  <>
                    <input
                      className="campo-busca"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder={`Buscar ${titulos[modulo].toLowerCase()}...`}
                    />

                    <div className="tabela-responsiva">
                      <table className="tabela-crud">
                        <thead>
                          <tr>
                            <th>ID</th>

                            {Object.keys(formularios[modulo]).map((campo) => (
                              <th key={campo}>
                                {modulo === "vendas" && campo === "produto_id"
                                  ? "Produto"
                                  : campo === "data_venda"
                                    ? "Data da venda"
                                    : campo.replace("_", " ")}
                              </th>
                            ))}

                            <th>Ações</th>
                          </tr>
                        </thead>

                        <tbody>
                          {registrosFiltrados.map((registro) => (
                            <tr key={registro.id}>
                              <td>{registro.id}</td>

                              {Object.keys(formularios[modulo]).map((campo) => (
                                <td key={campo}>
                                  {campo === "preco" || campo === "salario" ? (
                                    `R$ ${Number(registro[campo] || 0).toFixed(2)}`
                                  ) : campo === "produto_id" ? (
                                    registro.produto ||
                                    registro.produto_nome ||
                                    registro.produto_id ||
                                    "-"
                                  ) : campo === "data_venda" ? (
                                    formatarData(
                                      registro.data_venda ||
                                        String(registro[campo] || "")
                                    )
                                  ) : (
                                    registro[campo] ?? "-"
                                  )}
                                </td>
                              ))}

                              <td>
                                <div className="acoes-registro">
                                  <button
                                    type="button"
                                    onClick={() => editarRegistro(registro)}
                                  >
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      excluirRegistro(registro.id)
                                    }
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {registrosFiltrados.length === 0 && (
                            <tr>
                              <td
                                colSpan={
                                  Object.keys(formularios[modulo]).length + 2
                                }
                              >
                                Nenhum registro encontrado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
