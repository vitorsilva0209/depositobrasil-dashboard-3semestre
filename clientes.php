<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: login.php");
    exit();
}


include("../../config/conexao.php");

$mensagem = "";

if (isset($_POST['cadastrar'])) {

    $nome = trim($_POST['nome']);
    $email = trim($_POST['email']);
    $telefone = trim($_POST['telefone']);

    if (!empty($nome) && !empty($email) && !empty($telefone)) {

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

            header("Location: clientes.php");
            exit();

        } else {

            $mensagem = "Erro ao cadastrar cliente: " . $conn->error;

        }

        $stmt->close();

    } else {

        $mensagem = "Preencha todos os campos!";

    }
}

if (isset($_GET['excluir'])) {

    $id_excluir = (int) $_GET['excluir'];

    $stmt = $conn->prepare(
        "DELETE FROM clientes WHERE id = ?"
    );

    $stmt->bind_param(
        "i",
        $id_excluir
    );

    $stmt->execute();

    $stmt->close();

    header("Location: clientes.php");
    exit();
}

$res = $conn->query(
    "SELECT * FROM clientes ORDER BY id DESC"
);

?>

<!DOCTYPE html>

<html lang="pt-br">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Clientes - Depósito Brasil</title>

    <style>

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            display: flex;
            background: #f4f6f9;
            min-height: 100vh;
            color: #333;
        }

        .sidebar {
            width: 220px;
            background: #1e1e1e;
            color: #fff;
            min-height: 100vh;
            padding-top: 20px;
        }

        .sidebar h2 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 20px;
            letter-spacing: 1px;
        }

        .sidebar a {
            display: block;
            padding: 12px 20px;
            color: #b0b0b0;
            text-decoration: none;
            font-size: 15px;
            transition: 0.3s;
        }

        .sidebar a:hover,
        .sidebar a.active {
            background: #d32f2f;
            color: #fff;
            font-weight: bold;
        }

        .content {
            flex: 1;
        }

        .header {
            background: #d32f2f;
            color: #fff;
            padding: 15px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .header .user-info {
            font-weight: 500;
        }

        .header a {
            background: #fff;
            color: #d32f2f;
            padding: 6px 15px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
            transition: 0.2s;
        }

        .header a:hover {
            background: #f8f9fa;
        }

        .main {
            padding: 30px;
        }

        .card {
            background: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 20px;
            border-top: 3px solid #d32f2f;
        }

        .card h3 {
            margin-bottom: 15px;
            color: #1e1e1e;
        }

        .form-inline {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .form-inline input {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            flex: 1;
            min-width: 180px;
            font-size: 14px;
        }

        .form-inline input:focus {
            border-color: #d32f2f;
            outline: none;
        }

        .btn-add {
            background: #28a745;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: 0.2s;
        }

        .btn-add:hover {
            background: #218838;
        }

        .alert-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }

        th {
            background: #f8f9fa;
            color: #495057;
            font-weight: 600;
        }

        tr:hover {
            background-color: #f1f1f1;
        }

        .btn-delete {
            color: #d32f2f;
            text-decoration: none;
            font-weight: bold;
        }

        .btn-delete:hover {
            text-decoration: underline;
        }

    </style>

</head>

<body>

    <div class="sidebar">

        <h2>Painel</h2>

        <a href="dashboard.php">
            Dashboard
        </a>

        <a href="produtos.php">
            Produtos
        </a>

        <a href="clientes.php" class="active">
            Clientes
        </a>

        <a href="funcionarios.php">
            Funcionários
        </a>

      

    </div>

    <div class="content">

        <div class="header">

            <h3>
                Depósito Brasil
            </h3>

            <div class="user-info">

                <span>
                    Olá,
                    <?php echo htmlspecialchars($_SESSION["nome"]); ?>
                </span>

                <a href="logout.php">
                    Sair
                </a>

            </div>

        </div>

        <div class="main">

            <h2>
                Gerenciar Clientes
            </h2>

            <br>

            <?php if (!empty($mensagem)): ?>

                <div class="alert-error">

                    <?php echo htmlspecialchars($mensagem); ?>

                </div>

            <?php endif; ?>

            <div class="card">

                <h3>
                    Cadastrar Novo Cliente
                </h3>

                <form method="POST" class="form-inline">

                    <input
                        type="text"
                        name="nome"
                        placeholder="Nome Completo"
                        required
                    >

                    <input
                        type="email"
                        name="email"
                        placeholder="E-mail"
                        required
                    >

                    <input
                        type="text"
                        name="telefone"
                        placeholder="Telefone / WhatsApp"
                        required
                    >

                    <button
                        type="submit"
                        name="cadastrar"
                        class="btn-add"
                    >
                        Adicionar
                    </button>

                </form>

            </div>

            <div class="card">

                <h3>
                    Lista de Clientes
                </h3>

                <table>

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Telefone</th>
                            <th>Ações</th>

                        </tr>

                    </thead>

                    <tbody>

                        <?php if ($res && $res->num_rows > 0): ?>

                            <?php while ($c = $res->fetch_assoc()): ?>

                                <tr>

                                    <td>
                                        #<?php echo $c['id']; ?>
                                    </td>

                                    <td>
                                        <?php
                                        echo htmlspecialchars($c['nome']);
                                        ?>
                                    </td>

                                    <td>
                                        <?php
                                        echo htmlspecialchars($c['email']);
                                        ?>
                                    </td>

                                    <td>
                                        <?php
                                        echo htmlspecialchars($c['telefone']);
                                        ?>
                                    </td>

                                    <td>

                                        <a
                                            href="clientes.php?excluir=<?php echo $c['id']; ?>"
                                            class="btn-delete"
                                            onclick="return confirm('Tem certeza que deseja excluir este cliente?');"
                                        >
                                            Excluir
                                        </a>

                                    </td>

                                </tr>

                            <?php endwhile; ?>

                        <?php else: ?>

                            <tr>

                                <td
                                    colspan="5"
                                    style="text-align: center; color: #888;"
                                >
                                    Nenhum cliente cadastrado ainda.
                                </td>

                            </tr>

                        <?php endif; ?>

                    </tbody>

                </table>

            </div>

        </div>

    </div>

</body>

</html>