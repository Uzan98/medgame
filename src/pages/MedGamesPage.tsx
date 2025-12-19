import React from 'react';
import { Link } from 'react-router-dom';
import {
    Gamepad2,
    Trophy,
    Coins,
    Star,
    ChevronRight,
    Lock,
    Sparkles,
    FileText,
    ClipboardList,
    DollarSign,
    Building2,
    Stethoscope,
    HeartPulse,
    Zap,
    Swords,
    Search,
    type LucideIcon
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import clsx from 'clsx';

interface GameCard {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    iconColor: string;
    path: string;
    requiredLevel: number;
    reward: string;
    gradient: string;
    bgGlow: string;
    coming?: boolean;
}

const games: GameCard[] = [
    {
        id: 'quiz',
        title: 'Quiz Médico',
        description: 'Teste seus conhecimentos com perguntas de múltipla escolha!',
        icon: FileText,
        iconColor: 'text-blue-400',
        path: '/quiz',
        requiredLevel: 1,
        reward: 'Até 50 XP',
        gradient: 'from-blue-500 to-indigo-600',
        bgGlow: 'shadow-blue-500/20'
    },
    {
        id: 'casos',
        title: 'Casos Clínicos',
        description: 'Resolva casos clínicos completos e aprenda na prática!',
        icon: ClipboardList,
        iconColor: 'text-emerald-400',
        path: '/cases',
        requiredLevel: 1,
        reward: 'Até 100 XP',
        gradient: 'from-emerald-500 to-green-600',
        bgGlow: 'shadow-emerald-500/20'
    },
    {
        id: 'medmilhao',
        title: 'MedMilhão',
        description: 'Responda perguntas médicas e ganhe até 1 milhão de MediCoins!',
        icon: DollarSign,
        iconColor: 'text-yellow-400',
        path: '/games/medmilhao',
        requiredLevel: 1,
        reward: 'Até 1.000.000',
        gradient: 'from-yellow-500 to-amber-600',
        bgGlow: 'shadow-yellow-500/20'
    },
    {
        id: 'plantao-infinito',
        title: 'Plantão Infinito',
        description: 'Sobreviva ao caos do PS! Casos chegam em fila sem parar!',
        icon: Building2,
        iconColor: 'text-red-400',
        path: '/games/plantao-infinito',
        requiredLevel: 1,
        reward: 'Sobrevivência',
        gradient: 'from-red-500 to-orange-600',
        bgGlow: 'shadow-red-500/20'
    },
    {
        id: 'consulta-express',
        title: 'Consulta Express',
        description: 'Faça anamnese com paciente IA e escreva o prontuário!',
        icon: Stethoscope,
        iconColor: 'text-teal-400',
        path: '/games/consulta-express',
        requiredLevel: 1,
        reward: 'Até 400 XP',
        gradient: 'from-teal-500 to-cyan-600',
        bgGlow: 'shadow-teal-500/20',
        coming: true
    },
    {
        id: 'ecg-diagnosis',
        title: 'Diagnostique o ECG',
        description: 'Analise ECGs e identifique o diagnóstico correto!',
        icon: HeartPulse,
        iconColor: 'text-pink-400',
        path: '/games/ecg',
        requiredLevel: 1,
        reward: 'Modo Infinito',
        gradient: 'from-red-500 to-pink-600',
        bgGlow: 'shadow-pink-500/20'
    },
    {
        id: 'medical-detective',
        title: 'Medical Detective',
        description: 'Investigue casos clínicos como um detetive médico!',
        icon: Search,
        iconColor: 'text-cyan-400',
        path: '/games/detective',
        requiredLevel: 1,
        reward: 'Até 150 XP',
        gradient: 'from-cyan-500 to-blue-600',
        bgGlow: 'shadow-cyan-500/20'
    },
    {
        id: 'quiz-relampago',
        title: 'Quiz Relâmpago',
        description: 'Responda o máximo de perguntas em 60 segundos!',
        icon: Zap,
        iconColor: 'text-purple-400',
        path: '/games/quiz-relampago',
        requiredLevel: 3,
        reward: 'Variável',
        gradient: 'from-purple-500 to-pink-600',
        bgGlow: 'shadow-purple-500/20',
        coming: true
    },
    {
        id: 'duelo-medico',
        title: 'Duelo Médico',
        description: 'Desafie outros jogadores em tempo real!',
        icon: Swords,
        iconColor: 'text-cyan-400',
        path: '/games/duelo',
        requiredLevel: 10,
        reward: 'Variável',
        gradient: 'from-cyan-500 to-blue-600',
        bgGlow: 'shadow-cyan-500/20',
        coming: true
    }
];

export const MedGamesPage: React.FC = () => {
    const { level } = useGameStore();

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="mb-6 shrink-0">
                <div className="flex items-center gap-4 mb-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Gamepad2 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">MedGames</h1>
                        <p className="text-sm text-slate-400">Aprenda jogando, domine a medicina</p>
                    </div>
                </div>
            </div>

            {/* Games Grid */}
            <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {games.map((game) => {
                        const isLocked = level < game.requiredLevel;
                        const isComing = game.coming;
                        const IconComponent = game.icon;

                        return (
                            <div
                                key={game.id}
                                className={clsx(
                                    'group relative rounded-2xl overflow-hidden transition-all duration-300',
                                    isLocked || isComing
                                        ? 'opacity-60'
                                        : 'hover:scale-[1.02] hover:-translate-y-1'
                                )}
                            >
                                {/* Background glow effect */}
                                <div className={clsx(
                                    'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl',
                                    game.gradient
                                )}></div>

                                {/* Card content */}
                                <div className={clsx(
                                    'relative bg-slate-800/80 backdrop-blur-sm border rounded-2xl overflow-hidden',
                                    isLocked || isComing
                                        ? 'border-slate-700/50'
                                        : 'border-slate-700 group-hover:border-slate-600'
                                )}>
                                    {/* Coming Soon / Locked Overlay */}
                                    {(isLocked || isComing) && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
                                            {isComing ? (
                                                <div className="text-center">
                                                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                                                        <Sparkles className="w-8 h-8 text-purple-400" />
                                                    </div>
                                                    <p className="text-sm font-bold text-purple-400">Em Breve</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-3">
                                                        <Lock className="w-8 h-8 text-slate-500" />
                                                    </div>
                                                    <p className="text-xs text-slate-400">Requer Nível {game.requiredLevel}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Link
                                        to={isLocked || isComing ? '#' : game.path}
                                        className="block p-5"
                                        onClick={(e) => (isLocked || isComing) && e.preventDefault()}
                                    >
                                        {/* Header */}
                                        <div className="flex items-start gap-4 mb-4">
                                            {/* Icon container with gradient overlay */}
                                            <div className="relative">
                                                <div className={clsx(
                                                    'absolute inset-0 rounded-xl blur-lg opacity-50 bg-gradient-to-br',
                                                    game.gradient
                                                )}></div>
                                                <div className={clsx(
                                                    'relative w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
                                                    game.gradient,
                                                    game.bgGlow
                                                )}>
                                                    <IconComponent className="w-8 h-8 text-white drop-shadow-md" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-100 transition-colors">
                                                    {game.title}
                                                </h3>
                                                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                                    {game.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg">
                                                    <Coins className="w-4 h-4 text-yellow-400" />
                                                    <span className="text-sm font-semibold text-yellow-400">{game.reward}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-lg">
                                                    <Star className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm text-slate-400">Nv.{game.requiredLevel}+</span>
                                                </div>
                                            </div>
                                            {!isLocked && !isComing && (
                                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                                                    <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Box */}
                <div className="mt-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
                    <div className="relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-5">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                                <Trophy className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">Dica do Mestre</h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Jogando MedGames você ganha MediCoins extras e XP bônus!
                                    Quanto mais você acertar, maiores as recompensas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
