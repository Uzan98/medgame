-- ================================================
-- Shifts (Plantões) Database Schema
-- ================================================
-- Execute este SQL no Supabase SQL Editor

-- Table: shifts (plantões)
CREATE TABLE IF NOT EXISTS shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    specialty TEXT NOT NULL,
    icon TEXT DEFAULT '🏥',
    duration INTEGER NOT NULL DEFAULT 6,
    payment INTEGER NOT NULL DEFAULT 100,
    difficulty TEXT NOT NULL DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
    required_level INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: shift_cases (casos dentro de cada plantão)
CREATE TABLE IF NOT EXISTS shift_cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    patient_info TEXT NOT NULL,
    description TEXT NOT NULL,
    media_type TEXT DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video', 'audio', 'mixed')),
    media_images TEXT[] DEFAULT '{}',
    media_video TEXT,
    media_audio TEXT,
    total_points INTEGER NOT NULL DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: shift_questions (perguntas de cada caso)
CREATE TABLE IF NOT EXISTS shift_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES shift_cases(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL,
    correct_index INTEGER NOT NULL,
    explanation TEXT,
    points INTEGER NOT NULL DEFAULT 50,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shift_cases_shift_id ON shift_cases(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_questions_case_id ON shift_questions(case_id);
CREATE INDEX IF NOT EXISTS idx_shifts_specialty ON shifts(specialty);
CREATE INDEX IF NOT EXISTS idx_shifts_active ON shifts(is_active);

-- Enable RLS
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Everyone can read, only authenticated can modify
CREATE POLICY "Public read shifts" ON shifts FOR SELECT USING (true);
CREATE POLICY "Auth insert shifts" ON shifts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update shifts" ON shifts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete shifts" ON shifts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Public read shift_cases" ON shift_cases FOR SELECT USING (true);
CREATE POLICY "Auth insert shift_cases" ON shift_cases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update shift_cases" ON shift_cases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete shift_cases" ON shift_cases FOR DELETE TO authenticated USING (true);

CREATE POLICY "Public read shift_questions" ON shift_questions FOR SELECT USING (true);
CREATE POLICY "Auth insert shift_questions" ON shift_questions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update shift_questions" ON shift_questions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete shift_questions" ON shift_questions FOR DELETE TO authenticated USING (true);

-- ================================================
-- Storage Bucket for Media (run separately if needed)
-- ================================================
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('shift-media', 'shift-media', true)
-- ON CONFLICT (id) DO NOTHING;

-- CREATE POLICY "Public read shift-media" ON storage.objects 
-- FOR SELECT USING (bucket_id = 'shift-media');

-- CREATE POLICY "Auth upload shift-media" ON storage.objects 
-- FOR INSERT TO authenticated WITH CHECK (bucket_id = 'shift-media');
