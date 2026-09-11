-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 11/09/2026 às 00:17
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `deposito_brasil`
--

DELIMITER $$
--
-- Procedimentos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_buscar_produtos` (IN `p_busca` VARCHAR(100), IN `p_limite` INT, IN `p_offset` INT)   BEGIN

    SELECT
        id,
        nome,
        categoria,
        preco,
        estoque,
        quantidade_vendida
    FROM vw_produtos_vendas
    WHERE
        p_busca = ''
        OR nome LIKE CONCAT('%', p_busca, '%')
        OR categoria LIKE CONCAT('%', p_busca, '%')
    ORDER BY id DESC
    LIMIT p_limite OFFSET p_offset;

END$$

--
-- Funções
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_valor_total_produto` (`p_preco` DECIMAL(10,2), `p_quantidade` INT) RETURNS DECIMAL(10,2) DETERMINISTIC BEGIN
    RETURN p_preco * p_quantidade;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `clientes`
--

INSERT INTO `clientes` (`id`, `nome`, `email`, `telefone`) VALUES
(5, 'Vitor Matheus Monteiro da Silva', 'vitor.monsil@gmail.com', '999144443'),
(6, 'Abisai Regina Monteiro', 'abisai@hotmail.com', '999784444'),
(7, 'Reginaldo Monteiro Da Silva', 'reginaldo.monteiro@gmail.com', '988888888');

-- --------------------------------------------------------

--
-- Estrutura para tabela `funcionarios`
--

CREATE TABLE `funcionarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `cargo` varchar(50) NOT NULL,
  `salario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `funcionarios`
--

INSERT INTO `funcionarios` (`id`, `nome`, `cargo`, `salario`) VALUES
(1, 'Carlos Silva', 'Vendedor', 2200.00),
(2, 'João Santos', 'Estoquista', 2000.00),
(3, 'Marcos Oliveira', 'Gerente', 3500.00),
(4, 'Pedro Souza', 'Vendedor', 2300.00),
(5, 'Lucas Pereira', 'Auxiliar de Estoque', 1900.00),
(6, 'Carlos Silva', 'Vendedor', 2200.00),
(7, 'João Santos', 'Estoquista', 2000.00),
(8, 'Marcos Oliveira', 'Gerente', 3500.00),
(9, 'Pedro Souza', 'Vendedor', 2300.00),
(11, 'Vitor Matheus', 'Administrativo', 1409.36);

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `descricao` text DEFAULT NULL,
  `imagem_url` varchar(255) DEFAULT NULL,
  `estoque` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `produtos`
--

INSERT INTO `produtos` (`id`, `nome`, `categoria`, `preco`, `descricao`, `imagem_url`, `estoque`) VALUES
(11, 'Cimento CP-II', 'Cimento', 38.90, 'Cimento para utilização em obras e construção civil.', 'imagens/img/produtos/cimento-cp-ii.jpg', 10),
(12, 'Tijolo Cerâmico', 'Alvenaria', 1000.20, 'Tijolo cerâmico indicado para construção de paredes e divisórias.', 'imagens/img/produtos/tijolo-ceramico.jpg', 50),
(13, 'Areia Média', 'Materiais Básicos', 120.00, 'Areia média para utilização em diferentes etapas da construção civil.', 'imagens/img/produtos/areia-media.jpg', 4),
(14, 'Brita 1', 'Materiais Básicos', 135.00, 'Brita utilizada em concretos, fundações e outras aplicações.', 'imagens/img/produtos/brita-1.jpg', 3),
(15, 'Telha Cerâmica', 'Telhas', 200.50, 'Telha cerâmica para cobertura de construções.', 'imagens/img/produtos/telha-ceramica.jpg', 20),
(16, 'Tinta Acrílica', 'Tintas', 89.90, 'Tinta acrílica para acabamento e proteção de superfícies.', 'imagens/img/produtos/tinta-acrilica.jpg', 15),
(17, 'Argamassa', 'Argamassa', 25.90, 'Argamassa para assentamento e acabamento na construção civil.', 'imagens/img/produtos/argamassa.jpg', 2),
(18, 'Piso Cerâmico', 'Pisos', 42.90, 'Piso cerâmico para revestimento de ambientes.', 'imagens/img/produtos/piso-ceramico.jpg', 25),
(19, 'Tubo PVC 100mm', 'Hidráulica', 65.00, 'Tubo PVC de 100mm para instalações hidráulicas.', 'imagens/img/produtos/tubo-pvc-100mm.jpg', 8),
(20, 'Ferro 10mm', 'Ferragens', 48.50, 'Ferro de 10mm utilizado em estruturas e construção civil.', 'imagens/img/produtos/ferro-10mm.jpg', 6);

--
-- Acionadores `produtos`
--
DELIMITER $$
CREATE TRIGGER `trg_validar_produto` BEFORE UPDATE ON `produtos` FOR EACH ROW BEGIN

    IF NEW.preco < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'O preço não pode ser negativo';
    END IF;

    IF NEW.estoque < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'O estoque não pode ser negativo';
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `usuario`, `senha`) VALUES
(3, 'Vitor Matheus', 'admin@gmail', '12345');

-- --------------------------------------------------------

--
-- Estrutura para tabela `vendas`
--

CREATE TABLE `vendas` (
  `id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `data_venda` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `vendas`
--

INSERT INTO `vendas` (`id`, `produto_id`, `quantidade`, `data_venda`) VALUES
(32, 11, 20, '2026-08-20 19:08:45'),
(33, 12, 5, '2026-08-20 19:08:45'),
(34, 13, 15, '2026-08-20 19:08:45'),
(35, 14, 8, '2026-08-20 19:08:45'),
(36, 15, 3, '2026-08-20 19:08:45'),
(37, 16, 10, '2026-08-20 19:08:45'),
(38, 17, 25, '2026-08-20 19:08:45'),
(39, 18, 12, '2026-08-20 19:08:45'),
(40, 19, 7, '2026-08-20 19:08:45'),
(41, 20, 18, '2026-08-20 19:08:45');

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_produtos_vendas`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `vw_produtos_vendas` (
`id` int(11)
,`nome` varchar(100)
,`categoria` varchar(50)
,`preco` decimal(10,2)
,`estoque` int(11)
,`quantidade_vendida` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Estrutura para view `vw_produtos_vendas`
--
DROP TABLE IF EXISTS `vw_produtos_vendas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_produtos_vendas`  AS SELECT `p`.`id` AS `id`, `p`.`nome` AS `nome`, `p`.`categoria` AS `categoria`, `p`.`preco` AS `preco`, `p`.`estoque` AS `estoque`, coalesce(sum(`v`.`quantidade`),0) AS `quantidade_vendida` FROM (`produtos` `p` left join `vendas` `v` on(`v`.`produto_id` = `p`.`id`)) GROUP BY `p`.`id`, `p`.`nome`, `p`.`categoria`, `p`.`preco`, `p`.`estoque` ;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `funcionarios`
--
ALTER TABLE `funcionarios`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `vendas`
--
ALTER TABLE `vendas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_vendas_produto` (`produto_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `funcionarios`
--
ALTER TABLE `funcionarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `vendas`
--
ALTER TABLE `vendas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `vendas`
--
ALTER TABLE `vendas`
  ADD CONSTRAINT `fk_vendas_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
