import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Heart,
    AlertTriangle,
    Zap,
    Clock,
    Users,
    Skull,
    Trophy,
    Coins,
    Loader2,
    Target,
    Timer,
    Shield,
    Coffee,
    Star,
    Eye,
    User,
    UserPlus,
    Ambulance
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';
import { loadPlantaoCases, loadPlantaoEvents, PlantaoEvent } from '../lib/plantaoSync';
import clsx from 'clsx';

// Sample mini-cases (fallback if database empty)
const sampleCases = [
    { id: '1', specialty: 'Clínica', question: 'Paciente com febre há 3 dias e tosse produtiva. Conduta?', options: ['Antibiótico empírico', 'Apenas sintomáticos', 'TC de tórax urgente', 'Internação imediata'], correct_index: 0 },
    { id: '2', specialty: 'Cardio', question: 'ECG mostra supra de ST em V1-V4. Diagnóstico?', options: ['IAM inferior', 'IAM anterior', 'Pericardite', 'BRE'], correct_index: 1 },
    { id: '3', specialty: 'Neuro', question: 'Hemiparesia direita súbita há 2 horas. Prioridade?', options: ['TC de crânio urgente', 'RM de crânio', 'Punção lombar', 'Observar 24h'], correct_index: 0 },
    { id: '4', specialty: 'Pediatria', question: 'Criança 2 anos com estridor e tosse ladrante. Conduta?', options: ['Nebulização com adrenalina', 'Antibiótico IV', 'Intubação imediata', 'Alta com orientações'], correct_index: 0 },
    { id: '5', specialty: 'Clínica', question: 'Dor abdominal em FID, Blumberg +. Próximo passo?', options: ['USG abdome', 'Cirurgia de urgência', 'Colonoscopia', 'Observação'], correct_index: 1 },
    { id: '6', specialty: 'Cardio', question: 'PA 80x50, FC 120, B3 presente. Qual o choque?', options: ['Hipovolêmico', 'Cardiogênico', 'Séptico', 'Neurogênico'], correct_index: 1 },
    { id: '7', specialty: 'Neuro', question: 'Convulsão tônico-clônica há 5 min. Droga de escolha?', options: ['Fenitoína', 'Diazepam', 'Fenobarbital', 'Carbamazepina'], correct_index: 1 },
    { id: '8', specialty: 'Trauma', question: 'Trauma fechado, instável, FAST +. Conduta?', options: ['TC de abdome', 'Laparotomia exploradora', 'Observação', 'Lavado peritoneal'], correct_index: 1 },
];

// Sample events (fallback if database empty)
const sampleEvents: PlantaoEvent[] = [
    { id: 'ambulance', icon: '🚑', title: 'SAMU Chegando!', description: '+3 pacientes na fila!', effect: 'add_patients', value: 3 },
    { id: 'blackout', icon: '🔦', title: 'Queda de Luz!', description: 'Tela escurece por 5 segundos', effect: 'blackout', value: 5 },
    { id: 'coffee', icon: '☕', title: 'Café Chegou!', description: 'Caos reduzido!', effect: 'reduce_chaos', value: 15 },
    { id: 'resident', icon: '👨‍⚕️', title: 'Residente Chegou!', description: 'Fila reduzida em 2!', effect: 'remove_patients', value: 2 },
    { id: 'vip', icon: '👔', title: 'Paciente VIP!', description: 'Próximo caso vale dobro', effect: 'double_points', value: 1 },
    { id: 'vereador', icon: '📹', title: 'Vereador Filmando!', description: '+20% de caos!', effect: 'add_chaos', value: 20 },
];

// Card definitions
interface PowerCard {
    id: string;
    icon: React.ReactNode;
    emoji: string;
    title: string;
    description: string;
    effect: 'eliminate' | 'extra_time' | 'calm' | 'streak_shield' | 'coffee' | 'resident' | 'double_points' | 'xray';
    duration: number; // number of cases or -1 for instant
    rarity: 'common' | 'rare' | 'epic';
}

