import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
    Friend,
    FriendRequest,
    UserProfile,
    FriendRow,
    UserProfileRow,
    mapRowToProfile,
} from '../lib/friendTypes';
import { useToastStore } from './toastStore';

interface FriendStoreState {
    friends: Friend[];
    pendingRequests: FriendRequest[];
    searchResults: UserProfile[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchFriends: (userId: string) => Promise<void>;
    fetchPendingRequests: (userId: string) => Promise<void>;
    searchUsers: (query: string, currentUserId: string) => Promise<void>;
    sendFriendRequest: (fromUserId: string, toUserId: string) => Promise<{ success: boolean; error?: string }>;
    acceptRequest: (requestId: string, userId: string) => Promise<{ success: boolean }>;
    rejectRequest: (requestId: string) => Promise<{ success: boolean }>;
    removeFriend: (friendId: string, userId: string) => Promise<{ success: boolean }>;
    getUserProfile: (userId: string) => Promise<UserProfile | null>;
    updateMyProfile: (userId: string, updates: Partial<UserProfile>) => Promise<{ success: boolean }>;
    generateFriendCode: () => string;
}

export const useFriendStore = create<FriendStoreState>((set, get) => ({
    friends: [],
    pendingRequests: [],
    searchResults: [],
    isLoading: false,
    error: null,

    // Fetch accepted friends
    fetchFriends: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            // Get friendships where user is either user_id or friend_id
            const { data: friendships, error } = await supabase
                .from('friends')
                .select('*')
                .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
                .eq('status', 'accepted');

            if (error) throw error;

            // Get friend user IDs
            const friendIds = (friendships as FriendRow[]).map(f =>
                f.user_id === userId ? f.friend_id : f.user_id
            );

            // Fetch profiles for friends
            if (friendIds.length > 0) {
                const { data: profiles, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .in('id', friendIds);

                if (profileError) throw profileError;

                const friendsWithProfiles: Friend[] = (friendships as FriendRow[]).map(f => {
                    const friendUserId = f.user_id === userId ? f.friend_id : f.user_id;
                    const profile = (profiles as UserProfileRow[]).find(p => p.id === friendUserId);
                    return {
                        id: f.id,
                        friendId: friendUserId,
                        status: f.status,
                        createdAt: f.created_at,
                        profile: profile ? mapRowToProfile(profile) : undefined,
                    };
                });

                set({ friends: friendsWithProfiles, isLoading: false });
            } else {
                set({ friends: [], isLoading: false });
            }
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    // Fetch pending requests (where I'm the recipient)
    fetchPendingRequests: async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('friends')
                .select('*')
                .eq('friend_id', userId)
                .eq('status', 'pending');

            if (error) throw error;

            // Get sender profiles
            const senderIds = (data as FriendRow[]).map(r => r.user_id);
            if (senderIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .in('id', senderIds);

                const requests: FriendRequest[] = (data as FriendRow[]).map(r => ({
                    id: r.id,
                    fromUserId: r.user_id,
                    toUserId: r.friend_id,
                    status: 'pending' as const,
                    createdAt: r.created_at,
                    senderProfile: profiles
                        ? mapRowToProfile((profiles as UserProfileRow[]).find(p => p.id === r.user_id)!)
                        : undefined,
                }));

                set({ pendingRequests: requests });
            } else {
                set({ pendingRequests: [] });
            }
        } catch (err: any) {
            console.error('Failed to fetch requests:', err.message);
        }
    },

    // Search users by name or friend code
    searchUsers: async (query: string, currentUserId: string) => {
        if (!query.trim()) {
            set({ searchResults: [] });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .neq('id', currentUserId)
                .or(`display_name.ilike.%${query}%,friend_code.eq.${query.toUpperCase()}`)
                .limit(10);

            if (error) throw error;

            const profiles = (data as UserProfileRow[]).map(mapRowToProfile);
            set({ searchResults: profiles });
        } catch (err: any) {
            console.error('Search failed:', err.message);
            set({ searchResults: [] });
        }
    },

    // Send friend request
    sendFriendRequest: async (fromUserId: string, toUserId: string) => {
        try {
            // Check if already friends or pending
            const { data: existing } = await supabase
                .from('friends')
                .select('*')
                .or(`and(user_id.eq.${fromUserId},friend_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_id.eq.${fromUserId})`)
                .limit(1);

            if (existing && existing.length > 0) {
                return { success: false, error: 'Já existe uma solicitação ou amizade' };
            }

            const { error } = await supabase
                .from('friends')
                .insert({
                    user_id: fromUserId,
                    friend_id: toUserId,
                    status: 'pending',
                });

            if (error) throw error;

            useToastStore.getState().addToast('Solicitação enviada! 📨', 'success');
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    },

    // Accept friend request
    acceptRequest: async (requestId: string, userId: string) => {
        try {
            const { error } = await supabase
                .from('friends')
                .update({ status: 'accepted' })
                .eq('id', requestId);

            if (error) throw error;

            // Refresh lists
            await get().fetchPendingRequests(userId);
            await get().fetchFriends(userId);

            useToastStore.getState().addToast('Amigo adicionado! 🎉', 'success');
            return { success: true };
        } catch (err: any) {
            return { success: false };
        }
    },

    // Reject friend request
    rejectRequest: async (requestId: string) => {
        try {
            const { error } = await supabase
                .from('friends')
                .delete()
                .eq('id', requestId);

            if (error) throw error;

            set(state => ({
                pendingRequests: state.pendingRequests.filter(r => r.id !== requestId),
            }));

            return { success: true };
        } catch (err: any) {
            return { success: false };
        }
    },

    // Remove a friend
    removeFriend: async (friendId: string, userId: string) => {
        try {
            const { error } = await supabase
                .from('friends')
                .delete()
                .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

            if (error) throw error;

            set(state => ({
                friends: state.friends.filter(f => f.friendId !== friendId),
            }));

            useToastStore.getState().addToast('Amigo removido', 'info');
            return { success: true };
        } catch (err: any) {
            return { success: false };
        }
    },

    // Get a user's public profile
    getUserProfile: async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return mapRowToProfile(data as UserProfileRow);
        } catch {
            return null;
        }
    },

    // Update my profile
    updateMyProfile: async (userId: string, updates: Partial<UserProfile>) => {
        try {
            const row: Record<string, any> = {};
            if (updates.displayName !== undefined) row.display_name = updates.displayName;
            if (updates.avatarUrl !== undefined) row.avatar_url = updates.avatarUrl;
            if (updates.level !== undefined) row.level = updates.level;
            if (updates.xp !== undefined) row.xp = updates.xp;
            if (updates.coins !== undefined) row.coins = updates.coins;
            if (updates.streak !== undefined) row.streak = updates.streak;
            if (updates.casesCompleted !== undefined) row.cases_completed = updates.casesCompleted;
            if (updates.isPublic !== undefined) row.is_public = updates.isPublic;
            row.last_seen = new Date().toISOString();

            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: userId,
                    ...row,
                });

            if (error) throw error;
            return { success: true };
        } catch {
            return { success: false };
        }
    },

    // Generate a unique friend code
    generateFriendCode: () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },
}));
