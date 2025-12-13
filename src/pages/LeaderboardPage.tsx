import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Flame, Star, ChevronUp, ChevronDown, Minus, Loader2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../contexts/AuthContext';
import { getLeaderboard } from '../lib/gameStateSync';
import clsx from 'clsx';

type TimeFilter = 'week' | 'month' | 'all';
type CategoryFilter = 'xp' | 'cases' | 'streak';

interface LeaderboardPlayer {
    id: string;
    userId: string;
    name: string;
    avatar: string;
    level: number;
    xp: number;
    casesCompleted: number;
    streak: number;
    rank: number;
    change: 'up' | 'down' | 'same';
}

const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-slate-400">#{rank}</span>;
};

const getChangeIcon = (change: 'up' | 'down' | 'same') => {
    if (change === 'up') return <ChevronUp className="w-4 h-4 text-emerald-400" />;
    if (change === 'down') return <ChevronDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
};

export const LeaderboardPage: React.FC = () => {
    const { xp, level, stats, streak } = useGameStore();
    const { user } = useAuth();
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('xp');
    const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRank, setUserRank] = useState<number>(0);

    // Load leaderboard data from Supabase
    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            try {
                const data = await getLeaderboard();

                // Transform Supabase data to our format
                const transformedPlayers: LeaderboardPlayer[] = data.map((player, index) => ({
                    id: String(index),
                    userId: player.user_id,
                    name: player.display_name || 'Jogador Anônimo',
                    avatar: player.avatar_url || player.display_name || 'User',
                    level: player.level || 1,
                    xp: player.xp || 0,
                    casesCompleted: player.cases_completed || 0,
                    streak: player.streak || 0,
                    rank: index + 1,
                    change: 'same' as const, // We don't track changes yet
                }));

                // Sort based on selected category
                if (categoryFilter === 'xp') {
                    transformedPlayers.sort((a, b) => b.xp - a.xp);
                } else if (categoryFilter === 'cases') {
                    transformedPlayers.sort((a, b) => b.casesCompleted - a.casesCompleted);
                } else if (categoryFilter === 'streak') {
                    transformedPlayers.sort((a, b) => b.streak - a.streak);
                }

                // Update ranks after sorting
                transformedPlayers.forEach((p, i) => p.rank = i + 1);


                setPlayers(transformedPlayers);

                // Find user's rank
                if (user) {
                    const userIndex = data.findIndex(p =>
                        p.display_name?.toLowerCase() === user.email?.split('@')[0].toLowerCase()
                    );
                    setUserRank(userIndex >= 0 ? userIndex + 1 : transformedPlayers.length + 1);
                }
            } catch (error) {
                console.error('Error loading leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, [categoryFilter, user]);

    // Find current user in the players list using their auth user ID
    const currentUserFromList = players.find(p => p.userId === user?.id);

    const userPlayer: LeaderboardPlayer = currentUserFromList || {
        id: 'user',
        userId: user?.id || '',
        name: 'Você',
        avatar: 'User',
        level,
        xp,
        casesCompleted: stats.casesCompleted,
        streak,
        rank: userRank || players.length + 1,
        change: 'same'
    };

    const getValue = (player: LeaderboardPlayer) => {
        if (categoryFilter === 'xp') return `${player.xp.toLocaleString()} XP`;
        if (categoryFilter === 'cases') return `${player.casesCompleted} casos`;
        return `${player.streak} dias`;
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Carregando ranking...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="mb-4 shrink-0">
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-1">Ranking</h1>
                <p className="text-sm text-slate-400">Veja quem são os melhores médicos!</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
                {/* Time Filter */}
                <div className="flex gap-2">
                    {[
                        { id: 'week', label: 'Semana' },
                        { id: 'month', label: 'Mês' },
                        { id: 'all', label: 'Geral' },
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setTimeFilter(filter.id as TimeFilter)}
                            className={clsx(
                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                timeFilter === filter.id
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Category Filter */}
                <div className="flex gap-2">
                    {[
                        { id: 'xp', label: 'XP', icon: Star },
                        { id: 'cases', label: 'Casos', icon: Trophy },
                        { id: 'streak', label: 'Streak', icon: Flame },
                    ].map((filter) => {
                        const Icon = filter.icon;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => setCategoryFilter(filter.id as CategoryFilter)}
                                className={clsx(
                                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                    categoryFilter === filter.id
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                        : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                                )}
                            >
                                <Icon className="w-3 h-3" />
                                {filter.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Empty State */}
            {players.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-300 mb-1">Nenhum jogador ainda</h3>
                        <p className="text-sm text-slate-500">Seja o primeiro a aparecer no ranking!</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Top 3 Podium */}
                    {players.length >= 3 && (
                        <div className="flex items-end justify-center gap-2 mb-4 shrink-0">
                            {/* 2nd Place */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-slate-700 border-2 border-slate-400 overflow-hidden mb-1">
                                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${players[1].avatar}`} alt="" className="w-full h-full" />
                                </div>
                                <Medal className="w-5 h-5 text-slate-300 -mt-2 mb-1" />
                                <div className="bg-slate-700 rounded-t-lg w-20 h-16 lg:w-24 lg:h-20 flex flex-col items-center justify-center">
                                    <span className="text-xs text-slate-300 truncate max-w-[90%]">{players[1].name}</span>
                                    <span className="text-[10px] text-slate-400">{getValue(players[1])}</span>
                                </div>
                            </div>

                            {/* 1st Place */}
                            <div className="flex flex-col items-center">
                                <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-slate-700 border-4 border-yellow-400 overflow-hidden mb-1 shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${players[0].avatar}`} alt="" className="w-full h-full" />
                                </div>
                                <Crown className="w-6 h-6 text-yellow-400 -mt-2 mb-1" />
                                <div className="bg-gradient-to-t from-yellow-600/20 to-yellow-500/10 border border-yellow-500/30 rounded-t-lg w-24 h-20 lg:w-28 lg:h-24 flex flex-col items-center justify-center">
                                    <span className="text-xs text-yellow-300 font-bold truncate max-w-[90%]">{players[0].name}</span>
                                    <span className="text-[10px] text-yellow-200">{getValue(players[0])}</span>
                                </div>
                            </div>

                            {/* 3rd Place */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-slate-700 border-2 border-amber-600 overflow-hidden mb-1">
                                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${players[2].avatar}`} alt="" className="w-full h-full" />
                                </div>
                                <Medal className="w-5 h-5 text-amber-600 -mt-2 mb-1" />
                                <div className="bg-amber-900/20 border border-amber-600/30 rounded-t-lg w-20 h-14 lg:w-24 lg:h-18 flex flex-col items-center justify-center">
                                    <span className="text-xs text-amber-200 truncate max-w-[90%]">{players[2].name}</span>
                                    <span className="text-[10px] text-amber-300">{getValue(players[2])}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rankings List - Show all when less than 3, otherwise skip top 3 which are in podium */}
                    <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
                        {(players.length >= 3 ? players.slice(3) : players).map((player) => (
                            <div
                                key={player.id}
                                className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-xl p-3 hover:border-slate-600 transition-colors"
                            >
                                {/* Rank */}
                                <div className="w-8 flex items-center justify-center">
                                    {getRankIcon(player.rank)}
                                </div>

                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0">
                                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${player.avatar}`} alt="" className="w-full h-full" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-sm truncate">{player.name}</span>
                                        <span className="text-[10px] text-slate-500">Lv.{player.level}</span>
                                    </div>
                                </div>

                                {/* Value */}
                                <div className="text-right">
                                    <div className="text-sm font-bold text-cyan-400">{getValue(player)}</div>
                                    <div className="flex items-center justify-end">
                                        {getChangeIcon(player.change)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Separator */}
                        <div className="flex items-center gap-2 py-2">
                            <div className="flex-1 h-px bg-slate-700" />
                            <span className="text-xs text-slate-500">Sua posição</span>
                            <div className="flex-1 h-px bg-slate-700" />
                        </div>

                        {/* User's Position */}
                        <div className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
                            {/* Rank */}
                            <div className="w-8 flex items-center justify-center">
                                {getRankIcon(userPlayer.rank)}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-cyan-500 overflow-hidden shrink-0">
                                <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${userPlayer.avatar}`} alt="" className="w-full h-full" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-cyan-400 text-sm truncate">{userPlayer.name}</span>
                                    <span className="text-[10px] text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded">Você</span>
                                </div>
                                <span className="text-[10px] text-slate-400">Nível {userPlayer.level}</span>
                            </div>

                            {/* Value */}
                            <div className="text-right">
                                <div className="text-sm font-bold text-cyan-400">{getValue(userPlayer)}</div>
                                <div className="flex items-center justify-end">
                                    {getChangeIcon(userPlayer.change)}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
