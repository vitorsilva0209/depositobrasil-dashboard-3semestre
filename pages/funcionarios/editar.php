<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: ../../login.php");
    exit();
}

include("../../config/conexao.php");

if (!isset($_GET["id"]) || !is_numeric($_GET["id"])) {

    echo "<script>
        alert('ID do funcionário inválido.');
        window.location='listar.php';
    </script>";

    exit();

}

$id = (int)$_GET["id"];

$stmt = $conn->prepare(
    "SELECT * FROM funcionarios WHERE id = ?"
);

$stmt->bind_param("i", $id);
$stmt->execute();

$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {

    $stmt->close();

    echo "<script>
        alert('Funcionário não encontrado.');
        window.location='listar.php';
    </script>";

    exit();

}

$funcionario = $resultado->fetch_assoc();

$stmt->close();

$erro = "";

if (isset($_POST["editar"])) {

    $nome = trim($_POST["nome"] ?? "");
    $cargo = trim($_POST["cargo"] ?? "");
    $salario = (float)($_POST["salario"] ?? 0);

    if (
        $nome === "" ||
        $cargo === "" ||
        $salario <= 0
    ) {

        $erro = "Preencha todos os campos corretamente.";

    } else {

        $stmt = $conn->prepare("
            UPDATE funcionarios
            SET
                nome = ?,
                cargo = ?,
                salario = ?
            WHERE id = ?
        ");

        if (!$stmt) {

            $erro =
                "Erro ao preparar atualização: " .
                $conn->error;

        } else {

            $stmt->bind_param(
                "ssdi",
                $nome,
                $cargo,
                $salario,
                $id
            );

            if ($stmt->execute()) {

                $stmt->close();

                header("Location: listar.php");
                exit();

            } else {

                $erro =
                    "Erro ao atualizar funcionário: " .
                    $stmt->error;

                $stmt->close();

            }

        }

    }

    $funcionario["nome"] = $nome;
    $funcionario["cargo"] = $cargo;
    $funcionario["salario"] = $salario;
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

<title>Editar Funcionário - Depósito Brasil</title>

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

.btn-atualizar {
    background: #d32f2f;
    border-color: #d32f2f;
    color: white;
    font-weight: bold;
}

.btn-atualizar:hover {
    background: #b71c1c;
    border-color: #b71c1c;
    color: white;
}

.btn-cancelar {
    background: #555555;
    border-color: #555555;
    color: white;
}

.btn-cancelar:hover {
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
                Editar Funcionário
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
                        value="<?= htmlspecialchars($funcionario["nome"] ?? "") ?>"
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
                        value="<?= htmlspecialchars($funcionario["cargo"] ?? "") ?>"
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
                        step="0.01"
                        min="0.01"
                        class="form-control"
                        value="<?= htmlspecialchars($funcionario["salario"] ?? "0") ?>"
                        required
                    >

                </div>

                <button
                    type="submit"
                    name="editar"
                    class="btn btn-atualizar"
                >
                    Atualizar Funcionário
                </button>

                <a
                    href="listar.php"
                    class="btn btn-cancelar"
                >
                    Cancelar
                </a>

            </form>

        </div>

    </div>

</div>

</body>

</html>