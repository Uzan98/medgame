import { supabase } from './supabase';
import { useGameStore } from '../store/gameStore';

/**
 * Syncs user public profile to user_profiles table
 * Called on login and periodically to keep profile updated
 */
export const syncUserProfile = async (userId: string, email: string, displayName?: string) => {
    try {
        const state = useGameStore.getState();

        // Generate friend code from user ID (deterministic)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let friendCode = '';
        for (let i = 0; i < 8; i++) {
            const index = (userId.charCodeAt(i % userId.length) + i) % chars.length;
            friendCode += chars[index];
        }

        const profile = {
            id: userId,
            display_name: displayName || email.split('@')[0] || 'Jogador',
            avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`,
            level: state.level || 1,
            xp: state.xp || 0,
            coins: state.coins || 0,
            streak: state.streak || 0,
            cases_completed: state.stats?.casesCompleted || 0,
            friend_code: friendCode,
            is_public: true,
            last_seen: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('user_profiles')
            .upsert(profile, { onConflict: 'id' });

        if (error) {
            console.error('Error syncing user profile:', error.message);
            return false;
        }

        console.log('✅ User profile synced successfully');
        return true;
    } catch (err) {
        console.error('Failed to sync user profile:', err);
        return false;
    }
};

/**
 * Update profile stats (call this after game state saves)
 */
export const updateProfileStats = async (userId: string) => {
    try {
        const state = useGameStore.getState();

        const { error } = await supabase
            .from('user_profiles')
            .update({
                level: state.level,
                xp: state.xp,
                coins: state.coins,
                streak: state.streak,
                cases_completed: state.stats?.casesCompleted || 0,
                last_seen: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) {
            // Profile might not exist yet, try upsert
            console.warn('Profile update failed, might not exist:', error.message);
        }
    } catch (err) {
        console.error('Failed to update profile stats:', err);
    }
};
