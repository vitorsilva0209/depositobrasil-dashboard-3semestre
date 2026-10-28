<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: ../../login.php");
    exit();
}

include("../../config/conexao.php");

$erro = "";

if (isset($_POST["salvar"])) {

    $nome = trim($_POST["nome"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $cpf = trim($_POST["cpf"] ?? "");
    $senha = $_POST["senha"] ?? "";
    $confirmar_senha = $_POST["confirmar_senha"] ?? "";

    if (
        $nome === "" ||
        $email === "" ||
        $cpf === "" ||
        $senha === "" ||
        $confirmar_senha === ""
    ) {

        $erro = "Preencha todos os campos obrigatórios.";

    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        $erro = "Digite um e-mail válido.";

    } else {

        $cpfNumeros = preg_replace("/\D/", "", $cpf);

        if (strlen($cpfNumeros) !== 11) {

            $erro = "CPF inválido.";

        } elseif ($senha !== $confirmar_senha) {

            $erro = "As senhas não conferem.";

        } elseif (strlen($senha) < 8) {

            $erro = "A senha deve possuir pelo menos 8 caracteres.";

        } elseif (
            !preg_match("/[A-Z]/", $senha) ||
            !preg_match("/[a-z]/", $senha) ||
            !preg_match("/[0-9]/", $senha)
        ) {

            $erro = "A senha deve possuir letra maiúscula, letra minúscula e número.";

        } else {

            $verifica = $conn->prepare(
                "SELECT id FROM usuarios WHERE email = ? OR cpf = ?"
            );

            $verifica->bind_param(
                "ss",
                $email,
                $cpfNumeros
            );

            $verifica->execute();

            $resultado = $verifica->get_result();

            if ($resultado->num_rows > 0) {

                $erro = "E-mail ou CPF já cadastrado.";

            } else {

                $senhaHash = password_hash(
                    $senha,
                    PASSWORD_DEFAULT
                );

                $usuario = $email;

                $stmt = $conn->prepare(
                    "INSERT INTO usuarios
                    (nome, email, cpf, usuario, senha)
                    VALUES (?, ?, ?, ?, ?)"
                );

                if (!$stmt) {

                    $erro = "Erro ao preparar cadastro: " . $conn->error;

                } else {

                    $stmt->bind_param(
                        "sssss",
                        $nome,
                        $email,
                        $cpfNumeros,
                        $usuario,
                        $senhaHash
                    );

                    if ($stmt->execute()) {

                        echo "<script>
                            alert('Usuário cadastrado com sucesso!');
                            window.location='cadastrar.php';
                        </script>";

                        exit();

                    } else {

                        $erro = "Erro ao cadastrar usuário: " . $stmt->error;
                    }

                    $stmt->close();
                }
            }

            $verifica->close();
        }
    }
}

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Cadastrar Usuário</title>

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >

</head>

<body>

<div class="container mt-5">

    <h2 class="mb-4">
        Novo Usuário
    </h2>

    <?php if ($erro !== ""): ?>

        <div class="alert alert-danger">
            <?= htmlspecialchars($erro) ?>
        </div>

    <?php endif; ?>

    <form method="POST">

        <div class="mb-3">

            <label class="form-label">
                Nome
            </label>

            <input
                type="text"
                name="nome"
                class="form-control"
                value="<?= htmlspecialchars($_POST["nome"] ?? "") ?>"
                required
            >

        </div>

        <div class="mb-3">

            <label class="form-label">
                E-mail
            </label>

            <input
                type="email"
                name="email"
                class="form-control"
                value="<?= htmlspecialchars($_POST["email"] ?? "") ?>"
                required
            >

        </div>

        <div class="mb-3">

            <label class="form-label">
                CPF
            </label>

            <input
                type="text"
                name="cpf"
                class="form-control"
                placeholder="000.000.000-00"
                maxlength="14"
                value="<?= htmlspecialchars($_POST["cpf"] ?? "") ?>"
                required
            >

        </div>

        <div class="mb-3">

            <label class="form-label">
                Senha
            </label>

            <input
                type="password"
                name="senha"
                class="form-control"
                required
            >

            <small class="text-muted">
                Mínimo de 8 caracteres, com letra maiúscula,
                minúscula e número.
            </small>

        </div>

        <div class="mb-3">

            <label class="form-label">
                Confirmar senha
            </label>

            <input
                type="password"
                name="confirmar_senha"
                class="form-control"
                required
            >

        </div>

        <button
            type="submit"
            name="salvar"
            class="btn btn-success"
        >
            Salvar
        </button>

        <a
            href="../../dashboard.php"
            class="btn btn-secondary"
        >
            Voltar
        </a>

    </form>

</div>

</body>

</html>