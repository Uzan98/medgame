-- MedGame Supabase Schema v2 - FIXED
-- Run this in Supabase SQL Editor AFTER dropping old tables

-- First, drop existing objects (if upgrading)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP TRIGGER IF EXISTS update_game_state_updated_at ON game_state;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS update_updated_at();
DROP VIEW IF EXISTS leaderboard;
DROP TABLE IF EXISTS game_state;
DROP TABLE IF EXISTS profiles;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT
);

-- Game state table (stores all game progress)
CREATE TABLE game_state (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    coins INTEGER DEFAULT 1300,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    energy INTEGER DEFAULT 100,
    hunger INTEGER DEFAULT 0,
    reputation INTEGER DEFAULT 3,
    stats JSONB DEFAULT '{"casesCompleted": 0, "quizzesTaken": 0, "totalCorrectAnswers": 0, "bestStreak": 0, "totalPlayTime": 0, "totalStudyTime": 0}'::jsonb,
    owned_items TEXT[] DEFAULT '{}',
    unlocked_professions TEXT[] DEFAULT '{}',
    has_seen_tutorial BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    last_rest_time BIGINT DEFAULT 0,
    last_hunger_update BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard view (SECURITY INVOKER - respects RLS)
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    p.display_name,
    p.avatar_url,
    g.xp,
    g.level,
    g.streak,
    (g.stats->>'casesCompleted')::int as cases_completed,
    (g.stats->>'quizzesTaken')::int as quizzes_taken
FROM game_state g
JOIN profiles p ON g.user_id = p.id
ORDER BY g.xp DESC
LIMIT 100;

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow everyone to read profiles for leaderboard
CREATE POLICY "Everyone can read profiles for leaderboard" ON profiles
    FOR SELECT USING (true);

-- Game state policies
CREATE POLICY "Users can read own game state" ON game_state
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own game state" ON game_state
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game state" ON game_state
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow everyone to read game_state for leaderboard
CREATE POLICY "Everyone can read game_state for leaderboard" ON game_state
    FOR SELECT USING (true);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Insert game state
    INSERT INTO public.game_state (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the auth
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_game_state_updated_at
    BEFORE UPDATE ON game_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Grant access to authenticated users
GRANT SELECT ON leaderboard TO authenticated;
GRANT SELECT ON leaderboard TO anon;
