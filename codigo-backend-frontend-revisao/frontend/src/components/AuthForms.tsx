
import type { FormEventHandler } from "react";

type Tela = "login" | "cadastro" | "dashboard";

type AuthFormsProps = {
  tela: Tela;
  carregando: boolean;

  email: string;
  setEmail: (valor: string) => void;

  senha: string;
  setSenha: (valor: string) => void;

  nome: string;
  setNome: (valor: string) => void;

  cpf: string;
  setCpf: (valor: string) => void;

  confirmarSenhaCadastro: string;
  setConfirmarSenhaCadastro: (valor: string) => void;

  fazerLogin: FormEventHandler<HTMLFormElement>;
  fazerCadastro: FormEventHandler<HTMLFormElement>;

  abrirCadastro: () => void;
  voltarLogin: () => void;
};

export function AuthForms({
  tela,
  carregando,
  email,
  setEmail,
  senha,
  setSenha,
  nome,
  setNome,
  cpf,
  setCpf,
  confirmarSenhaCadastro,
  setConfirmarSenhaCadastro,
  fazerLogin,
  fazerCadastro,
  abrirCadastro,
  voltarLogin,
}: AuthFormsProps) {
  return (
    <>
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
            <button type="button" onClick={abrirCadastro}>
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

          <button type="button" onClick={voltarLogin}>
            Voltar ao login
          </button>
        </form>
      )}
    </>
  );
}
