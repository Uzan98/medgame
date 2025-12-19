import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Activity, Trophy, Target, Lock, Flame, Zap, Star, Info } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { sampleCases } from '../lib/cases';
import { useAdminStore } from '../store/adminStore';
import { shopItems } from '../lib/shopItems';
import { getCurrentBadge, getNextBadge } from '../lib/badges';
import { LifeSystemInfo } from '../components/LifeSystemInfo';
import clsx from 'clsx';

export const HomePage: React.FC = () => {
    const { level, xp, coins, streak, stats, energy, hunger, reputation } = useGameStore();
    const { customCases, customQuizzes } = useAdminStore();
    const [showLifeInfo, setShowLifeInfo] = useState(false);

    // Merge cases and get unlocked ones
    const allCases = [...sampleCases, ...customCases];
    const unlockedCases = allCases.filter(c => (c.requiredLevel || 1) <= level);

    // Get featured cases to display (first 3 unlocked)
    const featuredCases = unlockedCases.slice(0, 3);

    // Get featured shop items
    const featuredShop = shopItems.slice(0, 4);

    // XP progress
    const xpInLevel = xp % 1000;
    const xpProgress = (xpInLevel / 1000) * 100;

    const difficultyColors: Record<string, string> = {
        facil: 'text-emerald-400',
        medio: 'text-yellow-400',
        dificil: 'text-red-400',
    };

    return (
        <div className="min-h-full flex flex-col gap-4 lg:gap-6">
            {/* Life System Info Modal */}
            <LifeSystemInfo isOpen={showLifeInfo} onClose={() => setShowLifeInfo(false)} />

            {/* Mobile Avatar Section - Only visible on small screens */}
            <div className="md:hidden bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <img
                            src="/avatar.png"
                            alt="Seu Avatar"
                            className="h-32 w-auto object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                        />
                        {/* Level Badge */}
                        <div className="absolute -top-1 -right-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 border-2 border-slate-800 flex items-center justify-center shadow-lg">
                                <div className="text-center">
                                    <div className="text-sm font-black text-white leading-none">{level}</div>
                                    <div className="text-[6px] text-white/80">NV</div>
                                </div>
                            </div>
                        </div>
                        {/* Streak badge */}
                        {streak > 0 && (
                            <div className="absolute -bottom-1 -left-1 bg-orange-500 rounded-full px-2 py-0.5 flex items-center gap-0.5 border-2 border-slate-800 shadow-lg">
                                <Flame className="w-3 h-3 text-white" />
                                <span className="text-white font-bold text-xs">{streak}</span>
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex-1 min-w-0">
                        {/* Status Bars Header with Info Button */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400 font-medium">Status</span>
                            <button
                                onClick={() => setShowLifeInfo(true)}
                                className="w-5 h-5 rounded-full bg-slate-700/50 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                                title="Como funciona?"
                            >
                                <Info size={12} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {/* Energy */}
                            <div>
                                <div className="flex justify-between text-[10px] mb-0.5">
                                    <span className="text-emerald-400 flex items-center gap-1"><Zap className="w-3 h-3" /> Energia</span>
                                    <span className={clsx("font-medium", energy >= 40 ? "text-emerald-400" : "text-red-400")}>{energy}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <div
                                        className={clsx("h-full rounded-full transition-all", energy >= 40 ? "bg-emerald-500" : "bg-red-500")}
                                        style={{ width: `${energy}%` }}
                                    />
                                </div>
                            </div>
                            {/* Hunger */}
                            <div>
                                <div className="flex justify-between text-[10px] mb-0.5">
                                    <span className="text-orange-400">🍔 Fome</span>
                                    <span className={clsx("font-medium", hunger <= 70 ? "text-orange-400" : "text-red-400")}>{hunger}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <div
                                        className={clsx("h-full rounded-full transition-all", hunger <= 70 ? "bg-orange-500" : "bg-red-500")}
                                        style={{ width: `${hunger}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Reputation Stars */}
                        <div className="flex items-center gap-1 mb-2">
                            <span className="text-[10px] text-slate-400 mr-1">Reputação:</span>
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    className={clsx("w-3 h-3", star <= reputation ? "text-yellow-400 fill-yellow-400" : "text-slate-600")}
                                />
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4">
                            <div className="text-center">
                                <div className="text-sm font-bold text-yellow-400">🪙 {coins}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-bold text-purple-400">{xp} XP</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0">

                {/* Coluna Esquerda - Meus Casos */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4 lg:gap-6 order-1">
                    {/* Painel Meus Casos */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-[0_0_20px_rgba(0,0,0,0.3)] relative overflow-hidden flex-1 min-h-0">
                        {/* Controles da Janela */}
                        <div className="hidden sm:flex space-x-2 absolute top-3 lg:top-4 left-3 lg:left-4">
                            <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-500"></div>
                        </div>

                        <div className="flex justify-between items-center mt-0 sm:mt-4 lg:mt-6 mb-4 lg:mb-6">
                            <h2 className="text-lg lg:text-xl font-bold text-white">Casos Disponíveis</h2>
                            <Link to="/cases" className="text-cyan-400 hover:text-cyan-300 text-sm">Ver todos →</Link>
                        </div>

                        <div className="space-y-3 lg:space-y-4 overflow-y-auto max-h-[40vh] lg:max-h-none scrollbar-hide">
                            {featuredCases.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Lock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Suba de nível para desbloquear casos!</p>
                                </div>
                            ) : (
                                featuredCases.map((caseItem) => (
                                    <Link
                                        key={caseItem.id}
                                        to={`/game/${caseItem.id}`}
                                        className="relative p-3 lg:p-4 rounded-xl lg:rounded-2xl border bg-slate-700/50 border-cyan-500/30 hover:border-cyan-500/50 cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98] block"
                                    >
                                        <div className="flex items-center space-x-3 lg:space-x-4">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                                                <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-cyan-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white text-sm lg:text-base truncate">{caseItem.title}</h3>
                                                <p className="text-[10px] lg:text-xs text-slate-400">{caseItem.category}</p>
                                                <div className="flex items-center mt-1 gap-3">
                                                    <span className={clsx("text-[10px] lg:text-xs font-medium", difficultyColors[caseItem.difficulty])}>
                                                        {caseItem.difficulty === 'facil' ? 'Fácil' : caseItem.difficulty === 'medio' ? 'Médio' : 'Difícil'}
                                                    </span>
                                                    <span className="text-[10px] lg:text-xs text-yellow-400 font-bold flex items-center gap-1">
                                                        <Trophy className="w-3 h-3" />
                                                        {caseItem.totalPoints} pts
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shrink-0 bg-cyan-500/20 text-cyan-400">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Estatísticas do Jogador */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-[0_0_20px_rgba(0,0,0,0.3)] hidden sm:block">
                        <h3 className="font-bold text-white text-sm lg:text-base mb-3 lg:mb-4">Suas Estatísticas</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-slate-700">
                                <div className="text-lg lg:text-2xl font-bold text-cyan-400">{stats.casesCompleted}</div>
                                <div className="text-[10px] lg:text-xs text-slate-400">Casos Completados</div>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-slate-700">
                                <div className="text-lg lg:text-2xl font-bold text-emerald-400">{stats.quizzesTaken}</div>
                                <div className="text-[10px] lg:text-xs text-slate-400">Quizzes Feitos</div>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-slate-700">
                                <div className="text-lg lg:text-2xl font-bold text-yellow-400">{stats.totalCorrectAnswers}</div>
                                <div className="text-[10px] lg:text-xs text-slate-400">Respostas Certas</div>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-3 text-center border border-slate-700">
                                <div className="text-lg lg:text-2xl font-bold text-purple-400">{stats.bestStreak}</div>
                                <div className="text-[10px] lg:text-xs text-slate-400">Melhor Sequência</div>
                            </div>
                        </div>
                    </div>

                    {/* Current Badge Card */}
                    {(() => {
                        const currentBadge = getCurrentBadge(level);
                        const nextBadge = getNextBadge(level);
                        const progressToNext = nextBadge
                            ? ((level - currentBadge.level) / (nextBadge.level - currentBadge.level)) * 100
                            : 100;

                        return (
                            <div className="bg-gradient-to-br from-slate-800/80 to-amber-900/20 backdrop-blur-sm border border-amber-500/30 rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] hidden sm:block">
                                <h3 className="font-bold text-white text-sm lg:text-base mb-4 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-400" />
                                    Sua Insígnia
                                </h3>

                                {/* Current Badge Display */}
                                <div className="flex flex-col items-center mb-4">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                                        <img
                                            src={currentBadge.image}
                                            alt={currentBadge.name}
                                            className="w-24 h-24 lg:w-28 lg:h-28 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform"
                                        />
                                    </div>
                                    <h4 className="text-lg font-bold text-amber-400 mt-3">{currentBadge.name}</h4>
                                    <p className="text-xs text-slate-400 text-center">{currentBadge.description}</p>
                                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full mt-2 border border-amber-500/30">
                                        Nível {currentBadge.level}+
                                    </span>
                                </div>

                                {/* Progress to Next Badge */}
                                {nextBadge && (
                                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] text-slate-400">Próxima insígnia</span>
                                            <span className="text-[10px] text-amber-400 font-bold">{nextBadge.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all"
                                                    style={{ width: `${progressToNext}%` }}
                                                />
                                            </div>
                                            <img
                                                src={nextBadge.image}
                                                alt={nextBadge.name}
                                                className="w-8 h-8 object-contain opacity-50 grayscale"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1 text-center">
                                            Faltam {nextBadge.level - level} níveis
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* Centro - Avatar e Nível */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-start relative order-2 overflow-y-auto py-4 pt-12">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none"></div>

                    {/* Avatar Container */}
                    <div className="relative z-10 flex flex-col items-center mb-8">
                        {/* Avatar Image */}
                        <div className="relative">
                            {/* Glow effect behind avatar */}
                            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-transparent to-transparent blur-2xl scale-110"></div>

                            {/* Avatar */}
                            <img
                                src="/avatar.png"
                                alt="Seu Avatar"
                                className="relative h-48 lg:h-56 xl:h-64 w-auto object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                            />

                            {/* Level Badge */}
                            <div className="absolute -top-2 -right-2 lg:top-0 lg:right-0">
                                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 border-4 border-slate-800 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                                    <div className="text-center">
                                        <div className="text-xl lg:text-2xl font-black text-white leading-none">{level}</div>
                                        <div className="text-[8px] lg:text-[10px] text-white/80 font-medium">NV</div>
                                    </div>
                                </div>
                            </div>

                            {/* Streak badge */}
                            {streak > 0 && (
                                <div className="absolute -bottom-2 -left-2 lg:bottom-0 lg:left-0 bg-orange-500 rounded-full px-3 py-1 flex items-center gap-1 border-2 border-slate-800 shadow-lg">
                                    <Flame className="w-4 h-4 text-white" />
                                    <span className="text-white font-bold text-sm">{streak}</span>
                                </div>
                            )}
                        </div>

                        {/* Status Bars */}
                        <div className="mt-3 w-56 lg:w-64 space-y-2">
                            {/* Header with info button */}
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-400 font-medium">Status</span>
                                <button
                                    onClick={() => setShowLifeInfo(true)}
                                    className="w-5 h-5 rounded-full bg-slate-700/50 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                                    title="Como funciona?"
                                >
                                    <Info size={12} />
                                </button>
                            </div>
                            {/* Energy */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-emerald-400 flex items-center gap-1"><Zap className="w-3 h-3" /> Energia</span>
                                    <span className={clsx("font-medium", energy >= 40 ? "text-emerald-400" : "text-red-400")}>{energy}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <div
                                        className={clsx("h-full rounded-full transition-all", energy >= 40 ? "bg-emerald-500" : "bg-red-500")}
                                        style={{ width: `${energy}%` }}
                                    />
                                </div>
                            </div>
                            {/* Hunger */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-orange-400">🍔 Fome</span>
                                    <span className={clsx("font-medium", hunger <= 70 ? "text-orange-400" : "text-red-400")}>{hunger}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <div
                                        className={clsx("h-full rounded-full transition-all", hunger <= 70 ? "bg-orange-500" : "bg-red-500")}
                                        style={{ width: `${hunger}%` }}
                                    />
                                </div>
                            </div>
                            {/* XP */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-cyan-400">XP</span>
                                    <span className="text-cyan-400 font-medium">{xpInLevel} / 1000</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all"
                                        style={{ width: `${xpProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Reputation Stars */}
                        <div className="mt-3 flex items-center gap-1">
                            <span className="text-xs text-slate-400 mr-2">Reputação:</span>
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    className={clsx("w-4 h-4", star <= reputation ? "text-yellow-400 fill-yellow-400" : "text-slate-600")}
                                />
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-3 flex gap-6">
                            <div className="text-center">
                                <div className="text-lg font-bold text-yellow-400">🪙 {coins}</div>
                                <div className="text-[10px] text-slate-400">Moedas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-purple-400">{xp}</div>
                                <div className="text-[10px] text-slate-400">XP Total</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita - Widgets */}
                <div className="w-full lg:w-1/3 flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-6 order-3">
                    {/* Quiz Diário */}
                    <Link to="/quiz" className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-[0_0_20px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center relative overflow-hidden flex-1 sm:flex-none lg:flex-none hover:border-cyan-500/40 transition-colors group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/20"></div>
                        <div className="flex items-center justify-between w-full mb-3 lg:mb-4 z-10">
                            <h3 className="font-bold text-white text-base lg:text-lg">Quiz Diagnóstico</h3>
                            <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                                +XP
                            </div>
                        </div>
                        <div className="w-16 h-16 lg:w-24 lg:h-24 mb-3 lg:mb-4 relative z-10">
                            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-500/30 transition-colors"></div>
                            <Target className="w-full h-full text-cyan-400 drop-shadow-[0_0_10px_#22d3ee]" />
                        </div>
                        <div className="text-center mb-3 z-10">
                            <p className="text-sm text-slate-400">5 diagnósticos rápidos</p>
                            <p className="text-xs text-cyan-400">60 segundos no total</p>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-2.5 lg:py-3 px-6 lg:px-8 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform w-full z-10 text-sm lg:text-base text-center">
                            Jogar Agora
                        </div>
                    </Link>

                    {/* Grid da Loja */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-[0_0_20px_rgba(0,0,0,0.3)] flex-1">
                        <div className="flex items-center justify-between mb-3 lg:mb-4">
                            <h3 className="font-bold text-white text-sm lg:text-base">Loja</h3>
                            <Link to="/shop" className="text-cyan-400 hover:text-cyan-300 text-xs">Ver tudo →</Link>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-2 gap-2 lg:gap-4">
                            {featuredShop.map((item) => (
                                <Link
                                    to="/shop"
                                    key={item.id}
                                    className="aspect-square bg-slate-900/50 rounded-lg lg:rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-colors flex flex-col items-center justify-center p-1.5 lg:p-2 cursor-pointer relative overflow-hidden group active:scale-95"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="text-2xl lg:text-3xl mb-1 lg:mb-2">{item.icon}</div>
                                    <div className="bg-slate-900/80 rounded-full px-1.5 lg:px-2 py-0.5 lg:py-1 flex items-center border border-yellow-500/30">
                                        <span className="text-yellow-400 mr-0.5">🪙</span>
                                        <span className="text-[10px] lg:text-xs font-bold text-white">{item.price}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Conteúdo do Admin */}
                    {(customCases.length > 0 || customQuizzes.length > 0) && (
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                            <h3 className="font-bold text-white text-sm lg:text-base mb-3">Conteúdo Personalizado</h3>
                            <div className="flex gap-3">
                                <div className="flex-1 bg-slate-900/50 rounded-xl p-3 text-center border border-slate-700">
                                    <div className="text-xl font-bold text-purple-400">{customCases.length}</div>
                                    <div className="text-[10px] text-slate-400">Casos</div>
                                </div>
                                <div className="flex-1 bg-slate-900/50 rounded-xl p-3 text-center border border-slate-700">
                                    <div className="text-xl font-bold text-purple-400">{customQuizzes.length}</div>
                                    <div className="text-[10px] text-slate-400">Quizzes</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
