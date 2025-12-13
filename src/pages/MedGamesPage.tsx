import React from 'react';
import { Link } from 'react-router-dom';
import {
    Gamepad2,
    Trophy,
    Coins,
    Star,
    ChevronRight,
    Lock,
    Sparkles
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import clsx from 'clsx';

interface GameCard {
    id: string;
    title: string;
    description: string;
    icon: string;
    path: string;
    requiredLevel: number;
    reward: string;
    gradient: string;
    coming?: boolean;
}

const games: GameCard[] = [
    {
        id: 'medmilhao',
        title: 'MedMilhão',
        description: 'Responda perguntas médicas e ganhe até 1 milhão de MediCoins!',
        icon: '💰',
        path: '/games/medmilhao',
        requiredLevel: 1,
        reward: 'Até 1.000.000',
        gradient: 'from-yellow-500 to-amber-600'
    },
    {
        id: 'plantao-infinito',
        title: 'Plantão Infinito',
        description: 'Sobreviva ao caos do PS! Casos chegam em fila sem parar!',
        icon: '🏥',
        path: '/games/plantao-infinito',
        requiredLevel: 1,
        reward: 'Sobrevivência',
        gradient: 'from-red-500 to-orange-600'
    },
    {
        id: 'quiz-relampago',
        title: 'Quiz Relâmpago',
        description: 'Responda o máximo de perguntas em 60 segundos!',
        icon: '⚡',
        path: '/games/quiz-relampago',
        requiredLevel: 3,
        reward: 'Variável',
        gradient: 'from-purple-500 to-pink-600',
        coming: true
    },
    {
        id: 'duelo-medico',
        title: 'Duelo Médico',
        description: 'Desafie outros jogadores em tempo real!',
        icon: '⚔️',
        path: '/games/duelo',
        requiredLevel: 10,
        reward: 'Variável',
        gradient: 'from-cyan-500 to-blue-600',
        coming: true
    }
];

export const MedGamesPage: React.FC = () => {
    const { level } = useGameStore();

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="mb-6 shrink-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Gamepad2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-white">MedGames</h1>
                        <p className="text-sm text-slate-400">Jogos para testar seu conhecimento médico!</p>
                    </div>
                </div>
            </div>

            {/* Games Grid */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {games.map((game) => {
                        const isLocked = level < game.requiredLevel;
                        const isComing = game.coming;

                        return (
                            <div
                                key={game.id}
                                className={clsx(
                                    'relative bg-slate-800/50 border rounded-2xl overflow-hidden transition-all',
                                    isLocked || isComing
                                        ? 'border-slate-700/50 opacity-60'
                                        : 'border-slate-700 hover:border-cyan-500/50 hover:scale-[1.02]'
                                )}
                            >
                                {/* Coming Soon / Locked Overlay */}
                                {(isLocked || isComing) && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 z-10">
                                        {isComing ? (
                                            <div className="text-center">
                                                <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                                <p className="text-sm font-bold text-purple-400">Em Breve</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Lock className="w-8 h-8 text-slate-500 mx-auto mb-1" />
                                                <p className="text-xs text-slate-400">Nível {game.requiredLevel}</p>
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
                                        <div className={clsx(
                                            'w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br',
                                            game.gradient
                                        )}>
                                            {game.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-1">{game.title}</h3>
                                            <p className="text-sm text-slate-400 line-clamp-2">{game.description}</p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-lg">
                                                <Coins className="w-4 h-4 text-yellow-400" />
                                                <span className="text-sm font-bold text-yellow-400">{game.reward}</span>
                                            </div>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-slate-700/50 rounded-lg">
                                                <Star className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-400">Nv. {game.requiredLevel}+</span>
                                            </div>
                                        </div>
                                        {!isLocked && !isComing && (
                                            <ChevronRight className="w-5 h-5 text-cyan-400" />
                                        )}
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Trophy className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-white mb-1">Dica do Mestre</h3>
                            <p className="text-sm text-slate-300">
                                Jogando MedGames você ganha MediCoins extras e XP bônus!
                                Quanto mais você acertar, maiores as recompensas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
