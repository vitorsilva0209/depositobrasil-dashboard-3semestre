<?php

include("../../config/conexao.php");

$sql = "SELECT * FROM produtos ORDER BY id DESC";

$resultado = $conn->query($sql);

if (!$resultado) {
    die("Erro ao consultar produtos: " . $conn->error);
}



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

<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Produtos - Depósito Brasil</title>

<link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
>

<style>

body {
    background: #f9f4f443;
}

.container {
    margin-top: 40px;
}

.card {
    background: #9d9797;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.produto-imagem {

    width: 80px;
    height: 80px;

    object-fit: contain;

    border-radius: 8px;

    background: #fafafa;

    padding: 5px;

}

.table {
    vertical-align: middle;
}

.btn-editar {
    background: #0d6efd;
    color: white;
}

.btn-editar:hover {
    background: #0b5ed7;
    color: white;
}

.btn-excluir {
    background: #dc3545;
    color: white;
}

.btn-excluir:hover {
    background: #bb2d3b;
    color: white;
}

</style>

</head>

<body>

<div class="container">

    <div class="card">

        <div class="d-flex justify-content-between align-items-center mb-4">

    <h2>Produtos</h2>

    <div>

        <a href="../../dashboard.php" class="btn btn-secondary me-2">
            ← Dashboard
        </a>

        <a href="cadastrar.php" class="btn btn-success">
            + Novo Produto
        </a>

    </div>

</div>


        <div class="table-responsive">

            <table class="table table-bordered table-hover">

                <thead class="table-dark">

                    <tr>

                        <th>
                            ID
                        </th>

                        <th>
                            Imagem
                        </th>

                        <th>
                            Nome
                        </th>

                        <th>
                            Categoria
                        </th>

                        <th>
                            Preço
                        </th>

                        <th>
                            Quantidade
                        </th>

                        <th>
                            Ações
                        </th>

                    </tr>

                </thead>


                <tbody>

                <?php if ($resultado->num_rows > 0): ?>

                    <?php while ($produto = $resultado->fetch_assoc()): ?>

                        <?php

                        $nomeProduto = $produto['nome'];



                        $imagem = $imagens[$nomeProduto]
                            ?? "produto-sem-imagem.jpg";


                

                        if (isset($produto['quantidade'])) {

                            $quantidade = $produto['quantidade'];

                        } elseif (isset($produto['estoque'])) {

                            $quantidade = $produto['estoque'];

                        } else {

                            $quantidade = 0;

                        }

                        ?>

                        <tr>

                           

                            <td>

                                <?= (int)$produto['id']; ?>

                            </td>


                            

                            <td>

                                <img
                                    src="../../imagens/img/produtos/<?= htmlspecialchars($imagem); ?>"
                                    alt="<?= htmlspecialchars($nomeProduto); ?>"
                                    class="produto-imagem"
                                >

                            </td>


                           

                            <td>

                                <strong>

                                    <?= htmlspecialchars($produto['nome']); ?>

                                </strong>

                            </td>


                            <td>

                                <?= htmlspecialchars($produto['categoria']); ?>

                            </td>


                           

                            <td>

                                R$

                                <?= number_format(
                                    (float)$produto['preco'],
                                    2,
                                    ',',
                                    '.'
                                ); ?>

                            </td>


                           

                            <td>

                                <?= (int)$quantidade; ?>

                            </td>

                                <td>

                        <a
                            href="editar.php?id=<?= (int)$produto['id']; ?>"
                            class="btn btn-editar btn-sm"
                                                            >
                             Editar
                             </a>
                       


                             <button type="button"
            class="btn btn-danger"
                onclick="excluir(<?= $produto['id']; ?>)">
         Excluir
        </button>

                            </td>

                        </tr>

                    <?php endwhile; ?>

                <?php else: ?>

                    <tr>

                        <td
                            colspan="7"
                            class="text-center"
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

</body>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
function excluir(id) {
    Swal.fire({
        title: "Você tem certeza?",
        text: "Esta ação não poderá ser desfeita.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Excluir",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "excluir.php?id=" + id;
        }
    });
}
</script>
</html>