import { supabase } from '../lib/supabase';
import { useGameStore, UserStats } from '../store/gameStore';

interface GameStateRow {
    coins: number;
    xp: number;
    level: number;
    streak: number;
    energy: number;
    hunger: number;
    reputation: number;
    stats: UserStats;
    owned_items: string[];
    unlocked_professions: string[];
    has_seen_tutorial: boolean;
    is_premium: boolean;
    last_rest_time: number;
    last_hunger_update: number;
}

// Flag to prevent auto-save during initial load
let isLoadingFromSupabase = false;
let skipNextSaves = 0;

// Load game state from Supabase
export const loadGameState = async (userId: string): Promise<boolean> => {
    try {
        isLoadingFromSupabase = true;
        skipNextSaves = 3; // Skip next 3 save attempts to allow state to settle

        const { data, error } = await supabase
            .from('game_state')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error loading game state:', error);
            isLoadingFromSupabase = false;
            return false;
        }

        if (data) {
            const row = data as GameStateRow;


            useGameStore.setState({
                coins: row.coins,
                xp: row.xp,
                level: row.level,
                streak: row.streak,
                energy: row.energy,
                hunger: row.hunger,
                reputation: row.reputation,
                stats: row.stats,
                ownedItems: row.owned_items || [],
                unlockedProfessions: row.unlocked_professions || [],
                hasSeenTutorial: row.has_seen_tutorial,
                isPremium: row.is_premium,
                lastRestTime: row.last_rest_time || 0,
                lastHungerUpdate: row.last_hunger_update || Date.now(),
            });


            // Allow saves again after a short delay
            setTimeout(() => {
                isLoadingFromSupabase = false;
                skipNextSaves = 0;
            }, 1000);

            return true;
        }
        isLoadingFromSupabase = false;
        return false;
    } catch (err) {
        console.error('Failed to load game state:', err);
        isLoadingFromSupabase = false;
        return false;
    }
};

// Save game state to Supabase
export const saveGameState = async (userId: string): Promise<boolean> => {
    // Don't save while loading
    if (isLoadingFromSupabase) {

        return false;
    }

    try {
        const state = useGameStore.getState();


        // Use upsert to handle both insert and update cases
        const { error } = await supabase
            .from('game_state')
            .upsert({
                user_id: userId,
                coins: state.coins,
                xp: state.xp,
                level: state.level,
                streak: state.streak,
                energy: state.energy,
                hunger: state.hunger,
                reputation: Math.round(state.reputation),
                stats: state.stats,
                owned_items: state.ownedItems,
                unlocked_professions: state.unlockedProfessions,
                has_seen_tutorial: state.hasSeenTutorial,
                is_premium: state.isPremium,
                last_rest_time: state.lastRestTime,
                last_hunger_update: state.lastHungerUpdate,
            }, {
                onConflict: 'user_id'
            })
            .select();

        if (error) {
            console.error('❌ Error saving game state:', error.message, error.details, error.hint);
            return false;
        }


        return true;
    } catch (err) {
        console.error('❌ Failed to save game state:', err);
        return false;
    }
};

// Debounced auto-save (wait 2 seconds after last change)
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
export const debouncedSave = (userId: string) => {
    // Skip if we're loading or need to skip saves
    if (isLoadingFromSupabase || skipNextSaves > 0) {
        if (skipNextSaves > 0) skipNextSaves--;

        return;
    }

    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveGameState(userId);
    }, 2000);
};

// Get leaderboard data - using optimized PostgreSQL RPC function
export const getLeaderboard = async (): Promise<Array<{
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    xp: number;
    level: number;
    streak: number;
    cases_completed: number;
    quizzes_taken: number;
}>> => {
    try {
        // Use optimized RPC function that does the join in the database
        const { data, error } = await supabase.rpc('get_leaderboard');

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }


        return data || [];
    } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        return [];
    }
};

// Update user profile
export const updateProfile = async (userId: string, displayName: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ display_name: displayName })
            .eq('id', userId);

        if (error) {
            console.error('Error updating profile:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Failed to update profile:', err);
        return false;
    }
};
