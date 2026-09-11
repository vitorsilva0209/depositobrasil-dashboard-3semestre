<?php

include("../../config/conexao.php");

$sql = "SELECT * FROM clientes ORDER BY id DESC";
$resultado = $conn->query($sql);

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Clientes - Depósito Brasil</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

<div class="container mt-5">

<div class="d-flex justify-content-between align-items-center mb-4">

<h2>Clientes</h2>

<a href="cadastrar.php" class="btn btn-success">
Novo Cliente
</a>

</div>

<table class="table table-bordered table-hover">

<thead class="table-dark">

<tr>

<th>ID</th>
<th>Nome</th>
<th>E-mail</th>
<th>Telefone</th>
<th>Ações</th>

</tr>

</thead>

<tbody>

<?php if ($resultado && $resultado->num_rows > 0): ?>

<?php while ($cliente = $resultado->fetch_assoc()): ?>

<tr>

<td>
<?= $cliente['id']; ?>
</td>

<td>
<?= htmlspecialchars($cliente['nome']); ?>
</td>

<td>
<?= htmlspecialchars($cliente['email'] ?? ''); ?>
</td>

<td>
<?= htmlspecialchars($cliente['telefone'] ?? ''); ?>
</td>

<td>

<a
href="editar.php?id=<?= $cliente['id']; ?>"
class="btn btn-primary btn-sm"
>
Editar
</a>

<button type="button"
        class="btn btn-danger"
        onclick="excluir(<?= $cliente['id']; ?>)">
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

<a href="../../dashboard.php" class="btn btn-secondary">
Voltar para Dashboard
</a>

</div>

</body>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
function excluir(id) {
    Swal.fire({
        title: "Você tem certeza?",
        text: "O cliente será excluído.",
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