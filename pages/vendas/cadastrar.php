<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: ../../login.php");
    exit();
}

include("../../config/conexao.php");

$erro = "";

if (isset($_POST["salvar"])) {

    $produto_id = (int)($_POST["produto_id"] ?? 0);
    $quantidade = (int)($_POST["quantidade"] ?? 0);
    $data_venda = trim($_POST["data_venda"] ?? "");

    if ($produto_id <= 0 || $quantidade <= 0 || $data_venda === "") {

        $erro = "Preencha todos os campos corretamente.";

    } else {

        $verificaProduto = $conn->prepare(
            "SELECT id FROM produtos WHERE id = ?"
        );

        $verificaProduto->bind_param("i", $produto_id);
        $verificaProduto->execute();

        $resultadoProduto = $verificaProduto->get_result();

        if ($resultadoProduto->num_rows === 0) {

            $erro = "Produto não encontrado.";

        } else {

            $stmt = $conn->prepare(
                "INSERT INTO vendas (produto_id, quantidade, data_venda)
                 VALUES (?, ?, ?)"
            );

            if (!$stmt) {

                $erro = "Erro ao preparar cadastro: " . $conn->error;

            } else {

                $stmt->bind_param(
                    "iis",
                    $produto_id,
                    $quantidade,
                    $data_venda
                );

                if ($stmt->execute()) {

                    echo "<script>
                        alert('Venda cadastrada com sucesso!');
                        window.location='listar.php';
                    </script>";

                    exit();

                } else {

                    $erro = "Erro ao cadastrar venda: " . $stmt->error;
                }

                $stmt->close();
            }
        }

        $verificaProduto->close();
    }
}

$produtos = $conn->query(
    "SELECT id, nome FROM produtos ORDER BY nome ASC"
);

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Cadastrar Venda</title>

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >

    <style>

        body {
            background: #f5f5f5;
        }

        .card {
            border-radius: 15px;
            margin-top: 50px;
            padding: 25px;
        }

        h2 {
            color: #dc3545;
        }

        .btn-salvar {
            background: #dc3545;
            color: white;
        }

        .btn-salvar:hover {
            background: #bb2d3b;
            color: white;
        }

    </style>

</head>

<body>

<div class="container">

    <div class="card shadow">

        <div class="d-flex justify-content-between align-items-center mb-4">

            <h2>Nova Venda</h2>

            <a href="listar.php" class="btn btn-secondary">
                ← Voltar
            </a>

        </div>

        <?php if ($erro !== ""): ?>

            <div class="alert alert-danger">
                <?= htmlspecialchars($erro) ?>
            </div>

        <?php endif; ?>

        <form method="POST">

            <div class="mb-3">

                <label class="form-label">
                    Produto
                </label>

                <select
                    name="produto_id"
                    class="form-select"
                    required
                >

                    <option value="">
                        Selecione um produto
                    </option>

                    <?php while ($produto = $produtos->fetch_assoc()): ?>

                        <option
                            value="<?= $produto["id"] ?>"
                            <?= (isset($_POST["produto_id"]) &&
                                $_POST["produto_id"] == $produto["id"])
                                ? "selected"
                                : "" ?>
                        >
                            <?= htmlspecialchars($produto["nome"]) ?>
                        </option>

                    <?php endwhile; ?>

                </select>

            </div>

            <div class="mb-3">

                <label class="form-label">
                    Quantidade
                </label>

                <input
                    type="number"
                    name="quantidade"
                    class="form-control"
                    min="1"
                    value="<?= htmlspecialchars($_POST["quantidade"] ?? "") ?>"
                    required
                >

            </div>

            <div class="mb-3">

                <label class="form-label">
                    Data da Venda
                </label>

                <input
                    type="date"
                    name="data_venda"
                    class="form-control"
                    value="<?= htmlspecialchars($_POST["data_venda"] ?? date("Y-m-d")) ?>"
                    required
                >

            </div>

            <button
                type="submit"
                name="salvar"
                class="btn btn-salvar"
            >
                Cadastrar Venda
            </button>

        </form>

    </div>

</div>

</body>

</html>