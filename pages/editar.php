<?php

include("../../config/conexao.php");

$id = (int) ($_GET['id'] ?? 0);

$stmt = $conn->prepare(
    "SELECT * FROM clientes WHERE id = ?"
);

$stmt->bind_param("i", $id);
$stmt->execute();

$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {

    echo "<script>
        alert('Cliente não encontrado.');
        window.location='listar.php';
    </script>";

    exit();
}

$cliente = $resultado->fetch_assoc();

if (isset($_POST['editar'])) {

    $nome = trim($_POST['nome']);
    $email = trim($_POST['email']);
    $telefone = trim($_POST['telefone']);

    $stmt = $conn->prepare(
        "UPDATE clientes
         SET nome = ?, email = ?, telefone = ?
         WHERE id = ?"
    );

    $stmt->bind_param(
        "sssi",
        $nome,
        $email,
        $telefone,
        $id
    );

    if ($stmt->execute()) {

        header("Location: listar.php");
        exit();

    } else {

        $erro = "Erro ao atualizar cliente.";
    }
}

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Editar Cliente</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

<div class="container mt-5">

<h2>Editar Cliente</h2>

<?php if (isset($erro)): ?>

<div class="alert alert-danger">

<?= htmlspecialchars($erro); ?>

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
value="<?= htmlspecialchars($cliente['nome']); ?>"
class="form-control"
required
>

</div>

<div class="mb-3">

<label class="form-label">
E-mail
</label>

<input
type="email"
name="email"
value="<?= htmlspecialchars($cliente['email'] ?? ''); ?>"
class="form-control"
required
>

</div>

<div class="mb-3">

<label class="form-label">
Telefone
</label>

<input
type="text"
name="telefone"
value="<?= htmlspecialchars($cliente['telefone'] ?? ''); ?>"
class="form-control"
>

</div>

<button
type="submit"
name="editar"
class="btn btn-primary"
>
Atualizar
</button>

<a
href="listar.php"
class="btn btn-secondary"
>
Cancelar
</a>

</form>

</div>

</body>
<link href="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.css" rel="stylesheet">

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.js"></script>

<script>
$(document).ready(function() {
    $('#descricao').summernote({
        height: 200
    });
});
</script>
</html>