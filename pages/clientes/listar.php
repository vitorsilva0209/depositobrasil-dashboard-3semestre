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
    "SELECT COUNT(*) AS total FROM clientes"
);

if (!$resultadoTotal) {
    die("Erro ao contar clientes: " . $conn->error);
}

$totalClientes = (int)$resultadoTotal->fetch_assoc()["total"];

$totalPaginas = ceil($totalClientes / $porPagina);

$sql = "
    SELECT *
    FROM clientes
    ORDER BY id DESC
    LIMIT $porPagina OFFSET $inicio
";

$resultado = $conn->query($sql);

if (!$resultado) {
    die("Erro ao consultar clientes: " . $conn->error);
}

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Clientes - Depósito Brasil</title>

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
    max-width: 1200px;
    margin-top: 40px;
}

.card {
    background: #ffffff;
    border: none;
    border-top: 5px solid #d32f2f;
    border-radius: 10px;
    padding: 25px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

h2 {
    color: #333333;
    font-weight: 700;
}

.table {
    margin-top: 20px;
    vertical-align: middle;
}

.table thead th {
    background: #212529;
    color: white;
    border-color: #444;
}

.table tbody tr:hover {
    background: #f5f5f5;
}

.btn-novo {
    background: #d32f2f;
    color: white;
    border: none;
}

.btn-novo:hover {
    background: #a92323;
    color: white;
}

.btn-editar {
    background: #555555;
    color: white;
    border: none;
}

.btn-editar:hover {
    background: #333333;
    color: white;
}

.btn-excluir {
    background: #d32f2f;
    color: white;
    border: none;
}

.btn-excluir:hover {
    background: #a92323;
    color: white;
}

.btn-dashboard {
    background: #343a40;
    color: white;
    border: none;
}

.btn-dashboard:hover {
    background: #212529;
    color: white;
}

</style>

</head>

<body>

<div class="container">

    <div class="card">

        <div class="d-flex justify-content-between align-items-center mb-4">

            <h2>Clientes</h2>

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
                    + Novo Cliente
                </a>

            </div>

        </div>

        <div class="table-responsive">

            <table class="table table-bordered table-hover">

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Telefone</th>
                        <th>Ações</th>

                    </tr>

                </thead>

                <tbody>

                <?php if ($resultado->num_rows > 0): ?>

                    <?php while ($cliente = $resultado->fetch_assoc()): ?>

                        <tr>

                            <td>
                                <?= (int)$cliente['id']; ?>
                            </td>

                            <td>
                                <strong>
                                    <?= htmlspecialchars($cliente['nome']); ?>
                                </strong>
                            </td>

                            <td>
                                <?= htmlspecialchars($cliente['email'] ?? ''); ?>
                            </td>

                            <td>
                                <?= htmlspecialchars($cliente['telefone'] ?? ''); ?>
                            </td>

                            <td>

                                <a
                                    href="editar.php?id=<?= (int)$cliente['id']; ?>"
                                    class="btn btn-editar btn-sm"
                                >
                                    Editar
                                </a>

                                <button
                                    type="button"
                                    class="btn btn-excluir btn-sm"
                                    onclick="excluir(<?= (int)$cliente['id']; ?>)"
                                >
                                    Excluir
                                </button>

                            </td>

                        </tr>

                    <?php endwhile; ?>

                <?php else: ?>

                    <tr>

                        <td colspan="5" class="text-center">

                            Nenhum cliente cadastrado.

                        </td>

                    </tr>

                <?php endif; ?>

                </tbody>

            </table>

        </div>

        <?php if ($totalPaginas > 1): ?>

            <nav class="mt-4">

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


                    <?php for ($i = 1; $i <= $totalPaginas; $i++): ?>

                        <li
                            class="page-item
                            <?= $i === $pagina ? 'active' : '' ?>"
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

</div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>

function excluir(id) {

    Swal.fire({

        title: "Você tem certeza?",

        text: "Esta ação não poderá ser desfeita.",

        icon: "warning",

        showCancelButton: true,

        confirmButtonText: "Excluir",

        cancelButtonText: "Cancelar",

        confirmButtonColor: "#d32f2f",

        cancelButtonColor: "#555555"

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