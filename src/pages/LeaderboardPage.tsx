import React, { useState } from 'react';
import { Trophy, Medal, Crown, Flame, Star, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import clsx from 'clsx';

type TimeFilter = 'week' | 'month' | 'all';
type CategoryFilter = 'xp' | 'cases' | 'streak';

interface LeaderboardPlayer {
    id: string;
    name: string;
    avatar: string;
    specialty: string;
    level: number;
    xp: number;
    casesCompleted: number;
    streak: number;
    rank: number;
    change: 'up' | 'down' | 'same';
}

const mockPlayers: LeaderboardPlayer[] = [
    { id: '1', name: 'Dr. Silva', avatar: 'Sarah', specialty: 'Cardiologia', level: 15, xp: 14500, casesCompleted: 87, streak: 45, rank: 1, change: 'same' },
    { id: '2', name: 'Dra. Santos', avatar: 'Maria', specialty: 'Neurologia', level: 14, xp: 13200, casesCompleted: 76, streak: 32, rank: 2, change: 'up' },
    { id: '3', name: 'Dr. Oliveira', avatar: 'John', specialty: 'Emergência', level: 13, xp: 12800, casesCompleted: 71, streak: 28, rank: 3, change: 'down' },
    { id: '4', name: 'Dra. Costa', avatar: 'Emma', specialty: 'Pediatria', level: 12, xp: 11500, casesCompleted: 65, streak: 21, rank: 4, change: 'up' },
    { id: '5', name: 'Dr. Ferreira', avatar: 'Lucas', specialty: 'Cardiologia', level: 11, xp: 10200, casesCompleted: 58, streak: 19, rank: 5, change: 'same' },
    { id: '6', name: 'Dra. Lima', avatar: 'Ana', specialty: 'Neurologia', level: 10, xp: 9800, casesCompleted: 52, streak: 15, rank: 6, change: 'down' },
    { id: '7', name: 'Dr. Souza', avatar: 'Pedro', specialty: 'Ortopedia', level: 9, xp: 8500, casesCompleted: 45, streak: 12, rank: 7, change: 'up' },
    { id: '8', name: 'Dra. Almeida', avatar: 'Julia', specialty: 'Cardiologia', level: 8, xp: 7200, casesCompleted: 38, streak: 10, rank: 8, change: 'same' },
    { id: '9', name: 'Dr. Rodrigues', avatar: 'Carlos', specialty: 'Emergência', level: 7, xp: 6100, casesCompleted: 32, streak: 8, rank: 9, change: 'up' },
    { id: '10', name: 'Dra. Martins', avatar: 'Laura', specialty: 'Pediatria', level: 6, xp: 5400, casesCompleted: 28, streak: 6, rank: 10, change: 'down' },
];

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
    const { xp, level, stats } = useGameStore();
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('xp');

    // Calculate user's rank (simulated)
    const userRank = 42;
    const userPlayer: LeaderboardPlayer = {
        id: 'user',
        name: 'Dr. Usuário',
        avatar: 'Felix',
        specialty: 'Cardiologia',
        level,
        xp,
        casesCompleted: stats.casesCompleted,
        streak: stats.bestStreak,
        rank: userRank,
        change: 'up'
    };

    const getValue = (player: LeaderboardPlayer) => {
        if (categoryFilter === 'xp') return `${player.xp.toLocaleString()} XP`;
        if (categoryFilter === 'cases') return `${player.casesCompleted} casos`;
        return `${player.streak} dias`;
    };

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

            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-2 mb-4 shrink-0">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-slate-700 border-2 border-slate-400 overflow-hidden mb-1">
                        <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${mockPlayers[1].avatar}`} alt="" className="w-full h-full" />
                    </div>
                    <Medal className="w-5 h-5 text-slate-300 -mt-2 mb-1" />
                    <div className="bg-slate-700 rounded-t-lg w-20 h-16 lg:w-24 lg:h-20 flex flex-col items-center justify-center">
                        <span className="text-xs text-slate-300 truncate max-w-[90%]">{mockPlayers[1].name}</span>
                        <span className="text-[10px] text-slate-400">{getValue(mockPlayers[1])}</span>
                    </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                    <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-slate-700 border-4 border-yellow-400 overflow-hidden mb-1 shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                        <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${mockPlayers[0].avatar}`} alt="" className="w-full h-full" />
                    </div>
                    <Crown className="w-6 h-6 text-yellow-400 -mt-2 mb-1" />
                    <div className="bg-gradient-to-t from-yellow-600/20 to-yellow-500/10 border border-yellow-500/30 rounded-t-lg w-24 h-20 lg:w-28 lg:h-24 flex flex-col items-center justify-center">
                        <span className="text-xs text-yellow-300 font-bold truncate max-w-[90%]">{mockPlayers[0].name}</span>
                        <span className="text-[10px] text-yellow-200">{getValue(mockPlayers[0])}</span>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-slate-700 border-2 border-amber-600 overflow-hidden mb-1">
                        <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${mockPlayers[2].avatar}`} alt="" className="w-full h-full" />
                    </div>
                    <Medal className="w-5 h-5 text-amber-600 -mt-2 mb-1" />
                    <div className="bg-amber-900/20 border border-amber-600/30 rounded-t-lg w-20 h-14 lg:w-24 lg:h-18 flex flex-col items-center justify-center">
                        <span className="text-xs text-amber-200 truncate max-w-[90%]">{mockPlayers[2].name}</span>
                        <span className="text-[10px] text-amber-300">{getValue(mockPlayers[2])}</span>
                    </div>
                </div>
            </div>

            {/* Rankings List */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
                {mockPlayers.slice(3).map((player) => (
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
                            <span className="text-[10px] text-slate-400">{player.specialty}</span>
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
                        <span className="text-[10px] text-slate-400">{userPlayer.specialty}</span>
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
        </div>
    );
};
