<?php

include("../../config/conexao.php");

if (isset($_POST['salvar'])) {

    $nome = trim($_POST['nome']);
    $email = trim($_POST['email']);
    $telefone = trim($_POST['telefone']);

    $stmt = $conn->prepare(
        "SELECT id FROM clientes WHERE email = ?"
    );

    $stmt->bind_param("s", $email);
    $stmt->execute();

    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {

        $erro = "Cliente com este e-mail já está cadastrado.";

    } else {

        $stmt = $conn->prepare(
            "INSERT INTO clientes (nome, email, telefone)
             VALUES (?, ?, ?)"
        );

        $stmt->bind_param(
            "sss",
            $nome,
            $email,
            $telefone
        );

        if ($stmt->execute()) {

            header("Location: listar.php");
            exit();

        } else {

            $erro = "Erro ao cadastrar cliente.";
        }
    }

    $stmt->close();
}

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Novo Cliente</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

<div class="container mt-5">

<h2>Novo Cliente</h2>

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
E-mail
</label>

<input
type="email"
name="email"
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
class="form-control"
>

</div>

<button
type="submit"
name="salvar"
class="btn btn-success"
>
Salvar Cliente
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