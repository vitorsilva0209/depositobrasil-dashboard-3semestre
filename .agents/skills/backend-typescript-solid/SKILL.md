# Backend TypeScript e SOLID

## Objetivo
Orientar alterações no backend TypeScript do Depósito Brasil.

## Regras
- Respeitar a separação entre controllers, services, repositories e models.
- Aplicar responsabilidade única.
- Preferir extensão de funcionalidades a modificações que quebrem contratos existentes.
- Respeitar substituibilidade de implementações.
- Utilizar interfaces pequenas e específicas.
- Inverter dependências quando isso melhorar o desacoplamento.
- Encapsular estado e comportamento nas classes de domínio.
- Utilizar classes abstratas somente quando houver abstração real.
- Utilizar getters e setters somente quando necessários.
- Evitar duplicação de regras de negócio.
- Não utilizar any sem justificativa.
- Utilizar generics quando melhorarem reutilização e segurança de tipos.
- Manter compatibilidade com MariaDB.

## Banco de dados
- Utilizar parâmetros nas consultas.
- Preservar relacionamentos.
- Não alterar tabelas sem necessidade.
- Não apagar registros durante testes.

## Conclusão
Executar npm run build após alterações no backend.
Testar somente os fluxos afetados.
