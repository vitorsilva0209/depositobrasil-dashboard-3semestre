<?php

include("../../config/conexao.php");

if (!isset($_GET["id"]) || !is_numeric($_GET["id"])) {
    die("ID do produto inválido.");
}

$id = (int) $_GET["id"];

if (isset($_POST["editar"])) {

    $nome = trim($_POST["nome"] ?? "");
    $categoria = trim($_POST["categoria"] ?? "");
    $preco = (float) ($_POST["preco"] ?? 0);
    $estoque = (int) ($_POST["estoque"] ?? 0);
    $descricao = trim($_POST["descricao"] ?? "");

    $stmt = $conn->prepare("
        UPDATE produtos
        SET
            nome = ?,
            categoria = ?,
            preco = ?,
            estoque = ?,
            descricao = ?
        WHERE id = ?
    ");

    if (!$stmt) {
        die("Erro ao preparar atualização: " . $conn->error);
    }

    $stmt->bind_param(
        "ssdisi",
        $nome,
        $categoria,
        $preco,
        $estoque,
        $descricao,
        $id
    );

    if ($stmt->execute()) {
        $stmt->close();

        header("Location: listar.php");
        exit();
    }

    echo "Erro ao atualizar produto: " . $stmt->error;

    $stmt->close();
}

$stmt = $conn->prepare("
    SELECT *
    FROM produtos
    WHERE id = ?
");

$stmt->bind_param("i", $id);
$stmt->execute();

$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    die("Produto não encontrado.");
}

$produto = $resultado->fetch_assoc();

$stmt->close();

?>

<!DOCTYPE html>

<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Editar Produto - Depósito Brasil</title>

<link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
>

<style>

body {
    background: #f4f6f9;
}

.container {
    max-width: 800px;
}

.card {
    margin-top: 40px;
    padding: 30px;
    border-radius: 10px;
}

</style>

</head>

<body>

<div class="container">

    <div class="card shadow">

        <h2 class="mb-4">Editar Produto</h2>

        <form method="POST">

            <div class="mb-3">

                <label class="form-label">
                    Nome
                </label>

                <input
                    type="text"
                    name="nome"
                    class="form-control"
                    value="<?= htmlspecialchars($produto["nome"] ?? "") ?>"
                    required
                >

            </div>

            <div class="mb-3">

                <label class="form-label">
                    Categoria
                </label>

                <input
                    type="text"
                    name="categoria"
                    class="form-control"
                    value="<?= htmlspecialchars($produto["categoria"] ?? "") ?>"
                    required
                >

            </div>

            <div class="mb-3">

                <label class="form-label">
                    Preço
                </label>

                <input
                    type="number"
                    step="0.01"
                    name="preco"
                    class="form-control"
                    value="<?= htmlspecialchars($produto["preco"] ?? "0") ?>"
                    required
                >

            </div>

            <div class="mb-3">

                <label class="form-label">
                    Estoque
                </label>

                <input
                    type="number"
                    name="estoque"
                    class="form-control"
                    value="<?= htmlspecialchars($produto["estoque"] ?? "0") ?>"
                    required
                >

            </div>

            <div class="mb-3">

                <label class="form-label">
                    Descrição
                </label>

                <textarea
                    name="descricao"
                    class="form-control"
                    rows="4"
                ><?= htmlspecialchars($produto["descricao"] ?? "") ?></textarea>

            </div>

            <button
                type="submit"
                name="editar"
                class="btn btn-primary"
            >
                Atualizar Produto
            </button>

            <a
                href="listar.php"
                class="btn btn-secondary"
            >
                Cancelar
            </a>

        </form>

    </div>

</div>

</body>
<link href="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.css" rel="stylesheet">

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.js"></script>

<script>
$(document).ready(function() {
    $('#descricao').summernote({
        height: 200
    });
});
</script>
</html>