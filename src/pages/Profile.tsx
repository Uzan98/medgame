import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Flame, Award, ChevronRight, Star, Zap, Shield, Edit2, Moon, BookOpen, Coins, LogOut, Lock, Trophy, Crown, Sparkles, Medal, GraduationCap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';
import { useAuth } from '../contexts/AuthContext';
import { shopItems } from '../lib/shopItems';
import { badges, isBadgeUnlocked, getCurrentBadge } from '../lib/badges';
import clsx from 'clsx';

type Tab = 'overview' | 'achievements' | 'badges' | 'items';

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
    const [activeTab, setActiveTab] = useState<Tab>('overview');
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
            useToastStore.getState().addToast('Você ainda não está cansado (Cooldown 2h) ⏳', 'warning');
        }
    };

    const xpInCurrentLevel = xp % 1000;
    const xpProgress = (xpInCurrentLevel / 1000) * 100;
    const ownedItemsData = shopItems.filter(item => ownedItems.includes(item.id));
    const currentBadge = getCurrentBadge(level);

    // Achievements
    const achievements: Achievement[] = useMemo(() => [
        { id: 'first-case', name: 'Primeiro Diagnóstico', description: 'Complete seu primeiro caso clínico', icon: '🩺', progress: Math.min(stats.casesCompleted, 1), total: 1 },
        { id: 'case-master-10', name: 'Residente', description: 'Complete 10 casos clínicos', icon: '🏥', progress: Math.min(stats.casesCompleted, 10), total: 10 },
        { id: 'case-master-50', name: 'Especialista', description: 'Complete 50 casos clínicos', icon: '👨‍⚕️', progress: Math.min(stats.casesCompleted, 50), total: 50 },
        { id: 'quiz-starter', name: 'Mestre do Quiz', description: 'Complete 10 quizzes', icon: '🎯', progress: Math.min(stats.quizzesTaken, 10), total: 10 },
        { id: 'correct-50', name: 'Cérebro Afiado', description: 'Acerte 50 questões', icon: '🧠', progress: Math.min(stats.totalCorrectAnswers, 50), total: 50 },
        { id: 'streak-5', name: 'Sequência de 5', description: 'Mantenha um streak de 5 dias', icon: '🔥', progress: Math.min(stats.bestStreak, 5), total: 5 },
        { id: 'streak-30', name: 'Mês Dedicado', description: 'Mantenha um streak de 30 dias', icon: '📅', progress: Math.min(stats.bestStreak, 30), total: 30 },
        { id: 'rich-1000', name: 'Poupador', description: 'Acumule 1000 MediMoedas', icon: '💰', progress: Math.min(coins, 1000), total: 1000 },
        { id: 'level-10', name: 'Veterano', description: 'Alcance o nível 10', icon: '🏆', progress: Math.min(level, 10), total: 10 },
        { id: 'specialty-3', name: 'Multiespecialista', description: 'Desbloqueie 3 especialidades', icon: '🎓', progress: Math.min(unlockedProfessions.length, 3), total: 3 },
    ], [stats, coins, level, unlockedProfessions]);

    const unlockedAchievements = achievements.filter(a => a.progress >= a.total);
    const totalQuestions = stats.quizzesTaken * 5;
    const accuracyRate = totalQuestions > 0 ? Math.round((stats.totalCorrectAnswers / totalQuestions) * 100) : 0;

    return (
        <div className="h-full overflow-y-auto">
            {/* Hero Banner with Gradient */}
            <div className="relative mb-6">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/30 via-purple-600/20 to-pink-600/30 rounded-2xl" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h20v20H0z%22 fill=%22none%22/%3E%3Ccircle cx=%2210%22 cy=%2210%22 r=%221%22 fill=%22rgba(255,255,255,0.03)%22/%3E%3C/svg%3E')] opacity-50 rounded-2xl" />

                <div className="relative p-6 pb-20">
                    {/* Top Actions */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRest}
                            className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 rounded-lg hover:bg-white/20 transition-colors"
                            title="Descansar"
                        >
                            <Moon className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="p-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                            title="Sair"
                        >
                            <LogOut className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Profile Content */}
                    <div className="flex flex-col items-center text-center">
                        {/* Avatar with Glow */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative mb-4"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse" />
                            <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500">
                                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                                    <img
                                        src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix"
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-cyan-400 border-2 border-slate-900">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            {/* Level Badge */}
                            <div className="absolute -top-1 -left-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg border-2 border-slate-900">
                                {level}
                            </div>
                        </motion.div>

                        {/* Name & Title */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h1 className="text-2xl font-black text-white mb-1 flex items-center justify-center gap-2">
                                Dr. Usuário
                                {level >= 10 && <Crown className="w-5 h-5 text-yellow-400" />}
                            </h1>
                            <p className="text-cyan-300/80 text-sm flex items-center justify-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                {unlockedProfessions.length > 1
                                    ? unlockedProfessions[unlockedProfessions.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                    : 'Acadêmico de Medicina'}
                            </p>
                        </motion.div>

                        {/* XP Bar */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-full max-w-xs mt-4"
                        >
                            <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                                <span className="font-medium">Nível {level}</span>
                                <span>{xpInCurrentLevel} / 1000 XP</span>
                            </div>
                            <div className="h-2 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${xpProgress}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Stats Floating Cards */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-3 px-4 w-full max-w-md justify-center">
                    {[
                        { icon: Coins, value: coins, label: 'Moedas', color: 'from-yellow-500 to-amber-600', glow: 'shadow-yellow-500/30' },
                        { icon: Flame, value: streak, label: 'Streak', color: 'from-orange-500 to-red-600', glow: 'shadow-orange-500/30' },
                        { icon: Target, value: accuracyRate + '%', label: 'Acerto', color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/30' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className={clsx("flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-center shadow-xl", stat.glow)}
                        >
                            <div className={clsx("w-8 h-8 mx-auto mb-1 rounded-lg flex items-center justify-center bg-gradient-to-br", stat.color)}>
                                <stat.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-lg font-black text-white">{stat.value}</div>
                            <div className="text-[10px] text-slate-400">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Spacer for floating cards */}
            <div className="h-12" />

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                {[
                    { id: 'overview', label: 'Visão Geral', icon: Sparkles },
                    { id: 'achievements', label: 'Conquistas', icon: Award },
                    { id: 'badges', label: 'Insígnias', icon: Medal },
                    { id: 'items', label: 'Itens', icon: Shield },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={clsx(
                                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all',
                                isActive
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4 pb-6"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { icon: Target, label: 'Casos Completos', value: stats.casesCompleted, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
                                { icon: Zap, label: 'Quizzes', value: stats.quizzesTaken, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
                                { icon: Star, label: 'Acertos Totais', value: stats.totalCorrectAnswers, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
                                { icon: BookOpen, label: 'Tempo de Estudo', value: stats.totalStudyTime + 'min', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={clsx("rounded-xl p-4 border", stat.bg, stat.border)}
                                >
                                    <stat.icon className={clsx("w-6 h-6 mb-2", stat.color)} />
                                    <div className="text-2xl font-black text-white">{stat.value}</div>
                                    <div className="text-xs text-slate-400">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Current Badge Showcase */}
                        <div className="bg-gradient-to-br from-amber-900/30 via-slate-800/50 to-amber-900/20 rounded-2xl p-5 border border-amber-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                            <div className="relative flex items-center gap-4">
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                >
                                    <img src={currentBadge.image} alt={currentBadge.name} className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" />
                                </motion.div>
                                <div className="flex-1">
                                    <div className="text-[10px] text-amber-400/80 uppercase tracking-widest font-bold mb-1">Insígnia Atual</div>
                                    <div className="text-xl font-black text-amber-400">{currentBadge.name}</div>
                                    <div className="text-sm text-slate-400 mt-1">{currentBadge.description}</div>
                                </div>
                                <Trophy className="w-8 h-8 text-amber-500/30" />
                            </div>
                        </div>

                        {/* Specialty Card */}
                        <button
                            onClick={() => navigate('/career')}
                            className="w-full bg-gradient-to-r from-purple-900/30 to-slate-800/50 rounded-xl p-4 border border-purple-500/20 flex items-center gap-4 hover:border-purple-500/40 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-[10px] text-purple-400/80 uppercase tracking-wider">Carreira Médica</div>
                                <div className="text-white font-bold">
                                    {unlockedProfessions.length > 1
                                        ? unlockedProfessions[unlockedProfessions.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                        : 'Acadêmico'}
                                </div>
                                <div className="text-xs text-slate-400">{unlockedProfessions.length} especialidades desbloqueadas</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                        </button>

                        {/* Recent Achievements Preview */}
                        {unlockedAchievements.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-white">Conquistas Recentes</h3>
                                    <button onClick={() => setActiveTab('achievements')} className="text-xs text-cyan-400 hover:underline">Ver todas</button>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {unlockedAchievements.slice(0, 5).map((ach) => (
                                        <div key={ach.id} className="flex-shrink-0 w-16 text-center">
                                            <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl mb-1">
                                                {ach.icon}
                                            </div>
                                            <div className="text-[9px] text-slate-400 truncate">{ach.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'achievements' && (
                    <motion.div
                        key="achievements"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2 pb-6"
                    >
                        <div className="text-center mb-4">
                            <div className="text-3xl font-black text-white">{unlockedAchievements.length}/{achievements.length}</div>
                            <div className="text-sm text-slate-400">Conquistas Desbloqueadas</div>
                        </div>
                        {achievements.map((achievement) => {
                            const isUnlocked = achievement.progress >= achievement.total;
                            const progressPercent = (achievement.progress / achievement.total) * 100;
                            return (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={clsx(
                                        "flex items-center gap-3 rounded-xl p-3 border transition-all",
                                        isUnlocked
                                            ? "bg-gradient-to-r from-cyan-900/30 to-emerald-900/20 border-cyan-500/30"
                                            : "bg-slate-800/30 border-slate-700/50"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
                                        isUnlocked ? "bg-gradient-to-br from-cyan-500/20 to-emerald-500/20" : "bg-slate-700/50 grayscale opacity-60"
                                    )}>
                                        {achievement.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={clsx("font-bold text-sm", isUnlocked ? "text-white" : "text-slate-500")}>{achievement.name}</div>
                                        <div className="text-[10px] text-slate-500">{achievement.description}</div>
                                        {!isUnlocked && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all" style={{ width: `${progressPercent}%` }} />
                                                </div>
                                                <span className="text-[10px] text-slate-500">{achievement.progress}/{achievement.total}</span>
                                            </div>
                                        )}
                                    </div>
                                    {isUnlocked && (
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">✓</div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {activeTab === 'badges' && (
                    <motion.div
                        key="badges"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="pb-6"
                    >
                        {/* Current Badge Large */}
                        <div className="bg-gradient-to-br from-amber-900/30 via-slate-800/50 to-amber-900/20 rounded-2xl p-6 border border-amber-500/30 mb-6 text-center">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl animate-pulse" />
                                <motion.img
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    src={currentBadge.image}
                                    alt={currentBadge.name}
                                    className="w-28 h-28 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                                />
                            </div>
                            <div className="text-[10px] text-amber-400/80 uppercase tracking-widest font-bold mt-4 mb-1">Sua Insígnia</div>
                            <div className="text-2xl font-black text-amber-400">{currentBadge.name}</div>
                            <div className="text-sm text-slate-400 mt-1">{currentBadge.description}</div>
                        </div>

                        {/* All Badges */}
                        <div className="grid grid-cols-4 gap-2">
                            {badges.map((badge) => {
                                const unlocked = isBadgeUnlocked(badge, level);
                                const isCurrent = badge.id === currentBadge.id;
                                return (
                                    <div
                                        key={badge.id}
                                        className={clsx(
                                            "relative flex flex-col items-center p-3 rounded-xl border text-center",
                                            unlocked
                                                ? isCurrent
                                                    ? "bg-gradient-to-br from-amber-900/40 to-slate-800 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                                    : "bg-slate-800/50 border-slate-600"
                                                : "bg-slate-900/50 border-slate-800"
                                        )}
                                    >
                                        {!unlocked && (
                                            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10">
                                                <Lock className="w-5 h-5 text-slate-600" />
                                            </div>
                                        )}
                                        <img
                                            src={badge.image}
                                            alt={badge.name}
                                            className={clsx("w-12 h-12 object-contain mb-1", !unlocked && "grayscale opacity-30")}
                                        />
                                        <span className={clsx("text-[10px] font-bold", unlocked ? (isCurrent ? "text-amber-400" : "text-white") : "text-slate-600")}>
                                            {badge.name}
                                        </span>
                                        <span className="text-[9px] text-slate-500">Lv.{badge.level}</span>
                                        {isCurrent && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                                <Star className="w-3 h-3 text-white fill-white" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'items' && (
                    <motion.div
                        key="items"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="pb-6"
                    >
                        {ownedItemsData.length === 0 ? (
                            <div className="text-center py-16">
                                <Shield className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                                <p className="text-slate-400 mb-2">Nenhum item adquirido ainda.</p>
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="text-cyan-400 hover:underline text-sm"
                                >
                                    Visite a Loja →
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {ownedItemsData.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center"
                                    >
                                        <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-3xl mb-2">
                                            {item.icon}
                                        </div>
                                        <div className="font-bold text-white text-sm">{item.name}</div>
                                        <div className="text-[10px] text-slate-400 line-clamp-2">{item.description}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
