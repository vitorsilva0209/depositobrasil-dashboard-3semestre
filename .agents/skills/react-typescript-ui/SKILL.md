# React TypeScript e Interface

## Objetivo
Orientar o desenvolvimento da interface React do Depósito Brasil.

## Organização
- Separar páginas, componentes, contextos, serviços e utilitários.
- Manter componentes reutilizáveis.
- Evitar concentrar toda a interface em App.tsx.
- Manter componentes específicos próximos das páginas que os utilizam.
- Utilizar interfaces e tipos explícitos.
- Evitar any.

## Autenticação
- Utilizar AuthContext para estado global do usuário.
- Preservar o fluxo de login e logout.
- Armazenar o token conforme a implementação existente.
- Tratar sessões expiradas.
- Não exibir tokens na interface ou nos logs.

## Formulários
- Validar campos obrigatórios.
- Validar e-mail e CPF.
- Validar força da senha.
- Conferir confirmação de senha.
- Exibir mensagens compreensíveis.
- Impedir alteração do e-mail no perfil.
- Tratar erros da API.

## Interface
- Preservar a identidade visual preta, vermelha e cinza.
- Manter acessibilidade básica e labels nos campos.
- Manter estados de carregamento e mensagens.
- Preservar paginação e relacionamentos.
- Não remover funcionalidades existentes.

## Conclusão
Executar npm run build após alterações no frontend.
Testar os fluxos efetivamente modificados.
