# AGENTS.md - Depósito Brasil

## 1. Projeto
Sistema de gerenciamento do Depósito Brasil Materiais de Construção.

Tecnologias:
- React e TypeScript no frontend.
- Node.js, Express e TypeScript no backend.
- MariaDB.
- Docker Compose.
- Nginx como proxy reverso.

## 2. Estrutura real
- frontend/src: aplicação React.
- backend/src/config: configurações e conexão com banco.
- backend/src/controllers: controladores HTTP.
- backend/src/entities: entidades abstratas.
- backend/src/errors: erros personalizados.
- backend/src/interfaces: interfaces e contratos.
- backend/src/middlewares: autenticação e tratamento de erros.
- backend/src/models: modelos de domínio.
- backend/src/repositories: acesso ao banco.
- backend/src/routes: rotas da API.
- backend/src/services: regras de negócio.
- backend/src/utils: funções auxiliares.
- docker: configurações de infraestrutura.
- nginx: configuração do proxy reverso.
- includes: arquivos PHP legados que devem ser preservados.

## 3. Módulos
- Produtos.
- Clientes.
- Funcionários.
- Vendas.
- Autenticação.
- Perfil do usuário.

## 4. Skills obrigatórias
Antes de alterar código relacionado a uma área, consultar a skill correspondente:

- .agents/skills/backend-typescript-solid/SKILL.md
- .agents/skills/api-security-auth/SKILL.md
- .agents/skills/react-typescript-ui/SKILL.md

## 5. Segurança e proteção de arquivos
- Nunca exibir, imprimir, copiar ou revelar valores de arquivos .env.
- Nunca expor tokens, senhas, chaves privadas ou credenciais.
- Não ler arquivos .env, .env.docker ou backend/.env.
- Arquivos de exemplo sem segredos, como .env.example, podem ser consultados.
- Não adicionar credenciais ou dados pessoais ao Git.
- Não incluir registros pessoais reais em exemplos, logs ou documentação.
- Não executar comandos que revelem segredos no terminal.
- Não alterar arquivos de configuração de segurança sem necessidade.

## 6. Proteção do banco e Docker
- Nunca executar docker compose down -v.
- Nunca remover volumes do Docker.
- Nunca apagar bancos, tabelas ou registros sem autorização explícita.
- Nunca executar DROP DATABASE, DROP TABLE, TRUNCATE ou DELETE em massa sem autorização.
- Não reinicializar o banco para realizar testes.
- Preservar os dados existentes.
- Não remover ou recriar containers de outros projetos.
- Não publicar portas do banco ou backend no host sem autorização.
- Manter o Nginx como único serviço publicado para acesso externo.

## 7. Regras de desenvolvimento
- Não remover funcionalidades existentes sem autorização.
- Não substituir arquivos completos sem analisar suas dependências.
- Preservar os contratos e formatos das respostas da API.
- Utilizar consultas parametrizadas.
- Não utilizar any sem justificativa técnica.
- Validar dados no frontend e no backend.
- Não duplicar regras de negócio desnecessariamente.
- Preservar relacionamentos, chaves e paginação.
- Manter a identidade visual preta, vermelha e cinza.

## 8. Verificações
Após alterações no backend:
- Executar npm run build no backend.

Após alterações no frontend:
- Executar npm run build no frontend.

Testar somente os fluxos afetados pela alteração.
Não repetir testes de módulos que não foram modificados.
