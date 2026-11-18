# Segurança da API e Autenticação

## Objetivo
Preservar a segurança da API e dos dados dos usuários.

## Autenticação
- Utilizar JWT nas rotas privadas.
- Validar tokens por middleware.
- Utilizar bcrypt para hash de senhas.
- Nunca armazenar ou retornar senhas em texto puro.
- Nunca retornar o hash da senha.
- Não aceitar identidade do usuário enviada livremente pelo frontend.
- Obter o ID do usuário a partir do token autenticado.

## Cadastro
- Validar nome, e-mail e CPF.
- Validar os dígitos verificadores do CPF.
- Validar força mínima da senha.
- Verificar duplicidade de e-mail e CPF.
- Utilizar mensagens de erro compreensíveis.

## Perfil
- Permitir que o usuário altere somente os próprios dados.
- Não permitir alteração do e-mail.
- Exigir senha atual para alteração de senha.
- Confirmar a nova senha.
- Validar a força da nova senha.

## API
- Validar entradas no backend mesmo quando o frontend já valida.
- Utilizar consultas parametrizadas.
- Não expor detalhes internos ou stack traces.
- Preservar códigos HTTP e contratos utilizados pelo frontend.

## Segredos
- Nunca ler, imprimir, copiar ou revelar arquivos .env.
- Nunca expor JWT_SECRET, senhas, tokens ou credenciais.
- Nunca versionar segredos.
- Não inserir dados pessoais reais em exemplos ou logs.

## Operações proibidas sem autorização explícita
- Apagar banco ou tabelas.
- Executar DELETE em massa ou TRUNCATE.
- Remover volumes Docker.
- Alterar credenciais ou chaves.
- Desabilitar autenticação ou validações.
