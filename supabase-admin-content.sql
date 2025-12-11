-- MedGame Admin Content Tables
-- Run this in Supabase SQL Editor to add admin content support

-- Clinical Cases Table (stores full case data as JSONB)
CREATE TABLE IF NOT EXISTS clinical_cases (
    id TEXT PRIMARY KEY, -- Use the case ID from the app (e.g., 'case-001')
    case_data JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Cases Table (stores full quiz data as JSONB)
CREATE TABLE IF NOT EXISTS quiz_cases (
    id TEXT PRIMARY KEY, -- Use the quiz ID from the app (e.g., 'quiz-001')
    quiz_data JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clinical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_cases ENABLE ROW LEVEL SECURITY;

-- Everyone can read cases and quizzes (they're public content)
CREATE POLICY "Anyone can read clinical cases" ON clinical_cases
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read quiz cases" ON quiz_cases
    FOR SELECT USING (true);

-- Authenticated users can create/update/delete (for now, any logged user can be admin)
-- In production, you'd want a separate 'is_admin' column in profiles
CREATE POLICY "Authenticated can insert clinical cases" ON clinical_cases
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update clinical cases" ON clinical_cases
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete clinical cases" ON clinical_cases
    FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert quiz cases" ON quiz_cases
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update quiz cases" ON quiz_cases
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete quiz cases" ON quiz_cases
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Triggers for updated_at
CREATE TRIGGER update_clinical_cases_updated_at
    BEFORE UPDATE ON clinical_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_quiz_cases_updated_at
    BEFORE UPDATE ON quiz_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Grant access
GRANT SELECT ON clinical_cases TO anon;
GRANT SELECT ON clinical_cases TO authenticated;
GRANT INSERT, UPDATE, DELETE ON clinical_cases TO authenticated;

GRANT SELECT ON quiz_cases TO anon;
GRANT SELECT ON quiz_cases TO authenticated;
GRANT INSERT, UPDATE, DELETE ON quiz_cases TO authenticated;
