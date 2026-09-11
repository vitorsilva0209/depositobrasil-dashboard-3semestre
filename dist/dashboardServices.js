export function processarMetricasDashboard(dados) {
    /*
    REQUISITO: Edge Cases
    Garante que o sistema continue funcionando mesmo
    quando não existirem produtos cadastrados.
    */
    const produtos = dados.produtos ?? [];
    /*
    REQUISITO: Reduce
    Calcula o faturamento total multiplicando o preço
    pela quantidade vendida de cada produto.
    */
    const faturamentoTotal = produtos.reduce((total, produto) => {
        return total +
            produto.preco *
                produto.quantidadeVendida;
    }, 0);
    /*
    REQUISITO: Filter
    Filtra os produtos que possuem estoque crítico.
    Produtos com 10 unidades ou menos são considerados críticos.
    */
    const produtosCriticos = produtos.filter(produto => produto.estoque <= 10);
    /*
    REQUISITO: Ranking
    Ordena os produtos pela quantidade vendida para
    descobrir o produto mais vendido.
    */
    const produtosOrdenados = [...produtos].sort((a, b) => b.quantidadeVendida -
        a.quantidadeVendida);
    let produtoMaisVendido = "Nenhum produto vendido";
    /*
    REQUISITO: Edge Cases
    Verifica se existem produtos e vendas antes
    de acessar a primeira posição do array.
    */
    if (produtosOrdenados.length > 0 &&
        produtosOrdenados[0].quantidadeVendida > 0) {
        produtoMaisVendido =
            produtosOrdenados[0].nome +
                " (" +
                produtosOrdenados[0].quantidadeVendida +
                " vendas)";
    }
    /*
    REQUISITO: Maior quantidade em estoque
    Encontra o produto que possui a maior quantidade
    disponível no estoque.
    */
    let maiorEstoque = "Nenhum produto";
    if (produtos.length > 0) {
        const produtoMaiorEstoque = produtos.reduce((maior, produto) => {
            return produto.estoque > maior.estoque
                ? produto
                : maior;
        }, produtos[0]);
        maiorEstoque =
            produtoMaiorEstoque.nome +
                " (" +
                produtoMaiorEstoque.estoque +
                " unidades)";
    }
    /*
    REQUISITO: Estoque Crítico
    Identifica os produtos que possuem pouca quantidade
    disponível para alertar o usuário.
    */
    let estoqueCritico = "Nenhum produto";
    if (produtosCriticos.length > 0) {
        estoqueCritico =
            produtosCriticos
                .map(produto => produto.nome +
                " (" +
                produto.estoque +
                ")")
                .join(", ");
    }
    /*
    REQUISITO: Map
    Transforma os produtos para uma estrutura preparada
    para apresentação no frontend.
    */
    const produtosFormatados = produtos.map(produto => ({
        id: produto.id,
        nome: produto.nome,
        categoria: produto.categoria,
        preco: produto.preco,
        precoFormatado: produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        }),
        estoque: produto.estoque,
        quantidadeVendida: produto.quantidadeVendida
    }));
    const faturamentoFormatado = faturamentoTotal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    return {
        totalProdutos: dados.totalProdutos ?? 0,
        totalClientes: dados.totalClientes ?? 0,
        totalFuncionarios: dados.totalFuncionarios ?? 0,
        faturamentoTotal,
        faturamentoFormatado,
        produtoMaisVendido,
        produtosCriticos,
        produtosFormatados,
        maiorEstoque,
        estoqueCritico
    };
}
