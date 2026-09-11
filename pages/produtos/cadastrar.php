<?php

include("../../config/conexao.php");

$mensagem = "";
$tipoMensagem = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $nome = trim($_POST["nome"] ?? "");
    $categoria = trim($_POST["categoria"] ?? "");
    $preco = (float)($_POST["preco"] ?? 0);
    $estoque = (int)($_POST["estoque"] ?? 0);
    $descricao = trim($_POST["descricao"] ?? "");
    $imagem_url = trim($_POST["imagem_url"] ?? "");

    if ($nome === "" || $categoria === "" || $preco <= 0) {

        $mensagem = "Preencha os campos obrigatórios corretamente.";
        $tipoMensagem = "danger";

    } else {

        $colunas = [];

        $resultadoColunas = $conn->query("SHOW COLUMNS FROM produtos");

        if (!$resultadoColunas) {
            $mensagem = "Erro ao verificar a tabela produtos: " . $conn->error;
            $tipoMensagem = "danger";
        } else {

            while ($coluna = $resultadoColunas->fetch_assoc()) {
                $colunas[] = $coluna["Field"];
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

            if (in_array("estoque", $colunas)) {
                $campos[] = "estoque";
                $valores[] = "?";
                $tipos .= "i";
                $dados[] = $estoque;
            } elseif (in_array("quantidade", $colunas)) {
                $campos[] = "quantidade";
                $valores[] = "?";
                $tipos .= "i";
                $dados[] = $estoque;
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

                $mensagem = "Não foi possível encontrar os campos da tabela produtos.";
                $tipoMensagem = "danger";

            } else {

                $sql = "INSERT INTO produtos (" .
                    implode(", ", $campos) .
                    ") VALUES (" .
                    implode(", ", $valores) .
                    ")";

                $stmt = $conn->prepare($sql);

                if (!$stmt) {

                    $mensagem = "Erro ao preparar cadastro: " . $conn->error;
                    $tipoMensagem = "danger";

                } else {

                    $stmt->bind_param($tipos, ...$dados);

                    if ($stmt->execute()) {

                        $mensagem = "Produto cadastrado com sucesso!";
                        $tipoMensagem = "success";

                        $_POST = [];

                    } else {

                        $mensagem = "Erro ao cadastrar produto: " . $stmt->error;
                        $tipoMensagem = "danger";
                    }

                    $stmt->close();
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Cadastrar Produto - Depósito Brasil</title>

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet">
</head>

<body class="bg-dark text-white">

    <div class="container mt-5">

        <div class="card bg-secondary text-white shadow">

            <div class="card-header">
                <h3 class="mb-0">Cadastrar Produto</h3>
            </div>

            <div class="card-body">

                <?php if ($mensagem !== ""): ?>

                    <div class="alert alert-<?= $tipoMensagem ?>">
                        <?= htmlspecialchars($mensagem) ?>
                    </div>

                <?php endif; ?>

                <form method="POST">

                    <div class="mb-3">
                        <label class="form-label">Nome</label>

                        <input
                            type="text"
                            name="nome"
                            class="form-control"
                            value="<?= htmlspecialchars($_POST["nome"] ?? "") ?>"
                            required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Categoria</label>

                        <input
                            type="text"
                            name="categoria"
                            class="form-control"
                            value="<?= htmlspecialchars($_POST["categoria"] ?? "") ?>"
                            required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Preço</label>

                        <input
                            type="number"
                            name="preco"
                            class="form-control"
                            step="0.01"
                            min="0"
                            value="<?= htmlspecialchars($_POST["preco"] ?? "") ?>"
                            required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Estoque</label>

                        <input
                            type="number"
                            name="estoque"
                            class="form-control"
                            min="0"
                            value="<?= htmlspecialchars($_POST["estoque"] ?? "0") ?>">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Descrição</label>

                        <textarea
                            name="descricao"
                            class="form-control"
                            rows="4"><?= htmlspecialchars($_POST["descricao"] ?? "") ?></textarea>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Imagem</label>

                        <input
                            type="text"
                            name="imagem_url"
                            class="form-control"
                            placeholder="exemplo.jpg"
                            value="<?= htmlspecialchars($_POST["imagem_url"] ?? "") ?>">
                    </div>

                    <button
                        type="submit"
                        class="btn btn-danger">
                        Cadastrar Produto
                    </button>

                    <a
                        href="listar.php"
                        class="btn btn-secondary">
                        Voltar
                    </a>

                </form>

            </div>
        </div>
    </div>

</body>

</html>