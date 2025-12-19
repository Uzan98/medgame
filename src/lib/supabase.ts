import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Helper types for database
export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string;
                    email: string;
                    display_name: string | null;
                    avatar_url: string | null;
                };
                Insert: {
                    id: string;
                    email: string;
                    display_name?: string | null;
                    avatar_url?: string | null;
                };
                Update: {
                    display_name?: string | null;
                    avatar_url?: string | null;
                };
            };
            game_state: {
                Row: {
                    id: string;
                    user_id: string;
                    coins: number;
                    xp: number;
                    level: number;
                    streak: number;
                    energy: number;
                    hunger: number;
                    reputation: number;
                    stats: Record<string, number>;
                    owned_items: string[];
                    unlocked_professions: string[];
                    has_seen_tutorial: boolean;
                    is_premium: boolean;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    coins?: number;
                    xp?: number;
                    level?: number;
                };
                Update: Partial<Omit<Database['public']['Tables']['game_state']['Row'], 'id' | 'user_id'>>;
            };
        };
    };
};
