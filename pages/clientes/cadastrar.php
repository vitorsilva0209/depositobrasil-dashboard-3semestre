<?php

include("../../config/conexao.php");

$erro = "";

if (isset($_POST["salvar"])) {

    $nome = trim($_POST["nome"] ?? "");
    $categoria = trim($_POST["categoria"] ?? "");
    $preco = (float) ($_POST["preco"] ?? 0);
    $quantidade = (int) ($_POST["quantidade"] ?? 0);
    $fornecedor = trim($_POST["fornecedor"] ?? "");
    $imagem_url = trim($_POST["imagem_url"] ?? "");
    $descricao = trim($_POST["descricao"] ?? "");

    if ($nome === "" || $categoria === "" || $preco <= 0) {

        $erro = "Preencha os campos obrigatórios corretamente.";

    } else {

        $verifica = $conn->prepare(
            "SELECT id FROM produtos WHERE nome = ?"
        );

        $verifica->bind_param("s", $nome);
        $verifica->execute();

        $resultado = $verifica->get_result();

        if ($resultado->num_rows > 0) {

            $erro = "Produto já cadastrado.";

        } else {

            $stmt = $conn->prepare("
                INSERT INTO produtos
                (nome, categoria, preco, quantidade, fornecedor, descricao, imagem_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");

            if (!$stmt) {

                $erro = "Erro ao preparar cadastro: " . $conn->error;

            } else {

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

                    echo "<script>
                        alert('Produto cadastrado com sucesso!');
                        window.location='listar.php';
                    </script>";

                    exit();

                } else {

                    $erro = "Erro ao cadastrar produto: " . $stmt->error;
                }

                $stmt->close();
            }
        }

        $verifica->close();
    }
}

?>

<!DOCTYPE html>

<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

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

.container-cadastro {
    max-width: 1100px;
    margin: 25px auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    border-top: 6px solid #d32f2f;
}

.cabecalho {
    background: #1f1f1f;
    color: white;
    padding: 28px;
}

.cabecalho h1 {
    margin: 0;
    font-size: 40px;
    font-weight: bold;
}

.conteudo {
    padding: 40px;
}

.form-label {
    font-weight: bold;
    font-size: 18px;
    color: #222;
}

.form-control {
    border: 1px solid #bbbbbb;
    border-radius: 7px;
    padding: 12px 14px;
    font-size: 18px;
}

.form-control:focus {
    border-color: #d32f2f;
    box-shadow: 0 0 0 0.2rem rgba(211, 47, 47, 0.15);
}

.campo {
    margin-bottom: 22px;
}

.linha-dupla {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
}

.btn-cadastrar {
    background: #d32f2f;
    border: none;
    color: white;
    padding: 12px 25px;
    font-size: 18px;
    border-radius: 7px;
}

.btn-cadastrar:hover {
    background: #b71c1c;
    color: white;
}

.btn-voltar {
    background: #555555;
    border: none;
    color: white;
    padding: 12px 25px;
    font-size: 18px;
    border-radius: 7px;
}

.btn-voltar:hover {
    background: #333333;
    color: white;
}

.alert-danger {
    border-left: 5px solid #b71c1c;
}

.note-editor {
    border-radius: 7px;
    overflow: hidden;
}

@media (max-width: 768px) {

    .container-cadastro {
        margin: 10px;
    }

    .conteudo {
        padding: 20px;
    }

    .cabecalho h1 {
        font-size: 30px;
    }

    .linha-dupla {
        grid-template-columns: 1fr;
        gap: 0;
    }

}

</style>

</head>

<body>

<div class="container-cadastro">

    <div class="cabecalho">

        <h1>
            Cadastrar Produto
        </h1>

    </div>

    <div class="conteudo">

        <?php if ($erro !== ""): ?>

            <div class="alert alert-danger">
                <?= htmlspecialchars($erro) ?>
            </div>

        <?php endif; ?>

        <form method="POST">

            <div class="campo">

                <label class="form-label">
                    Nome do Produto
                </label>

                <input
                    type="text"
                    name="nome"
                    class="form-control"
                    value="<?= htmlspecialchars($_POST["nome"] ?? "") ?>"
                    required
                >

            </div>


            <div class="campo">

                <label class="form-label">
                    Categoria
                </label>

                <input
                    type="text"
                    name="categoria"
                    class="form-control"
                    value="<?= htmlspecialchars($_POST["categoria"] ?? "") ?>"
                    required
                >

            </div>


            <div class="linha-dupla">

                <div class="campo">

                    <label class="form-label">
                        Preço
                    </label>

                    <input
                        type="number"
                        name="preco"
                        class="form-control"
                        step="0.01"
                        min="0"
                        value="<?= htmlspecialchars($_POST["preco"] ?? "") ?>"
                        required
                    >

                </div>


                <div class="campo">

                    <label class="form-label">
                        Quantidade em Estoque
                    </label>

                    <input
                        type="number"
                        name="quantidade"
                        class="form-control"
                        min="0"
                        value="<?= htmlspecialchars($_POST["quantidade"] ?? "0") ?>"
                        required
                    >

                </div>

            </div>


            <div class="campo">

                <label class="form-label">
                    Fornecedor
                </label>

                <input
                    type="text"
                    name="fornecedor"
                    class="form-control"
                    value="<?= htmlspecialchars($_POST["fornecedor"] ?? "") ?>"
                >

            </div>


            <div class="campo">

                <label class="form-label">
                    Imagem
                </label>

                <input
                    type="text"
                    name="imagem_url"
                    class="form-control"
                    value="<?= htmlspecialchars($_POST["imagem_url"] ?? "") ?>"
                    placeholder="exemplo: imagens/img/produtos/ferro-10mm.jpg"
                >

            </div>


            <div class="campo">

                <label class="form-label">
                    Descrição
                </label>

                <textarea
                    id="descricao"
                    name="descricao"
                    class="form-control"
                    rows="5"
                ><?= htmlspecialchars($_POST["descricao"] ?? "") ?></textarea>

            </div>


            <div class="mt-4">

                <button
                    type="submit"
                    name="salvar"
                    class="btn btn-cadastrar"
                >
                    Cadastrar Produto
                </button>

                <a
                    href="listar.php"
                    class="btn btn-voltar"
                >
                    Voltar
                </a>

            </div>

        </form>

    </div>

</div>


<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.js"></script>

<script>

$(document).ready(function() {

    $('#descricao').summernote({
        height: 200,
        placeholder: 'Digite a descrição do produto...'
    });

});

</script>

</body>

</html>