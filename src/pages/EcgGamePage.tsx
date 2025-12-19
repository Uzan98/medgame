import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Heart,
    ArrowLeft,
    Coins,
    Clock,
    Zap,
    CheckCircle,
    XCircle,
    Loader2,
    Play,
    RotateCcw,
    Maximize2,
    X
} from 'lucide-react';
import { useEcgGameStore } from '../store/ecgGameStore';
import clsx from 'clsx';

export const EcgGamePage: React.FC = () => {
    const {
        isPlaying,
        currentCase,
        casesAnswered,
        correctAnswers,
        streak,
        bestStreak,
        xpEarned,
        coinsEarned,
        timeRemaining,
        selectedAnswer,
        showResult,
        isLoading,
        error,
        startGame,
        answerQuestion,
        nextCase,
        endGame,
        tick,
        reset
    } = useEcgGameStore();

    // Image zoom state
    const [imageZoom, setImageZoom] = useState(false);

    // Timer effect
    useEffect(() => {
        if (!isPlaying || showResult) return;

        const timer = setInterval(() => {
            tick();
        }, 1000);

        return () => clearInterval(timer);
    }, [isPlaying, showResult, tick]);

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Shuffle alternatives ONLY when currentCase changes (not on every render)
    const shuffledAlternatives = useMemo(() => {
        if (!currentCase?.alternatives) return [];
        return [...currentCase.alternatives].sort(() => Math.random() - 0.5);
    }, [currentCase?.id]); // Depend on case ID, not the entire case object

    // Start Screen
    if (!isPlaying && !showResult) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="max-w-md">
                    <div className="text-8xl mb-6">🫀</div>
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Diagnostique o ECG
                    </h1>
                    <p className="text-slate-400 mb-8">
                        Analise o caso clínico, observe o ECG e identifique o diagnóstico correto.
                        O jogo continua até você errar!
                    </p>

                    <div className="flex items-center justify-center gap-6 mb-8 text-sm">
                        <div className="flex items-center gap-2 text-cyan-400">
                            <Clock className="w-5 h-5" />
                            <span>60s por caso</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Zap className="w-5 h-5" />
                            <span>Modo infinito</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={startGame}
                        disabled={isLoading}
                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-3 mx-auto"
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Play className="w-6 h-6" />
                        )}
                        {isLoading ? 'Carregando...' : 'Iniciar Jogo'}
                    </button>

                    <Link
                        to="/games"
                        className="mt-6 text-slate-400 hover:text-white flex items-center gap-2 justify-center transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Games
                    </Link>
                </div>
            </div>
        );
    }

    // Game Over Screen
    if (!isPlaying && casesAnswered > 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="max-w-md">
                    <div className="text-8xl mb-6">🏆</div>
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Fim de Jogo!
                    </h1>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="text-3xl font-bold text-cyan-400">{correctAnswers}</div>
                            <div className="text-sm text-slate-400">Acertos</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="text-3xl font-bold text-orange-400">{bestStreak}</div>
                            <div className="text-sm text-slate-400">Melhor Sequência</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="text-3xl font-bold text-emerald-400 flex items-center justify-center gap-1">
                                <Zap className="w-5 h-5" />
                                {xpEarned}
                            </div>
                            <div className="text-sm text-slate-400">XP Ganho</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="text-3xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                                <Coins className="w-5 h-5" />
                                {coinsEarned}
                            </div>
                            <div className="text-sm text-slate-400">Moedas</div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => { reset(); startGame(); }}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl text-white font-bold hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Jogar Novamente
                        </button>
                        <Link
                            to="/games"
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors"
                        >
                            Voltar
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Game Screen
    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 p-4 shrink-0">
                <div className="flex items-center justify-between">
                    {/* Stats */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                            <Heart className="w-4 h-4 text-red-400" />
                            <span className="text-white font-medium">{correctAnswers}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                            <Zap className="w-4 h-4 text-orange-400" />
                            <span className="text-white font-medium">{streak}x</span>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className={clsx(
                        'px-4 py-2 rounded-xl font-mono text-lg font-bold',
                        timeRemaining <= 10 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-700 text-white'
                    )}>
                        <Clock className="w-5 h-5 inline mr-2" />
                        {formatTime(timeRemaining)}
                    </div>

                    {/* XP */}
                    <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-lg">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">{xpEarned} XP</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentCase && (
                    <>
                        {/* Clinical Context */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <h3 className="text-sm text-cyan-400 font-medium mb-2">📋 Caso Clínico</h3>
                            <p className="text-white">{currentCase.clinical_context}</p>
                        </div>

                        {/* ECG Image */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-cyan-400 font-medium">🫀 ECG</h3>
                                <button
                                    onClick={() => setImageZoom(true)}
                                    className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 text-xs"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                    Ampliar
                                </button>
                            </div>
                            <img
                                src={currentCase.ecg_image_url}
                                alt="ECG"
                                className="w-full rounded-lg border border-slate-600 cursor-zoom-in hover:opacity-90 transition-opacity"
                                onClick={() => setImageZoom(true)}
                            />
                        </div>

                        {/* Alternatives */}
                        <div className="space-y-3">
                            <h3 className="text-sm text-cyan-400 font-medium">Qual o diagnóstico?</h3>
                            {shuffledAlternatives.map((alt, idx) => {
                                const isSelected = selectedAnswer === alt;
                                const isCorrect = alt === currentCase.correct_answer;
                                const showCorrect = showResult && isCorrect;
                                const showWrong = showResult && isSelected && !isCorrect;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => !showResult && answerQuestion(alt)}
                                        disabled={showResult}
                                        className={clsx(
                                            'w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3',
                                            showCorrect && 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
                                            showWrong && 'bg-red-500/20 border-red-500 text-red-400',
                                            !showResult && 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 text-white',
                                            showResult && !showCorrect && !showWrong && 'bg-slate-800/30 border-slate-700/50 text-slate-500'
                                        )}
                                    >
                                        {showCorrect && <CheckCircle className="w-5 h-5 shrink-0" />}
                                        {showWrong && <XCircle className="w-5 h-5 shrink-0" />}
                                        <span>{alt}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation */}
                        {showResult && currentCase.explanation && (
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                                <h3 className="text-sm text-cyan-400 font-medium mb-2">💡 Explicação</h3>
                                <p className="text-slate-300">{currentCase.explanation}</p>
                            </div>
                        )}

                        {/* Next Button */}
                        {showResult && (
                            <button
                                onClick={selectedAnswer === currentCase.correct_answer ? nextCase : endGame}
                                className={clsx(
                                    'w-full py-4 rounded-xl font-bold text-lg transition-all',
                                    selectedAnswer === currentCase.correct_answer
                                        ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:scale-[1.02]'
                                        : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:scale-[1.02]'
                                )}
                            >
                                {selectedAnswer === currentCase.correct_answer
                                    ? 'Próximo Caso →'
                                    : 'Ver Resultado Final'
                                }
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Image Zoom Modal */}
            {imageZoom && currentCase && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setImageZoom(false)}
                >
                    <button
                        onClick={() => setImageZoom(false)}
                        className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={currentCase.ecg_image_url}
                        alt="ECG Ampliado"
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};
