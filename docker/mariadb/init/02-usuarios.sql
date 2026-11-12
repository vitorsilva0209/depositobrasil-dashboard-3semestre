USE deposito_brasil;

-- Remover o usuário antigo, cuja senha estava em texto puro.
DELETE FROM usuarios;

-- Adequar a tabela ao cadastro e à autenticação atuais.
ALTER TABLE usuarios
    ADD COLUMN email VARCHAR(150) NOT NULL AFTER nome,
    ADD COLUMN cpf CHAR(11) NOT NULL AFTER email,
    MODIFY COLUMN usuario VARCHAR(150) NULL,
    MODIFY COLUMN senha VARCHAR(255) NOT NULL;

-- Impedir cadastros duplicados.
ALTER TABLE usuarios
    ADD UNIQUE KEY uq_usuarios_email (email),
    ADD UNIQUE KEY uq_usuarios_cpf (cpf),
    ADD UNIQUE KEY uq_usuarios_usuario (usuario);
