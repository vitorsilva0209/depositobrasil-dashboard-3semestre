# AGENTS.md - Backend Depósito Brasil

## 1. Arquitetura
O backend utiliza Node.js, Express, TypeScript e MariaDB.

Estrutura:
- src/config: conexão e configurações.
- src/controllers: controladores.
- src/entities: entidades abstratas.
- src/errors: erros personalizados.
- src/interfaces: interfaces.
- src/middlewares: autenticação e tratamento de erros.
- src/models: modelos de domínio.
- src/repositories: persistência.
- src/routes: rotas HTTP.
- src/services: regras de negócio.
- src/utils: utilitários.

## 2. Padrões
- Separar responsabilidades.
- Aplicar princípios SOLID.
- Utilizar interfaces e classes de domínio.
- Reutilizar BaseRepository e IRepository quando adequado.
- Utilizar classes abstratas quando houver comportamento comum real.
- Preferir tipagem explícita.
- Evitar any.
- Utilizar generics quando houver benefício de reutilização e segurança de tipos.
- Não concentrar regras de negócio nos controllers.

## 3. Banco de dados
- Banco: deposito_brasil.
- Compatibilidade com MariaDB.
- Utilizar consultas parametrizadas.
- Preservar chaves primárias e estrangeiras.
- Preservar o relacionamento entre vendas e produtos.
- Não inventar campos ou relacionamentos.
- Não alterar o schema sem necessidade e autorização.

## 4. Autenticação
- Proteger rotas privadas com JWT.
- Utilizar bcrypt para senhas.
- Nunca armazenar senhas em texto puro.
- Nunca permitir alteração do e-mail pelo endpoint de edição do próprio perfil.
- O usuário autenticado só pode editar os próprios dados.
- Validar CPF, e-mail e força da senha.
- Não retornar hashes de senha nas respostas.

## 5. CRUDs
Preservar os CRUDs de:
- Produtos.
- Clientes.
- Funcionários.
- Vendas.

Manter autenticação, paginação, validação, relacionamentos e respostas existentes.

## 6. Tratamento de erros
- Utilizar erros personalizados quando apropriado.
- Não expor stack traces em respostas públicas.
- Manter o formato de resposta consumido pelo frontend.
- Encaminhar erros ao tratamento centralizado quando aplicável.

## 7. Comandos
- npm run dev: desenvolvimento.
- npm run build: compilação.
- npm start: execução da versão compilada.

## 8. Restrições
- Não alterar credenciais.
- Não exibir conteúdo de arquivos .env.
- Não apagar dados.
- Não executar migrações destrutivas sem autorização.
- Não remover rotas ou funcionalidades sem autorização.
- Consultar as skills da raiz do projeto antes de alterações relevantes.
