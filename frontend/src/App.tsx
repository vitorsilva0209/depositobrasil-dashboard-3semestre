
import { useEffect, useRef, useState, type FormEvent } from "react";

import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/useAuth";
import type { Usuario } from "./contexts/authContextCore";

import {
  validarEmail,
  validarCPF,
  validarSenhaForte,
  formatarData,
  formatarDataParaInput,
} from "./utils/validacoes";

import { API_URL, requisicaoAPI } from "./services/api";

import "./App.css";

// ============================================================
// REQUISITO: PAGINAÇÃO
// Define quantos registros serão exibidos por página.
// ============================================================

const ITENS_POR_PAGINA = 5;

type Tela = "login" | "cadastro" | "dashboard";

type Modulo =
  | "produtos"
  | "clientes"
  | "funcionarios"
  | "vendas"
  | "perfil";

// ============================================================
// TIPOS DOS DADOS UTILIZADOS NO FRONTEND
// ============================================================

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

// ============================================================
// REQUISITO: QUATRO CRUDs
// Define os campos dos formulários de cada módulo.
// ============================================================

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

  // REQUISITO: RELACIONAMENTO ENTRE VENDAS E PRODUTOS.
  // A venda utiliza produto_id para identificar o produto relacionado.
  vendas: {
    produto_id: "",
    quantidade: "",
    data_venda: "",
  },
};

// Rotas da API para cada CRUD.
const rotas: Record<Exclude<Modulo, "perfil">, string> = {
  produtos: "/api/produtos",
  clientes: "/api/clientes",
  funcionarios: "/api/funcionarios",
  vendas: "/api/vendas",
};

