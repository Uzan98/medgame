-- =============================================
-- ECG DIAGNOSIS GAME - SCHEMA
-- =============================================

-- Table for ECG diagnostic cases
CREATE TABLE IF NOT EXISTS ecg_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinical_context TEXT NOT NULL,           -- Brief clinical case (2-3 lines)
    ecg_image_url TEXT NOT NULL,              -- URL from Supabase Storage
    correct_answer TEXT NOT NULL,             -- The correct diagnosis
    alternatives JSONB NOT NULL DEFAULT '[]', -- Array of alternative answers (4-5 options)
    explanation TEXT,                         -- Explanation shown after answer
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    xp_reward INTEGER DEFAULT 20,
    coins_reward INTEGER DEFAULT 10,
    tags TEXT[] DEFAULT '{}',                 -- Tags like ["cardiologia", "arritmia"]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active cases
CREATE INDEX IF NOT EXISTS idx_ecg_cases_active ON ecg_cases(is_active) WHERE is_active = true;

-- Index for difficulty filtering
CREATE INDEX IF NOT EXISTS idx_ecg_cases_difficulty ON ecg_cases(difficulty);

-- Enable RLS
ALTER TABLE ecg_cases ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read all cases (for admin listing)
CREATE POLICY "Authenticated users can read all ECG cases"
ON ecg_cases FOR SELECT
TO authenticated
USING (true);

-- Policy: Anon users can only read active cases (for game)
CREATE POLICY "Anon can read active ECG cases"
ON ecg_cases FOR SELECT
TO anon
USING (is_active = true);

-- Policy: Authenticated users can insert new cases (for admin)
CREATE POLICY "Authenticated users can insert ECG cases"
ON ecg_cases FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Authenticated users can update cases (for admin)
CREATE POLICY "Authenticated users can update ECG cases"
ON ecg_cases FOR UPDATE
TO authenticated
USING (true);

-- Policy: Authenticated users can delete cases (for admin)
CREATE POLICY "Authenticated users can delete ECG cases"
ON ecg_cases FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- ECG GAME SESSIONS (for tracking scores)  
-- =============================================

CREATE TABLE IF NOT EXISTS ecg_game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cases_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,                 -- Current streak
    best_streak INTEGER DEFAULT 0,            -- Best streak in session
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ecg_game_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own sessions
CREATE POLICY "Users can see own ECG sessions"
ON ecg_game_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own sessions
CREATE POLICY "Users can create own ECG sessions"
ON ecg_game_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update own ECG sessions"
ON ecg_game_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- =============================================
-- SAMPLE DATA (you can delete after testing)
-- =============================================

INSERT INTO ecg_cases (clinical_context, ecg_image_url, correct_answer, alternatives, explanation, difficulty, tags) VALUES
(
    'Homem, 58 anos, dor torácica opressiva há 2 horas, irradiando para braço esquerdo. Sudorese intensa.',
    'https://via.placeholder.com/800x400/1e293b/22d3ee?text=ECG+Placeholder',
    'Infarto Agudo do Miocárdio com Supra de ST',
    '["Infarto Agudo do Miocárdio com Supra de ST", "Fibrilação Atrial", "Bloqueio de Ramo Esquerdo", "Taquicardia Sinusal"]',
    'O ECG mostra supradesnivelamento do segmento ST em derivações V1-V4, característico de IAM anterior.',
    'easy',
    ARRAY['cardiologia', 'emergência', 'IAM']
),
(
    'Mulher, 72 anos, palpitações há 3 dias. FC irregular ao exame físico.',
    'https://via.placeholder.com/800x400/1e293b/22d3ee?text=ECG+Placeholder+2',
    'Fibrilação Atrial',
    '["Fibrilação Atrial", "Flutter Atrial", "Taquicardia Supraventricular", "Extrassístoles Atriais"]',
    'Ritmo irregularmente irregular, ausência de ondas P definidas e linha de base fibrilatória são característicos de FA.',
    'medium',
    ARRAY['cardiologia', 'arritmia', 'FA']
);
