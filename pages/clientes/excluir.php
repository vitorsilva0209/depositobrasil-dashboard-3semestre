<?php

include("../../config/conexao.php");

$id = (int) ($_GET['id'] ?? 0);

$stmt = $conn->prepare(
    "SELECT id FROM clientes WHERE id = ?"
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

$stmt = $conn->prepare(
    "DELETE FROM clientes WHERE id = ?"
);

$stmt->bind_param("i", $id);

if ($stmt->execute()) {

    echo "<script>

        alert('Cliente excluído com sucesso!');

        window.location='listar.php';

    </script>";

} else {

    echo "<script>

        alert('Não foi possível excluir o cliente.');

        window.location='listar.php';

    </script>";
}