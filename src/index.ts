import type { DadosDashboard } from "./types.js";

import {
    processarMetricasDashboard
} from "./dashboardServices.js";

async function buscarDados(): Promise<DadosDashboard> {

    /*
    REQUISITO: Consumo de API e Resolução de Fluxo Assíncrono
    O fetch realiza a comunicação entre o TypeScript
    e a API PHP que fornece os dados em JSON.
    */
    try {

        const resposta = await fetch("api_dashboard.php");

        if (!resposta.ok) {
            throw new Error(
                `Erro HTTP: ${resposta.status}`
            );
        }

        const dados: DadosDashboard =
            await resposta.json();

        if (!dados.sucesso) {
            throw new Error(
                dados.mensagem ?? "A API retornou um erro."
            );
        }

        return dados;

    } catch (erro) {

        console.error(
            "Erro ao buscar dados:",
            erro
        );

        throw erro;
    }
}

async function iniciarDashboard(): Promise<void> {

    try {

        const dados = await buscarDados();

        const metricas =
            processarMetricasDashboard(dados);

        /*
        REQUISITO: Manipulação Segura do DOM
        Os elementos são verificados antes de receber
        os dados processados pelo TypeScript.
        */
        const faturamentoTotal =
            document.getElementById(
                "faturamento-total"
            );

        const produtoMaisVendido =
            document.getElementById(
                "produto-mais-vendido"
            );

        const maiorEstoque =
            document.getElementById(
                "maior-estoque"
            );

        const menorEstoque =
            document.getElementById(
                "menor-estoque"
            );

        if (faturamentoTotal) {
            faturamentoTotal.textContent =
                metricas.faturamentoFormatado;
        }

        if (produtoMaisVendido) {
            produtoMaisVendido.textContent =
                metricas.produtoMaisVendido;
        }

        if (maiorEstoque) {
            maiorEstoque.textContent =
                metricas.maiorEstoque;
        }

        if (menorEstoque) {
            menorEstoque.textContent =
                metricas.menorEstoque;
        }

    } catch (erro) {

        /*
        REQUISITO: Tratamento de Exceções
        Caso a API ou o banco apresente algum problema,
        o erro é capturado sem quebrar a aplicação.
        */
        console.error(
            "Erro ao carregar dashboard:",
            erro
        );

    }
}

iniciarDashboard();