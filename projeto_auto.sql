IF OBJECT_ID(N'dbo.fabricantes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.fabricantes (
        id INT IDENTITY(1,1) NOT NULL,
        nome NVARCHAR(100) NOT NULL,
        ativo BIT NOT NULL CONSTRAINT df_fabricantes_ativo DEFAULT (1),
        CONSTRAINT pk_fabricantes PRIMARY KEY (id),
        CONSTRAINT uq_fabricantes_nome UNIQUE (nome)
    );
END;
GO

/* 2. Modelos de veículos */
IF OBJECT_ID(N'dbo.modelos_veiculos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.modelos_veiculos (
        id INT IDENTITY(1,1) NOT NULL,
        fabricante_id INT NOT NULL,
        nome NVARCHAR(100) NOT NULL,
        ano_inicio SMALLINT NULL,
        ano_fim SMALLINT NULL,
        ativo BIT NOT NULL CONSTRAINT df_modelos_ativo DEFAULT (1),
        CONSTRAINT pk_modelos_veiculos PRIMARY KEY (id),
        CONSTRAINT uq_modelos_fabricante_nome UNIQUE (fabricante_id, nome),
        CONSTRAINT fk_modelos_fabricantes
            FOREIGN KEY (fabricante_id)
            REFERENCES dbo.fabricantes (id),
        CONSTRAINT ck_modelos_anos
            CHECK (
                (ano_inicio IS NULL AND ano_fim IS NULL)
                OR
                (ano_inicio IS NOT NULL AND ano_fim IS NULL)
                OR
                (ano_inicio IS NOT NULL AND ano_fim >= ano_inicio)
            )
    );
END;
GO

/* 3. Problemas */
IF OBJECT_ID(N'dbo.problemas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.problemas (
        id INT IDENTITY(1,1) NOT NULL,
        nome NVARCHAR(150) NOT NULL,
        descricao NVARCHAR(MAX) NULL,
        nivel_urgencia TINYINT NOT NULL CONSTRAINT df_problemas_urgencia DEFAULT (1),
        ativo BIT NOT NULL CONSTRAINT df_problemas_ativo DEFAULT (1),
        CONSTRAINT pk_problemas PRIMARY KEY (id),
        CONSTRAINT uq_problemas_nome UNIQUE (nome),
        CONSTRAINT ck_problemas_urgencia
            CHECK (nivel_urgencia BETWEEN 1 AND 5)
    );
END;
GO

