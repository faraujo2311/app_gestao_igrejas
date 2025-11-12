-- ============================================================
-- CRIAR TABELA DE MEMBROS COM TODOS OS CAMPOS
-- ============================================================

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  marital_status VARCHAR(50), -- Solteiro, Casado, Divorciado, Viúvo
  baptism_date DATE,
  ministry_id UUID NOT NULL,
  is_tithe_payer BOOLEAN DEFAULT FALSE,
  has_children BOOLEAN DEFAULT FALSE,
  mother_name VARCHAR(255),
  observations TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE RESTRICT
);

-- Índices
CREATE INDEX idx_members_ministry ON members(ministry_id);
CREATE INDEX idx_members_status ON members(status);

-- RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on members" ON members;
DROP POLICY IF EXISTS "Allow insert on members" ON members;
DROP POLICY IF EXISTS "Allow update on members" ON members;
DROP POLICY IF EXISTS "Allow delete on members" ON members;

CREATE POLICY "Allow public read on members" ON members FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert on members" ON members FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update on members" ON members FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow delete on members" ON members FOR DELETE USING (TRUE);

-- Garantir que ministério não pode ser deletado se tiver membros
-- (já feito no FK com ON DELETE RESTRICT)
