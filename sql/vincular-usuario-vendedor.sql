-- Script SQL para vincular usuário vendedor com tabela Vendedores via CPF
-- Execute este script para garantir que o usuário vendedor tenha um CPF válido

-- 1️⃣ Primeiro, vamos ver qual CPF de vendedor existe na tabela Vendedores
SELECT 
    ID_Vendedor,
    Nome_Vendedor,
    CPF_Vendedor,
    ID_Filial
FROM Vendedores
LIMIT 10;

-- 2️⃣ Atualizar o usuário vendedor de teste com um CPF válido
-- Substitua 'XXX.XXX.XXX-XX' pelo CPF de um vendedor real da tabela Vendedores
UPDATE users
SET cpf = (
    SELECT CPF_Vendedor 
    FROM Vendedores 
    WHERE ID_Vendedor = 10  -- ou outro ID que você queira usar
    LIMIT 1
)
WHERE email = 'vendas@teste.com'
AND role = 'VENDEDOR';

-- 3️⃣ Verificar se o update funcionou
SELECT 
    u.id,
    u.email,
    u.name,
    u.cpf,
    u.role,
    v.ID_Vendedor,
    v.Nome_Vendedor,
    v.ID_Filial
FROM users u
LEFT JOIN Vendedores v ON u.cpf = v.CPF_Vendedor
WHERE u.email = 'vendas@teste.com';

-- 4️⃣ (OPCIONAL) Se não houver correspondência, criar um vendedor com o CPF do usuário
-- Descomente se necessário:
/*
INSERT INTO Vendedores (Nome_Vendedor, CPF_Vendedor, ID_Filial)
VALUES (
    (SELECT name FROM users WHERE email = 'vendas@teste.com'),
    (SELECT cpf FROM users WHERE email = 'vendas@teste.com'),
    11  -- ID da filial associada ao usuário
)
ON DUPLICATE KEY UPDATE Nome_Vendedor = VALUES(Nome_Vendedor);
*/
