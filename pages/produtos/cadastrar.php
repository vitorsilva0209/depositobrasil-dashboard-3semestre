<?php

include("../../config/conexao.php");

$mensagem = "";
$tipoMensagem = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $nome = trim($_POST["nome"] ?? "");
    $categoria = trim($_POST["categoria"] ?? "");
    $preco = (float)($_POST["preco"] ?? 0);
    $quantidade = (int)($_POST["quantidade"] ?? 0);
    $fornecedor = trim($_POST["fornecedor"] ?? "");
    $descricao = trim($_POST["descricao"] ?? "");
    $imagem_url = trim($_POST["imagem_url"] ?? "");

    if (
        $nome === "" ||
        $categoria === "" ||
        $preco <= 0
    ) {

        $mensagem =
            "Preencha os campos obrigatórios corretamente.";

        $tipoMensagem = "danger";

    } else {

        $verifica = $conn->prepare(
            "SELECT id FROM produtos WHERE nome = ?"
        );

        $verifica->bind_param(
            "s",
            $nome
        );

        $verifica->execute();

        $resultado = $verifica->get_result();

        if ($resultado->num_rows > 0) {

            $mensagem =
                "Produto já cadastrado.";

            $tipoMensagem = "danger";

            $verifica->close();

        } else {

            $verifica->close();

            $resultadoColunas =
                $conn->query("SHOW COLUMNS FROM produtos");

            $colunas = [];

            if ($resultadoColunas) {

                while ($coluna = $resultadoColunas->fetch_assoc()) {

                    $colunas[] = $coluna["Field"];

                }

            }

            $campos = [];
            $valores = [];
            $tipos = "";
            $dados = [];

            if (in_array("nome", $colunas)) {

                $campos[] = "nome";
                $valores[] = "?";
                $tipos .= "s";
                $dados[] = $nome;

            }

            if (in_array("categoria", $colunas)) {

                $campos[] = "categoria";
                $valores[] = "?";
                $tipos .= "s";
                $dados[] = $categoria;

            }

            if (in_array("preco", $colunas)) {

                $campos[] = "preco";
                $valores[] = "?";
                $tipos .= "d";
                $dados[] = $preco;

            }

            if (in_array("quantidade", $colunas)) {

                $campos[] = "quantidade";
                $valores[] = "?";
                $tipos .= "i";
                $dados[] = $quantidade;

            } elseif (in_array("estoque", $colunas)) {

                $campos[] = "estoque";
                $valores[] = "?";
                $tipos .= "i";
                $dados[] = $quantidade;

            }

            if (in_array("fornecedor", $colunas)) {

                $campos[] = "fornecedor";
                $valores[] = "?";
                $tipos .= "s";
                $dados[] = $fornecedor;

            }

            if (in_array("descricao", $colunas)) {

                $campos[] = "descricao";
                $valores[] = "?";
                $tipos .= "s";
                $dados[] = $descricao;

            }

            if (in_array("imagem_url", $colunas)) {

                $campos[] = "imagem_url";
                $valores[] = "?";
                $tipos .= "s";
                $dados[] = $imagem_url;

            }

            if (count($campos) === 0) {

                $mensagem =
                    "Não foi possível encontrar os campos da tabela produtos.";

                $tipoMensagem = "danger";

            } else {

                $sql =
                    "INSERT INTO produtos (" .
                    implode(", ", $campos) .
                    ") VALUES (" .
                    implode(", ", $valores) .
                    ")";

                $stmt = $conn->prepare($sql);

                if (!$stmt) {

                    $mensagem =
                        "Erro ao preparar cadastro: " .
                        $conn->error;

                    $tipoMensagem = "danger";

                } else {

                    $stmt->bind_param(
                        $tipos,
                        ...$dados
                    );

                    if ($stmt->execute()) {

                        $stmt->close();

                        header(
                            "Location: listar.php"
                        );

                        exit();

                    } else {

                        $mensagem =
                            "Erro ao cadastrar produto: " .
                            $stmt->error;

                        $tipoMensagem = "danger";

                        $stmt->close();

                    }

                }

            }

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

<title>Cadastrar Produto - Depósito Brasil</title>

<link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
>

<link
    href="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.css"
    rel="stylesheet"
>

<style>

body {
    background: #eeeeee;
    font-family: Arial, sans-serif;
}

.container {
    max-width: 900px;
    margin-top: 40px;
    margin-bottom: 40px;
}

.card {
    border: none;
    border-top: 5px solid #d32f2f;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.card-header {
    background: #1e1e1e;
    color: white;
    padding: 20px;
}

.card-header h2 {
    margin: 0;
    font-weight: bold;
}

.card-body {
    padding: 30px;
}

.form-label {
    font-weight: bold;
    color: #343434;
}

.form-control {
    border: 1px solid #bdbdbd;
}

.form-control:focus {
    border-color: #d32f2f;
    box-shadow: 0 0 0 0.2rem rgba(211, 47, 47, 0.15);
}

.btn-salvar {
    background: #d32f2f;
    border-color: #d32f2f;
    color: white;
}

.btn-salvar:hover {
    background: #b71c1c;
    border-color: #b71c1c;
    color: white;
}

.btn-voltar {
    background: #343a40;
    border-color: #343a40;
    color: white;
}

.btn-voltar:hover {
    background: #1e1e1e;
    border-color: #1e1e1e;
    color: white;
}

</style>

</head>

<body>

<div class="container">

    <div class="card">

        <div class="card-header">

            <h2>
                Cadastro de Produto
            </h2>

        </div>

        <div class="card-body">

            <?php if ($mensagem !== ""): ?>

                <div class="alert alert-<?= htmlspecialchars($tipoMensagem); ?>">

                    <?= htmlspecialchars($mensagem); ?>

                </div>

            <?php endif; ?>

            <form method="POST">

                <div class="mb-3">

                    <label class="form-label">
                        Nome do Produto
                    </label>

                    <input
                        type="text"
                        name="nome"
                        class="form-control"
                        value="<?= htmlspecialchars($_POST["nome"] ?? ""); ?>"
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
                        value="<?= htmlspecialchars($_POST["categoria"] ?? ""); ?>"
                        required
                    >

                </div>

                <div class="row">

                    <div class="col-md-6 mb-3">

                        <label class="form-label">
                            Preço
                        </label>

                        <input
                            type="number"
                            name="preco"
                            class="form-control"
                            step="0.01"
                            min="0"
                            value="<?= htmlspecialchars($_POST["preco"] ?? ""); ?>"
                            required
                        >

                    </div>

                    <div class="col-md-6 mb-3">

                        <label class="form-label">
                            Quantidade em Estoque
                        </label>

                        <input
                            type="number"
                            name="quantidade"
                            class="form-control"
                            min="0"
                            value="<?= htmlspecialchars($_POST["quantidade"] ?? "0"); ?>"
                            required
                        >

                    </div>

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Fornecedor
                    </label>

                    <input
                        type="text"
                        name="fornecedor"
                        class="form-control"
                        value="<?= htmlspecialchars($_POST["fornecedor"] ?? ""); ?>"
                    >

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Imagem
                    </label>

                    <input
                        type="text"
                        name="imagem_url"
                        class="form-control"
                        placeholder="exemplo.jpg ou imagens/img/produtos/exemplo.jpg"
                        value="<?= htmlspecialchars($_POST["imagem_url"] ?? ""); ?>"
                    >

                </div>

                <div class="mb-4">

                    <label class="form-label">
                        Descrição
                    </label>

                    <textarea
                        id="descricao"
                        name="descricao"
                        class="form-control"
                        rows="5"
                    ><?= htmlspecialchars($_POST["descricao"] ?? ""); ?></textarea>

                </div>

                <button
                    type="submit"
                    class="btn btn-salvar"
                >
                    Cadastrar Produto
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

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.js"></script>

<script>

$(document).ready(function() {

    $('#descricao').summernote({
        height: 200
    });

});

</script>

</body>

</html>