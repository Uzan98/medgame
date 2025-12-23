import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Trophy,
    Clock,
    CheckCircle,
    XCircle,
    Zap,
    Crown,
    Heart,
    Swords,
    Users
} from 'lucide-react';
import { SpinningWheel } from '../components/trivia/SpinningWheel';
import {
    TriviaCategory,
    TriviaGameState,
    TRIVIA_CATEGORIES
} from '../lib/triviaTypes';
import { useGameStore } from '../store/gameStore';
import { useTriviaStore } from '../store/triviaStore';
import { casinoSounds } from '../lib/casinoSounds';
import { triggerCoinReward } from '../components/CoinRewardAnimation';
import { ChallengeFriendModal } from '../components/challenges/ChallengeFriendModal';
import { useGameChallengeStore } from '../store/gameChallengeStore';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

const QUESTION_TIME = 15; // seconds per question
const CROWNS_TO_WIN = 6;
const CORRECT_FOR_CROWN = 3;

export const MedTriviaPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { addCoins, addXP } = useGameStore();
    const { questions, fetchQuestions } = useTriviaStore();
    const { submitScore, fetchMyChallenges } = useGameChallengeStore();

    // Challenge mode state
    const challengeId = searchParams.get('challenge');
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

    const [gameState, setGameState] = useState<TriviaGameState>({
        phase: 'idle',
        currentCategory: null,
        currentQuestion: null,
        selectedAnswer: null,
        isCorrect: null,
        crowns: {},
        progress: {},
        streak: 0,
        totalCorrect: 0,
        totalWrong: 0,
        timeLeft: QUESTION_TIME
    });

    // Fetch questions and challenges from Supabase on mount
    useEffect(() => {
        fetchQuestions();
        if (user?.id) {
            fetchMyChallenges(user.id, 'trivia');
        }
    }, [fetchQuestions, user?.id]);

    // Handle challenge mode from URL
    useEffect(() => {
        if (challengeId) {
            setActiveChallengeId(challengeId);
        }
    }, [challengeId]);

    // Timer effect
    useEffect(() => {
        if (gameState.phase !== 'question' || gameState.timeLeft <= 0) return;

        const timer = setInterval(() => {
            setGameState(prev => {
                if (prev.timeLeft <= 1) {
                    // Time's up - wrong answer
                    return handleAnswer(-1, prev);
                }
                // Play time warning sound at 5 seconds
                if (prev.timeLeft === 6) {
                    casinoSounds.timeWarning();
                }
                return { ...prev, timeLeft: prev.timeLeft - 1 };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState.phase, gameState.timeLeft]);

    // Handle answer (internal)
    const handleAnswer = (answerIndex: number, prev: TriviaGameState): TriviaGameState => {
        if (!prev.currentQuestion || !prev.currentCategory) return prev;

        const isCorrect = answerIndex === prev.currentQuestion.correctIndex;
        const categoryId = prev.currentCategory.id;

        let newProgress = { ...prev.progress };
        let newCrowns = { ...prev.crowns };
        let newStreak = prev.streak;

        if (isCorrect) {
            newProgress[categoryId] = (newProgress[categoryId] || 0) + 1;
            newStreak = prev.streak + 1;

            // Check if earned crown
            if (newProgress[categoryId] >= CORRECT_FOR_CROWN) {
                newCrowns[categoryId] = true;
                newProgress[categoryId] = 0;
            }
        } else {
            newStreak = 0;
            // Reset progress on wrong answer
            newProgress[categoryId] = 0;
        }

        // Check for victory
        const crownsCount = Object.values(newCrowns).filter(Boolean).length;
        const phase = crownsCount >= CROWNS_TO_WIN ? 'victory' : 'result';

        return {
            ...prev,
            phase,
            selectedAnswer: answerIndex,
            isCorrect,
            crowns: newCrowns,
            progress: newProgress,
            streak: newStreak,
            totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
            totalWrong: prev.totalWrong + (isCorrect ? 0 : 1)
        };
    };

    // User clicks an answer
    const selectAnswer = (index: number) => {
        if (gameState.phase !== 'question' || gameState.selectedAnswer !== null) return;

        const newState = handleAnswer(index, {
            ...gameState
        } as TriviaGameState);

        // Play sound based on result
        if (newState.isCorrect) {
            // Check if crown was earned
            const prevCrowns = Object.values(gameState.crowns).filter(Boolean).length;
            const newCrowns = Object.values(newState.crowns).filter(Boolean).length;
            if (newCrowns > prevCrowns) {
                casinoSounds.crownEarned();
            } else {
                casinoSounds.correct();
            }
        } else {
            casinoSounds.wrong();
        }

        // Check for victory/defeat sounds
        if (newState.phase === 'victory') {
            setTimeout(() => casinoSounds.victory(), 300);
        }

        setGameState(newState);
    };

    // Spin completed
    const handleSpinEnd = useCallback((category: TriviaCategory) => {
        // Get random question from category
        const categoryQuestions = questions.filter(q => q.categoryId === category.id);
        const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];

        setGameState(prev => ({
            ...prev,
            phase: 'question',
            currentCategory: category,
            currentQuestion: randomQuestion || null,
            selectedAnswer: null,
            isCorrect: null,
            timeLeft: QUESTION_TIME
        }));
    }, [questions]);

    // Start spinning
    const handleSpin = () => {
        setGameState(prev => ({ ...prev, phase: 'spinning' }));
    };

    // Continue after result
    const handleContinue = () => {
        // Check for defeat (too many wrong answers)
        if (gameState.totalWrong >= 3) {
            casinoSounds.defeat();
            setGameState(prev => ({ ...prev, phase: 'defeat' }));
            return;
        }

        setGameState(prev => ({
            ...prev,
            phase: 'idle',
            currentCategory: null,
            currentQuestion: null,
            selectedAnswer: null,
            isCorrect: null
        }));
    };

    // Reset game
    const resetGame = () => {
        setGameState({
            phase: 'idle',
            currentCategory: null,
            currentQuestion: null,
            selectedAnswer: null,
            isCorrect: null,
            crowns: {},
            progress: {},
            streak: 0,
            totalCorrect: 0,
            totalWrong: 0,
            timeLeft: QUESTION_TIME
        });
    };

    // End game and give rewards
    const endGameWithRewards = async (isVictory: boolean) => {
        const crownsCount = Object.values(gameState.crowns).filter(Boolean).length;
        const baseReward = isVictory ? 500 : crownsCount * 50;
        const streakBonus = gameState.streak * 10;
        const total = baseReward + streakBonus;

        addCoins(total);
        addXP(Math.floor(total / 2));

        // Trigger animated coin reward
        triggerCoinReward(total);

        // If in challenge mode, submit score using universal store
        if (activeChallengeId && user?.id) {
            await submitScore(activeChallengeId, user.id, {
                score: gameState.totalCorrect,
                crowns: crownsCount
            });
            // Refresh challenges
            fetchMyChallenges(user.id, 'trivia');
        }
    };

    // Handle challenge created - start playing immediately as challenger
    const handleChallengeCreated = (newChallengeId: string) => {
        setShowChallengeModal(false);
        setActiveChallengeId(newChallengeId);
    };

    // Victory screen
    if (gameState.phase === 'victory') {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30"
                    >
                        <Crown className="w-12 h-12 text-white" />
                    </motion.div>

                    <h2 className="text-3xl font-black text-white mb-2">VITÓRIA!</h2>
                    <p className="text-yellow-400 mb-6">Você conquistou todas as coroas!</p>

                    <div className="flex justify-center gap-2 mb-6">
                        {TRIVIA_CATEGORIES.map((cat, i) => (
                            <motion.div
                                key={cat.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                                style={{ backgroundColor: `${['#ef4444', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#f97316'][i]}40` }}
                            >
                                👑
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-800/50 rounded-xl p-3">
                            <p className="text-2xl font-bold text-emerald-400">{gameState.totalCorrect}</p>
                            <p className="text-xs text-slate-400">Acertos</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-3">
                            <p className="text-2xl font-bold text-yellow-400">500</p>
                            <p className="text-xs text-slate-400">MediCoins</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => { endGameWithRewards(true); navigate('/games'); }}
                            className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-xl"
                        >
                            Sair
                        </button>
                        <button
                            onClick={() => { endGameWithRewards(true); resetGame(); }}
                            className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-xl"
                        >
                            Jogar Novamente
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Defeat screen
    if (gameState.phase === 'defeat') {
        const crownsCount = Object.values(gameState.crowns).filter(Boolean).length;

        return (
            <div className="h-full flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-slate-800/50 border border-red-500/30 rounded-2xl p-6 text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">Fim de Jogo</h2>
                    <p className="text-slate-400 mb-6">Você errou 3 perguntas</p>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-900/50 rounded-xl p-3">
                            <p className="text-2xl font-bold text-yellow-400">{crownsCount}</p>
                            <p className="text-xs text-slate-400">Coroas</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-3">
                            <p className="text-2xl font-bold text-emerald-400">{gameState.totalCorrect}</p>
                            <p className="text-xs text-slate-400">Acertos</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-3">
                            <p className="text-2xl font-bold text-cyan-400">{crownsCount * 50}</p>
                            <p className="text-xs text-slate-400">Coins</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => { endGameWithRewards(false); navigate('/games'); }}
                            className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-xl"
                        >
                            Sair
                        </button>
                        <button
                            onClick={() => { endGameWithRewards(false); resetGame(); }}
                            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-xl"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Question screen
    if (gameState.phase === 'question' || gameState.phase === 'result') {
        const { currentQuestion, currentCategory, selectedAnswer, isCorrect, timeLeft } = gameState;

        // Get category color for glow effects
        const categoryColors: Record<string, string> = {
            clinica: '#ef4444',
            cirurgia: '#3b82f6',
            pediatria: '#10b981',
            go: '#eab308',
            neuro: '#a855f7',
            coletiva: '#f97316'
        };
        const categoryColor = categoryColors[currentCategory?.id || 'clinica'] || '#06b6d4';

        return (
            <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
                <div className="min-h-full flex flex-col p-3">
                    {/* Header - gamer style */}
                    <div className="flex items-center justify-between mb-3 shrink-0">
                        <button
                            onClick={() => navigate('/games')}
                            className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-slate-400 border border-slate-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="px-4 py-1.5 rounded-lg flex items-center gap-2 shadow-lg"
                            style={{
                                background: `linear-gradient(135deg, ${categoryColor}40, ${categoryColor}20)`,
                                boxShadow: `0 0 20px ${categoryColor}30`,
                                border: `1px solid ${categoryColor}50`
                            }}
                        >
                            <span className="font-bold text-white text-sm">{currentCategory?.name}</span>
                        </motion.div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="font-black text-yellow-400">{gameState.streak}</span>
                        </div>
                    </div>

                    {/* Timer - animated glow bar */}
                    <div className="mb-3 shrink-0">
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
                                className={clsx(
                                    'h-full rounded-full transition-all',
                                    timeLeft <= 5
                                        ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                                        : timeLeft <= 10
                                            ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.5)]'
                                            : 'bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                                )}
                            />
                        </div>
                        <motion.div
                            animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
                            transition={{ repeat: timeLeft <= 5 ? Infinity : 0, duration: 0.5 }}
                            className="flex items-center justify-center gap-1 mt-1"
                        >
                            <Clock className={clsx('w-4 h-4', timeLeft <= 5 ? 'text-red-400' : 'text-slate-500')} />
                            <span className={clsx('text-sm font-black', timeLeft <= 5 ? 'text-red-400' : 'text-slate-500')}>
                                {timeLeft}s
                            </span>
                        </motion.div>
                    </div>

                    {/* Progress crowns - gamer badges */}
                    <div className="flex justify-center gap-1 mb-3 shrink-0">
                        {TRIVIA_CATEGORIES.map((cat, idx) => {
                            const hasCrown = gameState.crowns[cat.id];
                            const progress = gameState.progress[cat.id] || 0;
                            const colors = ['#ef4444', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#f97316'];

                            return (
                                <motion.div
                                    key={cat.id}
                                    whileHover={{ scale: 1.1 }}
                                    className={clsx(
                                        'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all',
                                        hasCrown ? 'shadow-lg' : ''
                                    )}
                                    style={{
                                        background: hasCrown
                                            ? `linear-gradient(135deg, ${colors[idx]}60, ${colors[idx]}30)`
                                            : 'rgba(30,41,59,0.8)',
                                        border: `2px solid ${colors[idx]}`,
                                        boxShadow: hasCrown ? `0 0 15px ${colors[idx]}40` : 'none'
                                    }}
                                >
                                    {hasCrown ? (
                                        <Crown className="w-4 h-4 text-yellow-400" />
                                    ) : (
                                        <span style={{ color: colors[idx] }}>{progress}</span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Question card - glassmorphism */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="relative mb-3 shrink-0"
                    >
                        <div
                            className="absolute inset-0 rounded-2xl blur-xl opacity-30"
                            style={{ background: `linear-gradient(135deg, ${categoryColor}, transparent)` }}
                        />
                        <div className="relative bg-slate-800/70 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-4 shadow-xl">
                            <p className="text-white text-base font-semibold text-center leading-relaxed">
                                {currentQuestion?.question}
                            </p>
                        </div>
                    </motion.div>

                    {/* Options - game buttons */}
                    <div className="flex-1 flex flex-col gap-2">
                        {currentQuestion?.options.map((option, index) => {
                            const showResult = gameState.phase === 'result';
                            const isSelected = selectedAnswer === index;
                            const isCorrectOption = index === currentQuestion.correctIndex;
                            const letters = ['A', 'B', 'C', 'D'];

                            return (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.08, type: 'spring', stiffness: 300 }}
                                    whileHover={!showResult ? { scale: 1.02, x: 5 } : {}}
                                    whileTap={!showResult ? { scale: 0.98 } : {}}
                                    onClick={() => selectAnswer(index)}
                                    disabled={gameState.phase === 'result'}
                                    className={clsx(
                                        'w-full p-3 rounded-xl text-left font-medium transition-all relative overflow-hidden',
                                        showResult
                                            ? isCorrectOption
                                                ? 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                                : isSelected
                                                    ? 'bg-gradient-to-r from-red-600/30 to-red-500/20 border-2 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                                    : 'bg-slate-800/50 border-2 border-slate-700/50 opacity-50'
                                            : isSelected
                                                ? 'bg-gradient-to-r from-cyan-600/30 to-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                                : 'bg-slate-800/60 border-2 border-slate-600/50 hover:border-slate-500 hover:bg-slate-700/60'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={clsx(
                                            'w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0',
                                            showResult && isCorrectOption
                                                ? 'bg-emerald-500 text-white'
                                                : showResult && isSelected
                                                    ? 'bg-red-500 text-white'
                                                    : isSelected
                                                        ? 'bg-cyan-500 text-white'
                                                        : 'bg-slate-700 text-slate-300'
                                        )}>
                                            {showResult && isCorrectOption ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : showResult && isSelected ? (
                                                <XCircle className="w-5 h-5" />
                                            ) : (
                                                letters[index]
                                            )}
                                        </span>
                                        <span className={clsx(
                                            'text-sm',
                                            showResult && isCorrectOption ? 'text-emerald-300' :
                                                showResult && isSelected ? 'text-red-300' :
                                                    isSelected ? 'text-cyan-300' : 'text-white'
                                        )}>{option}</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Result feedback - victory/defeat animation */}
                    <AnimatePresence>
                        {gameState.phase === 'result' && (
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                                className="mt-3 shrink-0"
                            >
                                <div className={clsx(
                                    'p-4 rounded-xl text-center relative overflow-hidden',
                                    isCorrect
                                        ? 'bg-gradient-to-br from-emerald-600/30 to-emerald-500/10 border-2 border-emerald-500/50'
                                        : 'bg-gradient-to-br from-red-600/30 to-red-500/10 border-2 border-red-500/50'
                                )}>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', delay: 0.1 }}
                                    >
                                        {isCorrect ? (
                                            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                                        ) : (
                                            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                                        )}
                                    </motion.div>
                                    <p className={clsx('font-black text-xl', isCorrect ? 'text-emerald-400' : 'text-red-400')}>
                                        {isCorrect ? 'CORRETO!' : 'ERRADO!'}
                                    </p>
                                    {currentQuestion?.explanation && (
                                        <p className="text-xs text-slate-400 mt-2">{currentQuestion.explanation}</p>
                                    )}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleContinue}
                                    className={clsx(
                                        'w-full mt-3 py-3 rounded-xl font-black text-white uppercase tracking-wide shadow-lg',
                                        isCorrect
                                            ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 shadow-emerald-500/30'
                                            : 'bg-gradient-to-r from-red-600 to-orange-600 shadow-red-500/30'
                                    )}
                                >
                                    Continuar
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // Idle state - show wheel
    return (
        <div className="h-full overflow-y-auto relative bg-[#1e1b4b]">
            {/* Deep Purple Radial Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#581c87_0%,_#1e1b4b_70%)]" />

            {/* Ambient Glows */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#4c1d95_0%,_transparent_40%)] opacity-40" />
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,_#3b82f6_0%,_transparent_40%)] opacity-20" />

            <div className="min-h-full flex flex-col p-4 relative z-10 gap-4">
                {/* Header Card */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center justify-between shadow-xl">
                    <button
                        onClick={() => navigate('/games')}
                        className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-slate-400 border border-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-sm">
                        MEDTRIVIA
                    </h1>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 rounded-xl border border-yellow-500/20 shadow-inner">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-yellow-500">
                            {Object.values(gameState.crowns).filter(Boolean).length}/{CROWNS_TO_WIN}
                        </span>
                    </div>
                </div>

                {/* Main Game Area */}
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    {/* Wheel Section */}
                    <div className="relative">
                        {/* Glow behind wheel */}
                        <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full" />

                        <SpinningWheel
                            onSpinEnd={handleSpinEnd}
                            isSpinning={gameState.phase === 'spinning'}
                            onSpin={handleSpin}
                            crowns={gameState.crowns}
                            progress={gameState.progress}
                        />
                    </div>

                    {/* Challenge Buttons */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => setShowChallengeModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl text-sm hover:scale-105 transition-transform shadow-lg shadow-purple-500/30"
                        >
                            <Swords className="w-4 h-4" />
                            Desafiar Amigo
                        </button>
                        <button
                            onClick={() => navigate('/games/trivia/challenges')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 border border-purple-500/30 text-purple-400 font-medium rounded-xl text-sm hover:bg-slate-700 transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            Ver Desafios
                        </button>
                    </div>
                </div>

                {/* Footer Stats / Lives Card */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vidas</div>
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ scale: gameState.totalWrong > i ? 0.9 : 1 }}
                                    className={clsx(
                                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                                        gameState.totalWrong > i
                                            ? 'bg-slate-800/50 grayscale opacity-50'
                                            : 'bg-gradient-to-b from-red-500 to-red-600 shadow-lg shadow-red-500/20 border-t border-red-400'
                                    )}
                                >
                                    <Heart className={clsx("w-4 h-4 fill-white", gameState.totalWrong > i ? "text-slate-500" : "text-white")} />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Objetivo</p>
                        <p className="text-xs text-slate-300 font-medium">
                            Conquiste <span className="text-yellow-400 font-bold">6 coroas</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Challenge Friend Modal */}
            <ChallengeFriendModal
                isOpen={showChallengeModal}
                onClose={() => setShowChallengeModal(false)}
                gameType="trivia"
                onChallengeCreated={handleChallengeCreated}
            />
        </div>
    );
};