/* 4. Possíveis causas */
IF OBJECT_ID(N'dbo.causas_possiveis', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.causas_possiveis (
        id INT IDENTITY(1,1) NOT NULL,
        nome NVARCHAR(180) NOT NULL,
        resumo NVARCHAR(MAX) NOT NULL,
        recomendacao NVARCHAR(MAX) NOT NULL,
        nivel_gravidade TINYINT NOT NULL CONSTRAINT df_causas_gravidade DEFAULT (1),
        ativo BIT NOT NULL CONSTRAINT df_causas_ativo DEFAULT (1),
        CONSTRAINT pk_causas_possiveis PRIMARY KEY (id),
        CONSTRAINT uq_causas_nome UNIQUE (nome),
        CONSTRAINT ck_causas_gravidade
            CHECK (nivel_gravidade BETWEEN 1 AND 5)
    );
END;
GO

/* 5. Relacionamento entre problemas e causas */
IF OBJECT_ID(N'dbo.problemas_causas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.problemas_causas (
        problema_id INT NOT NULL,
        causa_possivel_id INT NOT NULL,
        ordem_exibicao INT NOT NULL CONSTRAINT df_problemas_causas_ordem DEFAULT (0),
        CONSTRAINT pk_problemas_causas PRIMARY KEY (problema_id, causa_possivel_id),
        CONSTRAINT fk_problemas_causas_problemas
            FOREIGN KEY (problema_id)
            REFERENCES dbo.problemas (id)
            ON DELETE CASCADE,
        CONSTRAINT fk_problemas_causas_causas
            FOREIGN KEY (causa_possivel_id)
            REFERENCES dbo.causas_possiveis (id)
            ON DELETE CASCADE,
        CONSTRAINT ck_problemas_causas_ordem
            CHECK (ordem_exibicao >= 0)
    );
END;
GO

/* 6. Mensagens de isenção de responsabilidade */
IF OBJECT_ID(N'dbo.mensagens_isencao', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.mensagens_isencao (
        id INT IDENTITY(1,1) NOT NULL,
        titulo NVARCHAR(150) NOT NULL,
        texto NVARCHAR(MAX) NOT NULL,
        ativo BIT NOT NULL CONSTRAINT df_mensagens_ativo DEFAULT (1),
        CONSTRAINT pk_mensagens_isencao PRIMARY KEY (id)
    );
END;
GO

/* Dados iniciais para teste */

IF NOT EXISTS (
    SELECT 1 FROM dbo.fabricantes WHERE nome = N'Volkswagen'
)
BEGIN
    INSERT INTO dbo.fabricantes (nome, ativo)
    VALUES (N'Volkswagen', 1);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.modelos_veiculos m
    INNER JOIN dbo.fabricantes f ON f.id = m.fabricante_id
    WHERE f.nome = N'Volkswagen'
      AND m.nome = N'Fusca'
)
BEGIN
    INSERT INTO dbo.modelos_veiculos
        (fabricante_id, nome, ano_inicio, ano_fim, ativo)
    SELECT id, N'Fusca', 1950, 1996, 1
    FROM dbo.fabricantes
    WHERE nome = N'Volkswagen';
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM dbo.problemas WHERE nome = N'Fumaça'
)
BEGIN
    INSERT INTO dbo.problemas
        (nome, descricao, nivel_urgencia, ativo)
    VALUES
        (N'Fumaça', N'Presença de fumaça ou vapor emitido pelo veículo.', 4, 1);
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM dbo.problemas WHERE nome = N'Som estranho'
)
BEGIN
    INSERT INTO dbo.problemas
        (nome, descricao, nivel_urgencia, ativo)
    VALUES
        (N'Som estranho', N'Ruído incomum durante o funcionamento ou movimento do veículo.', 3, 1);
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM dbo.problemas WHERE nome = N'Falha nos freios'
)
BEGIN
    INSERT INTO dbo.problemas
        (nome, descricao, nivel_urgencia, ativo)
    VALUES
        (N'Falha nos freios', N'Alteração na capacidade de frear ou no comportamento do pedal.', 5, 1);
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM dbo.causas_possiveis
    WHERE nome = N'Possível superaquecimento do motor'
)
BEGIN
    INSERT INTO dbo.causas_possiveis
        (nome, resumo, recomendacao, nivel_gravidade, ativo)
    VALUES
    (
        N'Possível superaquecimento do motor',
        N'A temperatura do motor pode estar acima do limite normal de operação.',
        N'Pare o veículo em local seguro, não abra o reservatório quente e procure um profissional.',
        5,
        1
    );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM dbo.causas_possiveis
    WHERE nome = N'Possível vazamento de óleo'
)
BEGIN
    INSERT INTO dbo.causas_possiveis
        (nome, resumo, recomendacao, nivel_gravidade, ativo)
    VALUES
    (
        N'Possível vazamento de óleo',
        N'Um vazamento pode atingir partes quentes do motor e produzir fumaça.',
        N'Evite continuar dirigindo se houver vazamento intenso e solicite uma inspeção.',
        4,
        1
    );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM dbo.causas_possiveis
    WHERE nome = N'Possível falha no sistema de arrefecimento'
)
BEGIN
    INSERT INTO dbo.causas_possiveis
        (nome, resumo, recomendacao, nivel_gravidade, ativo)
    VALUES
    (
        N'Possível falha no sistema de arrefecimento',
        N'Radiador, mangueiras, bomba d’água ou outros componentes podem apresentar falha.',
        N'Interrompa o uso se houver superaquecimento e procure assistência profissional.',
        5,
        1
    );
END;
GO

/* Relaciona o problema Fumaça às suas possíveis causas */
INSERT INTO dbo.problemas_causas
    (problema_id, causa_possivel_id, ordem_exibicao)
SELECT
    p.id,
    c.id,
    CASE c.nome
        WHEN N'Possível superaquecimento do motor' THEN 1
        WHEN N'Possível falha no sistema de arrefecimento' THEN 2
        WHEN N'Possível vazamento de óleo' THEN 3
        ELSE 99
    END
FROM dbo.problemas p
CROSS JOIN dbo.causas_possiveis c
WHERE p.nome = N'Fumaça'
  AND c.nome IN (
      N'Possível superaquecimento do motor',
      N'Possível vazamento de óleo',
      N'Possível falha no sistema de arrefecimento'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM dbo.problemas_causas pc
      WHERE pc.problema_id = p.id
        AND pc.causa_possivel_id = c.id
  );
GO

IF NOT EXISTS (
    SELECT 1 FROM dbo.mensagens_isencao
    WHERE titulo = N'Aviso importante'
)
BEGIN
    INSERT INTO dbo.mensagens_isencao
        (titulo, texto, ativo)
    VALUES
    (
        N'Aviso importante',
        N'Este conteúdo é apenas informativo e não representa um diagnóstico. Consulte um mecânico qualificado antes de tomar qualquer decisão sobre o veículo.',
        1
    );
END;
GO

/* Consultas de teste */
SELECT * FROM dbo.fabricantes;
SELECT * FROM dbo.modelos_veiculos;
SELECT * FROM dbo.problemas;
SELECT * FROM dbo.causas_possiveis;
SELECT * FROM dbo.problemas_causas;
SELECT * FROM dbo.mensagens_isencao;
GO
