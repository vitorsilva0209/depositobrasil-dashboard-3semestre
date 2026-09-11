<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: login.php");
    exit();
}

include("config/conexao.php");

$resProdutos = $conn->query("
    SELECT
        id,
        nome,
        categoria,
        preco,
        estoque,
        descricao,
        imagem_url
    FROM produtos
    ORDER BY id DESC
");

?>

<!DOCTYPE html>
<html lang="pt-br">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Produtos - Depósito Brasil</title>

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
        }

        .sidebar a {
            display: block;
            padding: 12px 20px;
            color: #b0b0b0;
            text-decoration: none;
            font-size: 15px;
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
        }

        .header a {
            background: #fff;
            color: #d32f2f;

            padding: 6px 15px;

            border-radius: 4px;

            text-decoration: none;

            font-weight: bold;

            margin-left: 10px;
        }

        .main {
            padding: 30px;
        }

     

        .card {
            background: #fff;

            border-radius: 8px;

            padding: 20px;

            box-shadow:
                0 2px 8px rgba(0,0,0,0.08);

            margin-bottom: 20px;

            border-top: 3px solid #d32f2f;
        }

  

        table {
            width: 100%;

            border-collapse: collapse;

            margin-top: 15px;
        }

        th,
        td {
            padding: 12px;

            text-align: left;

            border-bottom: 1px solid #dee2e6;

            vertical-align: middle;
        }

        th {
            background: #f8f9fa;
        }

        tr:hover {
            background: #f5f5f5;
        }

     

        .imagem-produto {
            width: 60px;

            height: 60px;

            object-fit: cover;

            border-radius: 6px;

            border: 1px solid #ddd;
        }

       

        .btn-detalhes {
            padding: 7px 12px;

            background: #d32f2f;

            color: #fff;

            border: none;

            border-radius: 4px;

            cursor: pointer;

            font-weight: bold;
        }

        .btn-detalhes:hover {
            background: #a92323;
        }

        

        #modal-produto {
            display: none;

            position: fixed;

            top: 0;
            left: 0;

            width: 100%;
            height: 100%;

            background: rgba(0,0,0,0.65);

            justify-content: center;

            align-items: center;

            z-index: 9999;

            padding: 20px;
        }

        .modal-conteudo {

            background: #fff;

            width: 100%;

            max-width: 500px;

            border-radius: 10px;

            padding: 25px;

            position: relative;

            box-shadow:
                0 5px 25px rgba(0,0,0,0.3);
        }

        .fechar-modal {

            position: absolute;

            top: 10px;

            right: 15px;

            border: none;

            background: transparent;

            font-size: 28px;

            cursor: pointer;

            color: #555;
        }

        .fechar-modal:hover {
            color: #d32f2f;
        }

        #modal-imagem {

            width: 100%;

            height: 250px;

            object-fit: contain;

            border-radius: 8px;

            margin-bottom: 20px;

            background: #f5f5f5;
        }

        #modal-nome {
            font-size: 24px;

            margin-bottom: 8px;
        }

        #modal-categoria {

            color: #777;

            margin-bottom: 12px;
        }

        #modal-preco {

            color: #d32f2f;

            font-size: 22px;

            margin-bottom: 15px;
        }

        #modal-descricao {

            line-height: 1.6;

            color: #444;

            background: #f8f8f8;

            padding: 12px;

            border-radius: 6px;
        }

       

        @media (max-width: 768px) {

            .sidebar {
                width: 180px;
            }

            .main {
                padding: 15px;
            }

            table {
                font-size: 13px;
            }

            th,
            td {
                padding: 8px;
            }

        }

    </style>

</head>


