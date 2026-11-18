
function extrairComponentesData(data: string | undefined) {
  if (!data) return null;

  const correspondencia = data.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (!correspondencia) return null;

  const [, ano, mes, dia, hora = "00", minuto = "00", segundo = "00"] =
    correspondencia;

  const valores = {
    ano: Number(ano),
    mes: Number(mes),
    dia: Number(dia),
    hora: Number(hora),
    minuto: Number(minuto),
    segundo: Number(segundo),
  };

  const dataValidacao = new Date(
    Date.UTC(
      valores.ano,
      valores.mes - 1,
      valores.dia,
      valores.hora,
      valores.minuto,
      valores.segundo
    )
  );

  if (
    dataValidacao.getUTCFullYear() !== valores.ano ||
    dataValidacao.getUTCMonth() + 1 !== valores.mes ||
    dataValidacao.getUTCDate() !== valores.dia ||
    valores.hora > 23 ||
    valores.minuto > 59 ||
    valores.segundo > 59
  ) {
    return null;
  }

  return valores;
}

// VALIDAÇÃO DE E-MAIL
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

// VALIDAÇÃO DE CPF
export function validarCPF(cpf: string): boolean {
  const numero = cpf.replace(/\D/g, "");

  if (numero.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(numero)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(numero[i]) * (10 - i);
  }

  let primeiroDigito = (soma * 10) % 11;
  if (primeiroDigito === 10) primeiroDigito = 0;

  if (primeiroDigito !== Number(numero[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(numero[i]) * (11 - i);
  }

  let segundoDigito = (soma * 10) % 11;
  if (segundoDigito === 10) segundoDigito = 0;

  return segundoDigito === Number(numero[10]);
}

// VALIDAÇÃO DE SENHA FORTE
export function validarSenhaForte(senha: string): boolean {
  return (
    senha.length >= 8 &&
    /[A-Z]/.test(senha) &&
    /[a-z]/.test(senha) &&
    /\d/.test(senha) &&
    /[^A-Za-z0-9]/.test(senha)
  );
}

// FORMATAÇÃO DE DATA BRASILEIRA
export function formatarData(data: string | undefined): string {
  const partes = extrairComponentesData(data);

  if (!partes) return "-";

  const dia = String(partes.dia).padStart(2, "0");
  const mes = String(partes.mes).padStart(2, "0");
  const ano = String(partes.ano).padStart(4, "0");
  const hora = String(partes.hora).padStart(2, "0");
  const minuto = String(partes.minuto).padStart(2, "0");

  return `${dia}/${mes}/${ano} - ${hora}:${minuto}`;
}

// FORMATAÇÃO PARA O INPUT datetime-local
export function formatarDataParaInput(
  data: string | undefined
): string {
  const partes = extrairComponentesData(data);

  if (!partes) return "";

  const ano = String(partes.ano).padStart(4, "0");
  const mes = String(partes.mes).padStart(2, "0");
  const dia = String(partes.dia).padStart(2, "0");
  const hora = String(partes.hora).padStart(2, "0");
  const minuto = String(partes.minuto).padStart(2, "0");

  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}