const POWER_CARDS: PowerCard[] = [
    { id: 'eliminate', emoji: '🎯', icon: <Target className="w-6 h-6" />, title: 'Eliminação', description: 'Remove 1 alternativa errada', effect: 'eliminate', duration: 3, rarity: 'common' },
    { id: 'extra_time', emoji: '⏰', icon: <Timer className="w-6 h-6" />, title: 'Tempo Extra', description: '+10s por caso', effect: 'extra_time', duration: 3, rarity: 'common' },
    { id: 'calm', emoji: '😌', icon: <Coffee className="w-6 h-6" />, title: 'Calma', description: 'Chaos não aumenta', effect: 'calm', duration: 5, rarity: 'rare' },
    { id: 'streak_shield', emoji: '🛡️', icon: <Shield className="w-6 h-6" />, title: 'Streak Shield', description: 'Mantém streak em 1 erro', effect: 'streak_shield', duration: 1, rarity: 'rare' },
    { id: 'coffee', emoji: '☕', icon: <Coffee className="w-6 h-6" />, title: 'Café Duplo', description: '-20 chaos agora', effect: 'coffee', duration: -1, rarity: 'common' },
    { id: 'resident', emoji: '👨‍⚕️', icon: <Users className="w-6 h-6" />, title: 'Residência', description: '-2 pacientes na fila', effect: 'resident', duration: -1, rarity: 'common' },
    { id: 'double_points', emoji: '⭐', icon: <Star className="w-6 h-6" />, title: 'Pontos Dobro', description: '2x pontos', effect: 'double_points', duration: 3, rarity: 'epic' },
    { id: 'xray', emoji: '👁️', icon: <Eye className="w-6 h-6" />, title: 'Visão Raio-X', description: 'Destaca resposta certa', effect: 'xray', duration: 1, rarity: 'epic' },
];

interface ActiveCard {
    card: PowerCard;
    remaining: number;
}

interface MiniCase {
    id: string;
    specialty: string;
    question: string;
    options: string[];
    correct_index: number;
}

interface GameState {
    queue: MiniCase[];
    currentCase: MiniCase | null;
    selectedAnswer: number | null;
    showResult: boolean;
    isCorrect: boolean;
    chaos: number;
    score: number;
    casesResolved: number;
    errors: number;
    gameOver: boolean;
    timeLeft: number;
    streak: number;
    doublePoints: boolean;
    isBlackout: boolean;
    activeEvent: PlantaoEvent | null;
    isPaused: boolean;
    // Wave system
    currentWave: number;
    casesInWave: number;
    showCardSelection: boolean;
    cardOptions: PowerCard[];
    activeCards: ActiveCard[];
    eliminatedOption: number | null;
    showXrayHint: boolean;
}

// Wave difficulty settings
const getWaveSettings = (wave: number) => {
    if (wave <= 3) return { timer: 30, chaosRate: 1.0, points: 100 };
    if (wave <= 6) return { timer: 25, chaosRate: 1.5, points: 150 };
    if (wave <= 9) return { timer: 20, chaosRate: 2.0, points: 200 };
    return { timer: 15, chaosRate: 2.5, points: 300 };
};

