
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/useAuth";
import type { Usuario } from "./contexts/authContextCore";
import "./App.css";

const API_URL = "http://localhost:3000";
const ITENS_POR_PAGINA = 5;

type Tela = "login" | "cadastro" | "dashboard";
type Modulo =
  | "produtos"
  | "clientes"
  | "funcionarios"
  | "vendas"
  | "perfil";

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

const formularios: Record<
  Exclude<Modulo, "perfil">,
  Record<string, string>
> = {
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
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

function validarSenhaForte(senha: string): boolean {
  return (
    senha.length >= 8 &&
    /[A-Z]/.test(senha) &&
    /[a-z]/.test(senha) &&
    /\d/.test(senha) &&
    /[^A-Za-z0-9]/.test(senha)
  );
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

  if (resposta.status === 401 && token) {
    window.dispatchEvent(new Event("sessao-expirada"));
  }

  if (!resposta.ok) {
    throw new Error(resultado.mensagem || "Erro na requisição.");
  }

  return resultado;
}

function AppConteudo() {
  const {
    usuario,
    token,
    autenticado,
    entrar,
    atualizarUsuario,
    sair: sairContexto,
  } = useAuth();

  const [tela, setTela] = useState<Tela>(
    autenticado ? "dashboard" : "login"
  );

  const [modulo, setModulo] = useState<Modulo>("produtos");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenhaCadastro, setConfirmarSenhaCadastro] = useState("");
  const [cpf, setCpf] = useState("");

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [registros, setRegistros] = useState<Registro[]>([]);

  const [perfil, setPerfil] = useState<Usuario>({
    nome: "",
    email: "",
    cpf: "",
    usuario: "",
  });

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");

  const [formulario, setFormulario] = useState<Record<string, string>>({});
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    function tratarSessaoExpirada() {
      sairContexto();

      setProdutos([]);
      setTotalProdutos(0);
      setRegistros([]);
      setTela("login");
      setModulo("produtos");
      setMostrarFormulario(false);
      setEditandoId(null);
      setFormulario({});
      setBusca("");
      setPaginaAtual(1);
      setMensagem("Sua sessão expirou. Entre novamente.");
      setSenha("");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
    }

    window.addEventListener("sessao-expirada", tratarSessaoExpirada);

    return () => {
      window.removeEventListener("sessao-expirada", tratarSessaoExpirada);
    };
  }, [sairContexto]);

  async function fazerLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");

    try {
      if (!validarEmail(email)) {
        throw new Error("Digite um e-mail válido.");
      }

      setCarregando(true);

      const resultado = await requisicaoAPI(
        "/api/auth/login",
        "POST",
        {
          email: email.trim().toLowerCase(),
          senha,
        }
      );

      if (!resultado.token) {
        throw new Error("A API não retornou o token de acesso.");
      }

      const dadosUsuario: Usuario =
        resultado.usuario || resultado.user || {};

      entrar(resultado.token, dadosUsuario);

      setTela("dashboard");
      setMensagem("Login realizado com sucesso!");
      setSenha("");
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

    try {
      if (!nome.trim()) {
        throw new Error("Informe seu nome.");
      }

      if (!validarEmail(email)) {
        throw new Error("Digite um e-mail válido.");
      }

      if (!validarCPF(cpf)) {
        throw new Error("CPF inválido.");
      }

      if (!validarSenhaForte(senha)) {
        throw new Error(
          "A senha deve ter pelo menos 8 caracteres, letra maiúscula, minúscula, número e caractere especial."
        );
      }

      if (senha !== confirmarSenhaCadastro) {
        throw new Error("As senhas não coincidem.");
      }

      setCarregando(true);

      const resultado = await requisicaoAPI(
        "/api/auth/registrar",
        "POST",
        {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha,
          confirmarSenha: confirmarSenhaCadastro,
          cpf: cpf.replace(/\D/g, ""),
        }
      );

      setMensagem(resultado.mensagem || "Cadastro realizado com sucesso!");
      setTela("login");
      setNome("");
      setCpf("");
      setSenha("");
      setConfirmarSenhaCadastro("");
    } catch (erro) {
      setMensagem(
        erro instanceof Error ? erro.message : "Erro ao cadastrar."
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

      const usuarioAtualizado: Usuario = {
        id: dados.id,
        nome: dados.nome || "",
        email: dados.email || "",
        cpf: dados.cpf || "",
        usuario: dados.usuario || "",
      };

      setPerfil(usuarioAtualizado);
      atualizarUsuario(usuarioAtualizado);
    } catch (erro) {
      setMensagem(
        erro instanceof Error ? erro.message : "Erro ao carregar perfil."
      );
    }
  }

  async function carregarModulo(
    alvo: Modulo = modulo,
    pagina = paginaAtual,
    termoBusca = busca
  ) {
    if (alvo === "perfil") {
      await carregarPerfil();
      return;
    }

    try {
      setCarregando(true);

      const parametros = new URLSearchParams({
        pagina: String(pagina),
        limite: String(ITENS_POR_PAGINA),
        busca: termoBusca,
      });

      const resultado = await requisicaoAPI(
        `${rotas[alvo]}?${parametros.toString()}`,
        "GET",
        undefined,
        token
      );

      const lista =
        resultado[alvo] ||
        resultado.registros ||
        resultado.dados ||
        [];

      const dados = Array.isArray(lista) ? lista : [];

      setRegistros(dados);

      if (alvo === "produtos") {
        setProdutos(dados as Produto[]);

        // Atualiza o contador geral quando a busca está vazia.
        if (!termoBusca.trim()) {
          setTotalProdutos(
            Number(resultado.totalRegistros ?? dados.length)
          );
        }
      }

      const paginas = Number(
        resultado.totalPaginas ||
          resultado.paginas ||
          resultado.total_pages ||
          1
      );

      setTotalPaginas(Math.max(1, paginas));
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

  const carregarModuloRef = useRef(carregarModulo);

  useEffect(() => {
    carregarModuloRef.current = carregarModulo;
  });

  function limparCamposSenhaPerfil() {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarNovaSenha("");
  }

  function abrirModulo(alvo: Modulo) {
    setModulo(alvo);
    setBusca("");
    setMensagem("");
    setEditandoId(null);
    setMostrarFormulario(false);
    setPaginaAtual(1);
    limparCamposSenhaPerfil();

    if (alvo === "perfil") {
      void carregarPerfil();
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
        if (!String(dados.nome || "").trim()) {
          throw new Error("Informe o nome do produto.");
        }

        if (Number(dados.preco) < 0 || Number(dados.estoque) < 0) {
          throw new Error("Preço e estoque não podem ser negativos.");
        }

        dados.preco = Number(dados.preco);
        dados.estoque = Number(dados.estoque);
      }

      if (modulo === "clientes") {
        if (!String(dados.nome || "").trim()) {
          throw new Error("Informe o nome do cliente.");
        }

        if (dados.email && !validarEmail(String(dados.email))) {
          throw new Error("Digite um e-mail válido para o cliente.");
        }
      }

      if (modulo === "funcionarios") {
        if (!String(dados.nome || "").trim()) {
          throw new Error("Informe o nome do funcionário.");
        }

        if (Number(dados.salario) < 0) {
          throw new Error("O salário não pode ser negativo.");
        }

        dados.salario = Number(dados.salario);
      }

      if (modulo === "vendas") {
        if (!dados.produto_id || Number(dados.produto_id) <= 0) {
          throw new Error("Selecione um produto.");
        }

        if (Number(dados.quantidade) <= 0) {
          throw new Error("A quantidade deve ser maior que zero.");
        }

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
      setFormulario({});
      setBusca("");
      setPaginaAtual(1);

      // Recarrega explicitamente a primeira página após salvar.
      await carregarModulo(modulo, 1, "");
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

    if (modulo === "perfil") return;

    try {
      setCarregando(true);

      const resultado = await requisicaoAPI(
        `${rotas[modulo]}/${id}`,
        "DELETE",
        undefined,
        token
      );

      setMensagem(resultado.mensagem || "Registro excluído com sucesso!");

      // Recarrega a página atual. Se ela ficar vazia, volta uma página.
      const paginaDestino =
        registros.length === 1 && paginaAtual > 1
          ? paginaAtual - 1
          : paginaAtual;

      setPaginaAtual(paginaDestino);
      await carregarModulo(modulo, paginaDestino, busca);
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
      const nomeAtualizado = perfil.nome?.trim() || "";
      const cpfAtualizado = perfil.cpf || "";

      if (!nomeAtualizado) {
        throw new Error("Informe seu nome.");
      }

      if (!validarCPF(cpfAtualizado)) {
        throw new Error("CPF inválido.");
      }

      const camposSenha = [
        senhaAtual,
        novaSenha,
        confirmarNovaSenha,
      ];

      const desejaAlterarSenha = camposSenha.some(
        (campo) => campo.length > 0
      );

      const dados: Record<string, string> = {
        nome: nomeAtualizado,
        cpf: cpfAtualizado.replace(/\D/g, ""),
        usuario: perfil.usuario || "",
      };

      if (desejaAlterarSenha) {
        if (
          senhaAtual.length === 0 ||
          novaSenha.length === 0 ||
          confirmarNovaSenha.length === 0
        ) {
          throw new Error(
            "Para alterar sua senha, preencha a senha atual, a nova senha e a confirmação."
          );
        }

        if (!validarSenhaForte(novaSenha)) {
          throw new Error(
            "A nova senha deve ter pelo menos 8 caracteres, letra maiúscula, minúscula, número e caractere especial."
          );
        }

        if (novaSenha !== confirmarNovaSenha) {
          throw new Error("A confirmação da nova senha não coincide.");
        }

        if (novaSenha === senhaAtual) {
          throw new Error(
            "A nova senha deve ser diferente da senha atual."
          );
        }

        dados.senhaAtual = senhaAtual;
        dados.novaSenha = novaSenha;
        dados.confirmarSenha = confirmarNovaSenha;
      }

      setCarregando(true);

      const resultado = await requisicaoAPI(
        "/api/usuarios/me",
        "PUT",
        dados,
        token
      );

      const dadosRetornados = resultado.usuario || {};

      const usuarioAtualizado: Usuario = {
        ...perfil,
        ...dadosRetornados,
        nome: dadosRetornados.nome || nomeAtualizado,
        cpf: dadosRetornados.cpf || dados.cpf,
        usuario: dadosRetornados.usuario || perfil.usuario || "",
        email: perfil.email,
      };

      setPerfil(usuarioAtualizado);
      atualizarUsuario(usuarioAtualizado);

      limparCamposSenhaPerfil();

      setMensagem(
        resultado.mensagem || "Perfil atualizado com sucesso!"
      );
    } catch (erro) {
      setMensagem(
        erro instanceof Error ? erro.message : "Erro ao atualizar perfil."
      );
    } finally {
      setCarregando(false);
    }
  }

  function sair() {
    sairContexto();

    setProdutos([]);
    setTotalProdutos(0);
    setRegistros([]);
    setEmail("");
    setSenha("");
    setNome("");
    setCpf("");
    setConfirmarSenhaCadastro("");
    limparCamposSenhaPerfil();
    setMensagem("");
    setModulo("produtos");
    setMostrarFormulario(false);
    setEditandoId(null);
    setFormulario({});
    setBusca("");
    setPaginaAtual(1);
    setTela("login");
  }

  // Carrega automaticamente os registros quando muda a tela,
  // o módulo, a página ou o termo de pesquisa.
  useEffect(() => {
    if (tela !== "dashboard" || !token || modulo === "perfil") {
      return;
    }

    const temporizador = window.setTimeout(() => {
      void carregarModuloRef.current(modulo);
    }, 250);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [tela, token, modulo, paginaAtual, busca]);

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
              : campo === "estoque" || campo === "quantidade"
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
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                required
              />

              <label>Senha</label>
              <input
                type="password"
                autoComplete="current-password"
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
                  onClick={() => {
                    setMensagem("");
                    setTela("cadastro");
                  }}
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
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
              />

              <label>Confirmar senha</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmarSenhaCadastro}
                onChange={(e) =>
                  setConfirmarSenhaCadastro(e.target.value)
                }
                placeholder="Digite a senha novamente"
                required
              />

              <button type="submit" disabled={carregando}>
                {carregando ? "Cadastrando..." : "Cadastrar"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMensagem("");
                  setTela("login");
                }}
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
                  <p>Bem-vindo(a), {usuario?.nome || "usuário"}!</p>
                </div>

                <button className="botao-sair" onClick={sair}>
                  Sair
                </button>
              </div>

              <div className="resumo">
                <div className="resumo-card">
                  <h3>{totalProdutos}</h3>
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
                      onClick={() => void carregarModulo(modulo)}
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
                  <input
                    type="email"
                    value={perfil.email || ""}
                    disabled
                  />

                  <label>CPF</label>
                  <input
                    value={perfil.cpf || ""}
                    onChange={(e) =>
                      setPerfil({ ...perfil, cpf: e.target.value })
                    }
                    maxLength={14}
                    placeholder="000.000.000-00"
                    required
                  />

                  <label>Usuário</label>
                  <input
                    value={perfil.usuario || ""}
                    onChange={(e) =>
                      setPerfil({ ...perfil, usuario: e.target.value })
                    }
                  />

                  <h3>Alterar senha</h3>

                  <p>
                    Se não quiser alterar sua senha, deixe os três campos
                    abaixo vazios.
                  </p>

                  <label>Senha atual</label>
                  <input
                    type="password"
                    name="senha-atual-perfil"
                    autoComplete="current-password"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="Digite sua senha atual"
                  />

                  <label>Nova senha</label>
                  <input
                    type="password"
                    name="nova-senha-perfil"
                    autoComplete="new-password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Digite sua nova senha"
                  />

                  <label>Confirmar nova senha</label>
                  <input
                    type="password"
                    name="confirmar-nova-senha-perfil"
                    autoComplete="new-password"
                    value={confirmarNovaSenha}
                    onChange={(e) =>
                      setConfirmarNovaSenha(e.target.value)
                    }
                    placeholder="Repita sua nova senha"
                  />

                  <p>
                    A senha deve ter no mínimo 8 caracteres, incluindo
                    maiúscula, minúscula, número e caractere especial.
                  </p>

                  <button type="submit" disabled={carregando}>
                    {carregando ? "Salvando..." : "Salvar perfil"}
                  </button>
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
                      setFormulario({});
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
                    onChange={(e) => {
                      setBusca(e.target.value);
                      setPaginaAtual(1);
                    }}
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

                  {/* PAGINAÇÃO DOS CARTÕES DE PRODUTOS */}
                  <div className="paginacao">
                    <button
                      type="button"
                      disabled={paginaAtual <= 1 || carregando}
                      onClick={() =>
                        setPaginaAtual((pagina) => Math.max(1, pagina - 1))
                      }
                    >
                      Anterior
                    </button>

                    <span>
                      Página {paginaAtual} de {totalPaginas}
                    </span>

                    <button
                      type="button"
                      disabled={paginaAtual >= totalPaginas || carregando}
                      onClick={() =>
                        setPaginaAtual((pagina) =>
                          Math.min(totalPaginas, pagina + 1)
                        )
                      }
                    >
                      Próxima
                    </button>
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
                      onChange={(e) => {
                        setBusca(e.target.value);
                        setPaginaAtual(1);
                      }}
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
                                    onClick={() => excluirRegistro(registro.id)}
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

                    <div className="paginacao">
                      <button
                        type="button"
                        disabled={paginaAtual <= 1 || carregando}
                        onClick={() =>
                          setPaginaAtual((pagina) => Math.max(1, pagina - 1))
                        }
                      >
                        Anterior
                      </button>

                      <span>
                        Página {paginaAtual} de {totalPaginas}
                      </span>

                      <button
                        type="button"
                        disabled={paginaAtual >= totalPaginas || carregando}
                        onClick={() =>
                          setPaginaAtual((pagina) =>
                            Math.min(totalPaginas, pagina + 1)
                          )
                        }
                      >
                        Próxima
                      </button>
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

function App() {
  return (
    <AuthProvider>
      <AppConteudo />
    </AuthProvider>
  );
}

export default App;
