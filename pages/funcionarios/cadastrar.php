<?php

include("../../config/conexao.php");

if (isset($_POST['salvar'])) {

    $nome = trim($_POST['nome']);
    $cargo = trim($_POST['cargo']);
    $salario = (float) $_POST['salario'];

    $stmt = $conn->prepare(
        "INSERT INTO funcionarios (nome, cargo, salario)
         VALUES (?, ?, ?)"
    );

    $stmt->bind_param(
        "ssd",
        $nome,
        $cargo,
        $salario
    );

    if ($stmt->execute()) {

        header("Location: listar.php");
        exit();

    } else {

        $erro = "Erro ao cadastrar funcionário.";
    }

    $stmt->close();
}

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Novo Funcionário</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

<div class="container mt-5">

<h2>Novo Funcionário</h2>

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
class="form-control"
required
>

</div>

<div class="mb-3">

<label class="form-label">
Cargo
</label>

<input
type="text"
name="cargo"
class="form-control"
required
>

</div>

<div class="mb-3">

<label class="form-label">
Salário
</label>

<input
type="number"
step="0.01"
min="0"
name="salario"
class="form-control"
required
>

</div>

<button
type="submit"
name="salvar"
class="btn btn-success"
>
Salvar Funcionário
</button>

<a
href="listar.php"
class="btn btn-secondary"
>
Voltar
</a>

</form>

</div>

</body>

</html>