function AppConteudo() {
  // ==========================================================
  // REQUISITO: AUTENTICAÇÃO
  // Utiliza o contexto para acessar usuário, token e sessão.
  // ==========================================================

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

  // ==========================================================
  // ESTADOS DE LOGIN E CADASTRO
  // ==========================================================

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenhaCadastro, setConfirmarSenhaCadastro] =
    useState("");
  const [cpf, setCpf] = useState("");

  // ==========================================================
  // ESTADOS DOS CRUDs
  // ==========================================================

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [registros, setRegistros] = useState<Registro[]>([]);

  // ==========================================================
  // REQUISITO: EDIÇÃO DO PRÓPRIO PERFIL
  // O e-mail será exibido, mas não poderá ser alterado.
  // ==========================================================

  const [perfil, setPerfil] = useState<Usuario>({
    nome: "",
    email: "",
    cpf: "",
    usuario: "",
  });

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] =
    useState("");

  // ==========================================================
  // ESTADOS DOS FORMULÁRIOS, PESQUISA E PAGINAÇÃO
  // ==========================================================

  const [formulario, setFormulario] = useState<
    Record<string, string>
  >({});

  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(
    null
  );

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // ==========================================================
  // REQUISITO: CONTROLE DE SESSÃO
  // Quando a API informar que a sessão expirou, o usuário
  // retorna para a tela de login.
  // ==========================================================

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

    window.addEventListener(
      "sessao-expirada",
      tratarSessaoExpirada
    );

    return () => {
      window.removeEventListener(
        "sessao-expirada",
        tratarSessaoExpirada
      );
    };
  }, [sairContexto]);

  // ==========================================================
  // REQUISITO: LOGIN COM E-MAIL E SENHA
  // Valida o e-mail e envia as credenciais para a API.
  // A API deve validar a senha e devolver o JWT.
  // ==========================================================

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
        throw new Error(
          "A API não retornou o token de acesso."
        );
      }

      const dadosUsuario: Usuario =
        resultado.usuario || resultado.user || {};

      // Armazena o token e os dados do usuário no contexto.
      entrar(resultado.token, dadosUsuario);

      setTela("dashboard");
      setMensagem("Login realizado com sucesso!");
      setSenha("");
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Erro ao fazer login."
      );
    } finally {
      setCarregando(false);
    }
  }

  // ==========================================================
  // REQUISITO: CADASTRO DE USUÁRIO
  // Valida nome, e-mail, CPF, senha forte e confirmação.
  // O backend deve armazenar a senha usando hash seguro.
  // ==========================================================

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

      setMensagem(
        resultado.mensagem ||
          "Cadastro realizado com sucesso!"
      );

      setTela("login");
      setNome("");
      setCpf("");
      setSenha("");
      setConfirmarSenhaCadastro("");
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Erro ao cadastrar."
      );
    } finally {
      setCarregando(false);
    }
  }

  // ==========================================================
  // REQUISITO: CONSULTA DO PRÓPRIO PERFIL
  // Consulta os dados do usuário autenticado.
  // ==========================================================

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
        erro instanceof Error
          ? erro.message
          : "Erro ao carregar perfil."
      );
    }
  }

  // ==========================================================
  // REQUISITO: LEITURA DOS QUATRO CRUDs
  // Consulta os registros na API usando o token JWT.
  // Também envia os parâmetros de pesquisa e paginação.
  // ==========================================================

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

        if (!termoBusca.trim()) {
          setTotalProdutos(
            Number(resultado.totalRegistros ?? dados.length)
          );
        }
      }

      // Atualiza o total de páginas informado pela API.
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

  // Referência utilizada para carregar os dados no useEffect.
  const carregarModuloRef = useRef(carregarModulo);

  useEffect(() => {
    carregarModuloRef.current = carregarModulo;
  });

  function limparCamposSenhaPerfil() {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarNovaSenha("");
  }

  // ==========================================================
  // NAVEGAÇÃO ENTRE OS MÓDULOS
  // ==========================================================

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

  // ==========================================================
  // REQUISITO: CREATE DOS QUATRO CRUDs
  // Prepara um formulário vazio para cadastrar um registro.
  // ==========================================================

  function abrirNovoRegistro() {
    if (modulo === "perfil") return;

    setFormulario({ ...formularios[modulo] });
    setEditandoId(null);
    setMostrarFormulario(true);
    setMensagem("");
  }

  // ==========================================================
  // REQUISITO: UPDATE DOS QUATRO CRUDs
  // Preenche o formulário com os dados do registro escolhido.
  // ==========================================================

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

  // ==========================================================
  // REQUISITO: CREATE E UPDATE DOS QUATRO CRUDs
  // Valida os dados e envia POST ou PUT para a API.
  // ==========================================================

  async function salvarRegistro(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");

    if (modulo === "perfil") return;

    try {
      setCarregando(true);

      const dados: DadosFormulario = { ...formulario };

      // Validações de produtos.
      if (modulo === "produtos") {
        if (!String(dados.nome || "").trim()) {
          throw new Error("Informe o nome do produto.");
        }

        if (
          Number(dados.preco) < 0 ||
          Number(dados.estoque) < 0
        ) {
          throw new Error(
            "Preço e estoque não podem ser negativos."
          );
        }

        dados.preco = Number(dados.preco);
        dados.estoque = Number(dados.estoque);
      }

      // Validações de clientes.
      if (modulo === "clientes") {
        if (!String(dados.nome || "").trim()) {
          throw new Error("Informe o nome do cliente.");
        }

        if (
          dados.email &&
          !validarEmail(String(dados.email))
        ) {
          throw new Error(
            "Digite um e-mail válido para o cliente."
          );
        }
      }

      // Validações de funcionários.
      if (modulo === "funcionarios") {
        if (!String(dados.nome || "").trim()) {
          throw new Error("Informe o nome do funcionário.");
        }

        if (Number(dados.salario) < 0) {
          throw new Error(
            "O salário não pode ser negativo."
          );
        }

        dados.salario = Number(dados.salario);
      }

      // ========================================================
      // REQUISITO: RELACIONAMENTO DE VENDAS COM PRODUTOS
      // A venda precisa selecionar um produto existente.
      // O backend também deve validar a existência desse produto.
      // ========================================================

      if (modulo === "vendas") {
        if (
          !dados.produto_id ||
          Number(dados.produto_id) <= 0
        ) {
          throw new Error("Selecione um produto.");
        }

        if (Number(dados.quantidade) <= 0) {
          throw new Error(
            "A quantidade deve ser maior que zero."
          );
        }

        dados.produto_id = Number(dados.produto_id);
        dados.quantidade = Number(dados.quantidade);
      }

      const rota = rotas[modulo];

      // POST cadastra. PUT atualiza o registro selecionado.
      const resultado = await requisicaoAPI(
        editandoId
          ? `${rota}/${editandoId}`
          : rota,
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

      await carregarModulo(modulo, 1, "");
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Erro ao salvar registro."
      );
    } finally {
      setCarregando(false);
    }
  }

  // ==========================================================
  // REQUISITO: DELETE DOS QUATRO CRUDs
  // Solicita confirmação e envia DELETE para a API.
  // A API deve verificar se o registro existe antes de excluir.
  // ==========================================================

  async function excluirRegistro(id: number) {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este registro?"
      )
    ) {
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

      setMensagem(
        resultado.mensagem ||
          "Registro excluído com sucesso!"
      );

      // Se a página ficar vazia após a exclusão,
      // retorna para a página anterior.
      const paginaDestino =
        registros.length === 1 && paginaAtual > 1
          ? paginaAtual - 1
          : paginaAtual;

      setPaginaAtual(paginaDestino);

      await carregarModulo(
        modulo,
        paginaDestino,
        busca
      );
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

  // ==========================================================
  // REQUISITO: EDIÇÃO DO PRÓPRIO USUÁRIO
  // Atualiza somente os dados do usuário autenticado.
  // O e-mail não é enviado para alteração.
  // ==========================================================

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

      // O e-mail não faz parte dos dados enviados para atualização.
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
          throw new Error(
            "A confirmação da nova senha não coincide."
          );
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
        usuario:
          dadosRetornados.usuario || perfil.usuario || "",
        email: perfil.email,
      };

      setPerfil(usuarioAtualizado);
      atualizarUsuario(usuarioAtualizado);

      limparCamposSenhaPerfil();

      setMensagem(
        resultado.mensagem ||
          "Perfil atualizado com sucesso!"
      );
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Erro ao atualizar perfil."
      );
    } finally {
      setCarregando(false);
    }
  }

  // ==========================================================
  // REQUISITO: ENCERRAMENTO DA SESSÃO
  // Limpa os dados locais e retorna para o login.
  // ==========================================================

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

  // ==========================================================
  // REQUISITO: PESQUISA E PAGINAÇÃO
  // Recarrega os dados quando o módulo, página ou pesquisa muda.
  // ==========================================================

  useEffect(() => {
    if (
      tela !== "dashboard" ||
      !token ||
      modulo === "perfil"
    ) {
      return;
    }

    const temporizador = window.setTimeout(() => {
      void carregarModuloRef.current(modulo);
    }, 250);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [tela, token, modulo, paginaAtual, busca]);

  // Filtra os produtos apresentados na página carregada.
  const produtosFiltrados = produtos.filter((produto) =>
    `${produto.nome} ${produto.categoria}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  // Filtra os registros apresentados na página carregada.
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

  // ==========================================================
  // CAMPOS DINÂMICOS DOS FORMULÁRIOS
  // ==========================================================

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

    // Campo de seleção para o relacionamento venda-produto.
    if (campo === "produto_id") {
      return (
        <label key={campo}>
          {nomes[campo]}

          <select
            value={formulario[campo] || ""}
            onChange={(e) =>
              setFormulario({
                ...formulario,
                [campo]: e.target.value,
              })
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
              setFormulario({
                ...formulario,
                [campo]: e.target.value,
              })
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
                  campo === "quantidade"
                ? "number"
                : campo === "data_venda"
                  ? "datetime-local"
                  : campo === "email"
                    ? "email"
                    : "text"
          }
          min={
            [
              "preco",
              "salario",
              "estoque",
              "quantidade",
            ].includes(campo)
              ? "0"
              : undefined
          }
          step={
            ["preco", "salario"].includes(campo)
              ? "0.01"
              : undefined
          }
          value={formulario[campo] || ""}
          onChange={(e) =>
            setFormulario({
              ...formulario,
              [campo]: e.target.value,
            })
          }
          required={
            campo !== "descricao" &&
            campo !== "imagem_url"
          }
        />
      </label>
    );
  }

  // ==========================================================
  // INTERFACE DO SISTEMA
  // ==========================================================

  return (
    <main className="app">
      <section className="painel">
        <header className="cabecalho">
          <div className="marca">
            <h1>DEPÓSITO BRASIL</h1>
            <p>Materiais de Construção</p>
          </div>

          <span className="status-online">
            Sistema online
          </span>
        </header>

        <div className="conteudo">
          {mensagem && (
            <div className="mensagem">{mensagem}</div>
          )}

          {/* REQUISITO: TELA DE LOGIN */}

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

          {/* REQUISITO: CADASTRO DE USUÁRIO */}

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

          {/* REQUISITO: DASHBOARD E MÓDULOS DO SISTEMA */}

          {tela === "dashboard" && (
            <div className="dashboard">
              <div className="dashboard-topo">
                <div>
                  <h2>Dashboard</h2>
                  <p>
                    Bem-vindo(a), {usuario?.nome || "usuário"}!
                  </p>
                </div>

                <button
                  className="botao-sair"
                  onClick={sair}
                >
                  Sair
                </button>
              </div>

              {/* RESUMO DO DASHBOARD */}

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

              {/* NAVEGAÇÃO DOS QUATRO CRUDs E PERFIL */}

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
                    className={
                      modulo === item ? "menu-ativo" : ""
                    }
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
                      onClick={() =>
                        void carregarModulo(modulo)
                      }
                    >
                      Atualizar
                    </button>

                    <button
                      type="button"
                      onClick={abrirNovoRegistro}
                    >
                      Novo cadastro
                    </button>
                  </>
                )}
              </div>

              {/* REQUISITO: EDIÇÃO DO PRÓPRIO PERFIL */}

              {modulo === "perfil" && (
                <form onSubmit={salvarPerfil}>
                  <h3>Editar meus dados</h3>

                  <label>Nome</label>
                  <input
                    value={perfil.nome || ""}
                    onChange={(e) =>
                      setPerfil({
                        ...perfil,
                        nome: e.target.value,
                      })
                    }
                    required
                  />

                  <label>
                    E-mail (não pode ser alterado)
                  </label>
                  <input
                    type="email"
                    value={perfil.email || ""}
                    disabled
                  />

                  <label>CPF</label>
                  <input
                    value={perfil.cpf || ""}
                    onChange={(e) =>
                      setPerfil({
                        ...perfil,
                        cpf: e.target.value,
                      })
                    }
                    maxLength={14}
                    placeholder="000.000.000-00"
                    required
                  />

                  <label>Usuário</label>
                  <input
                    value={perfil.usuario || ""}
                    onChange={(e) =>
                      setPerfil({
                        ...perfil,
                        usuario: e.target.value,
                      })
                    }
                  />

                  <h3>Alterar senha</h3>

                  <p>
                    Se não quiser alterar sua senha, deixe os
                    três campos abaixo vazios.
                  </p>

                  <label>Senha atual</label>
                  <input
                    type="password"
                    name="senha-atual-perfil"
                    autoComplete="current-password"
                    value={senhaAtual}
                    onChange={(e) =>
                      setSenhaAtual(e.target.value)
                    }
                    placeholder="Digite sua senha atual"
                  />

                  <label>Nova senha</label>
                  <input
                    type="password"
                    name="nova-senha-perfil"
                    autoComplete="new-password"
                    value={novaSenha}
                    onChange={(e) =>
                      setNovaSenha(e.target.value)
                    }
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
                    A senha deve ter no mínimo 8 caracteres,
                    incluindo maiúscula, minúscula, número e
                    caractere especial.
                  </p>

                  <button
                    type="submit"
                    disabled={carregando}
                  >
                    {carregando
                      ? "Salvando..."
                      : "Salvar perfil"}
                  </button>
                </form>
              )}

              {/* REQUISITO: FORMULÁRIOS DOS QUATRO CRUDs */}

              {modulo !== "perfil" && (
                <>
                  {mostrarFormulario && (
                    <form
                      onSubmit={salvarRegistro}
                      className="formulario-crud"
                    >
                      <h3>
                        {editandoId
                          ? `Editar ${titulos[modulo]}`
                          : `Cadastrar ${titulos[modulo]}`}
                      </h3>

                      {Object.keys(formularios[modulo]).map(
                        (campo) => campoFormulario(campo)
                      )}

                      <div className="acoes-formulario">
                        <button
                          type="submit"
                          disabled={carregando}
                        >
                          {carregando
                            ? "Salvando..."
                            : editandoId
                              ? "Atualizar"
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
                      </div>
                    </form>
                  )}

                  {/* REQUISITO: PESQUISA DOS REGISTROS */}

                  <div className="pesquisa">
                    <input
                      type="search"
                      placeholder={`Pesquisar ${titulos[
                        modulo
                      ].toLowerCase()}...`}
                      value={busca}
                      onChange={(e) => {
                        setBusca(e.target.value);
                        setPaginaAtual(1);
                      }}
                    />
                  </div>

                  {carregando && (
                    <p className="carregando">
                      Carregando registros...
                    </p>
                  )}

                  {/* REQUISITO: CRUD DE PRODUTOS */}

                  {!carregando && modulo === "produtos" && (
                    <div className="lista-produtos">
                      {produtosFiltrados.length === 0 ? (
                        <p className="estado-lista">
                          Nenhum produto encontrado.
                        </p>
                      ) : (
                        produtosFiltrados.map((produto) => (
                          <article
                            className="produto-card"
                            key={produto.id}
                          >
                            {/* IMAGEM COM ALTURA LIMITADA */}

                            {produto.imagem_url && (
                              <div className="produto-imagem">
                              <img
  className="produto-imagem"
  src={
    produto.imagem_url.startsWith("http")
      ? produto.imagem_url
      : `${API_URL}/${produto.imagem_url.replace(/^\/+/, "")}`
  }
  alt={produto.nome}
  onError={(e) => {
    e.currentTarget.style.display = "none";
  }}
/>
                              </div>
                            )}

                            <div className="produto-info">
                              <h3>{produto.nome}</h3>

                              <p className="produto-categoria">
                                {produto.categoria}
                              </p>

                              <p className="produto-descricao">
                                {produto.descricao}
                              </p>

                              <div className="produto-dados">
                                <strong>
                                  {Number(
                                    produto.preco
                                  ).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </strong>

                                <span>
                                  Estoque: {produto.estoque}
                                </span>
                              </div>

                              {/* EDITAR E EXCLUIR PRODUTO */}

                              <div className="produto-acoes">
                                <button
                                  type="button"
                                  onClick={() =>
                                    editarRegistro(produto)
                                  }
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void excluirRegistro(
                                      produto.id
                                    )
                                  }
                                >
                                  Excluir
                                </button>
                              </div>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  )}

                  {/* REQUISITO: CRUD DE CLIENTES,
                      FUNCIONÁRIOS E VENDAS */}

                  {!carregando && modulo !== "produtos" && (
                    <div className="tabela-container">
                      {registrosFiltrados.length === 0 ? (
                        <p className="estado-lista">
                          Nenhum registro encontrado.
                        </p>
                      ) : (
                        <table>
                          <thead>
                            <tr>
                              <th>ID</th>

                              {Object.keys(
                                formularios[modulo]
                              ).map((campo) => (
                                <th key={campo}>
                                  {campo === "produto_id"
                                    ? "Produto"
                                    : campo === "produto_nome"
                                      ? "Produto"
                                      : campo === "data_venda"
                                        ? "Data da venda"
                                        : campo
                                            .charAt(0)
                                            .toUpperCase() +
                                          campo.slice(1)}
                                </th>
                              ))}

                              <th>Ações</th>
                            </tr>
                          </thead>

                          <tbody>
                            {registrosFiltrados.map(
                              (registro) => (
                                <tr key={registro.id}>
                                  <td>{registro.id}</td>

                                  {Object.keys(
                                    formularios[modulo]
                                  ).map((campo) => {
                                    let valor = registro[campo];

                                    if (
                                      campo === "produto_id" &&
                                      registro.produto_nome
                                    ) {
                                      valor =
                                        registro.produto_nome;
                                    }

                                    if (
                                      campo === "data_venda" &&
                                      typeof valor === "string"
                                    ) {
                                      valor = formatarData(valor);
                                    }

                                    if (
                                      campo === "preco" ||
                                      campo === "salario"
                                    ) {
                                      valor = Number(
                                        valor || 0
                                      ).toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      });
                                    }

                                    return (
                                      <td key={campo}>
                                        {String(valor ?? "-")}
                                      </td>
                                    );
                                  })}

                                  {/* AÇÕES DE EDIÇÃO E EXCLUSÃO */}

                                  <td>
                                    <div className="acoes-registro">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          editarRegistro(registro)
                                        }
                                      >
                                        Editar
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          void excluirRegistro(
                                            registro.id
                                          )
                                        }
                                      >
                                        Excluir
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* REQUISITO: PAGINAÇÃO */}

                  {!carregando && totalPaginas > 1 && (
                    <div className="paginacao">
                      <button
                        type="button"
                        disabled={paginaAtual <= 1}
                        onClick={() =>
                          setPaginaAtual((pagina) =>
                            Math.max(1, pagina - 1)
                          )
                        }
                      >
                        Anterior
                      </button>

                      <span>
                        Página {paginaAtual} de {totalPaginas}
                      </span>

                      <button
                        type="button"
                        disabled={
                          paginaAtual >= totalPaginas
                        }
                        onClick={() =>
                          setPaginaAtual((pagina) =>
                            Math.min(
                              totalPaginas,
                              pagina + 1
                            )
                          )
                        }
                      >
                        Próxima
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// O AuthProvider disponibiliza os dados de autenticação
// para todo o conteúdo do sistema.
// ============================================================

function App() {
  return (
    <AuthProvider>
      <AppConteudo />
    </AuthProvider>
  );
}

export default App;
