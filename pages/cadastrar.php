<?php

include("../../config/conexao.php");

if (isset($_POST['salvar'])) {

    $nome = trim($_POST['nome']);
    $categoria = trim($_POST['categoria']);
    $preco = $_POST['preco'];
    $quantidade = $_POST['quantidade'];
    $fornecedor = trim($_POST['fornecedor']);
    $descricao = trim($_POST['descricao']);
    $imagem_url = trim($_POST['imagem_url']);

    $verifica = $conn->prepare(
        "SELECT id FROM produtos WHERE nome = ?"
    );

    $verifica->bind_param("s", $nome);

    $verifica->execute();

    $resultado = $verifica->get_result();

    if ($resultado->num_rows > 0) {

        $erro = "Produto já cadastrado!";

    } else {

        $stmt = $conn->prepare(
            "INSERT INTO produtos
            (nome, categoria, preco, quantidade, fornecedor, descricao, imagem_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)"
        );

        $stmt->bind_param(
            "ssdisss",
            $nome,
            $categoria,
            $preco,
            $quantidade,
            $fornecedor,
            $descricao,
            $imagem_url
        );

        if ($stmt->execute()) {

            header("Location: listar.php");

            exit();

        } else {

            $erro = "Erro ao cadastrar produto.";

        }

        $stmt->close();
    }

    $verifica->close();
}

?>

<!DOCTYPE html>

<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Cadastrar Produto</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

<div class="container mt-5">

<h2 class="mb-4">

Novo Produto

</h2>

<?php if (isset($erro)): ?>

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
    required
>

</div>

<div class="mb-3">

<label class="form-label">

Quantidade

</label>

<input
    type="number"
    name="quantidade"
    class="form-control"
    required
>

</div>

<div class="mb-3">

<label class="form-label">

Fornecedor

</label>

<input
    type="text"
    name="fornecedor"
    class="form-control"
>

</div>

<div class="mb-3">

<label class="form-label">

URL da imagem

</label>

<input
    type="text"
    name="imagem_url"
    class="form-control"
    placeholder="exemplo: imagens/cimento.jpg"
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
></textarea>

</div>

<button
    type="submit"
    name="salvar"
    class="btn btn-success"
>

Salvar Produto

</button>

<a
    href="listar.php"
    class="btn btn-secondary"
>

Voltar

</a>

</form>

</div>

</body>

</html>