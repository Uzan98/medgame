import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Heart,
    AlertTriangle,
    Zap,
    Clock,
    Users,
    Skull,
    Trophy,
    Coins
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';
import clsx from 'clsx';

// Mini-cases for the game
const miniCases = [
    { id: 1, specialty: 'Clínica', question: 'Paciente com febre há 3 dias e tosse produtiva. Conduta?', options: ['Antibiótico empírico', 'Apenas sintomáticos', 'TC de tórax urgente', 'Internação imediata'], correct: 0 },
    { id: 2, specialty: 'Cardio', question: 'ECG mostra supra de ST em V1-V4. Diagnóstico?', options: ['IAM inferior', 'IAM anterior', 'Pericardite', 'BRE'], correct: 1 },
    { id: 3, specialty: 'Neuro', question: 'Hemiparesia direita súbita há 2 horas. Prioridade?', options: ['TC de crânio urgente', 'RM de crânio', 'Punção lombar', 'Observar 24h'], correct: 0 },
    { id: 4, specialty: 'Pediatria', question: 'Criança 2 anos com estridor e tosse ladrante. Conduta?', options: ['Nebulização com adrenalina', 'Antibiótico IV', 'Intubação imediata', 'Alta com orientações'], correct: 0 },
    { id: 5, specialty: 'Clínica', question: 'Dor abdominal em FID, Blumberg +. Próximo passo?', options: ['USG abdome', 'Cirurgia de urgência', 'Colonoscopia', 'Observação'], correct: 1 },
    { id: 6, specialty: 'Cardio', question: 'PA 80x50, FC 120, B3 presente. Qual o choque?', options: ['Hipovolêmico', 'Cardiogênico', 'Séptico', 'Neurogênico'], correct: 1 },
    { id: 7, specialty: 'Neuro', question: 'Convulsão tônico-clônica há 5 min. Droga de escolha?', options: ['Fenitoína', 'Diazepam', 'Fenobarbital', 'Carbamazepina'], correct: 1 },
    { id: 8, specialty: 'Trauma', question: 'Trauma fechado, instável, FAST +. Conduta?', options: ['TC de abdome', 'Laparotomia exploradora', 'Observação', 'Lavado peritoneal'], correct: 1 },
    { id: 9, specialty: 'Clínica', question: 'Glicemia 45mg/dL, sudorese, confusão. Tratamento?', options: ['Insulina regular', 'Glicose hipertônica IV', 'Glucagon IM', 'Soro fisiológico'], correct: 1 },
    { id: 10, specialty: 'Cardio', question: 'Taquicardia de QRS largo estável. Primeira droga?', options: ['Adenosina', 'Amiodarona', 'Cardioversão', 'Atropina'], correct: 1 },
    { id: 11, specialty: 'Neuro', question: 'Glasgow 8, reflexo pupilar abolido unilateral. Causa provável?', options: ['AVC isquêmico', 'Herniação cerebral', 'Crise epiléptica', 'Intoxicação'], correct: 1 },
    { id: 12, specialty: 'Pediatria', question: 'RN com cianose central, sopro sistólico. Suspeita?', options: ['Cardiopatia congênita', 'Pneumonia', 'Sepse neonatal', 'Icterícia'], correct: 0 },
    { id: 13, specialty: 'Clínica', question: 'Dispneia súbita pós-cirúrgica, D-dímero alto. Suspeita?', options: ['Pneumonia', 'TEP', 'ICC descompensada', 'Pneumotórax'], correct: 1 },
    { id: 14, specialty: 'Trauma', question: 'Trauma torácico, MV abolido à esquerda, desvio de traqueia. Conduta?', options: ['Rx de tórax', 'Drenagem de tórax imediata', 'TC de tórax', 'Pericardiocentese'], correct: 1 },
    { id: 15, specialty: 'Neuro', question: 'Cefaleia súbita "a pior da vida", rigidez de nuca. Suspeita?', options: ['Enxaqueca', 'HSA', 'Meningite', 'Sinusite'], correct: 1 },
];

