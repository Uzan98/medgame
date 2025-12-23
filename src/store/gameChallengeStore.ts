import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useToastStore } from './toastStore';
import { useMessageStore } from './messageStore';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
    GameType,
    GameResult,
    getGameChallengeConfig,
    GAME_CHALLENGE_CONFIGS
} from '../lib/gameChallengeConfig';

// Universal Challenge interface
export interface GameChallenge {
    id: string;
    gameType: GameType;
    challengerId: string;
    challengedId: string;

    // Challenger results
    challengerResult: GameResult;
    challengerPlayedAt: string | null;

    // Challenged results  
    challengedResult: GameResult;
    challengedPlayedAt: string | null;

    // Status
    status: 'pending' | 'completed' | 'expired';
    winnerId: string | null;

    // Notification tracking
    challengedNotified: boolean;
    challengerResultNotified: boolean;
    challengedResultNotified: boolean;

    createdAt: string;
    expiresAt: string;

    // Joined data
    challengerName?: string;
    challengerAvatar?: string;
    challengedName?: string;
    challengedAvatar?: string;
}

interface GameChallengeStoreState {
    challenges: GameChallenge[];
    isLoading: boolean;
    channel: RealtimeChannel | null;

    // Actions
    fetchMyChallenges: (userId: string, gameType?: GameType) => Promise<void>;
    createChallenge: (gameType: GameType, challengerId: string, challengedId: string) => Promise<{ success: boolean; challengeId?: string }>;
    submitScore: (challengeId: string, userId: string, result: GameResult) => Promise<{ success: boolean; isComplete?: boolean; winnerId?: string }>;
    getPendingChallenges: (userId: string, gameType?: GameType) => GameChallenge[];
    getSentChallenges: (userId: string, gameType?: GameType) => GameChallenge[];
    getCompletedChallenges: (userId: string, gameType?: GameType) => GameChallenge[];
    subscribeToNewChallenges: (userId: string) => void;
    unsubscribe: () => void;
}

// Map Supabase row to Challenge
interface SupabaseChallengeRow {
    id: string;
    game_type: string;
    challenger_id: string;
    challenged_id: string;
    challenger_result: Record<string, any>;
    challenger_played_at: string | null;
    challenged_result: Record<string, any>;
    challenged_played_at: string | null;
    status: string;
    winner_id: string | null;
    challenged_notified: boolean;
    challenger_result_notified: boolean;
    challenged_result_notified: boolean;
    created_at: string;
    expires_at: string;
}

const mapRowToChallenge = (row: SupabaseChallengeRow): GameChallenge => ({
    id: row.id,
    gameType: row.game_type as GameType,
    challengerId: row.challenger_id,
    challengedId: row.challenged_id,
    challengerResult: row.challenger_result || {},
    challengerPlayedAt: row.challenger_played_at,
    challengedResult: row.challenged_result || {},
    challengedPlayedAt: row.challenged_played_at,
    status: row.status as 'pending' | 'completed' | 'expired',
    winnerId: row.winner_id,
    challengedNotified: row.challenged_notified ?? false,
    challengerResultNotified: row.challenger_result_notified ?? false,
    challengedResultNotified: row.challenged_result_notified ?? false,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
});

