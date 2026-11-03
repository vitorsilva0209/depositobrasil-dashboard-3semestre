<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: ../../login.php");
    exit();
}

include("../../config/conexao.php");

$id = (int)($_GET["id"] ?? 0);

if ($id <= 0) {

    echo "<script>
        alert('ID do cliente inválido.');
        window.location='listar.php';
    </script>";

    exit();
}

$stmt = $conn->prepare(
    "SELECT * FROM clientes WHERE id = ?"
);

$stmt->bind_param("i", $id);
$stmt->execute();

$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {

    $stmt->close();

    echo "<script>
        alert('Cliente não encontrado.');
        window.location='listar.php';
    </script>";

    exit();

}

$cliente = $resultado->fetch_assoc();

$stmt->close();

$erro = "";

if (isset($_POST["editar"])) {

    $nome = trim($_POST["nome"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $telefone = trim($_POST["telefone"] ?? "");

    if ($nome === "" || $email === "") {

        $erro = "Preencha os campos obrigatórios.";

    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        $erro = "Informe um e-mail válido.";

    } else {

        $stmt = $conn->prepare(
            "UPDATE clientes
             SET nome = ?, email = ?, telefone = ?
             WHERE id = ?"
        );

        $stmt->bind_param(
            "sssi",
            $nome,
            $email,
            $telefone,
            $id
        );

        if ($stmt->execute()) {

            $stmt->close();

            header("Location: listar.php");
            exit();

        } else {

            $erro = "Erro ao atualizar cliente.";

        }

        $stmt->close();

    }

    $cliente["nome"] = $nome;
    $cliente["email"] = $email;
    $cliente["telefone"] = $telefone;
}

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Editar Cliente - Depósito Brasil</title>

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
    max-width: 800px;
    margin-top: 50px;
}

.card {
    border: none;
    border-top: 5px solid #d32f2f;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.card-header {
    background: #212529;
    color: white;
    padding: 20px;
}

.card-header h2 {
    margin: 0;
}

.card-body {
    padding: 30px;
}

.form-label {
    font-weight: 600;
    color: #333;
}

.form-control:focus {
    border-color: #d32f2f;
    box-shadow: 0 0 0 0.2rem rgba(211,47,47,0.15);
}

.btn-atualizar {
    background: #d32f2f;
    color: white;
    border: none;
}

.btn-atualizar:hover {
    background: #a92323;
    color: white;
}

.btn-voltar {
    background: #555555;
    color: white;
    border: none;
}

.btn-voltar:hover {
    background: #333333;
    color: white;
}

</style>

</head>

<body>

<div class="container">

    <div class="card">

        <div class="card-header">

            <h2>Editar Cliente</h2>

        </div>

        <div class="card-body">

            <?php if ($erro !== ""): ?>

                <div class="alert alert-danger">

                    <?= htmlspecialchars($erro); ?>

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
                        value="<?= htmlspecialchars($cliente["nome"] ?? ""); ?>"
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
                        value="<?= htmlspecialchars($cliente["email"] ?? ""); ?>"
                        required
                    >

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Telefone
                    </label>

                    <input
                        type="text"
                        name="telefone"
                        class="form-control"
                        value="<?= htmlspecialchars($cliente["telefone"] ?? ""); ?>"
                    >

                </div>

                <button
                    type="submit"
                    name="editar"
                    class="btn btn-atualizar"
                >
                    Atualizar Cliente
                </button>

                <a
                    href="listar.php"
                    class="btn btn-voltar"
                >
                    Cancelar
                </a>

            </form>

        </div>

    </div>

</div>

</body>

</html>