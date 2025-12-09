import React, { useState } from 'react';
import { Trophy, Target, Clock, Flame, Award, Settings, ChevronRight, Star, Zap, Shield, Edit2, Moon } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';
import { shopItems } from '../lib/shopItems';
import clsx from 'clsx';

type Tab = 'stats' | 'items' | 'achievements';

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress?: number;
    total?: number;
}

const achievements: Achievement[] = [
    { id: 'first-case', name: 'Primeiro Diagnóstico', description: 'Complete seu primeiro caso clínico', icon: '🩺', unlocked: true },
    { id: 'quiz-master', name: 'Mestre do Quiz', description: 'Acerte 10 diagnósticos no quiz', icon: '🎯', unlocked: true },
    { id: 'perfect-score', name: 'Nota Perfeita', description: 'Acerte todas as questões de um caso', icon: '⭐', unlocked: false, progress: 0, total: 1 },
    { id: 'speed-demon', name: 'Velocista', description: 'Acerte com 0 pistas no quiz', icon: '⚡', unlocked: false, progress: 0, total: 1 },
    { id: 'streak-5', name: 'Sequência de 5', description: 'Mantenha um streak de 5 dias', icon: '🔥', unlocked: true },
    { id: 'streak-30', name: 'Mês Dedicado', description: 'Mantenha um streak de 30 dias', icon: '📅', unlocked: false, progress: 5, total: 30 },
    { id: 'cardio-expert', name: 'Expert Cardiologia', description: 'Complete 10 casos de cardiologia', icon: '❤️', unlocked: false, progress: 3, total: 10 },
    { id: 'neuro-expert', name: 'Expert Neurologia', description: 'Complete 10 casos de neurologia', icon: '🧠', unlocked: false, progress: 1, total: 10 },
    { id: 'collector', name: 'Colecionador', description: 'Compre 10 itens na loja', icon: '🛒', unlocked: false, progress: 0, total: 10 },
    { id: 'rich', name: 'Rico', description: 'Acumule 5000 MediMoedas', icon: '💰', unlocked: false, progress: 1300, total: 5000 },
];

export const Profile: React.FC = () => {
    const { coins, xp, level, streak, stats, ownedItems, rest } = useGameStore();
    const [activeTab, setActiveTab] = useState<Tab>('stats');

    const handleRest = () => {
        const rested = rest();
        if (rested) {
            useToastStore.getState().addToast('Você descansou e recuperou energia! 😴', 'success');
        } else {
            useToastStore.getState().addToast('Você ainda não está cansado o suficiente (Cooldown 2h) ⏳', 'warning');
        }
    };

    const xpInCurrentLevel = xp % 1000;
    const xpProgress = (xpInCurrentLevel / 1000) * 100;

    const ownedItemsData = shopItems.filter(item => ownedItems.includes(item.id));
    const unlockedAchievements = achievements.filter(a => a.unlocked).length;

    const statCards = [
        { icon: Target, label: 'Casos Completos', value: stats.casesCompleted, color: 'cyan' },
        { icon: Zap, label: 'Quizzes', value: stats.quizzesTaken, color: 'yellow' },
        { icon: Star, label: 'Acertos', value: stats.totalCorrectAnswers, color: 'emerald' },
        { icon: Flame, label: 'Melhor Streak', value: stats.bestStreak, color: 'orange' },
        { icon: Clock, label: 'Tempo Jogado', value: `${stats.totalPlayTime}min`, color: 'purple' },
        { icon: Award, label: 'Conquistas', value: `${unlockedAchievements}/${achievements.length}`, color: 'pink' },
    ];

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-slate-800/80 to-cyan-900/30 rounded-2xl p-4 lg:p-6 mb-4 border border-cyan-500/20 shrink-0">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-slate-700 border-4 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)] overflow-hidden">
                            <img
                                src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix"
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-cyan-400 transition-colors">
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-lg lg:text-2xl font-bold text-white truncate">Dr. Usuário</h1>
                            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] lg:text-xs rounded-full border border-cyan-500/30">
                                Cardiologia
                            </span>
                        </div>

                        {/* Level Bar */}
                        <div className="mb-2">
                            <div className="flex items-center justify-between text-[10px] lg:text-xs text-slate-400 mb-1">
                                <span className="font-bold text-cyan-400">Nível {level}</span>
                                <span>{xpInCurrentLevel}/1000 XP</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all"
                                    style={{ width: `${xpProgress}%` }}
                                />
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-4 text-xs lg:text-sm">
                            <div className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] font-bold text-slate-900">M</div>
                                <span className="font-bold text-yellow-400">{coins}</span>
                            </div>
                            <div className="flex items-center gap-1 text-orange-400">
                                <Flame className="w-4 h-4" />
                                <span className="font-bold">{streak} dias</span>
                            </div>
                            <div className="flex items-center gap-1 text-purple-400">
                                <Trophy className="w-4 h-4" />
                                <span className="font-bold">{xp} XP</span>
                            </div>
                        </div>

                        {/* Rest Button */}
                        <button
                            onClick={handleRest}
                            className="mt-3 w-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-500/30 transition-colors"
                        >
                            <Moon className="w-4 h-4" />
                            Descansar em Casa (+50 Energia)
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 shrink-0">
                {[
                    { id: 'stats', label: 'Estatísticas', icon: Target },
                    { id: 'items', label: 'Inventário', icon: Shield },
                    { id: 'achievements', label: 'Conquistas', icon: Award },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={clsx(
                                'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all',
                                isActive
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {statCards.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={i}
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center"
                                >
                                    <div className={clsx(
                                        'w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center',
                                        `bg-${stat.color}-500/20 text-${stat.color}-400`
                                    )}
                                        style={{
                                            backgroundColor: `var(--color-${stat.color}-500, rgba(34,211,238,0.2))`,
                                        }}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-xl lg:text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-[10px] lg:text-xs text-slate-400">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'items' && (
                    <div>
                        {ownedItemsData.length === 0 ? (
                            <div className="text-center py-12">
                                <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">Nenhum item ainda</p>
                                <p className="text-sm text-slate-500">Visite a loja para comprar itens!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {ownedItemsData.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center"
                                    >
                                        <div className="text-3xl mb-2">{item.icon}</div>
                                        <div className="font-bold text-white text-sm">{item.name}</div>
                                        <div className="text-[10px] text-slate-400 capitalize">{item.category}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div className="space-y-3">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className={clsx(
                                    'flex items-center gap-4 p-4 rounded-xl border transition-all',
                                    achievement.unlocked
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-slate-800/50 border-slate-700 opacity-60'
                                )}
                            >
                                <div className={clsx(
                                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                                    achievement.unlocked ? 'bg-emerald-500/20' : 'bg-slate-700 grayscale'
                                )}>
                                    {achievement.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className={clsx(
                                            'font-bold text-sm',
                                            achievement.unlocked ? 'text-white' : 'text-slate-400'
                                        )}>
                                            {achievement.name}
                                        </h3>
                                        {achievement.unlocked && (
                                            <span className="text-emerald-400 text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                                ✓ Desbloqueado
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] lg:text-xs text-slate-400">{achievement.description}</p>

                                    {!achievement.unlocked && achievement.progress !== undefined && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                                <span>Progresso</span>
                                                <span>{achievement.progress}/{achievement.total}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-cyan-500"
                                                    style={{ width: `${(achievement.progress! / achievement.total!) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Settings Button */}
            <div className="shrink-0 pt-4 border-t border-slate-800">
                <button className="w-full flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-slate-400" />
                        <span className="text-white font-medium">Configurações</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
            </div>
        </div>
    );
};