export const useGameChallengeStore = create<GameChallengeStoreState>((set, get) => ({
    challenges: [],
    isLoading: false,
    channel: null,

    // Fetch all challenges for user
    fetchMyChallenges: async (userId: string, gameType?: GameType) => {
        set({ isLoading: true });

        try {
            let query = supabase
                .from('game_challenges')
                .select('*')
                .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
                .order('created_at', { ascending: false });

            if (gameType) {
                query = query.eq('game_type', gameType);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Get unique user IDs to fetch profiles
            const userIds = new Set<string>();
            (data || []).forEach((row: SupabaseChallengeRow) => {
                userIds.add(row.challenger_id);
                userIds.add(row.challenged_id);
            });

            // Fetch profiles
            let profilesMap: Record<string, { display_name: string; avatar_url: string | null }> = {};
            if (userIds.size > 0) {
                const { data: profiles } = await supabase
                    .from('user_profiles')
                    .select('id, display_name, avatar_url')
                    .in('id', Array.from(userIds));

                if (profiles) {
                    profiles.forEach(p => {
                        profilesMap[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url };
                    });
                }
            }

            const challenges: GameChallenge[] = (data || []).map((row: SupabaseChallengeRow) => ({
                ...mapRowToChallenge(row),
                challengerName: profilesMap[row.challenger_id]?.display_name || 'Jogador',
                challengerAvatar: profilesMap[row.challenger_id]?.avatar_url || undefined,
                challengedName: profilesMap[row.challenged_id]?.display_name || 'Jogador',
                challengedAvatar: profilesMap[row.challenged_id]?.avatar_url || undefined,
            }));

            // Process notifications
            const challengesToNotify: string[] = [];
            const resultsToNotify: { id: string; isChallenger: boolean }[] = [];

            for (const challenge of challenges) {
                const config = getGameChallengeConfig(challenge.gameType);

                // Notify challenged about new challenge
                if (challenge.challengedId === userId &&
                    challenge.status === 'pending' &&
                    challenge.challengedPlayedAt === null &&
                    !challenge.challengedNotified) {

                    useMessageStore.getState().addMessage({
                        sender: challenge.challengerName || `Desafio ${config.name}`,
                        senderRole: config.name,
                        subject: `${config.emoji} Você foi desafiado!`,
                        content: `${challenge.challengerName || 'Um amigo'} te desafiou para um duelo no ${config.name}!

${challenge.challengerPlayedAt ? config.getNotificationContent(challenge.challengerName || 'Ele', challenge.challengerResult) : 'O desafio está preparado e esperando por você!'}

Acesse os Desafios para jogar e mostrar quem é o melhor!`,
                        type: 'urgent'
                    });

                    challengesToNotify.push(challenge.id);
                }

                // Notify challenger about result
                if (challenge.challengerId === userId &&
                    challenge.status === 'completed' &&
                    !challenge.challengerResultNotified) {

                    const isWinner = challenge.winnerId === userId;
                    const isTie = challenge.winnerId === null;
                    const myResult = config.formatResult(challenge.challengerResult);
                    const opponentResult = config.formatResult(challenge.challengedResult);

                    if (isWinner) {
                        useMessageStore.getState().addMessage({
                            sender: config.name,
                            senderRole: 'Resultados',
                            subject: `🏆 Você venceu no ${config.name}!`,
                            content: `Parabéns! Você venceu o desafio contra ${challenge.challengedName}!

Você: ${myResult}
${challenge.challengedName}: ${opponentResult}

Continue desafiando seus amigos!`,
                            type: 'reward',
                            rewards: { coins: 100, xp: 50 }
                        });
                    } else if (isTie) {
                        useMessageStore.getState().addMessage({
                            sender: config.name,
                            senderRole: 'Resultados',
                            subject: `🤝 Empate no ${config.name}!`,
                            content: `O desafio contra ${challenge.challengedName} terminou empatado!

Desafie novamente para desempatar!`,
                            type: 'info'
                        });
                    } else {
                        useMessageStore.getState().addMessage({
                            sender: config.name,
                            senderRole: 'Resultados',
                            subject: `😔 Você perdeu no ${config.name}`,
                            content: `Você perdeu o desafio contra ${challenge.challengedName}.

Você: ${myResult}
${challenge.challengedName}: ${opponentResult}

Não desanime! Continue praticando!`,
                            type: 'info'
                        });
                    }

                    resultsToNotify.push({ id: challenge.id, isChallenger: true });
                }

                // Notify challenged about result
                if (challenge.challengedId === userId &&
                    challenge.status === 'completed' &&
                    !challenge.challengedResultNotified) {

                    const isWinner = challenge.winnerId === userId;
                    const isTie = challenge.winnerId === null;
                    const myResult = config.formatResult(challenge.challengedResult);
                    const opponentResult = config.formatResult(challenge.challengerResult);

                    if (isWinner) {
                        useMessageStore.getState().addMessage({
                            sender: config.name,
                            senderRole: 'Resultados',
                            subject: `🏆 Você venceu no ${config.name}!`,
                            content: `Você aceitou o desafio de ${challenge.challengerName} e venceu!

Você: ${myResult}
${challenge.challengerName}: ${opponentResult}

Parabéns pela vitória!`,
                            type: 'reward',
                            rewards: { coins: 100, xp: 50 }
                        });
                    } else if (!isTie) {
                        useMessageStore.getState().addMessage({
                            sender: config.name,
                            senderRole: 'Resultados',
                            subject: `😔 Você perdeu no ${config.name}`,
                            content: `Você aceitou o desafio de ${challenge.challengerName}, mas perdeu.

Você: ${myResult}
${challenge.challengerName}: ${opponentResult}

Não desanime! Desafie de volta!`,
                            type: 'info'
                        });
                    }

                    resultsToNotify.push({ id: challenge.id, isChallenger: false });
                }
            }

            // Mark as notified in Supabase (non-blocking)
            if (challengesToNotify.length > 0) {
                supabase
                    .from('game_challenges')
                    .update({ challenged_notified: true })
                    .in('id', challengesToNotify)
                    .then(() => console.log('Marked challenges as notified'));
            }

            for (const result of resultsToNotify) {
                const updateField = result.isChallenger
                    ? { challenger_result_notified: true }
                    : { challenged_result_notified: true };

                supabase
                    .from('game_challenges')
                    .update(updateField)
                    .eq('id', result.id)
                    .then(() => console.log('Marked result as notified'));
            }

            set({ challenges, isLoading: false });
        } catch (err) {
            console.error('Failed to fetch challenges:', err);
            set({ isLoading: false });
        }
    },

    // Create a new challenge
    createChallenge: async (gameType: GameType, challengerId: string, challengedId: string) => {
        try {
            const config = getGameChallengeConfig(gameType);

            const { data, error } = await supabase
                .from('game_challenges')
                .insert({
                    game_type: gameType,
                    challenger_id: challengerId,
                    challenged_id: challengedId,
                })
                .select()
                .single();

            if (error) throw error;

            useToastStore.getState().addToast(`Desafio enviado no ${config.name}! ${config.emoji}`, 'success');

            // Refresh challenges
            await get().fetchMyChallenges(challengerId);

            return { success: true, challengeId: data.id };
        } catch (err) {
            console.error('Failed to create challenge:', err);
            useToastStore.getState().addToast('Erro ao criar desafio', 'error');
            return { success: false };
        }
    },

    // Submit score for any player
    submitScore: async (challengeId: string, userId: string, result: GameResult) => {
        try {
            // Get challenge first
            const { data: challenge, error: fetchError } = await supabase
                .from('game_challenges')
                .select('*')
                .eq('id', challengeId)
                .single();

            if (fetchError || !challenge) throw new Error('Challenge not found');

            const isChallenger = challenge.challenger_id === userId;
            const config = getGameChallengeConfig(challenge.game_type as GameType);

            if (isChallenger) {
                // Challenger submitting
                const { error } = await supabase
                    .from('game_challenges')
                    .update({
                        challenger_result: result,
                        challenger_played_at: new Date().toISOString(),
                    })
                    .eq('id', challengeId);

                if (error) throw error;

                return { success: true, isComplete: false };
            } else {
                // Challenged submitting - determine winner
                const challengerResult = challenge.challenger_result || {};

                const winnerResult = config.determineWinner(challengerResult, result);
                let winnerId: string | null = null;

                if (winnerResult === 'challenger') {
                    winnerId = challenge.challenger_id;
                } else if (winnerResult === 'challenged') {
                    winnerId = challenge.challenged_id;
                }

                const { error } = await supabase
                    .from('game_challenges')
                    .update({
                        challenged_result: result,
                        challenged_played_at: new Date().toISOString(),
                        status: 'completed',
                        winner_id: winnerId,
                    })
                    .eq('id', challengeId);

                if (error) throw error;

                return { success: true, isComplete: true, winnerId: winnerId || undefined };
            }
        } catch (err) {
            console.error('Failed to submit score:', err);
            return { success: false };
        }
    },

    // Get pending challenges
    getPendingChallenges: (userId: string, gameType?: GameType) => {
        return get().challenges.filter(c =>
            c.challengedId === userId &&
            c.status === 'pending' &&
            c.challengedPlayedAt === null &&
            (gameType ? c.gameType === gameType : true)
        );
    },

    // Get sent challenges
    getSentChallenges: (userId: string, gameType?: GameType) => {
        return get().challenges.filter(c =>
            c.challengerId === userId &&
            c.status === 'pending' &&
            c.challengedPlayedAt === null &&
            (gameType ? c.gameType === gameType : true)
        );
    },

    // Get completed challenges
    getCompletedChallenges: (userId: string, gameType?: GameType) => {
        return get().challenges.filter(c =>
            (c.challengerId === userId || c.challengedId === userId) &&
            c.status === 'completed' &&
            (gameType ? c.gameType === gameType : true)
        );
    },

    // Subscribe to new challenges
    subscribeToNewChallenges: (userId: string) => {
        get().unsubscribe();

        const channel = supabase
            .channel('game-challenges-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'game_challenges',
                },
                async (payload) => {
                    if (payload.new.challenged_id !== userId) return;

                    const config = GAME_CHALLENGE_CONFIGS[payload.new.game_type as GameType];
                    if (!config) return;

                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('display_name')
                        .eq('id', payload.new.challenger_id)
                        .single();

                    useToastStore.getState().addToast(
                        `${profile?.display_name || 'Um amigo'} te desafiou no ${config.name}! ${config.emoji}`,
                        'info'
                    );

                    get().fetchMyChallenges(userId);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'game_challenges',
                },
                async (payload) => {
                    if (payload.new.challenger_id === userId && payload.new.status === 'completed') {
                        const config = GAME_CHALLENGE_CONFIGS[payload.new.game_type as GameType];
                        const isWinner = payload.new.winner_id === userId;

                        useToastStore.getState().addToast(
                            isWinner ? `Você venceu no ${config?.name}! 🏆` : `Você perdeu no ${config?.name} 😔`,
                            isWinner ? 'success' : 'info'
                        );
                    }

                    get().fetchMyChallenges(userId);
                }
            )
            .subscribe();

        set({ channel });
    },

    // Unsubscribe
    unsubscribe: () => {
        const { channel } = get();
        if (channel) {
            supabase.removeChannel(channel);
            set({ channel: null });
        }
    },
}));
