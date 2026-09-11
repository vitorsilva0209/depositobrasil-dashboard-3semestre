<?php

include("../../config/conexao.php");

$id = (int) ($_GET['id'] ?? 0);

$stmt = $conn->prepare(
    "SELECT id FROM funcionarios WHERE id = ?"
);

$stmt->bind_param("i", $id);
$stmt->execute();

$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {

    echo "<script>

        alert('Funcionário não encontrado.');

        window.location='listar.php';

    </script>";

    exit();
}

$stmt = $conn->prepare(
    "DELETE FROM funcionarios WHERE id = ?"
);

$stmt->bind_param("i", $id);

if ($stmt->execute()) {

    echo "<script>

        alert('Funcionário excluído com sucesso!');

        window.location='listar.php';

    </script>";

} else {

    echo "<script>

        alert('Não foi possível excluir o funcionário.');

        window.location='listar.php';

    </script>";
}