// Chaos events that can happen
const chaosEvents = [
    { id: 'ambulance', icon: '🚑', title: 'SAMU Chegando!', description: '+3 pacientes na fila!', effect: 'add_patients', value: 3 },
    { id: 'blackout', icon: '🔦', title: 'Queda de Luz!', description: 'Tela escurece por 5 segundos', effect: 'blackout', value: 5 },
    { id: 'crying', icon: '😭', title: 'Familiar Histérico!', description: 'Tempo reduzido por 10s', effect: 'time_pressure', value: 10 },
    { id: 'coffee', icon: '☕', title: 'Café Chegou!', description: 'Caos reduzido!', effect: 'reduce_chaos', value: 15 },
    { id: 'resident', icon: '👨‍⚕️', title: 'Residente Chegou!', description: 'Fila reduzida em 2!', effect: 'remove_patients', value: 2 },
    { id: 'vip', icon: '👔', title: 'Paciente VIP!', description: 'Próximo caso vale dobro', effect: 'double_points', value: 1 },
    { id: 'vereador', icon: '📹', title: 'Vereador Filmando!', description: '+20% de caos! "Olha essa situação!"', effect: 'add_chaos', value: 20 },
];

interface GameState {
    queue: typeof miniCases;
    currentCase: typeof miniCases[0] | null;
    selectedAnswer: number | null;
    showResult: boolean;
    isCorrect: boolean;
    chaos: number; // 0-100
    score: number;
    casesResolved: number;
    errors: number;
    gameOver: boolean;
    timeLeft: number;
    streak: number;
    doublePoints: boolean;
    isBlackout: boolean;
    activeEvent: typeof chaosEvents[0] | null;
    isPaused: boolean;
}

