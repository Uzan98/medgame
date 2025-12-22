// Friend System Types

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface Friend {
    id: string;
    friendId: string;
    status: FriendshipStatus;
    createdAt: string;
    // Profile data (joined from user_profiles)
    profile?: UserProfile;
}

export interface FriendRequest {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: 'pending';
    createdAt: string;
    // Sender's profile (joined from user_profiles)
    senderProfile?: UserProfile;
}

export interface UserProfile {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    level: number;
    xp: number;
    coins: number;
    streak: number;
    casesCompleted: number;
    friendCode: string;
    isPublic: boolean;
    lastSeen: string;
    createdAt: string;
}

// Database row types (snake_case from Supabase)
export interface FriendRow {
    id: string;
    user_id: string;
    friend_id: string;
    status: FriendshipStatus;
    created_at: string;
    updated_at: string;
}

export interface UserProfileRow {
    id: string;
    display_name: string;
    avatar_url: string | null;
    level: number;
    xp: number;
    coins: number;
    streak: number;
    cases_completed: number;
    friend_code: string;
    is_public: boolean;
    last_seen: string;
    created_at: string;
}

// Mappers
export const mapRowToProfile = (row: UserProfileRow): UserProfile => ({
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    level: row.level,
    xp: row.xp,
    coins: row.coins,
    streak: row.streak,
    casesCompleted: row.cases_completed,
    friendCode: row.friend_code,
    isPublic: row.is_public,
    lastSeen: row.last_seen,
    createdAt: row.created_at,
});

export const mapProfileToRow = (profile: Partial<UserProfile>): Partial<UserProfileRow> => ({
    display_name: profile.displayName,
    avatar_url: profile.avatarUrl,
    level: profile.level,
    xp: profile.xp,
    coins: profile.coins,
    streak: profile.streak,
    cases_completed: profile.casesCompleted,
    friend_code: profile.friendCode,
    is_public: profile.isPublic,
});
