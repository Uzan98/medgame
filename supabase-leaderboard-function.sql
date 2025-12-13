-- ================================================
-- Leaderboard PostgreSQL Function (Optimized)
-- ================================================
-- Execute este SQL no Supabase SQL Editor

-- Remover função existente se houver
DROP FUNCTION IF EXISTS get_leaderboard();

-- Criar função otimizada para leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
    user_id uuid,
    display_name text,
    avatar_url text,
    xp integer,
    level integer,
    streak integer,
    cases_completed integer,
    quizzes_taken integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.user_id,
        COALESCE(p.display_name, 'Jogador') as display_name,
        p.avatar_url,
        g.xp,
        g.level,
        g.streak,
        COALESCE((g.stats->>'casesCompleted')::integer, 0) as cases_completed,
        COALESCE((g.stats->>'quizzesTaken')::integer, 0) as quizzes_taken
    FROM game_state g
    LEFT JOIN profiles p ON g.user_id = p.id
    ORDER BY g.xp DESC
    LIMIT 100;
END;
$$;

-- Dar permissão para usuários autenticados e anônimos chamarem a função
GRANT EXECUTE ON FUNCTION get_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard() TO anon;

-- ================================================
-- Testar a função (opcional)
-- ================================================
-- SELECT * FROM get_leaderboard();
