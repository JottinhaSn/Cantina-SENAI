DROP DATABASE IF EXISTS cantina;
CREATE DATABASE cantina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cantina;

CREATE TABLE itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  preco DECIMAL(6,2) NOT NULL,
  emoji VARCHAR(10),
  categoria VARCHAR(20) NOT NULL,
  esgotado BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_cliente VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'recebido',
  total DECIMAL(8,2) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedido_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  item_id INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(6,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (item_id) REFERENCES itens(id)
);

INSERT INTO itens (nome, preco, emoji, categoria, esgotado) VALUES
('Hambúrguer', 15.00, '🍔', 'lanches', FALSE),
('Pastel', 13.00, '🥟', 'lanches', TRUE),
('Coxinha', 8.00, '🍗', 'lanches', FALSE),
('Suco de laranja', 6.00, '🧃', 'bebidas', FALSE),
('Refrigerante', 5.00, '🥤', 'bebidas', FALSE),
('Brigadeiro', 4.00, '🍫', 'doces', FALSE),
('Pudim', 7.00, '🍮', 'doces', FALSE);
