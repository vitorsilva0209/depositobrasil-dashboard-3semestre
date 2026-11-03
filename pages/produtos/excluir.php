<?php

include("../../config/conexao.php");

$id = (int)($_GET["id"] ?? 0);

if ($id <= 0) {

    echo "<script>
        alert('ID do produto inválido.');
        window.location='listar.php';
    </script>";

    exit();

}

$stmt = $conn->prepare(
    "SELECT id FROM produtos WHERE id = ?"
);

$stmt->bind_param(
    "i",
    $id
);

$stmt->execute();

$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {

    $stmt->close();

    echo "<script>
        alert('Produto não encontrado.');
        window.location='listar.php';
    </script>";

    exit();

}

$stmt->close();

$stmt = $conn->prepare(
    "DELETE FROM produtos WHERE id = ?"
);

$stmt->bind_param(
    "i",
    $id
);

if ($stmt->execute()) {

    echo "<script>

        alert('Produto excluído com sucesso!');

        window.location='listar.php';

    </script>";

} else {

    echo "<script>

        alert('Não foi possível excluir o produto.');

        window.location='listar.php';

    </script>";

}

$stmt->close();

$conn->close();