import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Square, Clock, Coins, Zap, BookOpen, CheckCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const StudyPage: React.FC = () => {
    const navigate = useNavigate();
    const { isStudying, studyStartTime, startStudying, stopStudying, stats } = useGameStore();

    const [elapsedTime, setElapsedTime] = useState(0);
    const [lastSession, setLastSession] = useState<{ minutes: number; coinsEarned: number; xpEarned: number } | null>(null);

    // Calculate timer display
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;

    // Update timer
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isStudying && studyStartTime) {
            // Initial calculation
            const elapsed = Math.floor((Date.now() - studyStartTime) / 1000);
            setElapsedTime(elapsed);

            // Update every second
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - studyStartTime) / 1000));
            }, 1000);
        } else {
            setElapsedTime(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isStudying, studyStartTime]);

    const handleStart = useCallback(() => {
        startStudying();
        setLastSession(null);
    }, [startStudying]);

    const handleStop = useCallback(() => {
        const result = stopStudying();
        setLastSession(result);
    }, [stopStudying]);

    // Calculate potential rewards based on current elapsed time
    const potentialCoins = Math.floor((elapsedTime / 3600) * 100);
    const potentialXP = Math.floor(elapsedTime / 60);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/')}
                    className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">Modo Estudo</h1>
                    <p className="text-sm text-slate-400">Ganhe recompensas enquanto estuda</p>
                </div>
            </div>

            {/* Main Timer Section */}
            <div className="flex-1 flex flex-col items-center justify-center">
                {/* Timer Display */}
                <div className="relative mb-8">
                    {/* Glow effect */}
                    {isStudying && (
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                    )}

                    <div className={`relative w-64 h-64 lg:w-80 lg:h-80 rounded-full flex items-center justify-center border-4 ${isStudying
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.3)]'
                        : 'border-slate-700 bg-slate-800/50'
                        }`}>
                        <div className="text-center">
                            <div className="text-5xl lg:text-6xl font-mono font-bold text-white tracking-wider">
                                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </div>
                            <div className="text-slate-400 mt-2 flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Tempo de Estudo</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Potential Rewards */}
                {isStudying && (
                    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-4 mb-6 w-full max-w-md">
                        <h3 className="text-sm text-slate-400 mb-3 text-center">Recompensas Acumuladas</h3>
                        <div className="flex justify-center gap-8">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                                    <Coins className="w-5 h-5" />
                                    {potentialCoins}
                                </div>
                                <div className="text-xs text-slate-400">MedCoins</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-cyan-400 flex items-center justify-center gap-1">
                                    <Zap className="w-5 h-5" />
                                    {potentialXP}
                                </div>
                                <div className="text-xs text-slate-400">XP</div>
                            </div>
                        </div>
                        <p className="text-xs text-center text-slate-500 mt-2">
                            100 MedCoins por hora • 1 XP por minuto
                        </p>
                    </div>
                )}

                {/* Last Session Result */}
                {lastSession && lastSession.minutes > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 w-full max-w-md">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-emerald-400 font-medium">Sessão Concluída!</h3>
                        </div>
                        <div className="flex justify-center gap-8">
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{lastSession.minutes} min</div>
                                <div className="text-xs text-slate-400">Estudado</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-yellow-400">+{lastSession.coinsEarned}</div>
                                <div className="text-xs text-slate-400">MedCoins</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-cyan-400">+{lastSession.xpEarned}</div>
                                <div className="text-xs text-slate-400">XP</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Control Buttons */}
                <div className="flex gap-4">
                    {!isStudying ? (
                        <button
                            onClick={handleStart}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl text-white font-bold text-lg shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-105 transition-transform"
                        >
                            <Play className="w-6 h-6" />
                            Iniciar Estudo
                        </button>
                    ) : (
                        <button
                            onClick={handleStop}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white font-bold text-lg shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-105 transition-transform"
                        >
                            <Square className="w-6 h-6" />
                            Encerrar Sessão
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Footer */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mt-4">
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Estatísticas de Estudo</span>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                        {Math.floor(stats.totalStudyTime / 60)}h {stats.totalStudyTime % 60}min
                    </div>
                    <div className="text-xs text-slate-400">Tempo Total Estudado</div>
                </div>
            </div>
        </div>
    );
};
