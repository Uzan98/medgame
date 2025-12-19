-- OSCE Cases Table for Consulta Express
-- Run this in Supabase SQL Editor

-- Create table
CREATE TABLE IF NOT EXISTS osce_cases (
    id TEXT PRIMARY KEY,
    case_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE osce_cases ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated to read osce_cases" ON osce_cases
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update/delete (for admin)
CREATE POLICY "Allow authenticated to manage osce_cases" ON osce_cases
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_osce_cases_updated_at
    BEFORE UPDATE ON osce_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Grant access
GRANT ALL ON osce_cases TO authenticated;
