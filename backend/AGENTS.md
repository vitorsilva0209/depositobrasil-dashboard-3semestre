# AGENTS.md - Depósito Brasil

## 1. Descrição do projeto
Sistema de gerenciamento do Depósito Brasil Materiais de Construção.
O projeto utiliza React, TypeScript, Node.js, Express e MySQL.

## 2. Estrutura
- frontend/src: aplicação React.
- frontend/backend/src/config: configurações e conexão com banco.
- frontend/backend/src/controllers: controladores.
- frontend/backend/src/entities: entidades abstratas.
- frontend/backend/src/errors: erros personalizados.
- frontend/backend/src/interfaces: contratos e interfaces.
- frontend/backend/src/middlewares: autenticação e tratamento de erros.
- frontend/backend/src/models: modelos de domínio.
- frontend/backend/src/repositories: acesso aos dados.
- frontend/backend/src/routes: rotas HTTP.
- frontend/backend/src/services: regras de negócio.
- frontend/backend/src/utils: funções auxiliares.

## 3. Padrões de desenvolvimento
- Utilizar TypeScript no backend.
- Utilizar tipagem explícita sempre que necessário.
- Separar rotas, serviços, modelos e repositórios.
- Não concentrar regras de negócio nas rotas.
- Reutilizar BaseRepository e IRepository quando aplicável.
- Utilizar Entidade como classe abstrata para entidades de domínio.
- Utilizar erros personalizados para validações e recursos inexistentes.
- Encaminhar erros das rotas para o middleware global.

## 4. Banco de dados
- Banco utilizado: deposito_brasil.
- Acesso por MySQL/MariaDB.
- Utilizar consultas parametrizadas.
- Não concatenar dados recebidos do usuário em comandos SQL.
- Preservar chaves primárias e estrangeiras.
- Respeitar o relacionamento entre vendas e produtos.
- Não criar campos ou relacionamentos sem conferir o banco existente.

## 5. Segurança
- Proteger rotas privadas com autenticação JWT.
- Utilizar bcrypt para senhas.
- Nunca armazenar senhas em texto puro.
- Não versionar arquivos .env ou credenciais.
- Validar os dados recebidos nas requisições.
- Não expor informações sensíveis nas respostas da API.

## 6. CRUDs
Os módulos principais são:
- Produtos
- Clientes
- Funcionários
- Vendas

Preservar paginação, validação, autenticação e relacionamentos existentes.

## 7. Comandos do backend
- npm run dev: iniciar ambiente de desenvolvimento.
- npm run build: compilar TypeScript.
- npm start: iniciar a versão compilada.

## 8. Regras para alterações
- Não remover funcionalidades existentes sem autorização.
- Não substituir arquivos completos sem analisar suas dependências.
- Não alterar o formato das respostas da API sem verificar o frontend.
- Executar npm run build após alterações no backend.
- Testar os CRUDs após mudanças que afetem suas rotas ou serviços.
- Preservar a identidade visual do Depósito Brasil: preto, vermelho e cinza.