export const PlantaoInfinitoPage: React.FC = () => {
    const navigate = useNavigate();
    const { addCoins, addXP } = useGameStore();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const chaosRef = useRef<NodeJS.Timeout | null>(null);
    const eventRef = useRef<NodeJS.Timeout | null>(null);

    const [loading, setLoading] = useState(true);
    const [allCases, setAllCases] = useState<MiniCase[]>([]);
    const [allEvents, setAllEvents] = useState<PlantaoEvent[]>([]);
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
        isPaused: false,
        currentWave: 1,
        casesInWave: 0,
        showCardSelection: false,
        cardOptions: [],
        activeCards: [],
        eliminatedOption: null,
        showXrayHint: false
    });

    // Load data and initialize game
    useEffect(() => {
        const loadData = async () => {
            const [dbCases, dbEvents] = await Promise.all([
                loadPlantaoCases(),
                loadPlantaoEvents()
            ]);

            const cases = dbCases.length > 0 ? dbCases : sampleCases;
            const events = dbEvents.length > 0 ? dbEvents : sampleEvents;

            setAllCases(cases);
            setAllEvents(events);
            setLoading(false);
        };

        loadData();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (chaosRef.current) clearInterval(chaosRef.current);
            if (eventRef.current) clearTimeout(eventRef.current);
        };
    }, []);

    // Start game when data is loaded
    useEffect(() => {
        if (!loading && allCases.length > 0) {
            startGame();
        }
    }, [loading, allCases]);

    const startGame = () => {
        const shuffled = [...allCases].sort(() => Math.random() - 0.5);
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
            isPaused: false,
            currentWave: 1,
            casesInWave: 0,
            showCardSelection: false,
            cardOptions: [],
            activeCards: [],
            eliminatedOption: null,
            showXrayHint: false
        });

        startTimers();
    };

    const startTimers = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (chaosRef.current) clearInterval(chaosRef.current);

        timerRef.current = setInterval(() => {
            setGameState(prev => {
                if (prev.isPaused || prev.gameOver || prev.showResult || prev.showCardSelection) return prev;

                const newTimeLeft = prev.timeLeft - 1;
                if (newTimeLeft <= 0) {
                    return handleTimeout(prev);
                }
                return { ...prev, timeLeft: newTimeLeft };
            });
        }, 1000);

        chaosRef.current = setInterval(() => {
            setGameState(prev => {
                if (prev.isPaused || prev.gameOver || prev.showCardSelection) return prev;

                // Check for calm card
                const hasCalmCard = prev.activeCards.some(ac => ac.card.effect === 'calm');
                if (hasCalmCard) return prev;

                const settings = getWaveSettings(prev.currentWave);
                const chaosIncrease = settings.chaosRate + (prev.queue.length * 0.3);
                const newChaos = Math.min(100, prev.chaos + chaosIncrease);

                if (newChaos >= 100) {
                    return { ...prev, chaos: 100, gameOver: true };
                }

                return { ...prev, chaos: newChaos };
            });
        }, 2000);

        scheduleNextEvent();
    };

    const scheduleNextEvent = () => {
        const delay = 15000 + Math.random() * 20000;
        eventRef.current = setTimeout(() => {
            triggerRandomEvent();
            scheduleNextEvent();
        }, delay);
    };

    const triggerRandomEvent = () => {
        setGameState(prev => {
            if (prev.gameOver || prev.isPaused || prev.showCardSelection) return prev;

            const event = allEvents[Math.floor(Math.random() * allEvents.length)];
            if (!event) return prev;
            let updates: Partial<GameState> = { activeEvent: event };

            switch (event.effect) {
                case 'add_patients':
                    const newPatients = [...allCases]
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
        if (gameState.showResult || gameState.isBlackout || index === gameState.eliminatedOption) return;
        setGameState(prev => ({ ...prev, selectedAnswer: index }));
    };

    const handleConfirmAnswer = () => {
        if (gameState.selectedAnswer === null || !gameState.currentCase) return;

        const isCorrect = gameState.selectedAnswer === gameState.currentCase.correct_index;

        setGameState(prev => {
            let updates: Partial<GameState> = {
                showResult: true,
                isCorrect,
                eliminatedOption: null,
                showXrayHint: false
            };

            // Consume active card uses
            let newActiveCards = prev.activeCards.map(ac => ({
                ...ac,
                remaining: ac.remaining - 1
            })).filter(ac => ac.remaining > 0 || ac.card.duration === -1);

            if (isCorrect) {
                const settings = getWaveSettings(prev.currentWave);
                const timeBonus = Math.floor(prev.timeLeft / 5);
                const streakBonus = prev.streak * 5;
                let points = settings.points + timeBonus + streakBonus;

                // Check for double points card
                const hasDoubleCard = prev.activeCards.some(ac => ac.card.effect === 'double_points');
                if (prev.doublePoints || hasDoubleCard) {
                    points *= 2;
                    updates.doublePoints = false;
                }

                updates.score = prev.score + points;
                updates.casesResolved = prev.casesResolved + 1;
                updates.casesInWave = prev.casesInWave + 1;
                updates.streak = prev.streak + 1;
                updates.chaos = Math.max(0, prev.chaos - (5 + prev.streak * 2));
            } else {
                // Check for streak shield
                const hasShield = prev.activeCards.some(ac => ac.card.effect === 'streak_shield');

                updates.errors = prev.errors + 1;
                updates.chaos = Math.min(100, prev.chaos + 15);
                updates.streak = hasShield ? prev.streak : 0;

                // Remove shield after use
                if (hasShield) {
                    newActiveCards = newActiveCards.filter(ac => ac.card.effect !== 'streak_shield');
                }

                if (prev.errors + 1 >= 5 || prev.chaos + 15 >= 100) {
                    updates.gameOver = true;
                    updates.chaos = 100;
                }
            }

            updates.activeCards = newActiveCards;
            return { ...prev, ...updates };
        });
    };

    const handleNext = () => {
        setGameState(prev => {
            // Check if wave complete (5 cases)
            if (prev.casesInWave >= 5) {
                // Show card selection
                const shuffledCards = [...POWER_CARDS].sort(() => Math.random() - 0.5);
                return {
                    ...prev,
                    showCardSelection: true,
                    cardOptions: shuffledCards.slice(0, 3),
                    isPaused: true
                };
            }
            return nextCase(prev);
        });
    };

    const selectCard = (card: PowerCard) => {
        setGameState(prev => {
            let updates: Partial<GameState> = {
                showCardSelection: false,
                currentWave: prev.currentWave + 1,
                casesInWave: 0,
                cardOptions: [],
                isPaused: false
            };

            // Apply instant effects
            if (card.duration === -1) {
                switch (card.effect) {
                    case 'coffee':
                        updates.chaos = Math.max(0, prev.chaos - 20);
                        break;
                    case 'resident':
                        updates.queue = prev.queue.slice(2);
                        break;
                }
            } else {
                // Add to active cards
                updates.activeCards = [...prev.activeCards, { card, remaining: card.duration }];
            }

            return nextCase({ ...prev, ...updates });
        });
    };

    const nextCase = (prev: GameState): GameState => {
        const settings = getWaveSettings(prev.currentWave);

        // Check for extra time card
        const hasExtraTime = prev.activeCards?.some(ac => ac.card.effect === 'extra_time');
        const bonusTime = hasExtraTime ? 10 : 0;

        // Check for eliminate card
        const hasEliminate = prev.activeCards?.some(ac => ac.card.effect === 'eliminate');

        // Check for xray card
        const hasXray = prev.activeCards?.some(ac => ac.card.effect === 'xray');

        if (prev.queue.length === 0) {
            const newQueue = [...allCases].sort(() => Math.random() - 0.5).slice(0, 5);
            const [next, ...rest] = newQueue;

            // Find a wrong option to eliminate
            let eliminatedOption = null;
            if (hasEliminate && next) {
                const wrongOptions = next.options.map((_, i) => i).filter(i => i !== next.correct_index);
                eliminatedOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
            }

            return {
                ...prev,
                queue: rest,
                currentCase: next,
                selectedAnswer: null,
                showResult: false,
                timeLeft: settings.timer + bonusTime,
                eliminatedOption,
                showXrayHint: hasXray || false
            };
        }

        const [next, ...rest] = prev.queue;

        // Find a wrong option to eliminate
        let eliminatedOption = null;
        if (hasEliminate && next) {
            const wrongOptions = next.options.map((_, i) => i).filter(i => i !== next.correct_index);
            eliminatedOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        }

        return {
            ...prev,
            queue: rest,
            currentCase: next,
            selectedAnswer: null,
            showResult: false,
            timeLeft: settings.timer + bonusTime,
            eliminatedOption,
            showXrayHint: hasXray || false
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

    useEffect(() => {
        if (gameState.gameOver) {
            endGame();
        }
    }, [gameState.gameOver]);

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

    // Loading screen
    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Preparando plantão...</p>
                </div>
            </div>
        );
    }

    // Card Selection Modal
    if (gameState.showCardSelection) {
        return (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900">
                <div className="text-center max-w-lg w-full px-4">
                    <div className="mb-6">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30"
                        >
                            <Trophy className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-black text-white mb-2">Wave {gameState.currentWave} Completa!</h2>
                        <p className="text-slate-400">Escolha uma carta para a próxima wave</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {gameState.cardOptions.map((card) => (
                            <button
                                key={card.id}
                                onClick={() => selectCard(card)}
                                className={clsx(
                                    'p-4 rounded-xl border-2 transition-all hover:scale-[1.02] text-left',
                                    card.rarity === 'epic' ? 'bg-purple-500/20 border-purple-500/50 hover:border-purple-400' :
                                        card.rarity === 'rare' ? 'bg-blue-500/20 border-blue-500/50 hover:border-blue-400' :
                                            'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={clsx(
                                        'w-14 h-14 rounded-xl flex items-center justify-center text-2xl',
                                        card.rarity === 'epic' ? 'bg-purple-500/30' :
                                            card.rarity === 'rare' ? 'bg-blue-500/30' :
                                                'bg-slate-700'
                                    )}>
                                        {card.emoji}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white">{card.title}</h3>
                                            {card.rarity === 'epic' && <span className="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded">ÉPICO</span>}
                                            {card.rarity === 'rare' && <span className="text-xs px-2 py-0.5 bg-blue-500/30 text-blue-300 rounded">RARO</span>}
                                        </div>
                                        <p className="text-sm text-slate-400">{card.description}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {card.duration === -1 ? 'Efeito imediato' : `Dura ${card.duration} casos`}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

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
                    <p className="text-slate-400 mb-2">O caos tomou conta do PS</p>
                    <p className="text-lg font-bold text-cyan-400 mb-4">Chegou até a Wave {gameState.currentWave}</p>

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
                            <p className="text-2xl font-bold text-purple-400">{gameState.currentWave}</p>
                            <p className="text-xs text-slate-500">Wave</p>
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

    const settings = getWaveSettings(gameState.currentWave);

    return (
        <div className={clsx(
            'h-full flex flex-col overflow-hidden transition-all duration-500',
            gameState.isBlackout && 'brightness-[0.1]'
        )}>
            {/* Chaos Event Notification */}
            <AnimatePresence>
                {gameState.activeEvent && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className={clsx(
                            'border rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg backdrop-blur-sm',
                            gameState.activeEvent.effect === 'add_patients' || gameState.activeEvent.effect === 'add_chaos'
                                ? 'bg-red-950/90 border-red-500/50 shadow-red-500/20'
                                : gameState.activeEvent.effect === 'reduce_chaos' || gameState.activeEvent.effect === 'remove_patients'
                                    ? 'bg-emerald-950/90 border-emerald-500/50 shadow-emerald-500/20'
                                    : 'bg-slate-800/90 border-yellow-500/50 shadow-yellow-500/20'
                        )}>
                            <div className={clsx(
                                'w-10 h-10 rounded-lg flex items-center justify-center',
                                gameState.activeEvent.effect === 'add_patients' ? 'bg-red-500/20' :
                                    gameState.activeEvent.effect === 'reduce_chaos' ? 'bg-emerald-500/20' :
                                        'bg-yellow-500/20'
                            )}>
                                {gameState.activeEvent.effect === 'add_patients' && <Ambulance className="w-5 h-5 text-red-400" />}
                                {gameState.activeEvent.effect === 'remove_patients' && <UserPlus className="w-5 h-5 text-emerald-400" />}
                                {gameState.activeEvent.effect === 'reduce_chaos' && <Coffee className="w-5 h-5 text-emerald-400" />}
                                {gameState.activeEvent.effect === 'add_chaos' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                                {gameState.activeEvent.effect === 'double_points' && <Star className="w-5 h-5 text-yellow-400" />}
                                {gameState.activeEvent.effect === 'blackout' && <Zap className="w-5 h-5 text-yellow-400" />}
                            </div>
                            <div>
                                <p className={clsx(
                                    'font-bold text-sm',
                                    gameState.activeEvent.effect === 'add_patients' || gameState.activeEvent.effect === 'add_chaos'
                                        ? 'text-red-400'
                                        : gameState.activeEvent.effect === 'reduce_chaos' || gameState.activeEvent.effect === 'remove_patients'
                                            ? 'text-emerald-400'
                                            : 'text-yellow-400'
                                )}>{gameState.activeEvent.title}</p>
                                <p className="text-xs text-slate-300">{gameState.activeEvent.description}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header with Wave & Stats */}
            <div className="mb-3 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/games')}
                            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
                            <span className="text-sm font-bold text-cyan-400">Wave {gameState.currentWave}</span>
                            <span className="text-xs text-slate-400 ml-2">{gameState.casesInWave}/5</span>
                        </div>
                    </div>
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

                {/* Active Cards Display */}
                {gameState.activeCards.length > 0 && (
                    <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                        {gameState.activeCards.map((ac, i) => (
                            <div key={i} className="px-2 py-1 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center gap-1 shrink-0">
                                <span className="text-sm">{ac.card.emoji}</span>
                                <span className="text-xs text-slate-400">{ac.remaining}</span>
                            </div>
                        ))}
                    </div>
                )}

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

            {/* Patient Queue */}
            <div className="mb-3 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400 font-medium">Sala de espera</span>
                    <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-white font-bold">
                        {gameState.queue.length}
                    </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    <AnimatePresence mode="popLayout">
                        {gameState.queue.slice(0, 12).map((patient, i) => (
                            <motion.div
                                key={patient.id || i}
                                layout
                                initial={{ opacity: 0, scale: 0.5, x: 50 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.5, x: -50 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                    delay: i * 0.03
                                }}
                                className={clsx(
                                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors',
                                    i < 3
                                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                        : i < 6
                                            ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                                            : 'bg-slate-800/80 border-slate-700/50 text-slate-500'
                                )}
                            >
                                <User className="w-4 h-4" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {gameState.queue.length > 12 && (
                        <motion.div
                            layout
                            className="px-2 h-8 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center text-xs text-slate-400 font-medium shrink-0"
                        >
                            +{gameState.queue.length - 12}
                        </motion.div>
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
                            style={{ width: `${(gameState.timeLeft / settings.timer) * 100}%` }}
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
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                            {(gameState.doublePoints || gameState.activeCards.some(ac => ac.card.effect === 'double_points')) && (
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
                            const isCorrect = index === gameState.currentCase!.correct_index;
                            const isEliminated = index === gameState.eliminatedOption;
                            const showHint = gameState.showXrayHint && isCorrect && !gameState.showResult;

                            if (isEliminated) {
                                return (
                                    <div key={index} className="w-full p-3 rounded-xl border-2 border-slate-800 bg-slate-900/30 text-slate-600 line-through opacity-50">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold">
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span>{option}</span>
                                        </div>
                                    </div>
                                );
                            }

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
                                                : showHint
                                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-slate-300'
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
                        {gameState.casesInWave >= 5 ? 'Escolher Carta' : 'Próximo Paciente'}
                    </button>
                )}
            </div>
        </div>
    );
};
