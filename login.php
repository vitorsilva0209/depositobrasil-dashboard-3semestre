<?php

session_start();

if (isset($_SESSION["id"])) {
    header("Location: dashboard.php");
    exit();
}



include("config/conexao.php");

$erro = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $usuario = trim($_POST["usuario"] ?? "");
    $senha = trim($_POST["senha"] ?? "");

    if ($usuario === "" || $senha === "") {

        $erro = "Preencha todos os campos!";

    } else {

        $stmt = $conn->prepare(
            "SELECT id, nome, senha
             FROM usuarios
             WHERE usuario = ?"
        );

        if (!$stmt) {

            $erro = "Erro ao preparar consulta: " . $conn->error;

        } else {

            $stmt->bind_param("s", $usuario);

            $stmt->execute();

            $resultado = $stmt->get_result();

            if ($resultado->num_rows > 0) {

                $user = $resultado->fetch_assoc();

            
                if ($senha === $user["senha"]) {

                    $_SESSION["id"] = $user["id"];
                    $_SESSION["nome"] = $user["nome"];

                    header("Location: dashboard.php");
                    exit();

                } else {

                    $erro = "Senha incorreta!";
                }

            } else {

                $erro = "Usuário não encontrado!";
            }

            $stmt->close();
        }
    }
}

?>

<!DOCTYPE html>

<html lang="pt-br">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Login - Depósito Brasil</title>

<style>

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
}

body {

    min-height: 100vh;

    display: flex;

    justify-content: center;

    align-items: center;

    background: #2b2b2b;
}

.login-card {

    width: 100%;

    max-width: 380px;

    background: white;

    padding: 30px;

    border-radius: 10px;

    box-shadow: 0 5px 20px rgba(0,0,0,0.4);
}

.login-card h2 {

    text-align: center;

    margin-bottom: 25px;

    color: #333;
}

.form-group {

    margin-bottom: 18px;
}

.form-group label {

    display: block;

    margin-bottom: 6px;

    font-weight: bold;

    color: #333;
}

.form-group input {

    width: 100%;

    padding: 11px;

    border: 2px solid #d32f2f;

    border-radius: 5px;

    outline: none;
}

.form-group input:focus {

    border-color: #a00000;
}

.btn-login {

    width: 100%;

    padding: 11px;

    border: none;

    border-radius: 5px;

    background: #d32f2f;

    color: white;

    font-size: 16px;

    font-weight: bold;

    cursor: pointer;
}

.btn-login:hover {

    background: #a00000;
}

.alert {

    background: #f8d7da;

    color: #721c24;

    padding: 10px;

    border-radius: 5px;

    margin-bottom: 15px;

    text-align: center;
}

</style>

</head>

<body>

<div class="login-card">

    <h2>Entrar no Sistema</h2>

    <?php if ($erro !== ""): ?>

        <div class="alert">

            <?= htmlspecialchars($erro); ?>

        </div>

    <?php endif; ?>

    <form method="POST">

        <div class="form-group">

            <label for="usuario">
                Usuário
            </label>

            <input
                type="text"
                id="usuario"
                name="usuario"
                required
            >

        </div>

        <div class="form-group">

            <label for="senha">
                Senha
            </label>

            <input
                type="password"
                id="senha"
                name="senha"
                required
            >

        </div>

        <button
            type="submit"
            class="btn-login"
        >

            Entrar

        </button>

    </form>

</div>

</body>

</html>