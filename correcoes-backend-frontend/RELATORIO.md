# Correções da revisão Backend + Frontend — Depósito Brasil

## O que foi alterado

### Backend
- Paginação compartilhada e normalizada nos quatro módulos: valores decimais são arredondados para baixo, limites inválidos voltam ao padrão e o limite máximo permanece em 100.
- Busca recebida por query string é aceita somente quando é texto.
- Validação numérica de preço, estoque, salário, produto e quantidade rejeita campos vazios e valores não numéricos antes da criação das entidades.
- Corpos ausentes/nulos de clientes, funcionários e produtos não provocam erro de desestruturação não tratado.
- Cadastro de usuário converte violações de unicidade do MariaDB em HTTP 409 com mensagem compreensível, cobrindo também cadastros simultâneos.
- IDs usados nos serviços passam a exigir inteiros seguros positivos.
- Nova rota autenticada `GET /api/produtos/opcoes`, que retorna somente `id` e `nome` para preencher o seletor de produtos das vendas sem depender da página atual da listagem.

### Frontend
- O seletor de produto da venda carrega a lista completa de opções pela nova rota.
- A tabela de vendas apresenta o nome do produto retornado pela API (`produto`) e mantém compatibilidade com `produto_nome`.
- A interface não aplica um segundo filtro sobre a página já filtrada pela API; isso evita ocultar resultados encontrados pela busca no servidor, inclusive por descrição de produto.
- Respostas antigas de pesquisas concorrentes não sobrescrevem a pesquisa mais recente.
- Limpar o nome de usuário no perfil mantém o campo realmente vazio após salvar.
- A sessão restaurada do `localStorage` exige ID numérico seguro, nome e e-mail válidos; respostas de login/perfil são conferidas antes de atualizar o contexto.
- A sincronização de sessão entre abas também trata o evento de limpeza do armazenamento.

## Preservado
- Rotas existentes, formatos principais das respostas, autenticação JWT, bcrypt, regras de perfil, repositórios, entidades, banco MariaDB, arquivos `.env`, configurações Docker, volumes e dados.
- Nenhum comando de banco ou Docker foi executado.

## Validação
- Os 56 arquivos TypeScript/TSX do Backend e Frontend passaram pela transpilação sintática local sem erros.
- O build completo e o lint ainda precisam ser executados no ambiente do projeto, pois a instalação das dependências não pôde ser concluída neste ambiente de análise (pacotes ausentes do cache e acesso ao registry expirou).
- O script `APLICAR-CORRECOES.ps1` cria backup dos 16 arquivos originais, aplica as correções e executa `npm run build` no Backend, `npm run build` no Frontend e `npm run lint` no Frontend. Se alguma validação falhar, o backup permanece disponível.
- O projeto não possui script de testes automatizados nos `package.json` recebidos. A integração real com MariaDB e os fluxos autenticados precisam ser conferidos após a aplicação no ambiente local.
