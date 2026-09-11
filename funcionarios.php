<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: login.php");
    exit();
}

require_once("config/dados.php");

?>

<!DOCTYPE html>
<html lang="pt-br">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Funcionários - Depósito Brasil</title>

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


        /* MENU LATERAL */

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
            margin-bottom: 10px;
            color: #1e1e1e;
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


    

        .codigo {
            color: #666;
            font-style: italic;
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

        <a href="clientes.php">
            Clientes
        </a>

        <a href="funcionarios.php" class="active">
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
                Funcionários
            </h2>

            <br>



            <div class="card">

                <h3>
                    Funcionários do Depósito Brasil
                </h3>

                <p>
                    Os funcionários são cadastrados diretamente no código do sistema.
                </p>

            </div>



          

            <div class="card">

                <h3>
                    Lista de Funcionários
                </h3>


                <table>

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>Nome</th>

                            <th>Cargo</th>

                            <th>Salário</th>

                            

                        </tr>

                    </thead>


                    <tbody>


                        <?php if (!empty($funcionarios)): ?>


                            <?php foreach ($funcionarios as $f): ?>

                                <tr>

                                    <td>
                                        #<?php echo $f["id"]; ?>
                                    </td>


                                    <td>
                                        <?php
                                        echo htmlspecialchars($f["nome"]);
                                        ?>
                                    </td>


                                    <td>
                                        <?php
                                        echo htmlspecialchars($f["cargo"]);
                                        ?>
                                    </td>


                                    <td>

                                        R$

                                        <?php

                                        echo number_format(
                                            $f["salario"],
                                            2,
                                            ",",
                                            "."
                                        );

                                        ?>

                                    </td>


                               

                                </tr>


                            <?php endforeach; ?>


                        <?php else: ?>


                            <tr>

                                <td
                                    colspan="5"
                                    style="text-align:center; color:#888;"
                                >

                                    Nenhum funcionário cadastrado.

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