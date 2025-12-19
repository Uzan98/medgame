-- ============================================
-- Plantão Infinito - Database Schema
-- ============================================

-- Table: plantao_cases (mini-cases for the game)
CREATE TABLE IF NOT EXISTS plantao_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialty TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL CHECK (array_length(options, 1) = 4),
    correct_index INTEGER NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: plantao_events (chaos events)
CREATE TABLE IF NOT EXISTS plantao_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    effect TEXT NOT NULL CHECK (effect IN ('add_patients', 'remove_patients', 'add_chaos', 'reduce_chaos', 'blackout', 'double_points', 'time_pressure')),
    value INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE plantao_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantao_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plantao_cases
CREATE POLICY "Allow public read of plantao_cases"
    ON plantao_cases FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert of plantao_cases"
    ON plantao_cases FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update of plantao_cases"
    ON plantao_cases FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated delete of plantao_cases"
    ON plantao_cases FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for plantao_events
CREATE POLICY "Allow public read of plantao_events"
    ON plantao_events FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert of plantao_events"
    ON plantao_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update of plantao_events"
    ON plantao_events FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated delete of plantao_events"
    ON plantao_events FOR DELETE
    TO authenticated
    USING (true);

-- Insert sample data for plantao_cases
INSERT INTO plantao_cases (specialty, question, options, correct_index) VALUES
('Clínica', 'Paciente com febre há 3 dias e tosse produtiva. Conduta?', ARRAY['Antibiótico empírico', 'Apenas sintomáticos', 'TC de tórax urgente', 'Internação imediata'], 0),
('Cardio', 'ECG mostra supra de ST em V1-V4. Diagnóstico?', ARRAY['IAM inferior', 'IAM anterior', 'Pericardite', 'BRE'], 1),
('Neuro', 'Hemiparesia direita súbita há 2 horas. Prioridade?', ARRAY['TC de crânio urgente', 'RM de crânio', 'Punção lombar', 'Observar 24h'], 0),
('Pediatria', 'Criança 2 anos com estridor e tosse ladrante. Conduta?', ARRAY['Nebulização com adrenalina', 'Antibiótico IV', 'Intubação imediata', 'Alta com orientações'], 0),
('Clínica', 'Dor abdominal em FID, Blumberg +. Próximo passo?', ARRAY['USG abdome', 'Cirurgia de urgência', 'Colonoscopia', 'Observação'], 1),
('Cardio', 'PA 80x50, FC 120, B3 presente. Qual o choque?', ARRAY['Hipovolêmico', 'Cardiogênico', 'Séptico', 'Neurogênico'], 1),
('Neuro', 'Convulsão tônico-clônica há 5 min. Droga de escolha?', ARRAY['Fenitoína', 'Diazepam', 'Fenobarbital', 'Carbamazepina'], 1),
('Trauma', 'Trauma fechado, instável, FAST +. Conduta?', ARRAY['TC de abdome', 'Laparotomia exploradora', 'Observação', 'Lavado peritoneal'], 1);

-- Insert sample data for plantao_events
INSERT INTO plantao_events (icon, title, description, effect, value) VALUES
('🚑', 'SAMU Chegando!', '+3 pacientes na fila!', 'add_patients', 3),
('🔦', 'Queda de Luz!', 'Tela escurece por 5 segundos', 'blackout', 5),
('😭', 'Familiar Histérico!', 'Tempo reduzido por 10s', 'time_pressure', 10),
('☕', 'Café Chegou!', 'Caos reduzido!', 'reduce_chaos', 15),
('👨‍⚕️', 'Residente Chegou!', 'Fila reduzida em 2!', 'remove_patients', 2),
('👔', 'Paciente VIP!', 'Próximo caso vale dobro', 'double_points', 1),
('📹', 'Vereador Filmando!', '+20% de caos! "Olha essa situação!"', 'add_chaos', 20);
