<?php

include("../../config/conexao.php");

$sql = "SELECT * FROM funcionarios ORDER BY id DESC";
$resultado = $conn->query($sql);

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Funcionários - Depósito Brasil</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

<div class="container mt-5">

<div class="d-flex justify-content-between align-items-center mb-4">

<h2>Funcionários</h2>

<a href="cadastrar.php" class="btn btn-success">
Novo Funcionário
</a>

</div>

<table class="table table-bordered table-hover">

<thead class="table-dark">

<tr>

<th>ID</th>
<th>Nome</th>
<th>Cargo</th>
<th>Salário</th>
<th>Ações</th>

</tr>

</thead>

<tbody>

<?php if ($resultado && $resultado->num_rows > 0): ?>

<?php while ($funcionario = $resultado->fetch_assoc()): ?>

<tr>

<td>
<?= $funcionario['id']; ?>
</td>

<td>
<?= htmlspecialchars($funcionario['nome']); ?>
</td>

<td>
<?= htmlspecialchars($funcionario['cargo']); ?>
</td>

<td>
R$ <?= number_format($funcionario['salario'], 2, ',', '.'); ?>
</td>

<td>

<a
href="editar.php?id=<?= $funcionario['id']; ?>"
class="btn btn-primary btn-sm"
>
Editar
</a>

<button type="button"
        class="btn btn-danger"
        onclick="excluir(<?= $funcionario['id']; ?>)">
    Excluir
</button>

</td>

</tr>

<?php endwhile; ?>

<?php else: ?>

<tr>

<td colspan="5" class="text-center">

Nenhum funcionário cadastrado.

</td>

</tr>

<?php endif; ?>

</tbody>

</table>

<a
href="../../dashboard.php"
class="btn btn-secondary"
>
Voltar para Dashboard
</a>

</div>

</body>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
function excluir(id) {
    Swal.fire({
        title: "Você tem certeza?",
        text: "O funcionário será excluído.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Excluir",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "excluir.php?id=" + id;
        }
    });
}
</script>
</html>