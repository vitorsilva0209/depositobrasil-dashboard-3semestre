<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: ../../login.php");
    exit();
}

include("../../config/conexao.php");

$id = (int)($_GET["id"] ?? 0);

if ($id <= 0) {

    header("Location: listar.php");
    exit();

}

$stmt = $conn->prepare(
    "SELECT * FROM produtos WHERE id = ?"
);

$stmt->bind_param(
    "i",
    $id
);

$stmt->execute();

$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {

    $stmt->close();

    echo "<script>
        alert('Produto não encontrado.');
        window.location='listar.php';
    </script>";

    exit();

}

$produto = $resultado->fetch_assoc();

$stmt->close();

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
        $preco <= 0 ||
        $quantidade < 0
    ) {

        $erro =
            "Preencha os campos obrigatórios corretamente.";

    } else {

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

            $campos[] = "nome = ?";
            $tipos .= "s";
            $dados[] = $nome;

        }

        if (in_array("categoria", $colunas)) {

            $campos[] = "categoria = ?";
            $tipos .= "s";
            $dados[] = $categoria;

        }

        if (in_array("preco", $colunas)) {

            $campos[] = "preco = ?";
            $tipos .= "d";
            $dados[] = $preco;

        }

        if (in_array("quantidade", $colunas)) {

            $campos[] = "quantidade = ?";
            $tipos .= "i";
            $dados[] = $quantidade;

        } elseif (in_array("estoque", $colunas)) {

            $campos[] = "estoque = ?";
            $tipos .= "i";
            $dados[] = $quantidade;

        }

        if (in_array("fornecedor", $colunas)) {

            $campos[] = "fornecedor = ?";
            $tipos .= "s";
            $dados[] = $fornecedor;

        }

        if (in_array("descricao", $colunas)) {

            $campos[] = "descricao = ?";
            $tipos .= "s";
            $dados[] = $descricao;

        }

        if (in_array("imagem_url", $colunas)) {

            $campos[] = "imagem_url = ?";
            $tipos .= "s";
            $dados[] = $imagem_url;

        }

        if (count($campos) > 0) {

            $sql =
                "UPDATE produtos SET " .
                implode(", ", $campos) .
                " WHERE id = ?";

            $tipos .= "i";
            $dados[] = $id;

            $stmt = $conn->prepare($sql);

            if (!$stmt) {

                $erro =
                    "Erro ao preparar atualização: " .
                    $conn->error;

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

                    $erro =
                        "Erro ao atualizar produto: " .
                        $stmt->error;

                    $stmt->close();

                }

            }

        } else {

            $erro =
                "Não foi possível encontrar os campos da tabela produtos.";

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

    <title>Editar Produto</title>

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >

    <link
        href="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-bs5.min.css"
        rel="stylesheet"
    >

</head>

<body>

<div class="container mt-5">

    <div class="card shadow">

        <div class="card-header bg-dark text-white">

            <h3 class="mb-0">
                Editar Produto
            </h3>

        </div>

        <div class="card-body">

            <?php if (isset($erro)): ?>

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
                        name="preco"
                        class="form-control"
                        step="0.01"
                        min="0"
                        value="<?= htmlspecialchars($produto["preco"] ?? "") ?>"
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
                        min="0"
                        value="<?= htmlspecialchars(
                            $produto["quantidade"]
                            ?? $produto["estoque"]
                            ?? 0
                        ) ?>"
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
                        value="<?= htmlspecialchars($produto["fornecedor"] ?? "") ?>"
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
                        value="<?= htmlspecialchars($produto["imagem_url"] ?? "") ?>"
                    >

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Descrição
                    </label>

                    <textarea
                        name="descricao"
                        id="descricao"
                        class="form-control"
                    ><?= htmlspecialchars($produto["descricao"] ?? "") ?></textarea>

                </div>

                <button
                    type="submit"
                    class="btn btn-primary"
                >
                    Salvar alterações
                </button>

                <a
                    href="listar.php"
                    class="btn btn-secondary"
                >
                    Voltar
                </a>

            </form>

        </div>

    </div>

</div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-bs5.min.js"></script>

<script>

$(document).ready(function () {

    $('#descricao').summernote({
        height: 200
    });

});

</script>

</body>

</html>