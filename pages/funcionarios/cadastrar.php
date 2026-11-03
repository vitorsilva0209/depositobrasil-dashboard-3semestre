<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: ../../login.php");
    exit();
}

include("../../config/conexao.php");

$erro = "";

if (isset($_POST['salvar'])) {

    $nome = trim($_POST['nome'] ?? "");
    $cargo = trim($_POST['cargo'] ?? "");
    $salario = (float)($_POST['salario'] ?? 0);

    if ($nome === "" || $cargo === "" || $salario <= 0) {

        $erro = "Preencha todos os campos corretamente.";

    } else {

        $stmt = $conn->prepare(
            "INSERT INTO funcionarios
            (nome, cargo, salario)
            VALUES (?, ?, ?)"
        );

        if (!$stmt) {

            $erro = "Erro ao preparar cadastro: " . $conn->error;

        } else {

            $stmt->bind_param(
                "ssd",
                $nome,
                $cargo,
                $salario
            );

            if ($stmt->execute()) {

                header("Location: listar.php");
                exit();

            } else {

                $erro = "Erro ao cadastrar funcionário: " . $stmt->error;

            }

            $stmt->close();
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

<title>Cadastrar Funcionário - Depósito Brasil</title>

<link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
>

<style>

body {
    background: #eeeeee;
    font-family: Arial, sans-serif;
}

.container {
    max-width: 850px;
    margin-top: 40px;
    margin-bottom: 40px;
}

.card {
    border: none;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.card-header {
    background: #1f1f1f;
    color: white;
    padding: 25px;
    border-top: 5px solid #d32f2f;
}

.card-header h2 {
    margin: 0;
    font-weight: bold;
}

.card-body {
    background: white;
    padding: 30px;
}

.form-label {
    font-weight: bold;
    color: #222222;
}

.form-control {
    border: 1px solid #bbbbbb;
    border-radius: 7px;
    padding: 11px;
}

.form-control:focus {
    border-color: #d32f2f;
    box-shadow: 0 0 0 0.2rem rgba(211, 47, 47, 0.20);
}

.btn-salvar {
    background: #d32f2f;
    border-color: #d32f2f;
    color: white;
    font-weight: bold;
}

.btn-salvar:hover {
    background: #b71c1c;
    border-color: #b71c1c;
    color: white;
}

.btn-voltar {
    background: #555555;
    border-color: #555555;
    color: white;
}

.btn-voltar:hover {
    background: #333333;
    border-color: #333333;
    color: white;
}

</style>

</head>

<body>

<div class="container">

    <div class="card">

        <div class="card-header">

            <h2>
                Cadastrar Funcionário
            </h2>

        </div>

        <div class="card-body">

            <?php if ($erro !== ""): ?>

                <div class="alert alert-danger">

                    <?= htmlspecialchars($erro); ?>

                </div>

            <?php endif; ?>

            <form method="POST">

                <div class="mb-4">

                    <label class="form-label">
                        Nome do Funcionário
                    </label>

                    <input
                        type="text"
                        name="nome"
                        class="form-control"
                        value="<?= htmlspecialchars($_POST['nome'] ?? '') ?>"
                        required
                    >

                </div>

                <div class="mb-4">

                    <label class="form-label">
                        Cargo
                    </label>

                    <input
                        type="text"
                        name="cargo"
                        class="form-control"
                        value="<?= htmlspecialchars($_POST['cargo'] ?? '') ?>"
                        required
                    >

                </div>

                <div class="mb-4">

                    <label class="form-label">
                        Salário
                    </label>

                    <input
                        type="number"
                        name="salario"
                        class="form-control"
                        step="0.01"
                        min="0.01"
                        value="<?= htmlspecialchars($_POST['salario'] ?? '') ?>"
                        required
                    >

                </div>

                <button
                    type="submit"
                    name="salvar"
                    class="btn btn-salvar"
                >
                    Cadastrar Funcionário
                </button>

                <a
                    href="listar.php"
                    class="btn btn-voltar"
                >
                    Voltar
                </a>

            </form>

        </div>

    </div>

</div>

</body>

</html>