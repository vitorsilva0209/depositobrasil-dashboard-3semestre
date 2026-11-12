export const API_URL = "";

export async function requisicaoAPI(
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
