import { processarMetricasDashboard } from "./dashboardServices.js";
async function buscarDados() {
    try {
        const resposta = await fetch("api_dashboard.php");
        if (!resposta.ok) {
            throw new Error("Erro HTTP: ${resposta.status}");
        }
        const dados = await resposta.json();
        if (!dados.sucesso) {
            throw new Error(dados.mensagem ?? "A API retornou um erro.");
        }
        return dados;
    }
    catch (erro) {
        console.error("Erro ao buscar dados:", erro);
        throw erro;
    }
}
async function iniciarDashboard() {
    try {
        const dados = await buscarDados();
        const metricas = processarMetricasDashboard(dados);
        const faturamentoTotal = document.getElementById("faturamento-total");
        const produtoMaisVendido = document.getElementById("produto-mais-vendido");
        const maiorEstoque = document.getElementById("maior-estoque");
        const estoqueCritico = document.getElementById("estoque-critico");
        if (maiorEstoque) {
            maiorEstoque.textContent = metricas.maiorEstoque;
        }
        if (estoqueCritico) {
            estoqueCritico.textContent = metricas.estoqueCritico;
        }
        if (faturamentoTotal) {
            faturamentoTotal.textContent =
                metricas.faturamentoFormatado;
        }
        if (produtoMaisVendido) {
            produtoMaisVendido.textContent =
                metricas.produtoMaisVendido;
        }
    }
    catch (erro) {
        console.error("Erro ao carregar dashboard:", erro);
    }
}
iniciarDashboard();
