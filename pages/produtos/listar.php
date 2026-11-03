<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: ../../login.php");
    exit();
}

include("../../config/conexao.php");

$porPagina = 5;

$pagina = (int)($_GET["pagina"] ?? 1);

if ($pagina < 1) {
    $pagina = 1;
}

$inicio = ($pagina - 1) * $porPagina;

$resultadoTotal = $conn->query(
    "SELECT COUNT(*) AS total FROM produtos"
);

if (!$resultadoTotal) {
    die("Erro ao contar produtos: " . $conn->error);
}

$totalProdutos = (int)$resultadoTotal->fetch_assoc()["total"];

$totalPaginas = ceil($totalProdutos / $porPagina);

$sql = "
    SELECT *
    FROM produtos
    ORDER BY id DESC
    LIMIT $porPagina OFFSET $inicio
";

$resultado = $conn->query($sql);

if (!$resultado) {
    die("Erro ao consultar produtos: " . $conn->error);
}

$imagens = [
    "Cimento CP-II" => "cimento-cp-ii.jpg",
    "Tijolo Cerâmico" => "tijolo-ceramico.jpg",
    "Areia Média" => "areia-media.jpg",
    "Brita 1" => "brita-1.jpg",
    "Telha Cerâmica" => "telha-ceramica.jpg",
    "Tinta Acrílica" => "tinta-acrilica.jpg",
    "Argamassa" => "argamassa.jpg",
    "Piso Cerâmico" => "piso-ceramico.jpg",
    "Tubo PVC 100mm" => "tubo-pvc-100mm.jpg",
    "Ferro 10mm" => "ferro-10mm.jpg"
];

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Lista de Produtos</title>

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

</head>

<body>

<div class="container mt-5">

    <div class="d-flex justify-content-between align-items-center mb-4">

        <h2>
            Produtos
        </h2>

        <a
            href="cadastrar.php"
            class="btn btn-success"
        >
            Cadastrar Produto
        </a>

    </div>

    <div class="table-responsive">

        <table class="table table-bordered table-striped align-middle">

            <thead class="table-dark">

                <tr>

                    <th>ID</th>

                    <th>Imagem</th>

                    <th>Nome</th>

                    <th>Categoria</th>

                    <th>Preço</th>

                    <th>Quantidade</th>

                    <th>Ações</th>

                </tr>

            </thead>

            <tbody>

            <?php if ($resultado->num_rows > 0): ?>

                <?php while ($produto = $resultado->fetch_assoc()): ?>

                    <?php

                    $nomeProduto = $produto["nome"] ?? "";

                    $imagem = $produto["imagem_url"] ?? "";

                    if (
                        $imagem === "" &&
                        isset($imagens[$nomeProduto])
                    ) {
                        $imagem = $imagens[$nomeProduto];
                    }

                    $quantidade =
                        $produto["quantidade"]
                        ?? $produto["estoque"]
                        ?? 0;

                    ?>

                    <tr>

                        <td>
                            <?= (int)$produto["id"] ?>
                        </td>

                        <td>

                            <?php if ($imagem !== ""): ?>

                                <img
                                    src="<?= htmlspecialchars($imagem) ?>"
                                    alt="<?= htmlspecialchars($nomeProduto) ?>"
                                    width="70"
                                    height="70"
                                    style="object-fit: cover;"
                                    class="rounded"
                                >

                            <?php else: ?>

                                Sem imagem

                            <?php endif; ?>

                        </td>

                        <td>
                            <?= htmlspecialchars($nomeProduto) ?>
                        </td>

                        <td>
                            <?= htmlspecialchars(
                                $produto["categoria"] ?? ""
                            ) ?>
                        </td>

                        <td>
                            R$
                            <?= number_format(
                                (float)($produto["preco"] ?? 0),
                                2,
                                ",",
                                "."
                            ) ?>
                        </td>

                        <td>
                            <?= (int)$quantidade ?>
                        </td>

                        <td>

                            <a
                                href="editar.php?id=<?= (int)$produto["id"] ?>"
                                class="btn btn-warning btn-sm"
                            >
                                Editar
                            </a>

                            <button
                                type="button"
                                class="btn btn-danger btn-sm"
                                onclick="excluir(<?= (int)$produto["id"] ?>)"
                            >
                                Excluir
                            </button>

                        </td>

                    </tr>

                <?php endwhile; ?>

            <?php else: ?>

                <tr>

                    <td
                        colspan="7"
                        class="text-center"
                    >
                        Nenhum produto encontrado.
                    </td>

                </tr>

            <?php endif; ?>

            </tbody>

        </table>

    </div>

    <?php if ($totalPaginas > 1): ?>

        <nav aria-label="Paginação">

            <ul class="pagination justify-content-center">

                <?php if ($pagina > 1): ?>

                    <li class="page-item">

                        <a
                            class="page-link"
                            href="?pagina=<?= $pagina - 1 ?>"
                        >
                            Anterior
                        </a>

                    </li>

                <?php endif; ?>


                <?php for (
                    $i = 1;
                    $i <= $totalPaginas;
                    $i++
                ): ?>

                    <li
                        class="page-item
                        <?= $i === $pagina ? "active" : "" ?>"
                    >

                        <a
                            class="page-link"
                            href="?pagina=<?= $i ?>"
                        >
                            <?= $i ?>
                        </a>

                    </li>

                <?php endfor; ?>


                <?php if ($pagina < $totalPaginas): ?>

                    <li class="page-item">

                        <a
                            class="page-link"
                            href="?pagina=<?= $pagina + 1 ?>"
                        >
                            Próxima
                        </a>

                    </li>

                <?php endif; ?>

            </ul>

        </nav>

    <?php endif; ?>

</div>


<script>

function excluir(id) {

    Swal.fire({

        title: "Tem certeza?",

        text: "O produto será excluído.",

        icon: "warning",

        showCancelButton: true,

        confirmButtonText: "Sim, excluir",

        cancelButtonText: "Cancelar"

    }).then((resultado) => {

        if (resultado.isConfirmed) {

            window.location =
                "excluir.php?id=" + id;

        }

    });

}

</script>

</body>

</html>