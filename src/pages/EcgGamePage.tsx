import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    X,
    Swords,
    Users,
    AlertCircle
} from 'lucide-react';
import { useEcgGameStore } from '../store/ecgGameStore';
import { useGameChallengeStore } from '../store/gameChallengeStore';
import { useAuth } from '../contexts/AuthContext';
import { ChallengeFriendModal } from '../components/challenges';
import clsx from 'clsx';

export const EcgGamePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { fetchMyChallenges, getPendingChallenges, submitScore } = useGameChallengeStore();

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

    // Challenge and UI state
    const [imageZoom, setImageZoom] = useState(false);
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

    // Check for challenge in URL params
    useEffect(() => {
        const challengeId = searchParams.get('challenge');
        if (challengeId) {
            setActiveChallengeId(challengeId);
            startGame(); // Start game immediately when accepting challenge
        }
    }, [searchParams]);

    // Fetch pending challenges on mount
    useEffect(() => {
        if (user?.id) {
            fetchMyChallenges(user.id, 'ecg');
        }
    }, [user?.id]);

    // Submit score when game ends in challenge mode
    useEffect(() => {
        if (!isPlaying && casesAnswered > 0 && activeChallengeId && user?.id) {
            submitScore(activeChallengeId, user.id, {
                correctAnswers: correctAnswers,
                score: correctAnswers, // Config usa correctAnswers para comparação
                casesAnswered,
                bestStreak
            });
            fetchMyChallenges(user.id, 'ecg');
        }
    }, [isPlaying, casesAnswered, activeChallengeId]);

    // Get pending challenges for badge
    const pendingChallenges = user?.id ? getPendingChallenges(user.id, 'ecg') : [];

    // Handle challenge created
    const handleChallengeCreated = (challengeId: string) => {
        setActiveChallengeId(challengeId);
        startGame();
    };

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
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900/10 to-slate-900 p-4">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block mb-4">
                            <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-pulse"></div>
                            <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                                <Heart className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
                            Diagnostique o ECG
                        </h1>
                        <p className="text-slate-400 mt-2">
                            Analise casos clínicos e identifique o diagnóstico!
                        </p>
                    </div>

                    {/* Game Info */}
                    <div className="bg-slate-800/50 rounded-2xl border border-red-500/20 p-6 mb-6 backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            Como Jogar
                        </h2>
                        <ul className="space-y-3 text-slate-300 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-cyan-400 text-xs">1</span>
                                </span>
                                <span>Leia o caso clínico e analise o ECG apresentado</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-emerald-400 text-xs">2</span>
                                </span>
                                <span>Escolha o diagnóstico correto entre as alternativas</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-yellow-400 text-xs">3</span>
                                </span>
                                <span>Você tem 60 segundos por caso - seja rápido!</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-red-400 text-xs">4</span>
                                </span>
                                <span>O jogo continua até você errar - modo infinito!</span>
                            </li>
                        </ul>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Start Button */}
                    <button
                        onClick={startGame}
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-[1.02] shadow-lg shadow-red-500/30 mb-4 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Play className="w-6 h-6" />
                        )}
                        {isLoading ? 'Carregando...' : 'Iniciar Jogo'}
                    </button>

                    {/* Challenge Buttons */}
                    <div className="flex gap-3 mb-4">
                        <button
                            onClick={() => setShowChallengeModal(true)}
                            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                            <Swords className="w-5 h-5" />
                            Desafiar Amigo
                        </button>
                        <button
                            onClick={() => navigate('/games/ecg/challenges')}
                            className="flex-1 py-3 bg-slate-800 border border-purple-500/30 text-purple-400 font-bold rounded-xl flex items-center justify-center gap-2 relative hover:bg-slate-700 transition-all"
                        >
                            <Users className="w-5 h-5" />
                            Desafios
                            {pendingChallenges.length > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse">
                                    {pendingChallenges.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/games')}
                        className="w-full py-3 bg-slate-800 border border-slate-700 text-slate-400 font-medium rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar aos Jogos
                    </button>
                </div>

                {/* Challenge Modal */}
                <ChallengeFriendModal
                    isOpen={showChallengeModal}
                    onClose={() => setShowChallengeModal(false)}
                    gameType="ecg"
                    onChallengeCreated={handleChallengeCreated}
                />
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
                        <button
                            onClick={() => { reset(); navigate('/games/ecg'); }}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors"
                        >
                            Menu
                        </button>
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