<body>


  

    <div class="sidebar">

        <h2>Painel</h2>


        <a href="dashboard.php">
            Dashboard
        </a>


        <a
            href="produtos.php"
            class="active"
        >
            Produtos
        </a>


        <a href="clientes.php">
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


            <div>

                Olá,

                <?php
                echo htmlspecialchars(
                    $_SESSION["nome"]
                );
                ?>


                <a href="logout.php">
                    Sair
                </a>

            </div>

        </div>


        <!-- MAIN -->

        <div class="main">


            <h2>
                Produtos de Construção
            </h2>


            <br>


           
            <div class="card">

                <h3>
                    Produtos cadastrados no sistema
                </h3>

                <br>

                <p>
                    Os produtos abaixo são carregados
                    diretamente do banco de dados.
                </p>

            </div>


          

            <div class="card">

                <table>

                    <thead>

                        <tr>

                            <th>
                                ID
                            </th>

                            <th>
                                Imagem
                            </th>

                            <th>
                                Produto
                            </th>

                            <th>
                                Categoria
                            </th>

                            <th>
                                Preço
                            </th>

                            <th>
                                Ações
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                        <?php if (
                            $resProdutos &&
                            $resProdutos->num_rows > 0
                        ): ?>


                            <?php while (
                                $p = $resProdutos->fetch_assoc()
                            ): ?>


                                <tr>


                                   

                                    <td>

                                        #<?php
                                        echo $p["id"];
                                        ?>

                                    </td>


                              
                                    <td>

                                        <?php if (
                                            !empty($p["imagem_url"])
                                        ): ?>

                                            <img
                                                class="imagem-produto"
                                                src="<?php
                                                    echo htmlspecialchars(
                                                        $p["imagem_url"]
                                                    );
                                                ?>"
                                                alt="<?php
                                                    echo htmlspecialchars(
                                                        $p["nome"]
                                                    );
                                                ?>"
                                            >

                                        <?php else: ?>

                                            <span>
                                                Sem imagem
                                            </span>

                                        <?php endif; ?>

                                    </td>


                               

                                    <td>

                                        <strong>

                                            <?php
                                            echo htmlspecialchars(
                                                $p["nome"]
                                            );
                                            ?>

                                        </strong>

                                    </td>


                                

                                    <td>

                                        <?php
                                        echo htmlspecialchars(
                                            $p["categoria"]
                                        );
                                        ?>

                                    </td>


                                  

                                    <td>

                                        R$

                                        <?php

                                        echo number_format(
                                            $p["preco"],
                                            2,
                                            ",",
                                            "."
                                        );

                                        ?>

                                    </td>


                                   

                                    <td>


                                        <button
                                            type="button"
                                            class="btn-detalhes"

                                            data-nome="<?php
                                                echo htmlspecialchars(
                                                    $p["nome"],
                                                    ENT_QUOTES
                                                );
                                            ?>"

                                            data-categoria="<?php
                                                echo htmlspecialchars(
                                                    $p["categoria"],
                                                    ENT_QUOTES
                                                );
                                            ?>"

                                            data-preco="R$ <?php

                                                echo number_format(
                                                    $p["preco"],
                                                    2,
                                                    ",",
                                                    "."
                                                );

                                            ?>"

                                            data-descricao="<?php
                                                echo htmlspecialchars(
                                                    $p["descricao"]
                                                    ??
                                                    "Nenhuma descrição disponível.",
                                                    ENT_QUOTES
                                                );
                                            ?>"

                                            data-imagem="<?php
                                                echo htmlspecialchars(
                                                    $p["imagem_url"]
                                                    ?? "",
                                                    ENT_QUOTES
                                                );
                                            ?>"
                                        >

                                            Ver Detalhes

                                        </button>


                                    </td>


                                </tr>


                            <?php endwhile; ?>


                        <?php else: ?>


                            <tr>

                                <td
                                    colspan="6"
                                    style="
                                        text-align:center;
                                        color:#888;
                                        padding:30px;
                                    "
                                >

                                    Nenhum produto cadastrado.

                                </td>

                            </tr>


                        <?php endif; ?>


                    </tbody>

                </table>

            </div>


        </div>

    </div>




    <div id="modal-produto">


        <div class="modal-conteudo">


            <button
                type="button"
                id="fechar-modal"
                class="fechar-modal"
            >

                &times;

            </button>


            <img
                id="modal-imagem"
                src=""
                alt="Imagem do produto"
            >


            <h2 id="modal-nome">
            </h2>


            <p id="modal-categoria">
            </p>


            <h3 id="modal-preco">
            </h3>


            <p id="modal-descricao">
            </p>


        </div>

    </div>


    <script>

        const botoesDetalhes =
            document.querySelectorAll(".btn-detalhes");


        const modal =
            document.getElementById("modal-produto");


        const fecharModal =
            document.getElementById("fechar-modal");


        const modalNome =
            document.getElementById("modal-nome");


        const modalCategoria =
            document.getElementById("modal-categoria");


        const modalPreco =
            document.getElementById("modal-preco");


        const modalDescricao =
            document.getElementById("modal-descricao");


        const modalImagem =
            document.getElementById("modal-imagem");


        botoesDetalhes.forEach(
            (botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        const nome =
                            botao.getAttribute(
                                "data-nome"
                            ) || "";


                        const categoria =
                            botao.getAttribute(
                                "data-categoria"
                            ) || "";


                        const preco =
                            botao.getAttribute(
                                "data-preco"
                            ) || "";


                        const descricao =
                            botao.getAttribute(
                                "data-descricao"
                            ) || "";


                        const imagem =
                            botao.getAttribute(
                                "data-imagem"
                            ) || "";


                        if (modalNome) {

                            modalNome.textContent =
                                nome;

                        }


                        if (modalCategoria) {

                            modalCategoria.textContent =
                                "Categoria: " +
                                categoria;

                        }


                        if (modalPreco) {

                            modalPreco.textContent =
                                preco;

                        }


                        if (modalDescricao) {

                            modalDescricao.textContent =
                                descricao;

                        }


                        if (
                            modalImagem instanceof
                            HTMLImageElement
                        ) {

                            modalImagem.src =
                                imagem;

                            modalImagem.alt =
                                nome;

                        }


                        if (modal) {

                            modal.style.display =
                                "flex";

                        }

                    }
                );

            }
        );


        if (fecharModal && modal) {

            fecharModal.addEventListener(
                "click",
                () => {

                    modal.style.display =
                        "none";

                }
            );

        }


        if (modal) {

            modal.addEventListener(
                "click",
                (evento) => {

                    if (
                        evento.target === modal
                    ) {

                        modal.style.display =
                            "none";

                    }

                }
            );

        }

    </script>


</body>

</html>