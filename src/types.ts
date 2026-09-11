export interface Produto {
    id: number;
    nome: string;
    categoria: string;
    preco: number;
    estoque: number;
    quantidadeVendida: number;
}

export interface Cliente {
    id: number;
    nome: string;
    email: string;
    telefone: string;
}

export interface Funcionario {
    id: number;
    nome: string;
    cargo: string;
    salario: number;
}

export interface DadosDashboard {
    sucesso: boolean;
    mensagem?: string;
    produtos: Produto[];
    totalProdutos: number;
    totalClientes: number;
    totalFuncionarios: number;
}

export interface MetricasDashboard {
    totalProdutos: number;
    totalClientes: number;
    totalFuncionarios: number;
    faturamentoTotal: number;
    faturamentoFormatado: string;
    produtoMaisVendido: string;
    produtosCriticos: Produto[];
    produtosFormatados: {
        id: number;
        nome: string;
        categoria: string;
        preco: number;
        precoFormatado: string;
        estoque: number;
        quantidadeVendida: number;
    }[];
    maiorEstoque: string;
    menorEstoque: string;
}