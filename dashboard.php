<?php

session_start();

if (!isset($_SESSION["id"])) {
    header("Location: login.php");
    exit();
}

include("config/conexao.php");

$totalProdutos = 0;
$totalClientes = 0;
$totalFuncionarios = 0;
$faturamentoTotal = 0;
$produtoMaisVendido = "Nenhum produto";

$resultado = $conn->query("SELECT COUNT(*) AS total FROM produtos");

if ($resultado) {
    $dados = $resultado->fetch_assoc();
    $totalProdutos = (int)$dados["total"];
}

$resultado = $conn->query("SELECT COUNT(*) AS total FROM clientes");

if ($resultado) {
    $dados = $resultado->fetch_assoc();
    $totalClientes = (int)$dados["total"];
}

$resultado = $conn->query("SELECT COUNT(*) AS total FROM funcionarios");

if ($resultado) {
    $dados = $resultado->fetch_assoc();
    $totalFuncionarios = (int)$dados["total"];
}

$resultado = $conn->query("
    SELECT COALESCE(SUM(p.preco * v.quantidade), 0) AS total
    FROM vendas v
    INNER JOIN produtos p ON p.id = v.produto_id
");

if ($resultado) {
    $dados = $resultado->fetch_assoc();
    $faturamentoTotal = (float)$dados["total"];
}

$resultado = $conn->query("
    SELECT
        p.nome,
        SUM(v.quantidade) AS total_vendido
    FROM vendas v
    INNER JOIN produtos p ON p.id = v.produto_id
    GROUP BY p.id, p.nome
    ORDER BY total_vendido DESC
    LIMIT 1
");

if ($resultado && $resultado->num_rows > 0) {

    $dados = $resultado->fetch_assoc();

    $produtoMaisVendido =
        $dados["nome"] .
        " (" .
        $dados["total_vendido"] .
        " vendas)";
}

$resProdutos = $conn->query("
    SELECT *
    FROM produtos
    ORDER BY id DESC
    LIMIT 10
");

$imagens = [
    "Cimento CP-II" => "cimento-cp-ii.jpg",
    "Tijolo Cerâmico" => "tijolo-ceramico.jpg",
    "Areia Média" => "areia-media.jpg",
    "Brita 1" => "brita-1.jpg",
    "Telha Cerâmica" => "telha-ceramica.jpg",
    "Tinta Acrílica" => "tinta-acrilica.jpg",
    "Argamassa" => "argamassa.jpg",
    "Piso Cerâmico" => "piso-ceramico.jpg",
    "Tubo PVC 100mm" => "tubo-pvc-100mm.jpg",
    "Ferro 10mm" => "ferro-10mm.jpg"
];

?>

<!DOCTYPE html>

<html lang="pt-br">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Dashboard - Depósito Brasil</title>

<style>

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', sans-serif;
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
    min-width: 0;
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

.cards-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 30px;
}

.card-stat {
    padding: 20px;
    border-radius: 8px;
    color: #fff;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-stat h1 {
    font-size: 36px;
    margin-bottom: 5px;
}

.bg-blue {
    background: #007bff;
}

.bg-green {
    background: #28a745;
}

.bg-yellow {
    background: #ffc107;
    color: #333;
}

.bg-red {
    background: #dc3545;
}

.card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border-top: 3px solid #d32f2f;
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
    vertical-align: middle;
}

th {
    background: #f8f9fa;
}

tr:hover {
    background: #f1f1f1;
}

.produto-imagem {
    width: 65px;
    height: 65px;
    object-fit: contain;
    border-radius: 6px;
    background: #f8f9fa;
    padding: 4px;
}

.produto-mais-vendido {
    font-size: 18px;
    color: #333;
}

.estoque-critico {
    margin-top: 20px;
}

.estoque-critico ul {
    margin-top: 15px;
    padding-left: 20px;
}

.estoque-critico li {
    margin-bottom: 8px;
}

@media (max-width: 1100px) {

    .cards-grid {
        grid-template-columns: repeat(2, 1fr);
    }

}

@media (max-width: 900px) {

    .sidebar {
        width: 180px;
    }

}

@media (max-width: 600px) {

    body {
        display: block;
    }

    .sidebar {
        width: 100%;
        min-height: auto;
    }

    .cards-grid {
        grid-template-columns: 1fr;
    }

    .main {
        padding: 15px;
        overflow-x: auto;
    }

}

</style>

</head>

<body>

<div class="sidebar">

    <h2>Painel</h2>

    <a href="dashboard.php" class="active">
        Dashboard
    </a>

    <a href="pages/produtos/listar.php">
        Produtos
    </a>

    <a href="pages/clientes/listar.php">
        Clientes
    </a>

    <a href="pages/funcionarios/listar.php">
        Funcionários
    </a>

</div>

<div class="content">

    <div class="header">

        <h3>
            Depósito Brasil
        </h3>

        <div>

            <span>
                Olá,
                <?php
                echo htmlspecialchars($_SESSION["nome"]);
                ?>
            </span>

            <a href="logout.php">
                Sair
            </a>

        </div>

    </div>

    <div class="main">

        <h2>
            Dashboard
        </h2>

        <br>

        <div class="cards-grid">

            <div class="card-stat bg-blue">

                <h1 id="total-produtos">
                    <?php echo $totalProdutos; ?>
                </h1>

                <p>
                    Produtos
                </p>

            </div>

   <div class="card-stat bg-green">

    <h1 id="total-clientes">
        <?php echo $totalClientes; ?>
    </h1>

    <p>Clientes</p>

</div>

<div class="card-stat bg-yellow">

    <h1 id="total-funcionarios">
        <?php echo $totalFuncionarios; ?>
    </h1>

    <p>Funcionários</p>

</div>

            <div class="card-stat bg-red">

                <h1 id="faturamento-total">

                    R$
                    <?php

                    echo number_format(
                        $faturamentoTotal,
                        2,
                        ",",
                        "."
                    );

                    ?>

                </h1>

                <p>
                    Faturamento Total
                </p>

            </div>

        </div>

        <div class="card">

            <h3>
                Produto Mais Vendido
            </h3>

            <br>

            <p
                id="produto-mais-vendido"
                class="produto-mais-vendido"
            >

                <?php
                echo htmlspecialchars($produtoMaisVendido);
                ?>

            </p>

        </div>

        <br>

        <div class="card">

            <h3>
                Produtos
            </h3>

            <table>

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Imagem</th>

                        <th>Produto</th>

                        <th>Categoria</th>

                        <th>Preço</th>

                        <th>Vendas</th>

                    </tr>
                 
       
    </div>
</div>

                </thead>

                <tbody id="tabela-produtos-corpo">

                    <?php if ($resProdutos && $resProdutos->num_rows > 0): ?>

                        <?php while ($p = $resProdutos->fetch_assoc()): ?>

                            <?php

                            $nomeProduto = $p["nome"];

                            $imagem = $imagens[$nomeProduto]
                                ?? "produto-sem-imagem.jpg";

                            ?>

                            <tr>

                                <td>
                                    #<?php echo (int)$p["id"]; ?>
                                </td>

                                <td>

                                    <img
                                        src="imagens/img/produtos/<?php echo htmlspecialchars($imagem); ?>"
                                        alt="<?php echo htmlspecialchars($nomeProduto); ?>"
                                        class="produto-imagem"
                                    >

                                </td>

                                <td>

                                    <strong>
                                        <?php
                                        echo htmlspecialchars($nomeProduto);
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
                                        (float)$p["preco"],
                                        2,
                                        ",",
                                        "."
                                    );

                                    ?>

                                </td>

                                <td>
                                    0
                                </td>

                            </tr>

                        <?php endwhile; ?>

                    <?php else: ?>

                        <tr>

                            <td
                                colspan="6"
                                style="text-align:center;"
                            >
                                Nenhum produto cadastrado.
                            </td>

                        </tr>

                    <?php endif; ?>

                </tbody>

            </table>

        </div>

        <br>

        <div class="card estoque-critico">

            <h3>
                Produtos com Estoque Crítico
            </h3>

            <ul id="lista-estoque-critico">

                <?php

                $resultadoEstoque = $conn->query("
                    SELECT nome, estoque
                    FROM produtos
                    WHERE estoque <= 10
                    ORDER BY estoque ASC
                ");

                if (
                    $resultadoEstoque &&
                    $resultadoEstoque->num_rows > 0
                ):

                ?>

                    <?php while ($estoque = $resultadoEstoque->fetch_assoc()): ?>

                        <li>

                            <?php
                            echo htmlspecialchars(
                                $estoque["nome"]
                            );
                            ?>

                            -

                            <?php
                            echo (int)$estoque["estoque"];
                            ?>

                            unidades

                        </li>

                    <?php endwhile; ?>

                <?php else: ?>

                    <li>
                        Nenhum produto com estoque crítico.
                    </li>

                <?php endif; ?>

            </ul>

        </div>

    </div>

</div>

<script type="module">

async function carregarDashboard() {

    try {

        const resposta = await fetch("api_dashboard.php");

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const dados = await resposta.json();

        const produtos = Array.isArray(dados.produtos)
            ? dados.produtos
            : [];

        const totalProdutos =
            document.getElementById("total-produtos");

        const totalClientes =
            document.getElementById("total-clientes");

        const totalFuncionarios =
            document.getElementById("total-funcionarios");

        const faturamento =
            document.getElementById("faturamento-total");

        const produtoMaisVendido =
            document.getElementById("produto-mais-vendido");

        const tabela =
            document.getElementById("tabela-produtos-corpo");

        if (totalProdutos) {
            totalProdutos.textContent =
                String(dados.produtos?.length ?? 0);
        }

  if (totalClientes) {
    totalClientes.textContent =
        String(dados.totalClientes ?? 0);
}

if (totalFuncionarios) {
    totalFuncionarios.textContent =
        String(dados.totalFuncionarios ?? 0);
}

        const faturamentoTotal = produtos.reduce(
            (total, produto) => {

                const vendas =
                    Number(produto.quantidadeVendida ?? 0);

                return total +
                    Number(produto.preco) * vendas;

            },
            0
        );

        if (faturamento) {

            faturamento.textContent =
                faturamentoTotal.toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                );

        }

        const estoqueCritico = produtos.filter(
            produto =>
                Number(produto.estoque ?? 0) <= 10
        );

        const produtoMaisVendidoDados =
            produtos.length > 0
                ? produtos.reduce(
                    (maior, produto) => {

                        return Number(
                            produto.quantidadeVendida ?? 0
                        ) >
                        Number(
                            maior.quantidadeVendida ?? 0
                        )
                            ? produto
                            : maior;

                    }
                )
                : null;

        if (produtoMaisVendido) {

            if (produtoMaisVendidoDados) {

                produtoMaisVendido.textContent =
                    `${produtoMaisVendidoDados.nome} ` +
                    `(${produtoMaisVendidoDados.quantidadeVendida ?? 0} vendas)`;

            } else {

                produtoMaisVendido.textContent =
                    "Nenhum produto vendido";

            }

        }

        if (tabela) {

            if (produtos.length === 0) {

                tabela.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align:center;">
                            Nenhum produto cadastrado.
                        </td>
                    </tr>
                `;

            } else {

                const produtosFormatados =
                    produtos.map(
                        produto => {

                            const preco =
                                Number(produto.preco).toLocaleString(
                                    "pt-BR",
                                    {
                                        style: "currency",
                                        currency: "BRL"
                                    }
                                );

                            const imagens = {

                                "Cimento CP-II":
                                    "cimento-cp-ii.jpg",

                                "Tijolo Cerâmico":
                                    "tijolo-ceramico.jpg",

                                "Areia Média":
                                    "areia-media.jpg",

                                "Brita 1":
                                    "brita-1.jpg",

                                "Telha Cerâmica":
                                    "telha-ceramica.jpg",

                                "Tinta Acrílica":
                                    "tinta-acrilica.jpg",

                                "Argamassa":
                                    "argamassa.jpg",

                                "Piso Cerâmico":
                                    "piso-ceramico.jpg",

                                "Tubo PVC 100mm":
                                    "tubo-pvc-100mm.jpg",

                                "Ferro 10mm":
                                    "ferro-10mm.jpg"

                            };

                            const imagem =
                                imagens[produto.nome]
                                ?? "produto-sem-imagem.jpg";

                            return `
                                <tr>

                                    <td>
                                        #${produto.id}
                                    </td>

                                    <td>
                                        <img
                                            src="imagens/img/produtos/${imagem}"
                                            alt="${produto.nome}"
                                            class="produto-imagem"
                                        >
                                    </td>

                                    <td>
                                        <strong>
                                            ${produto.nome}
                                        </strong>
                                    </td>

                                    <td>
                                        ${produto.categoria}
                                    </td>

                                    <td>
                                        ${preco}
                                    </td>

                                    <td>
                                        ${produto.quantidadeVendida ?? 0}
                                    </td>

                                </tr>
                            `;

                        }
                    );

                tabela.innerHTML =
                    produtosFormatados.join("");

            }

        }

        const listaEstoque =
            document.getElementById(
                "lista-estoque-critico"
            );

        if (listaEstoque) {

            if (estoqueCritico.length === 0) {

                listaEstoque.innerHTML =
                    "<li>Nenhum produto com estoque crítico.</li>";

            } else {

                listaEstoque.innerHTML =
                    estoqueCritico
                        .map(
                            produto =>
                                `<li>
                                    ${produto.nome} -
                                    ${produto.estoque} unidades
                                </li>`
                        )
                        .join("");

            }

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );

        const produtoMaisVendido =
            document.getElementById(
                "produto-mais-vendido"
            );

        if (produtoMaisVendido) {

            produtoMaisVendido.textContent =
                "Não foi possível carregar os dados.";

        }

    }

}

carregarDashboard();

</script>

</body>

</html>