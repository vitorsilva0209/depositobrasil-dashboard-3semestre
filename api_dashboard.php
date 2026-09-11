<?php

header("Content-Type: application/json; charset=UTF-8");

include("config/conexao.php");

try {

    $produtos = [];

    $resultado = $conn->query(
        "CALL sp_buscar_produtos('', 100, 0)"
    );

    if (!$resultado) {
        throw new Exception($conn->error);
    }

    while ($produto = $resultado->fetch_assoc()) {

        $produtos[] = [
            "id" => (int)$produto["id"],
            "nome" => $produto["nome"],
            "categoria" => $produto["categoria"],
            "preco" => (float)$produto["preco"],
            "estoque" => (int)$produto["estoque"],
            "quantidadeVendida" =>
                (int)$produto["quantidade_vendida"]
        ];
    }

    $resultado->free();

    while ($conn->more_results()) {

        $conn->next_result();

        if ($resultado = $conn->store_result()) {
            $resultado->free();
        }
    }

    $resultadoProdutos = $conn->query(
        "SELECT COUNT(*) AS total FROM produtos"
    );

    if (!$resultadoProdutos) {
        throw new Exception($conn->error);
    }

    $totalProdutos =
        (int)$resultadoProdutos->fetch_assoc()["total"];


    $resultadoClientes = $conn->query(
        "SELECT COUNT(*) AS total FROM clientes"
    );

    if (!$resultadoClientes) {
        throw new Exception($conn->error);
    }

    $totalClientes =
        (int)$resultadoClientes->fetch_assoc()["total"];


    $resultadoFuncionarios = $conn->query(
        "SELECT COUNT(*) AS total FROM funcionarios"
    );

    if (!$resultadoFuncionarios) {
        throw new Exception($conn->error);
    }

    $totalFuncionarios =
        (int)$resultadoFuncionarios->fetch_assoc()["total"];


    echo json_encode([
        "sucesso" => true,
        "produtos" => $produtos,
        "totalProdutos" => $totalProdutos,
        "totalClientes" => $totalClientes,
        "totalFuncionarios" => $totalFuncionarios
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}