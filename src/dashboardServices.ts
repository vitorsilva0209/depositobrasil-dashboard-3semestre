import type {
    DadosDashboard,
    MetricasDashboard
} from "./types.js";

export function processarMetricasDashboard(
    dados: DadosDashboard
): MetricasDashboard {

    /*
    REQUISITO: Tratamento de Cenários de Exceção
    Garante que o processamento continue funcionando
    mesmo quando não houver produtos cadastrados.
    */
    const produtos = dados.produtos ?? [];

    /*
    REQUISITO: Agregações e Cálculos Financeiros - REDUCE
    Calcula o faturamento total somando o preço de cada
    produto multiplicado pela quantidade vendida.
    */
    const faturamentoTotal = produtos.reduce(
        (total, produto) => {
            return total +
                produto.preco *
                produto.quantidadeVendida;
        },
        0
    );

    /*
    REQUISITO: Segmentação e Filtros de Negócio - FILTER
    Separa os produtos que possuem estoque crítico.
    Produtos com 10 unidades ou menos são considerados críticos.
    */
    const produtosCriticos = produtos.filter(
        produto => produto.estoque <= 10
    );

    /*
    REQUISITO: Algoritmos de Ranking e Destaques
    Ordena os produtos pela quantidade vendida para
    descobrir dinamicamente o produto mais vendido.
    */
    const produtosOrdenados = [...produtos].sort(
        (a, b) =>
            b.quantidadeVendida -
            a.quantidadeVendida
    );

    let produtoMaisVendido = "Nenhum produto vendido";

    /*
    REQUISITO: Tratamento de Cenários de Exceção
    Verifica se existem produtos e vendas antes
    de acessar a primeira posição do array.
    */
    if (
        produtosOrdenados.length > 0 &&
        produtosOrdenados[0].quantidadeVendida > 0
    ) {
        produtoMaisVendido =
            produtosOrdenados[0].nome +
            " (" +
            produtosOrdenados[0].quantidadeVendida +
            " vendas)";
    }

    /*
    REQUISITO: Ranking e Destaques
    Utiliza reduce para encontrar o produto com
    a maior quantidade disponível no estoque.
    */
    let maiorEstoque = "Nenhum produto";

    if (produtos.length > 0) {
        const produtoMaiorEstoque = produtos.reduce(
            (maior, produto) => {
                return produto.estoque > maior.estoque
                    ? produto
                    : maior;
            },
            produtos[0]
        );

        maiorEstoque =
            produtoMaiorEstoque.nome +
            " (" +
            produtoMaiorEstoque.estoque +
            " unidades)";
    }

    /*
    REQUISITO: Ranking e Destaques
    Utiliza reduce para encontrar o produto com
    a menor quantidade disponível no estoque.
    */
    let menorEstoque = "Nenhum produto";

    if (produtos.length > 0) {
        const produtoMenorEstoque = produtos.reduce(
            (menor, produto) => {
                return produto.estoque < menor.estoque
                    ? produto
                    : menor;
            },
            produtos[0]
        );

        menorEstoque =
            produtoMenorEstoque.nome +
            " (" +
            produtoMenorEstoque.estoque +
            " unidades)";
    }

    /*
    REQUISITO: Transformação e Formatação de Estruturas - MAP
    Transforma os produtos recebidos da API para uma
    estrutura preparada para apresentação no frontend.
    */
    const produtosFormatados = produtos.map(
        produto => ({
            id: produto.id,
            nome: produto.nome,
            categoria: produto.categoria,
            preco: produto.preco,
            precoFormatado: produto.preco.toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            ),
            estoque: produto.estoque,
            quantidadeVendida: produto.quantidadeVendida
        })
    );

    /*
    REQUISITO: Tratamento de Cenários de Exceção
    Caso não existam produtos, mantém os resultados
    com valores seguros para evitar erros na interface.
    */
    const faturamentoFormatado =
        faturamentoTotal.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

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
        menorEstoque
    };
}