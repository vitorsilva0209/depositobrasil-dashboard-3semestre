-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geraÃ§Ã£o: 11/09/2026 Ã s 00:17
-- VersÃ£o do servidor: 10.4.32-MariaDB
-- VersÃ£o do PHP: 8.0.30

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
CREATE PROCEDURE `sp_buscar_produtos` (IN `p_busca` VARCHAR(100), IN `p_limite` INT, IN `p_offset` INT)   BEGIN

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
-- FunÃ§Ãµes
--
CREATE FUNCTION `fn_valor_total_produto` (`p_preco` DECIMAL(10,2), `p_quantidade` INT) RETURNS DECIMAL(10,2) DETERMINISTIC BEGIN
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
(11, 'Cimento CP-II', 'Cimento', 38.90, 'Cimento para utilizaÃ§Ã£o em obras e construÃ§Ã£o civil.', 'imagens/img/produtos/cimento-cp-ii.jpg', 10),
(12, 'Tijolo CerÃ¢mico', 'Alvenaria', 1000.20, 'Tijolo cerÃ¢mico indicado para construÃ§Ã£o de paredes e divisÃ³rias.', 'imagens/img/produtos/tijolo-ceramico.jpg', 50),
(13, 'Areia MÃ©dia', 'Materiais BÃ¡sicos', 120.00, 'Areia mÃ©dia para utilizaÃ§Ã£o em diferentes etapas da construÃ§Ã£o civil.', 'imagens/img/produtos/areia-media.jpg', 4),
(14, 'Brita 1', 'Materiais BÃ¡sicos', 135.00, 'Brita utilizada em concretos, fundaÃ§Ãµes e outras aplicaÃ§Ãµes.', 'imagens/img/produtos/brita-1.jpg', 3),
(15, 'Telha CerÃ¢mica', 'Telhas', 200.50, 'Telha cerÃ¢mica para cobertura de construÃ§Ãµes.', 'imagens/img/produtos/telha-ceramica.jpg', 20),
(16, 'Tinta AcrÃ­lica', 'Tintas', 89.90, 'Tinta acrÃ­lica para acabamento e proteÃ§Ã£o de superfÃ­cies.', 'imagens/img/produtos/tinta-acrilica.jpg', 15),
(17, 'Argamassa', 'Argamassa', 25.90, 'Argamassa para assentamento e acabamento na construÃ§Ã£o civil.', 'imagens/img/produtos/argamassa.jpg', 2),
(18, 'Piso CerÃ¢mico', 'Pisos', 42.90, 'Piso cerÃ¢mico para revestimento de ambientes.', 'imagens/img/produtos/piso-ceramico.jpg', 25),
(19, 'Tubo PVC 100mm', 'HidrÃ¡ulica', 65.00, 'Tubo PVC de 100mm para instalaÃ§Ãµes hidrÃ¡ulicas.', 'imagens/img/produtos/tubo-pvc-100mm.jpg', 8),
(20, 'Ferro 10mm', 'Ferragens', 48.50, 'Ferro de 10mm utilizado em estruturas e construÃ§Ã£o civil.', 'imagens/img/produtos/ferro-10mm.jpg', 6);

--
-- Acionadores `produtos`
--
DELIMITER $$
CREATE TRIGGER `trg_validar_produto` BEFORE UPDATE ON `produtos` FOR EACH ROW BEGIN

    IF NEW.preco < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'O preÃ§o nÃ£o pode ser negativo';
    END IF;

    IF NEW.estoque < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'O estoque nÃ£o pode ser negativo';
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



-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_produtos_vendas`
-- (Veja abaixo para a visÃ£o atual)
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

CREATE ALGORITHM=UNDEFINED SQL SECURITY INVOKER VIEW `vw_produtos_vendas`  AS SELECT `p`.`id` AS `id`, `p`.`nome` AS `nome`, `p`.`categoria` AS `categoria`, `p`.`preco` AS `preco`, `p`.`estoque` AS `estoque`, coalesce(sum(`v`.`quantidade`),0) AS `quantidade_vendida` FROM (`produtos` `p` left join `vendas` `v` on(`v`.`produto_id` = `p`.`id`)) GROUP BY `p`.`id`, `p`.`nome`, `p`.`categoria`, `p`.`preco`, `p`.`estoque` ;

--
-- Ãndices para tabelas despejadas
--

--
-- Ãndices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`);

--
-- Ãndices de tabela `funcionarios`
--
ALTER TABLE `funcionarios`
  ADD PRIMARY KEY (`id`);

--
-- Ãndices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`);

--
-- Ãndices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- Ãndices de tabela `vendas`
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
-- RestriÃ§Ãµes para tabelas despejadas
--

--
-- RestriÃ§Ãµes para tabelas `vendas`
--
ALTER TABLE `vendas`
  ADD CONSTRAINT `fk_vendas_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
