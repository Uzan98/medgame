import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Flame, Award, ChevronRight, Star, Zap, Shield, Edit2, Moon, BookOpen, Coins, TrendingUp, LogOut, Lock, Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';
import { useAuth } from '../contexts/AuthContext';
import { shopItems } from '../lib/shopItems';
import { badges, isBadgeUnlocked, getCurrentBadge } from '../lib/badges';
import clsx from 'clsx';

type Tab = 'stats' | 'items' | 'achievements' | 'badges';

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    progress: number;
    total: number;
}

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const { coins, xp, level, streak, stats, ownedItems, rest, unlockedProfessions } = useGameStore();
    const [activeTab, setActiveTab] = useState<Tab>('stats');
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        await signOut();
        navigate('/auth');
    };

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

    // Dynamic achievements based on real stats
    const achievements: Achievement[] = useMemo(() => [
        {
            id: 'first-case',
            name: 'Primeiro Diagnóstico',
            description: 'Complete seu primeiro caso clínico',
            icon: '🩺',
            progress: Math.min(stats.casesCompleted, 1),
            total: 1
        },
        {
            id: 'case-master-10',
            name: 'Residente',
            description: 'Complete 10 casos clínicos',
            icon: '🏥',
            progress: Math.min(stats.casesCompleted, 10),
            total: 10
        },
        {
            id: 'case-master-50',
            name: 'Especialista',
            description: 'Complete 50 casos clínicos',
            icon: '👨‍⚕️',
            progress: Math.min(stats.casesCompleted, 50),
            total: 50
        },
        {
            id: 'quiz-starter',
            name: 'Mestre do Quiz',
            description: 'Complete 10 quizzes',
            icon: '🎯',
            progress: Math.min(stats.quizzesTaken, 10),
            total: 10
        },
        {
            id: 'quiz-expert',
            name: 'Expert em Quiz',
            description: 'Complete 50 quizzes',
            icon: '⚡',
            progress: Math.min(stats.quizzesTaken, 50),
            total: 50
        },
        {
            id: 'correct-50',
            name: 'Cérebro Afiado',
            description: 'Acerte 50 questões',
            icon: '🧠',
            progress: Math.min(stats.totalCorrectAnswers, 50),
            total: 50
        },
        {
            id: 'correct-200',
            name: 'Gênio Médico',
            description: 'Acerte 200 questões',
            icon: '🌟',
            progress: Math.min(stats.totalCorrectAnswers, 200),
            total: 200
        },
        {
            id: 'streak-5',
            name: 'Sequência de 5',
            description: 'Mantenha um streak de 5 dias',
            icon: '🔥',
            progress: Math.min(stats.bestStreak, 5),
            total: 5
        },
        {
            id: 'streak-30',
            name: 'Mês Dedicado',
            description: 'Mantenha um streak de 30 dias',
            icon: '📅',
            progress: Math.min(stats.bestStreak, 30),
            total: 30
        },
        {
            id: 'rich-1000',
            name: 'Poupador',
            description: 'Acumule 1000 MediMoedas',
            icon: '💰',
            progress: Math.min(coins, 1000),
            total: 1000
        },
        {
            id: 'rich-5000',
            name: 'Rico',
            description: 'Acumule 5000 MediMoedas',
            icon: '💎',
            progress: Math.min(coins, 5000),
            total: 5000
        },
        {
            id: 'level-5',
            name: 'Progredindo',
            description: 'Alcance o nível 5',
            icon: '📈',
            progress: Math.min(level, 5),
            total: 5
        },
        {
            id: 'level-10',
            name: 'Veterano',
            description: 'Alcance o nível 10',
            icon: '🏆',
            progress: Math.min(level, 10),
            total: 10
        },
        {
            id: 'collector-5',
            name: 'Colecionador',
            description: 'Compre 5 itens na loja',
            icon: '🛒',
            progress: Math.min(ownedItems.length, 5),
            total: 5
        },
        {
            id: 'specialty-3',
            name: 'Multiespecialista',
            description: 'Desbloqueie 3 especialidades',
            icon: '🎓',
            progress: Math.min(unlockedProfessions.length, 3),
            total: 3
        },
        {
            id: 'study-60',
            name: 'Estudioso',
            description: 'Estude por 60 minutos',
            icon: '📚',
            progress: Math.min(stats.totalStudyTime, 60),
            total: 60
        },
    ], [stats, coins, level, ownedItems, unlockedProfessions]);

    const unlockedAchievements = achievements.filter(a => a.progress >= a.total).length;

    // Enhanced stat cards with better styling
    const statCards = [
        { icon: Target, label: 'Casos Completos', value: stats.casesCompleted, color: 'bg-cyan-500/20 text-cyan-400', bgGlow: 'shadow-cyan-500/20' },
        { icon: Zap, label: 'Quizzes Feitos', value: stats.quizzesTaken, color: 'bg-yellow-500/20 text-yellow-400', bgGlow: 'shadow-yellow-500/20' },
        { icon: Star, label: 'Respostas Certas', value: stats.totalCorrectAnswers, color: 'bg-emerald-500/20 text-emerald-400', bgGlow: 'shadow-emerald-500/20' },
        { icon: Flame, label: 'Melhor Streak', value: stats.bestStreak + ' dias', color: 'bg-orange-500/20 text-orange-400', bgGlow: 'shadow-orange-500/20' },
        { icon: BookOpen, label: 'Tempo Estudado', value: stats.totalStudyTime + ' min', color: 'bg-purple-500/20 text-purple-400', bgGlow: 'shadow-purple-500/20' },
        { icon: TrendingUp, label: 'Nível Atual', value: 'Lv. ' + level, color: 'bg-pink-500/20 text-pink-400', bgGlow: 'shadow-pink-500/20' },
        { icon: Coins, label: 'Moedas Totais', value: coins, color: 'bg-amber-500/20 text-amber-400', bgGlow: 'shadow-amber-500/20' },
        { icon: Award, label: 'Conquistas', value: `${unlockedAchievements}/${achievements.length}`, color: 'bg-indigo-500/20 text-indigo-400', bgGlow: 'shadow-indigo-500/20' },
    ];

    // Calculate accuracy rate
    const totalQuestions = stats.quizzesTaken * 5; // Assuming 5 questions per quiz average
    const accuracyRate = totalQuestions > 0 ? Math.round((stats.totalCorrectAnswers / totalQuestions) * 100) : 0;

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
                                {unlockedProfessions.length > 1 ? unlockedProfessions[unlockedProfessions.length - 1].replace(/-/g, ' ') : 'Acadêmico'}
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
                            <div className="flex items-center gap-1 text-emerald-400">
                                <Target className="w-4 h-4" />
                                <span className="font-bold">{accuracyRate}% acerto</span>
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

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="mt-2 w-full bg-red-500/20 border border-red-500/30 text-red-300 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                            <LogOut className="w-4 h-4" />
                            {loggingOut ? 'Saindo...' : 'Sair da Conta'}
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
                    { id: 'badges', label: 'Insígnias', icon: Trophy },
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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {statCards.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={i}
                                    className={clsx(
                                        "bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center shadow-lg",
                                        stat.bgGlow
                                    )}
                                >
                                    <div className={clsx(
                                        'w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center',
                                        stat.color
                                    )}>
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
                    <div className="space-y-3">
                        {ownedItemsData.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum item adquirido ainda.</p>
                                <p className="text-sm">Visite a Loja para comprar itens!</p>
                            </div>
                        ) : (
                            ownedItemsData.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl">
                                        {item.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-white">{item.name}</div>
                                        <div className="text-xs text-slate-400">{item.description}</div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-500" />
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div className="space-y-3">
                        {achievements.map((achievement) => {
                            const isUnlocked = achievement.progress >= achievement.total;
                            const progressPercent = (achievement.progress / achievement.total) * 100;
                            return (
                                <div
                                    key={achievement.id}
                                    className={clsx(
                                        "flex items-center gap-4 rounded-xl p-4 border transition-all",
                                        isUnlocked
                                            ? "bg-gradient-to-r from-cyan-900/30 to-emerald-900/30 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                                            : "bg-slate-800/50 border-slate-700"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl border",
                                        isUnlocked
                                            ? "bg-cyan-500/20 border-cyan-500/50"
                                            : "bg-slate-700/50 border-slate-600 grayscale opacity-70"
                                    )}>
                                        {achievement.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={clsx(
                                            "font-bold",
                                            isUnlocked ? "text-white" : "text-slate-400"
                                        )}>
                                            {achievement.name}
                                        </div>
                                        <div className="text-xs text-slate-500 mb-1">{achievement.description}</div>
                                        {!isUnlocked && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-cyan-500 transition-all"
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-slate-500">
                                                    {achievement.progress}/{achievement.total}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {isUnlocked && (
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'badges' && (
                    <div className="space-y-4">
                        {/* Current Badge Highlight */}
                        {(() => {
                            const currentBadge = getCurrentBadge(level);
                            return (
                                <div className="bg-gradient-to-r from-amber-900/30 to-slate-800/50 rounded-2xl p-4 border border-amber-500/30">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl" />
                                            <img
                                                src={currentBadge.image}
                                                alt={currentBadge.name}
                                                className="w-20 h-20 object-contain relative z-10"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-[10px] text-amber-400/80 uppercase tracking-wider">Insígnia Atual</span>
                                            <h3 className="text-xl font-bold text-amber-400">{currentBadge.name}</h3>
                                            <p className="text-xs text-slate-400">{currentBadge.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* All Badges Grid */}
                        <div className="grid grid-cols-4 gap-3">
                            {badges.map((badge) => {
                                const unlocked = isBadgeUnlocked(badge, level);
                                const current = getCurrentBadge(level);
                                const isCurrent = badge.id === current.id;

                                return (
                                    <div
                                        key={badge.id}
                                        className={clsx(
                                            "relative flex flex-col items-center p-3 rounded-xl border transition-all",
                                            unlocked
                                                ? isCurrent
                                                    ? "bg-gradient-to-br from-amber-900/40 to-slate-800/50 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                                    : "bg-slate-800/50 border-emerald-500/30 hover:border-emerald-500/50"
                                                : "bg-slate-900/50 border-slate-700/50"
                                        )}
                                    >
                                        {/* Lock overlay for locked badges */}
                                        {!unlocked && (
                                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10">
                                                <Lock className="w-6 h-6 text-slate-600" />
                                            </div>
                                        )}

                                        <img
                                            src={badge.image}
                                            alt={badge.name}
                                            className={clsx(
                                                "w-14 h-14 lg:w-16 lg:h-16 object-contain mb-2",
                                                !unlocked && "grayscale opacity-40"
                                            )}
                                        />
                                        <h4 className={clsx(
                                            "text-xs font-bold text-center",
                                            unlocked ? (isCurrent ? "text-amber-400" : "text-white") : "text-slate-600"
                                        )}>
                                            {badge.name}
                                        </h4>
                                        <span className={clsx(
                                            "text-[10px] mt-1",
                                            unlocked ? "text-slate-400" : "text-slate-600"
                                        )}>
                                            Nível {badge.level}
                                        </span>
                                        {unlocked && isCurrent && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                                <Star className="w-3 h-3 text-white fill-white" />
                                            </div>
                                        )}
                                        {unlocked && !isCurrent && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