export const PlantaoInfinitoPage: React.FC = () => {
    const navigate = useNavigate();
    const { addCoins, addXP } = useGameStore();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const chaosRef = useRef<NodeJS.Timeout | null>(null);
    const eventRef = useRef<NodeJS.Timeout | null>(null);

    const [gameState, setGameState] = useState<GameState>({
        queue: [],
        currentCase: null,
        selectedAnswer: null,
        showResult: false,
        isCorrect: false,
        chaos: 0,
        score: 0,
        casesResolved: 0,
        errors: 0,
        gameOver: false,
        timeLeft: 30,
        streak: 0,
        doublePoints: false,
        isBlackout: false,
        activeEvent: null,
        isPaused: false
    });

    // Initialize game
    useEffect(() => {
        startGame();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (chaosRef.current) clearInterval(chaosRef.current);
            if (eventRef.current) clearTimeout(eventRef.current);
        };
    }, []);

    const startGame = () => {
        const shuffled = [...miniCases].sort(() => Math.random() - 0.5);
        const initialQueue = shuffled.slice(0, 5);
        const [first, ...rest] = initialQueue;

        setGameState({
            queue: rest,
            currentCase: first,
            selectedAnswer: null,
            showResult: false,
            isCorrect: false,
            chaos: 10,
            score: 0,
            casesResolved: 0,
            errors: 0,
            gameOver: false,
            timeLeft: 30,
            streak: 0,
            doublePoints: false,
            isBlackout: false,
            activeEvent: null,
            isPaused: false
        });

        // Start timers
        startTimers();
    };

    const startTimers = () => {
        // Question timer
        timerRef.current = setInterval(() => {
            setGameState(prev => {
                if (prev.isPaused || prev.gameOver || prev.showResult) return prev;

                const newTimeLeft = prev.timeLeft - 1;
                if (newTimeLeft <= 0) {
                    // Time out = wrong answer
                    return handleTimeout(prev);
                }
                return { ...prev, timeLeft: newTimeLeft };
            });
        }, 1000);

        // Chaos timer - increases over time
        chaosRef.current = setInterval(() => {
            setGameState(prev => {
                if (prev.isPaused || prev.gameOver) return prev;

                const chaosIncrease = 1 + (prev.queue.length * 0.5);
                const newChaos = Math.min(100, prev.chaos + chaosIncrease);

                if (newChaos >= 100) {
                    return { ...prev, chaos: 100, gameOver: true };
                }

                return { ...prev, chaos: newChaos };
            });
        }, 2000);

        // Random events
        scheduleNextEvent();
    };

    const scheduleNextEvent = () => {
        const delay = 15000 + Math.random() * 20000; // 15-35 seconds
        eventRef.current = setTimeout(() => {
            triggerRandomEvent();
            scheduleNextEvent();
        }, delay);
    };

    const triggerRandomEvent = () => {
        setGameState(prev => {
            if (prev.gameOver || prev.isPaused) return prev;

            const event = chaosEvents[Math.floor(Math.random() * chaosEvents.length)];
            let updates: Partial<GameState> = { activeEvent: event };

            switch (event.effect) {
                case 'add_patients':
                    const newPatients = [...miniCases]
                        .sort(() => Math.random() - 0.5)
                        .slice(0, event.value);
                    updates.queue = [...prev.queue, ...newPatients];
                    updates.chaos = Math.min(100, prev.chaos + 10);
                    break;
                case 'remove_patients':
                    updates.queue = prev.queue.slice(event.value);
                    break;
                case 'reduce_chaos':
                    updates.chaos = Math.max(0, prev.chaos - event.value);
                    break;
                case 'double_points':
                    updates.doublePoints = true;
                    break;
                case 'blackout':
                    updates.isBlackout = true;
                    setTimeout(() => {
                        setGameState(p => ({ ...p, isBlackout: false }));
                    }, event.value * 1000);
                    break;
                case 'add_chaos':
                    updates.chaos = Math.min(100, prev.chaos + event.value);
                    break;
            }

            // Clear event after 3 seconds
            setTimeout(() => {
                setGameState(p => ({ ...p, activeEvent: null }));
            }, 3000);

            return { ...prev, ...updates };
        });
    };

    const handleTimeout = (prev: GameState): GameState => {
        const newErrors = prev.errors + 1;
        const newChaos = Math.min(100, prev.chaos + 15);

        if (newChaos >= 100 || newErrors >= 5) {
            return { ...prev, gameOver: true, chaos: 100 };
        }

        return nextCase({
            ...prev,
            errors: newErrors,
            chaos: newChaos,
            streak: 0,
            showResult: true,
            isCorrect: false
        });
    };

    const handleSelectAnswer = (index: number) => {
        if (gameState.showResult || gameState.isBlackout) return;
        setGameState(prev => ({ ...prev, selectedAnswer: index }));
    };

    const handleConfirmAnswer = () => {
        if (gameState.selectedAnswer === null || !gameState.currentCase) return;

        const isCorrect = gameState.selectedAnswer === gameState.currentCase.correct;

        setGameState(prev => {
            let updates: Partial<GameState> = {
                showResult: true,
                isCorrect
            };

            if (isCorrect) {
                const timeBonus = Math.floor(prev.timeLeft / 5);
                const streakBonus = prev.streak * 5;
                let points = 100 + timeBonus + streakBonus;
                if (prev.doublePoints) {
                    points *= 2;
                    updates.doublePoints = false;
                }

                updates.score = prev.score + points;
                updates.casesResolved = prev.casesResolved + 1;
                updates.streak = prev.streak + 1;
                updates.chaos = Math.max(0, prev.chaos - (5 + prev.streak * 2));
            } else {
                updates.errors = prev.errors + 1;
                updates.chaos = Math.min(100, prev.chaos + 15);
                updates.streak = 0;

                if (prev.errors + 1 >= 5 || prev.chaos + 15 >= 100) {
                    updates.gameOver = true;
                    updates.chaos = 100;
                }
            }

            return { ...prev, ...updates };
        });
    };

    const handleNext = () => {
        setGameState(prev => nextCase(prev));
    };

    const nextCase = (prev: GameState): GameState => {
        if (prev.queue.length === 0) {
            // Refill queue
            const newQueue = [...miniCases].sort(() => Math.random() - 0.5).slice(0, 5);
            const [next, ...rest] = newQueue;
            return {
                ...prev,
                queue: rest,
                currentCase: next,
                selectedAnswer: null,
                showResult: false,
                timeLeft: Math.max(15, 30 - Math.floor(prev.casesResolved / 5))
            };
        }

        const [next, ...rest] = prev.queue;
        return {
            ...prev,
            queue: rest,
            currentCase: next,
            selectedAnswer: null,
            showResult: false,
            timeLeft: Math.max(15, 30 - Math.floor(prev.casesResolved / 5))
        };
    };

    const endGame = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (chaosRef.current) clearInterval(chaosRef.current);
        if (eventRef.current) clearTimeout(eventRef.current);

        const reward = Math.floor(gameState.score / 10);
        if (reward > 0) {
            addCoins(reward);
            addXP(reward);
            useToastStore.getState().addToast(`+${reward} MediCoins! 🏥`, 'success');
        }
    };

    // End game when game over
    useEffect(() => {
        if (gameState.gameOver) {
            endGame();
        }
    }, [gameState.gameOver]);

    // Get chaos color
    const getChaosColor = () => {
        if (gameState.chaos < 30) return 'from-emerald-500 to-green-500';
        if (gameState.chaos < 50) return 'from-yellow-500 to-amber-500';
        if (gameState.chaos < 70) return 'from-orange-500 to-red-500';
        return 'from-red-600 to-red-900';
    };

    const getChaosLabel = () => {
        if (gameState.chaos < 30) return 'Tranquilo';
        if (gameState.chaos < 50) return 'Movimentado';
        if (gameState.chaos < 70) return 'Agitado';
        if (gameState.chaos < 90) return 'CAOS!';
        return 'COLAPSO!';
    };

    // Game Over Screen
    if (gameState.gameOver) {
        const reward = Math.floor(gameState.score / 10);
        return (
            <div className="h-full flex items-center justify-center">
                <div className="max-w-md w-full bg-slate-800/50 border border-red-500/30 rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Skull className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">Plantão Encerrado!</h2>
                    <p className="text-slate-400 mb-6">O caos tomou conta do PS</p>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-900/50 rounded-xl p-3">
                            <p className="text-2xl font-bold text-cyan-400">{gameState.casesResolved}</p>
                            <p className="text-xs text-slate-500">Casos</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-3">
                            <p className="text-2xl font-bold text-yellow-400">{gameState.score}</p>
                            <p className="text-xs text-slate-500">Pontos</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-3">
                            <p className="text-2xl font-bold text-red-400">{gameState.errors}</p>
                            <p className="text-xs text-slate-500">Erros</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-center gap-2 text-xl font-bold text-yellow-400">
                            <Coins className="w-6 h-6" />
                            +{reward} MediCoins
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/games')}
                            className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-xl"
                        >
                            Sair
                        </button>
                        <button
                            onClick={startGame}
                            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-xl"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx(
            'h-full flex flex-col overflow-hidden transition-all duration-500',
            gameState.isBlackout && 'brightness-[0.1]'
        )}>
            {/* Chaos Event Notification */}
            {gameState.activeEvent && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-slate-800 border border-yellow-500/50 rounded-xl px-6 py-3 flex items-center gap-3 shadow-lg shadow-yellow-500/20">
                        <span className="text-3xl">{gameState.activeEvent.icon}</span>
                        <div>
                            <p className="font-bold text-yellow-400">{gameState.activeEvent.title}</p>
                            <p className="text-sm text-slate-300">{gameState.activeEvent.description}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Chaos Meter */}
            <div className="mb-3 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={() => navigate('/games')}
                        className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="font-bold text-white">{gameState.score}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                            <Heart className="w-4 h-4 text-red-400" />
                            <span className="font-bold text-white">{5 - gameState.errors}/5</span>
                        </div>
                    </div>
                </div>

                {/* Chaos Bar */}
                <div className="relative">
                    <div className="h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div
                            className={clsx('h-full transition-all duration-500 bg-gradient-to-r', getChaosColor())}
                            style={{ width: `${gameState.chaos}%` }}
                        />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                        <span className="text-xs font-bold text-white drop-shadow-lg flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {getChaosLabel()}
                        </span>
                        <span className="text-xs font-bold text-white drop-shadow-lg">{Math.round(gameState.chaos)}%</span>
                    </div>
                </div>
            </div>

            {/* Patient Queue Visualization */}
            <div className="mb-3 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400">Fila de espera: {gameState.queue.length} pacientes</span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1">
                    {gameState.queue.slice(0, 10).map((_, i) => (
                        <div
                            key={i}
                            className={clsx(
                                'w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 animate-pulse',
                                i < 3 ? 'bg-red-500/30' : i < 6 ? 'bg-yellow-500/20' : 'bg-slate-700/50'
                            )}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            🧑‍🦽
                        </div>
                    ))}
                    {gameState.queue.length > 10 && (
                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-xs text-slate-400 shrink-0">
                            +{gameState.queue.length - 10}
                        </div>
                    )}
                </div>
            </div>

            {/* Timer */}
            <div className="mb-3 shrink-0">
                <div className="flex items-center gap-2">
                    <Clock className={clsx('w-4 h-4', gameState.timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-slate-400')} />
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={clsx(
                                'h-full transition-all duration-1000',
                                gameState.timeLeft <= 10 ? 'bg-red-500' : gameState.timeLeft <= 20 ? 'bg-yellow-500' : 'bg-cyan-500'
                            )}
                            style={{ width: `${(gameState.timeLeft / 30) * 100}%` }}
                        />
                    </div>
                    <span className={clsx(
                        'text-sm font-bold w-8',
                        gameState.timeLeft <= 10 ? 'text-red-400' : 'text-slate-400'
                    )}>
                        {gameState.timeLeft}s
                    </span>
                </div>
            </div>

            {/* Current Case */}
            {gameState.currentCase && (
                <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={clsx(
                                'px-2 py-0.5 rounded text-xs font-bold',
                                gameState.currentCase.specialty === 'Cardio' ? 'bg-red-500/20 text-red-400' :
                                    gameState.currentCase.specialty === 'Neuro' ? 'bg-purple-500/20 text-purple-400' :
                                        gameState.currentCase.specialty === 'Pediatria' ? 'bg-pink-500/20 text-pink-400' :
                                            gameState.currentCase.specialty === 'Trauma' ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-cyan-500/20 text-cyan-400'
                            )}>
                                {gameState.currentCase.specialty}
                            </span>
                            {gameState.streak >= 3 && (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> Streak x{gameState.streak}
                                </span>
                            )}
                            {gameState.doublePoints && (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400">
                                    2x Pontos!
                                </span>
                            )}
                        </div>
                        <p className="text-white font-medium text-sm">{gameState.currentCase.question}</p>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-2">
                        {gameState.currentCase.options.map((option, index) => {
                            const isSelected = gameState.selectedAnswer === index;
                            const isCorrect = index === gameState.currentCase!.correct;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleSelectAnswer(index)}
                                    disabled={gameState.showResult}
                                    className={clsx(
                                        'w-full text-left p-3 rounded-xl border-2 transition-all text-sm',
                                        gameState.showResult
                                            ? isCorrect
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                                : isSelected
                                                    ? 'bg-red-500/20 border-red-500 text-red-300'
                                                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                                            : isSelected
                                                ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span>{option}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Action Button */}
            <div className="mt-3 shrink-0">
                {!gameState.showResult ? (
                    <button
                        onClick={handleConfirmAnswer}
                        disabled={gameState.selectedAnswer === null}
                        className={clsx(
                            'w-full py-3 rounded-xl font-bold transition-all',
                            gameState.selectedAnswer !== null
                                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        )}
                    >
                        Confirmar
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className={clsx(
                            'w-full py-3 rounded-xl font-bold',
                            gameState.isCorrect
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                                : 'bg-red-500 text-white'
                        )}
                    >
                        Próximo Paciente →
                    </button>
                )}
            </div>
        </div>
    );
};
