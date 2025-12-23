import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, Zap, CheckCircle, XCircle, ChevronRight, Trophy, Target, Heart, Swords, Users } from 'lucide-react';
import { QuizCase, shuffleOptions, quizCases } from '../lib/quizCases';
import { useAdminStore } from '../store/adminStore';
import clsx from 'clsx';
import { useGameStore } from '../store/gameStore';
import { useGameChallengeStore } from '../store/gameChallengeStore';
import { useAuth } from '../contexts/AuthContext';
import { ChallengeFriendModal } from '../components/challenges/ChallengeFriendModal';

type GameState = 'start' | 'playing' | 'answer' | 'result';

const TOTAL_TIME = 60;
const HINT_INTERVAL = 5;
const POINTS_BY_HINTS = [10, 8, 6, 4, 3, 1];
const CASES_PER_GAME = 5;

export const QuizPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { addXP, addCoins, updateStats, canPlay, drainEnergy, changeReputation } = useGameStore();
    const { submitScore, fetchMyChallenges, getPendingChallenges } = useGameChallengeStore();

    const [gameState, setGameState] = useState<GameState>('start');
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
    const [cases, setCases] = useState<QuizCase[]>([]);
    const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
    const [hintsRevealed, setHintsRevealed] = useState(0);
    const [options, setOptions] = useState<string[]>([]);
    const [, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [betMode, setBetMode] = useState(false);
    const [results, setResults] = useState<{ correct: boolean; points: number; case_: QuizCase }[]>([]);
    const [showHintAnimation, setShowHintAnimation] = useState(false);
    const [heartbeatSpeed, setHeartbeatSpeed] = useState(1);

    // Challenge state
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

    const currentCase = cases[currentCaseIndex];

    // Get custom quizzes from admin store
    const { customQuizzes } = useAdminStore();

    // Merge all quizzes
    const allQuizzes = useMemo(() => [...quizCases, ...customQuizzes], [customQuizzes]);

    // Check for challenge in URL params
    useEffect(() => {
        const challengeId = searchParams.get('challenge');
        if (challengeId) {
            setActiveChallengeId(challengeId);
        }
    }, [searchParams]);

    // Fetch pending challenges on mount
    useEffect(() => {
        if (user?.id) {
            fetchMyChallenges(user.id, 'quiz');
        }
    }, [user?.id]);

    const pendingChallenges = user?.id ? getPendingChallenges(user.id, 'quiz') : [];

    // Initialize game
    const startGame = useCallback(() => {
        // Get random quizzes from merged list
        const shuffled = [...allQuizzes].sort(() => Math.random() - 0.5);
        const selectedCases = shuffled.slice(0, CASES_PER_GAME);
        setCases(selectedCases);
        setCurrentCaseIndex(0);
        setTimeLeft(TOTAL_TIME);
        setHintsRevealed(0);
        setScore(0);
        setResults([]);
        setBetMode(false);
        setSelectedAnswer(null);
        setIsCorrect(null);

        if (selectedCases[0]) {
            setOptions(shuffleOptions(selectedCases[0].correctDiagnosis, selectedCases[0].wrongOptions));
        }

        setGameState('playing');
    }, []);

    // Setup next case
    const setupNextCase = useCallback(() => {
        if (currentCaseIndex + 1 < cases.length) {
            const nextIndex = currentCaseIndex + 1;
            setCurrentCaseIndex(nextIndex);
            setHintsRevealed(0);
            setBetMode(false);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setOptions(shuffleOptions(cases[nextIndex].correctDiagnosis, cases[nextIndex].wrongOptions));
            setGameState('playing');
        } else {
            setGameState('result');
        }
    }, [currentCaseIndex, cases]);

    // Handle answer
    const handleAnswer = useCallback((answer: string) => {
        if (!currentCase || gameState !== 'playing') return;

        setSelectedAnswer(answer);
        const correct = answer === currentCase.correctDiagnosis;
        setIsCorrect(correct);

        let points = 0;
        if (correct) {
            points = POINTS_BY_HINTS[Math.min(hintsRevealed, 5)];
            if (betMode) points *= 2;
        } else {
            // Penalty for wrong answer
            setTimeLeft(prev => Math.max(0, prev - 2));
            if (betMode) {
                setTimeLeft(prev => Math.max(0, prev - 5));
            }
        }



        if (correct) {
            changeReputation(0.1);
        } else {
            changeReputation(-0.2);
        }

        setScore(prev => prev + points);
        setResults(prev => [...prev, { correct, points, case_: currentCase }]);
        setGameState('answer');

        // Clear timers
        if (timerRef.current) clearInterval(timerRef.current);
        if (hintTimerRef.current) clearInterval(hintTimerRef.current);
    }, [currentCase, gameState, hintsRevealed, betMode]);

    // Main timer
    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setGameState('result');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [gameState]);

    // Hint reveal timer
    useEffect(() => {
        if (gameState === 'playing' && currentCase) {
            let hintCount = 0;

            hintTimerRef.current = setInterval(() => {
                hintCount++;
                if (hintCount <= 5) {
                    setShowHintAnimation(true);
                    setTimeout(() => setShowHintAnimation(false), 500);
                    setHintsRevealed(hintCount);
                }
            }, HINT_INTERVAL * 1000);

            return () => {
                if (hintTimerRef.current) clearInterval(hintTimerRef.current);
            };
        }
    }, [gameState, currentCaseIndex, currentCase]);

    // Heartbeat speed based on hints revealed
    useEffect(() => {
        setHeartbeatSpeed(1 + hintsRevealed * 0.3);
    }, [hintsRevealed]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (hintTimerRef.current) clearInterval(hintTimerRef.current);
        };
    }, []);

    // Award XP and coins when quiz ends
    const hasAwardedRef = useRef(false);
    useEffect(() => {
        if (gameState === 'result' && !hasAwardedRef.current) {
            hasAwardedRef.current = true;
            drainEnergy(10);

            const correctAnswers = results.filter(r => r.correct).length;

            // Always count the quiz, even with 0 score
            updateStats({
                quizzesTaken: 1,
                totalCorrectAnswers: correctAnswers,
            });

            if (score > 0) {
                const xpEarned = score * 10; // 10 XP per point
                const coinsEarned = score * 2; // 2 coins per point
                addXP(xpEarned);
                addCoins(coinsEarned);
            }

            // Submit score if in challenge mode
            if (activeChallengeId && user?.id) {
                submitScore(activeChallengeId, user.id, {
                    score,
                    correctAnswers,
                }).then(() => {
                    fetchMyChallenges(user.id, 'quiz');
                });
            }
        }

        // Reset the ref when starting a new game
        if (gameState === 'start') {
            hasAwardedRef.current = false;
        }
    }, [gameState, score, results, drainEnergy, updateStats, addXP, addCoins, activeChallengeId, user?.id, submitScore, fetchMyChallenges]);

    // Handle challenge created
    const handleChallengeCreated = (challengeId: string) => {
        setShowChallengeModal(false);
        setActiveChallengeId(challengeId);
    };


    const renderStart = () => (
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border-2 border-cyan-500/50 flex items-center justify-center mb-6 animate-pulse">
                <Target className="w-12 h-12 text-cyan-400" />
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Quiz Diagnóstico</h1>
            <p className="text-slate-400 mb-6">Adivinhe o diagnóstico em 60 segundos!</p>

            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4 max-w-md mb-6 text-left">
                <h3 className="font-bold text-cyan-400 mb-3">Como funciona:</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        Você tem 60 segundos para {CASES_PER_GAME} casos
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        A cada 5s, uma nova pista é revelada
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        Quanto mais cedo acertar, mais pontos!
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        Modo "Apostar" = pontos x2 (ou perde 5s)
                    </li>
                </ul>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-6">
                {POINTS_BY_HINTS.slice(0, 3).map((pts, i) => (
                    <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-emerald-400">+{pts}</div>
                        <div className="text-[10px] text-slate-400">{i} pistas</div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => {
                    if (canPlay()) {
                        startGame();
                    }
                }}
                disabled={!canPlay()}
                className={clsx(
                    "w-full max-w-md font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-transform text-lg",
                    canPlay()
                        ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
                )}
            >
                {canPlay() ? '🎯 Iniciar Quiz (-10 Energia)' : 'Muito Cansado (Requer 40% Energia)'}
            </button>

            {/* Challenge Buttons */}
            <div className="flex gap-3 w-full max-w-md mt-4">
                <button
                    onClick={() => setShowChallengeModal(true)}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-purple-500/20"
                >
                    <Swords className="w-5 h-5" />
                    Desafiar Amigo
                </button>
                <button
                    onClick={() => navigate('/quiz/challenges')}
                    className="flex-1 py-3 bg-slate-800/50 border border-purple-500/30 text-purple-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:border-purple-500/50 transition-colors relative"
                >
                    <Users className="w-5 h-5" />
                    Ver Desafios
                    {pendingChallenges.length > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse">
                            {pendingChallenges.length}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );

    const renderPlaying = () => {
        if (!currentCase) return null;

        const timePercentage = (timeLeft / TOTAL_TIME) * 100;
        const isLowTime = timeLeft <= 15;

        return (
            <div className="h-full flex flex-col overflow-hidden">
                {/* Timer Bar - Fixed */}
                <div className="mb-3 shrink-0">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <Clock className={clsx("w-5 h-5", isLowTime ? "text-red-400 animate-pulse" : "text-cyan-400")} />
                            <span className={clsx("text-lg font-bold", isLowTime ? "text-red-400" : "text-white")}>{timeLeft}s</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">Caso {currentCaseIndex + 1}/{CASES_PER_GAME}</span>
                            <span className="text-sm font-bold text-yellow-400">{score} pts</span>
                        </div>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div
                            className={clsx(
                                "h-full transition-all duration-1000 ease-linear",
                                isLowTime ? "bg-red-500" : "bg-gradient-to-r from-cyan-500 to-emerald-500"
                            )}
                            style={{ width: `${timePercentage}%` }}
                        />
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pb-2">
                    {/* Case Info & Hints */}
                    <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4 relative overflow-hidden">
                        {/* Heartbeat Effect */}
                        <div
                            className="absolute inset-0 bg-cyan-500/5 pointer-events-none"
                            style={{ animation: `pulse ${1 / heartbeatSpeed}s ease-in-out infinite` }}
                        />

                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-5 h-5 text-red-400" style={{ animation: `heartbeat ${1 / heartbeatSpeed}s ease-in-out infinite` }} />
                            <span className="text-xs text-slate-400 uppercase">Paciente</span>
                        </div>

                        <p className="text-white font-medium mb-3">{currentCase.initialInfo}</p>

                        {/* Hints */}
                        <div className="space-y-2">
                            {currentCase.hints.slice(0, hintsRevealed).map((hint, i) => (
                                <div
                                    key={i}
                                    className={clsx(
                                        "flex items-start gap-2 p-2 rounded-lg bg-slate-900/50 border border-cyan-500/20 text-sm",
                                        i === hintsRevealed - 1 && showHintAnimation && "animate-slideIn"
                                    )}
                                >
                                    <span className="text-cyan-400 font-bold shrink-0">#{i + 1}</span>
                                    <span className="text-slate-300">{hint}</span>
                                </div>
                            ))}

                            {hintsRevealed < 5 && (
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/30 border border-dashed border-slate-700 text-sm text-slate-500">
                                    <Clock className="w-4 h-4" />
                                    Próxima pista em {HINT_INTERVAL - (Math.floor((TOTAL_TIME - timeLeft) % HINT_INTERVAL) || HINT_INTERVAL)}s...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Points indicator */}
                    <div className="text-center py-2">
                        <span className="text-sm text-slate-400">Se acertar agora: </span>
                        <span className={clsx("font-bold", betMode ? "text-yellow-400" : "text-emerald-400")}>
                            +{POINTS_BY_HINTS[Math.min(hintsRevealed, 5)] * (betMode ? 2 : 1)} pts
                        </span>
                    </div>

                    {/* Bet Mode Toggle */}
                    <button
                        onClick={() => setBetMode(!betMode)}
                        className={clsx(
                            "w-full py-2 px-4 rounded-lg border text-sm font-bold transition-all flex items-center justify-center gap-2",
                            betMode
                                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                                : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-yellow-500/30"
                        )}
                    >
                        <Zap className="w-4 h-4" />
                        {betMode ? "🔥 MODO APOSTA ATIVO (x2)" : "Ativar Aposta (x2 ou -5s)"}
                    </button>

                    {/* Answer Options */}
                    <div className="space-y-2">
                        {options.map((option, i) => (
                            <button
                                key={i}
                                onClick={() => handleAnswer(option)}
                                className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-700/50 text-left transition-all active:scale-[0.98] group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 group-hover:bg-cyan-500/20 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0">
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    <span className="text-white font-medium text-sm">{option}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 ml-auto transition-colors shrink-0" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderAnswer = () => {
        if (!currentCase) return null;

        return (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className={clsx(
                    "w-20 h-20 rounded-full flex items-center justify-center mb-4",
                    isCorrect ? "bg-emerald-500/20 border-2 border-emerald-500" : "bg-red-500/20 border-2 border-red-500"
                )}>
                    {isCorrect ? (
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                    ) : (
                        <XCircle className="w-10 h-10 text-red-400" />
                    )}
                </div>

                <h2 className={clsx("text-xl font-bold mb-2", isCorrect ? "text-emerald-400" : "text-red-400")}>
                    {isCorrect ? (betMode ? "🔥 DOBRADO!" : "Correto!") : "Incorreto"}
                </h2>

                {isCorrect && (
                    <div className="text-2xl font-bold text-yellow-400 mb-4">
                        +{results[results.length - 1]?.points || 0} pontos
                    </div>
                )}

                <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4 max-w-md mb-6 text-left">
                    <div className="text-sm text-slate-400 mb-1">Resposta correta:</div>
                    <div className="text-lg font-bold text-cyan-400 mb-3">{currentCase.correctDiagnosis}</div>
                    <p className="text-sm text-slate-300">{currentCase.explanation}</p>
                </div>

                <button
                    onClick={setupNextCase}
                    className="w-full max-w-md bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                    {currentCaseIndex + 1 < cases.length ? "Próximo Caso →" : "Ver Resultado"}
                </button>
            </div>
        );
    };

    const renderResult = () => {
        const correctCount = results.filter(r => r.correct).length;
        const percentage = Math.round((correctCount / results.length) * 100) || 0;

        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    <div className="text-center mb-6">
                        <div className={clsx(
                            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                            percentage >= 60 ? "bg-emerald-500/20 border-2 border-emerald-500" : "bg-yellow-500/20 border-2 border-yellow-500"
                        )}>
                            <Trophy className={clsx("w-10 h-10", percentage >= 60 ? "text-emerald-400" : "text-yellow-400")} />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-1">Quiz Finalizado!</h1>
                        <p className="text-slate-400">Tempo esgotado</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-cyan-400">{correctCount}/{results.length}</div>
                            <div className="text-xs text-slate-400">Acertos</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-yellow-400">{score}</div>
                            <div className="text-xs text-slate-400">Pontos</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-emerald-400">{percentage}%</div>
                            <div className="text-xs text-slate-400">Taxa</div>
                        </div>
                    </div>

                    {/* Results breakdown */}
                    <div className="space-y-2 mb-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase">Resumo</h3>
                        {results.map((r, i) => (
                            <div key={i} className={clsx(
                                "flex items-center gap-3 p-3 rounded-lg border",
                                r.correct ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
                            )}>
                                {r.correct ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                                )}
                                <span className="text-sm text-white flex-1 truncate">{r.case_.correctDiagnosis}</span>
                                <span className={clsx("text-sm font-bold", r.correct ? "text-emerald-400" : "text-red-400")}>
                                    +{r.points}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                    <button
                        onClick={startGame}
                        className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                        🔄 Jogar Novamente
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-slate-800 text-slate-300 font-bold py-3 rounded-xl border border-slate-700 hover:border-cyan-500/30 transition-colors"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            {gameState !== 'start' && gameState !== 'result' && (
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => {
                            if (timerRef.current) clearInterval(timerRef.current);
                            if (hintTimerRef.current) clearInterval(hintTimerRef.current);
                            navigate('/');
                        }}
                        className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/30 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <h2 className="font-bold text-white text-sm">Quiz Diagnóstico</h2>
                        <p className="text-xs text-slate-400">Adivinhe em 60 segundos</p>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-h-0">
                {gameState === 'start' && renderStart()}
                {gameState === 'playing' && renderPlaying()}
                {gameState === 'answer' && renderAnswer()}
                {gameState === 'result' && renderResult()}
            </div>

            {/* Custom Styles */}
            <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

            {/* Challenge Modal */}
            <ChallengeFriendModal
                isOpen={showChallengeModal}
                onClose={() => setShowChallengeModal(false)}
                gameType="quiz"
                onChallengeCreated={handleChallengeCreated}
            />
        </div>
    );
};
