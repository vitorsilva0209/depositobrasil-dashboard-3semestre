<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: ../../login.php");
    exit();
}

include("../../config/conexao.php");

$porPagina = 5;

$pagina = isset($_GET["pagina"]) ? (int)$_GET["pagina"] : 1;

if ($pagina < 1) {
    $pagina = 1;
}

$totalResultado = $conn->query(
    "SELECT COUNT(*) AS total FROM vendas"
);

$total = (int)$totalResultado->fetch_assoc()["total"];

$totalPaginas = max(1, ceil($total / $porPagina));

if ($pagina > $totalPaginas) {
    $pagina = $totalPaginas;
}

$offset = ($pagina - 1) * $porPagina;

$stmt = $conn->prepare(
    "SELECT
        v.id,
        v.produto_id,
        p.nome AS produto,
        v.quantidade,
        v.data_venda
     FROM vendas v
     INNER JOIN produtos p
        ON p.id = v.produto_id
     ORDER BY v.id DESC
     LIMIT ? OFFSET ?"
);

$stmt->bind_param("ii", $porPagina, $offset);
$stmt->execute();

$resultado = $stmt->get_result();

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Vendas</title>

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <style>

        body {
            background: #f5f5f5;
        }

        .card {
            border-radius: 15px;
            margin-top: 40px;
            padding: 25px;
        }

        h2 {
            color: #dc3545;
        }

        .btn-novo {
            background: #dc3545;
            color: white;
        }

        .btn-novo:hover {
            background: #bb2d3b;
            color: white;
        }

        .btn-dashboard {
            background: #6c757d;
            color: white;
        }

        .btn-dashboard:hover {
            background: #5c636a;
            color: white;
        }

    </style>

</head>

<body>

<div class="container">

    <div class="card shadow">

        <div class="d-flex justify-content-between align-items-center mb-4">

            <h2>Vendas</h2>

            <div>

                <a
                    href="../../dashboard.php"
                    class="btn btn-dashboard me-2"
                >
                    ← Dashboard
                </a>

                <a
                    href="cadastrar.php"
                    class="btn btn-novo"
                >
                    + Nova Venda
                </a>

            </div>

        </div>

        <div class="table-responsive">

            <table class="table table-striped table-hover">

                <thead class="table-dark">

                    <tr>

                        <th>ID</th>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Data da Venda</th>
                        <th>Ações</th>

                    </tr>

                </thead>

                <tbody>

                <?php if ($resultado->num_rows > 0): ?>

                    <?php while ($venda = $resultado->fetch_assoc()): ?>

                        <tr>

                            <td>
                                <?= $venda["id"] ?>
                            </td>

                            <td>
                                <?= htmlspecialchars($venda["produto"]) ?>
                            </td>

                            <td>
                                <?= $venda["quantidade"] ?>
                            </td>

                            <td>
                                <?= date(
                                    "d/m/Y",
                                    strtotime($venda["data_venda"])
                                ) ?>
                            </td>

                            <td>

                                <a
                                    href="editar.php?id=<?= $venda["id"] ?>"
                                    class="btn btn-warning btn-sm"
                                >
                                    Editar
                                </a>

                                <button
                                    type="button"
                                    class="btn btn-danger btn-sm"
                                    onclick="excluir(<?= $venda["id"] ?>)"
                                >
                                    Excluir
                                </button>

                            </td>

                        </tr>

                    <?php endwhile; ?>

                <?php else: ?>

                    <tr>

                        <td colspan="5" class="text-center">
                            Nenhuma venda cadastrada.
                        </td>

                    </tr>

                <?php endif; ?>

                </tbody>

            </table>

        </div>

        <?php if ($totalPaginas > 1): ?>

            <nav>

                <ul class="pagination justify-content-center">

                    <?php for ($i = 1; $i <= $totalPaginas; $i++): ?>

                        <li
                            class="page-item <?= $i == $pagina ? "active" : "" ?>"
                        >

                            <a
                                class="page-link"
                                href="?pagina=<?= $i ?>"
                            >
                                <?= $i ?>
                            </a>

                        </li>

                    <?php endfor; ?>

                </ul>

            </nav>

        <?php endif; ?>

    </div>

</div>

<script>

function excluir(id) {

    Swal.fire({
        title: "Tem certeza?",
        text: "Essa venda será excluída!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar"
    }).then((result) => {

        if (result.isConfirmed) {

            window.location.href =
                "excluir.php?id=" + id;

        }

    });

}

</script>

</body>

</html>