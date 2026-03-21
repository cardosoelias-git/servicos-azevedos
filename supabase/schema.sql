-- ============================================
-- SERVIÇOS AZEVEDO - Schema do Supabase
-- ============================================
-- Execute este script no Supabase SQL Editor
-- https://app.supabase.com > SQL Editor
-- ============================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: CLIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  telefone VARCHAR(20),
  renach VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura
DROP POLICY IF EXISTS "Permitir leitura clientes" ON clientes;
CREATE POLICY "Permitir leitura clientes" ON clientes
  FOR SELECT USING (true);

-- Política para permitir inserção
DROP POLICY IF EXISTS "Permitir inserção clientes" ON clientes;
CREATE POLICY "Permitir inserção clientes" ON clientes
  FOR INSERT WITH CHECK (true);

-- Política para permitir atualização
DROP POLICY IF EXISTS "Permitir atualização clientes" ON clientes;
CREATE POLICY "Permitir atualização clientes" ON clientes
  FOR UPDATE USING (true);

-- Política para permitir exclusão
DROP POLICY IF EXISTS "Permitir exclusão clientes" ON clientes;
CREATE POLICY "Permitir exclusão clientes" ON clientes
  FOR DELETE USING (true);

-- ============================================
-- TABELA: SERVIÇOS
-- ============================================
CREATE TABLE IF NOT EXISTS servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_servico VARCHAR(100) NOT NULL,
  valor_total DECIMAL(10, 2) DEFAULT 0,
  valor_pago DECIMAL(10, 2) DEFAULT 0,
  valor_receber DECIMAL(10, 2) DEFAULT 0,
  etapas_completas INTEGER DEFAULT 0,
  total_etapas INTEGER DEFAULT 9,
  status VARCHAR(50) DEFAULT 'Em Andamento',
  etapas JSONB DEFAULT '[]'::jsonb,
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_conclusao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Permitir leitura servicos" ON servicos;
CREATE POLICY "Permitir leitura servicos" ON servicos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção servicos" ON servicos;
CREATE POLICY "Permitir inserção servicos" ON servicos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização servicos" ON servicos;
CREATE POLICY "Permitir atualização servicos" ON servicos
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir exclusão servicos" ON servicos;
CREATE POLICY "Permitir exclusão servicos" ON servicos
  FOR DELETE USING (true);

-- ============================================
-- TABELA: TRANSAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS transacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES servicos(id) ON DELETE CASCADE,
  cliente_nome VARCHAR(255),
  servico_nome VARCHAR(255),
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Entrada', 'Saída', 'A Receber')),
  valor DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pendente' CHECK (status IN ('Pago', 'Pendente', 'Cancelado')),
  data DATE DEFAULT CURRENT_DATE,
  data_pagamento DATE,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Permitir leitura transacoes" ON transacoes;
CREATE POLICY "Permitir leitura transacoes" ON transacoes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção transacoes" ON transacoes;
CREATE POLICY "Permitir inserção transacoes" ON transacoes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização transacoes" ON transacoes;
CREATE POLICY "Permitir atualização transacoes" ON transacoes
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir exclusão transacoes" ON transacoes;
CREATE POLICY "Permitir exclusão transacoes" ON transacoes
  FOR DELETE USING (true);

-- ============================================
-- TABELA: CONFIGURAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor) VALUES
  ('nome_empresa', 'Serviços Azevedo'),
  ('tema', 'light'),
  ('notificacoes_email', 'true'),
  ('backup_automatico', 'true')
ON CONFLICT (chave) DO NOTHING;

-- Habilitar RLS
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Permitir leitura configuracoes" ON configuracoes;
CREATE POLICY "Permitir leitura configuracoes" ON configuracoes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir atualização configuracoes" ON configuracoes;
CREATE POLICY "Permitir atualização configuracoes" ON configuracoes
  FOR UPDATE USING (true);

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para clientes
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para servicos
CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON servicos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para transacoes
CREATE TRIGGER update_transacoes_updated_at
  BEFORE UPDATE ON transacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_servicos_cliente_id ON servicos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_servicos_status ON servicos(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_cliente_id ON transacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_servico_id ON transacoes(servico_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_status ON transacoes(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);

-- ============================================
-- MENSAGEM DE SUCESSO
-- ============================================
-- Schema criado com sucesso!
-- Agora você pode usar o Supabase no projeto.
