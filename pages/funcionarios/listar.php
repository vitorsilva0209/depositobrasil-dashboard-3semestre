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
    "SELECT COUNT(*) AS total FROM funcionarios"
);

if (!$resultadoTotal) {
    die("Erro ao contar funcionários: " . $conn->error);
}

$totalFuncionarios =
    (int)$resultadoTotal->fetch_assoc()["total"];

$totalPaginas = ceil(
    $totalFuncionarios / $porPagina
);

$sql = "
    SELECT *
    FROM funcionarios
    ORDER BY id DESC
    LIMIT $porPagina OFFSET $inicio
";

$resultado = $conn->query($sql);

if (!$resultado) {
    die("Erro ao consultar funcionários: " . $conn->error);
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

<title>Funcionários - Depósito Brasil</title>

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
    margin-bottom: 40px;
}

.card {
    border: none;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.card-header {
    background: #1f1f1f;
    color: white;
    padding: 20px 25px;
    border-top: 5px solid #d32f2f;
}

.card-header h2 {
    margin: 0;
    font-weight: bold;
}

.card-body {
    background: #ffffff;
    padding: 25px;
}

.table {
    margin-bottom: 0;
    vertical-align: middle;
}

.table thead {
    background: #1f1f1f;
    color: white;
}

.table thead th {
    background: #1f1f1f;
    color: white;
    padding: 15px;
}

.table tbody td {
    padding: 15px;
}

.table tbody tr:hover {
    background: #f5f5f5;
}

.btn-novo {
    background: #d32f2f;
    border-color: #d32f2f;
    color: white;
    font-weight: bold;
}

.btn-novo:hover {
    background: #b71c1c;
    border-color: #b71c1c;
    color: white;
}

.btn-editar {
    background: #555555;
    border-color: #555555;
    color: white;
}

.btn-editar:hover {
    background: #333333;
    border-color: #333333;
    color: white;
}

.btn-excluir {
    background: #d32f2f;
    border-color: #d32f2f;
    color: white;
}

.btn-excluir:hover {
    background: #b71c1c;
    border-color: #b71c1c;
    color: white;
}

.btn-dashboard {
    background: #1f1f1f;
    border-color: #1f1f1f;
    color: white;
}

.btn-dashboard:hover {
    background: #000000;
    border-color: #000000;
    color: white;
}

.nome-funcionario {
    font-weight: bold;
    color: #222222;
}

.salario {
    font-weight: bold;
    color: #d32f2f;
}

</style>

</head>

<body>

<div class="container">

    <div class="card">

        <div class="card-header">

            <div class="d-flex justify-content-between align-items-center">

                <h2>
                    Funcionários
                </h2>

                <a
                    href="cadastrar.php"
                    class="btn btn-novo"
                >
                    + Novo Funcionário
                </a>

            </div>

        </div>

        <div class="card-body">

            <div class="table-responsive">

                <table class="table table-bordered table-hover">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Nome</th>
                            <th>Cargo</th>
                            <th>Salário</th>
                            <th>Ações</th>

                        </tr>

                    </thead>

                    <tbody>

                    <?php if ($resultado->num_rows > 0): ?>

                        <?php while ($funcionario = $resultado->fetch_assoc()): ?>

                            <tr>

                                <td>
                                    <?= (int)$funcionario['id']; ?>
                                </td>

                                <td class="nome-funcionario">
                                    <?= htmlspecialchars($funcionario['nome']); ?>
                                </td>

                                <td>
                                    <?= htmlspecialchars($funcionario['cargo']); ?>
                                </td>

                                <td class="salario">

                                    R$

                                    <?= number_format(
                                        (float)$funcionario['salario'],
                                        2,
                                        ',',
                                        '.'
                                    ); ?>

                                </td>

                                <td>

                                    <a
                                        href="editar.php?id=<?= (int)$funcionario['id']; ?>"
                                        class="btn btn-editar btn-sm"
                                    >
                                        Editar
                                    </a>

                                    <button
                                        type="button"
                                        class="btn btn-excluir btn-sm"
                                        onclick="excluir(<?= (int)$funcionario['id']; ?>)"
                                    >
                                        Excluir
                                    </button>

                                </td>

                            </tr>

                        <?php endwhile; ?>

                    <?php else: ?>

                        <tr>

                            <td
                                colspan="5"
                                class="text-center"
                            >
                                Nenhum funcionário cadastrado.
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

            <div class="mt-4">

                <a
                    href="../../dashboard.php"
                    class="btn btn-dashboard"
                >
                    ← Voltar para Dashboard
                </a>

            </div>

        </div>

    </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>

function excluir(id) {

    Swal.fire({

        title: "Você tem certeza?",

        text: "O funcionário será excluído e esta ação não poderá ser desfeita.",

        icon: "warning",

        showCancelButton: true,

        confirmButtonColor: "#d32f2f",

        cancelButtonColor: "#555555",

        confirmButtonText: "Excluir",

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