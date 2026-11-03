<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: ../../login.php");
    exit();
}

include("../../config/conexao.php");

$id = (int)($_GET["id"] ?? 0);

if ($id <= 0) {

    echo "<script>
        alert('ID da venda inválido.');
        window.location='listar.php';
    </script>";

    exit();
}

$stmt = $conn->prepare(
    "SELECT id FROM vendas WHERE id = ?"
);

$stmt->bind_param("i", $id);
$stmt->execute();

$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {

    $stmt->close();

    echo "<script>
        alert('Venda não encontrada.');
        window.location='listar.php';
    </script>";

    exit();
}

$stmt->close();

$stmt = $conn->prepare(
    "DELETE FROM vendas WHERE id = ?"
);

$stmt->bind_param("i", $id);

if ($stmt->execute()) {

    echo "<script>
        alert('Venda excluída com sucesso!');
        window.location='listar.php';
    </script>";

} else {

    echo "<script>
        alert('Não foi possível excluir a venda.');
        window.location='listar.php';
    </script>";
}

$stmt->close();

$conn->close();

?>