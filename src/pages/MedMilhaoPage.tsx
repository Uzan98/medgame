import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft,
    HelpCircle,
    Users,
    SkipForward,
    Phone,
    X,
    Check,
    Trophy,
    Coins,
    AlertCircle,
    Volume2,
    VolumeX,
    Crown,
    Shield,
    DollarSign,
    Swords,
    Zap
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';
import { useGameChallengeStore } from '../store/gameChallengeStore';
import { useAuth } from '../contexts/AuthContext';
import { ChallengeFriendModal } from '../components/challenges';
import clsx from 'clsx';

// Prize ladder (in MediCoins)
const prizeLadder = [
    { level: 1, prize: 1000, safe: false },
    { level: 2, prize: 2000, safe: false },
    { level: 3, prize: 5000, safe: false },
    { level: 4, prize: 10000, safe: false },
    { level: 5, prize: 20000, safe: true },
    { level: 6, prize: 40000, safe: false },
    { level: 7, prize: 80000, safe: false },
    { level: 8, prize: 150000, safe: false },
    { level: 9, prize: 300000, safe: false },
    { level: 10, prize: 500000, safe: true },
    { level: 11, prize: 750000, safe: false },
    { level: 12, prize: 1000000, safe: true }
];

// Sample medical questions
const sampleQuestions = [
    { id: 'q1', question: 'Qual é o principal neurotransmissor inibitório do sistema nervoso central?', options: ['Glutamato', 'GABA', 'Dopamina', 'Serotonina'], correctIndex: 1 },
    { id: 'q2', question: 'A tríade de Cushing (hipertensão, bradicardia e respiração irregular) indica:', options: ['Choque séptico', 'Hipertensão intracraniana', 'Infarto do miocárdio', 'Embolia pulmonar'], correctIndex: 1 },
    { id: 'q3', question: 'Qual antibiótico é contraindicado em crianças devido ao risco de deposição em cartilagens?', options: ['Amoxicilina', 'Azitromicina', 'Ciprofloxacino', 'Cefalexina'], correctIndex: 2 },
    { id: 'q4', question: 'O sinal de Blumberg positivo é característico de:', options: ['Apendicite aguda', 'Colecistite', 'Pancreatite', 'Peritonite'], correctIndex: 3 },
    { id: 'q5', question: 'Qual a principal causa de morte súbita em jovens atletas?', options: ['Infarto agudo do miocárdio', 'Cardiomiopatia hipertrófica', 'Arritmia ventricular', 'Dissecção de aorta'], correctIndex: 1 },
    { id: 'q6', question: 'O antídoto para intoxicação por paracetamol é:', options: ['Flumazenil', 'N-acetilcisteína', 'Naloxona', 'Atropina'], correctIndex: 1 },
    { id: 'q7', question: 'Na síndrome de Guillain-Barré, o achado clássico no líquor é:', options: ['Pleocitose', 'Dissociação albumino-citológica', 'Hipoglicorraquia', 'Bandas oligoclonais'], correctIndex: 1 },
    { id: 'q8', question: 'Qual é o marcador tumoral mais específico para carcinoma hepatocelular?', options: ['CEA', 'CA 19-9', 'AFP', 'CA 125'], correctIndex: 2 },
    { id: 'q9', question: 'A síndrome de Wernicke-Korsakoff é causada pela deficiência de:', options: ['Vitamina B12', 'Vitamina B1 (Tiamina)', 'Vitamina B6', 'Ácido fólico'], correctIndex: 1 },
    { id: 'q10', question: 'Qual síndrome paraneoplásica está mais associada ao carcinoma de pequenas células do pulmão?', options: ['Hipercalcemia', 'Síndrome de SIADH', 'Síndrome carcinoide', 'Policitemia'], correctIndex: 1 },
    { id: 'q11', question: 'O fenômeno de Raynaud secundário está mais frequentemente associado a:', options: ['Lúpus eritematoso', 'Esclerose sistêmica', 'Artrite reumatoide', 'Dermatomiosite'], correctIndex: 1 },
    { id: 'q12', question: 'Qual a mutação genética mais comum na fibrose cística?', options: ['TP53', 'BRCA1', 'F508del', 'CFTR-G551D'], correctIndex: 2 }
];

type HelpType = 'skip' | 'audience' | 'call' | 'cards';

interface GameState {
    currentLevel: number;
    selectedAnswer: number | null;
    showResult: boolean;
    isCorrect: boolean;
    gameOver: boolean;
    wonPrize: number;
    usedHelps: HelpType[];
    audienceHelp: number[] | null;
    callHelp: string | null;
    removedOptions: number[];
    isConfirming: boolean;
    showDramaticReveal: boolean;
}

// Sound URLs (royalty-free sounds)
const SOUNDS = {
    select: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2FgoF4cW1wdXx/fn55c3BwcXV4e3p6eHZ0cnBxc3V2d3d3dXNycHBxc3R1dXV1dHNycXBxcnNzdHV0c3JxcHBxcnNzdHR0c3JxcHBxcnNzdHRzcnFwcHFycnNzc3NycXBwcXJyc3NzcnFwcA==',
    confirm: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJKfoaGamI+GgX+AhYuRlJWVlJKPjImGhISFh4mKi4uLioiGhYSEhIWGh4iJiYmIh4aFhISEhYaHh4iIiIeGhYSEhIWFhoaHh4eHhoWEhISEhYaGhoeHh4aFhISE',
    correct: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJussrW0sauiopuXmJ2iqq2uraqmopycnZ+jpqipqKajoJ6cnZ6go6WnqKemo6Cdm5ucn6KkpqenpaKfnZubm56go6WmpqWjoZ6cnJydoKKkpaaloqCempqdnaChpKSkpKOf',
    wrong: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdGJSQjg4Oj9IT1dianBzc3FsZV5YVFRXXGRtdXt/gH99d29oYl9dX2RqcXd7fX58eHNtZ2JfXl9jaW91eXt7enZyb2tmYl9fYWVqcHR4enl4dXFua2ZjYWFkZ2xwc3Z3d3Z0cW5q'
};

export const MedMilhaoPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { addCoins, addXP } = useGameStore();
    const { fetchMyChallenges, getPendingChallenges, submitScore } = useGameChallengeStore();

    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showStart, setShowStart] = useState(true);
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

    const [gameState, setGameState] = useState<GameState>({
        currentLevel: 1,
        selectedAnswer: null,
        showResult: false,
        isCorrect: false,
        gameOver: false,
        wonPrize: 0,
        usedHelps: [],
        audienceHelp: null,
        callHelp: null,
        removedOptions: [],
        isConfirming: false,
        showDramaticReveal: false
    });

    const [showQuitConfirm, setShowQuitConfirm] = useState(false);
    const [questions] = useState(() => [...sampleQuestions].sort(() => Math.random() - 0.5));
    const [showLadder, setShowLadder] = useState(false);

    // Check for challenge in URL params
    useEffect(() => {
        const challengeId = searchParams.get('challenge');
        if (challengeId) {
            setActiveChallengeId(challengeId);
            setShowStart(false); // Start game immediately when accepting challenge
        }
    }, [searchParams]);

    // Fetch pending challenges on mount
    useEffect(() => {
        if (user?.id) {
            fetchMyChallenges(user.id, 'milhao');
        }
    }, [user?.id]);

    // Get pending challenges for badge
    const pendingChallenges = user?.id ? getPendingChallenges(user.id, 'milhao') : [];

    const currentQuestion = questions[gameState.currentLevel - 1];
    const currentPrize = prizeLadder[gameState.currentLevel - 1];

    const playSound = (soundType: keyof typeof SOUNDS) => {
        if (!soundEnabled) return;
        try {
            const audio = new Audio(SOUNDS[soundType]);
            audio.volume = 0.3;
            audio.play().catch(() => { });
        } catch (e) { }
    };

    const getSafePrize = () => {
        for (let i = gameState.currentLevel - 2; i >= 0; i--) {
            if (prizeLadder[i].safe) {
                return prizeLadder[i].prize;
            }
        }
        return 0;
    };

    const handleSelectAnswer = (index: number) => {
        if (gameState.showResult || gameState.removedOptions.includes(index) || gameState.isConfirming) return;
        playSound('select');
        setGameState(prev => ({ ...prev, selectedAnswer: index }));
    };

    const handleConfirmAnswer = () => {
        if (gameState.selectedAnswer === null) return;

        playSound('confirm');
        setGameState(prev => ({ ...prev, isConfirming: true }));

        // Dramatic pause before revealing
        setTimeout(() => {
            const isCorrect = gameState.selectedAnswer === currentQuestion.correctIndex;
            playSound(isCorrect ? 'correct' : 'wrong');

            setGameState(prev => ({
                ...prev,
                showDramaticReveal: true
            }));

            setTimeout(() => {
                setGameState(prev => ({
                    ...prev,
                    showResult: true,
                    isCorrect,
                    isConfirming: false,
                    showDramaticReveal: false
                }));
            }, 1500);
        }, 2000);
    };

    const handleNext = () => {
        if (gameState.isCorrect) {
            if (gameState.currentLevel >= 12) {
                endGame(prizeLadder[11].prize);
            } else {
                setGameState(prev => ({
                    ...prev,
                    currentLevel: prev.currentLevel + 1,
                    selectedAnswer: null,
                    showResult: false,
                    audienceHelp: null,
                    callHelp: null,
                    removedOptions: []
                }));
            }
        } else {
            endGame(getSafePrize());
        }
    };

    const handleQuit = () => {
        const prevPrize = gameState.currentLevel > 1 ? prizeLadder[gameState.currentLevel - 2].prize : 0;
        endGame(prevPrize);
    };

    const endGame = async (prize: number) => {
        setGameState(prev => ({ ...prev, gameOver: true, wonPrize: prize }));
        if (prize > 0) {
            const actualPrize = Math.floor(prize / 100);
            addCoins(actualPrize);
            addXP(actualPrize);
            useToastStore.getState().addToast(`Você ganhou ${actualPrize} MediCoins! 🎉`, 'success');
        }

        // Submit score if in challenge mode
        if (activeChallengeId && user?.id) {
            await submitScore(activeChallengeId, user.id, {
                score: prize,
                level: gameState.currentLevel,
                isMillionaire: prize >= 1000000
            });
            fetchMyChallenges(user.id, 'milhao');
        }
    };

    const handleChallengeCreated = (challengeId: string) => {
        setActiveChallengeId(challengeId);
        setShowStart(false);
    };

    const handleStartGame = () => {
        setShowStart(false);
    };

    const useHelp = (helpType: HelpType) => {
        if (gameState.usedHelps.includes(helpType)) return;
        playSound('select');

        const newHelps = [...gameState.usedHelps, helpType];

        switch (helpType) {
            case 'skip':
                setGameState(prev => ({ ...prev, usedHelps: newHelps, currentLevel: prev.currentLevel + 1, selectedAnswer: null, removedOptions: [] }));
                break;
            case 'audience':
                const correct = currentQuestion.correctIndex;
                const votes = [0, 0, 0, 0];
                votes[correct] = 40 + Math.floor(Math.random() * 30);
                let remaining = 100 - votes[correct];
                for (let i = 0; i < 4; i++) {
                    if (i !== correct) {
                        const vote = i < 3 ? Math.floor(Math.random() * (remaining / 2)) : remaining;
                        votes[i] = vote;
                        remaining -= vote;
                    }
                }
                setGameState(prev => ({ ...prev, usedHelps: newHelps, audienceHelp: votes }));
                break;
            case 'call':
                const isRight = Math.random() < 0.8;
                const suggestion = isRight ? currentQuestion.options[currentQuestion.correctIndex] : currentQuestion.options[(currentQuestion.correctIndex + 1) % 4];
                const confidence = isRight ? 'quase certeza' : 'acho que';
                setGameState(prev => ({ ...prev, usedHelps: newHelps, callHelp: `"Olha, eu tenho ${confidence} que é ${suggestion}..."` }));
                break;
            case 'cards':
                const wrongOptions: number[] = [];
                for (let i = 0; i < 4; i++) {
                    if (i !== currentQuestion.correctIndex) wrongOptions.push(i);
                }
                const toRemove = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
                setGameState(prev => ({ ...prev, usedHelps: newHelps, removedOptions: toRemove }));
                break;
        }
    };

    const restartGame = () => {
        setGameState({
            currentLevel: 1, selectedAnswer: null, showResult: false, isCorrect: false, gameOver: false,
            wonPrize: 0, usedHelps: [], audienceHelp: null, callHelp: null, removedOptions: [],
            isConfirming: false, showDramaticReveal: false
        });
    };

    const formatPrize = (prize: number) => {
        if (prize >= 1000000) return '1M';
        if (prize >= 1000) return `${prize / 1000}k`;
        return prize.toString();
    };

    // Start Screen
    if (showStart) {
        return (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-yellow-900/10 to-slate-900 p-4">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block mb-4">
                            <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-xl animate-pulse"></div>
                            <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center">
                                <Coins className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
                            MedMilhão
                        </h1>
                        <p className="text-slate-400 mt-2">
                            Responda corretamente e chegue ao milhão!
                        </p>
                    </div>

                    {/* Game Info */}
                    <div className="bg-slate-800/50 rounded-2xl border border-yellow-500/20 p-6 mb-6 backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                            Como Jogar
                        </h2>
                        <ul className="space-y-3 text-slate-300 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-yellow-400 text-xs">1</span>
                                </span>
                                <span>Responda 12 perguntas de dificuldade crescente</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-emerald-400 text-xs">2</span>
                                </span>
                                <span>Use 4 ajudas: Cartas, Plateia, Especialista e Pular</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-cyan-400 text-xs">3</span>
                                </span>
                                <span>Níveis seguros (5, 10, 12) garantem seu prêmio</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-purple-400 text-xs">4</span>
                                </span>
                                <span>Pode parar e levar o prêmio atual a qualquer momento</span>
                            </li>
                        </ul>
                    </div>

                    {/* Prize Preview */}
                    <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl border border-yellow-500/30 p-4 mb-6 text-center">
                        <p className="text-sm text-yellow-200/70">Prêmio máximo</p>
                        <div className="text-3xl font-black text-yellow-400 flex items-center justify-center gap-2">
                            <Crown className="w-7 h-7" />
                            1.000.000
                            <Coins className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={handleStartGame}
                        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all transform hover:scale-[1.02] shadow-lg shadow-yellow-500/30 mb-4 flex items-center justify-center gap-3"
                    >
                        <Zap className="w-6 h-6" />
                        Começar Jogo
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
                            onClick={() => navigate('/games/medmilhao/challenges')}
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
                        className="w-full py-3 bg-slate-800 border border-slate-700 text-slate-400 font-medium rounded-xl hover:bg-slate-700 transition-all"
                    >
                        Voltar aos Jogos
                    </button>
                </div>

                {/* Challenge Modal */}
                <ChallengeFriendModal
                    isOpen={showChallengeModal}
                    onClose={() => setShowChallengeModal(false)}
                    gameType="milhao"
                    onChallengeCreated={handleChallengeCreated}
                />
            </div>
        );
    }

    // Game Over Screen
    if (gameState.gameOver) {
        const actualPrize = Math.floor(gameState.wonPrize / 100);
        const isMillionaire = gameState.wonPrize >= 1000000;

        return (
            <div className="h-full bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center relative overflow-hidden">
                {/* Confetti effect for winners */}
                {isMillionaire && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-3 h-3 animate-bounce"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${1 + Math.random()}s`
                                }}
                            />
                        ))}
                    </div>
                )}

                <div className="max-w-lg w-full mx-4 text-center">
                    {/* Trophy */}
                    <div className={clsx(
                        'w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6',
                        isMillionaire
                            ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 shadow-[0_0_60px_rgba(251,191,36,0.5)] animate-pulse'
                            : gameState.wonPrize > 0
                                ? 'bg-gradient-to-br from-slate-600 to-slate-700'
                                : 'bg-slate-800'
                    )}>
                        {isMillionaire ? (
                            <Crown className="w-16 h-16 text-white drop-shadow-lg" />
                        ) : gameState.wonPrize > 0 ? (
                            <Trophy className="w-14 h-14 text-yellow-400" />
                        ) : (
                            <X className="w-14 h-14 text-red-400" />
                        )}
                    </div>

                    <h1 className={clsx(
                        'text-4xl font-black mb-4',
                        isMillionaire ? 'text-yellow-400' : 'text-white'
                    )}>
                        {isMillionaire ? 'MILIONÁRIO!' : gameState.wonPrize > 0 ? 'Parabéns!' : 'Que pena!'}
                    </h1>

                    <p className="text-slate-400 text-lg mb-8">
                        {isMillionaire
                            ? 'Você respondeu TODAS as perguntas e ganhou o MILHÃO!'
                            : gameState.wonPrize > 0
                                ? `Você chegou até a pergunta ${gameState.currentLevel}`
                                : 'Tente novamente!'}
                    </p>

                    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 mb-8 border border-yellow-500/20">
                        <p className="text-slate-400 mb-2">Você ganhou</p>
                        <div className="text-5xl font-black text-yellow-400 flex items-center justify-center gap-3">
                            <Coins className="w-10 h-10" />
                            {actualPrize.toLocaleString()}
                        </div>
                        <p className="text-sm text-slate-500 mt-2">MediCoins</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowStart(true)}
                            className="flex-1 py-4 bg-slate-700/50 backdrop-blur text-white font-bold rounded-xl hover:bg-slate-600/50 transition-colors"
                        >
                            Menu
                        </button>
                        <button
                            onClick={restartGame}
                            className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-yellow-500/25"
                        >
                            Jogar Novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gradient-to-b from-slate-900 via-indigo-900/30 to-slate-900 overflow-y-auto relative custom-scrollbar">
            {/* Spotlight effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_70%)]" />

            {/* Dramatic overlay during confirmation */}
            {gameState.isConfirming && (
                <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center">
                    <div className="text-center animate-pulse">
                        <div className="text-4xl font-black text-yellow-400 mb-4">
                            {gameState.showDramaticReveal ? 'A resposta certa é...' : 'Essa é sua resposta final?'}
                        </div>
                        {!gameState.showDramaticReveal && (
                            <div className="flex justify-center gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="h-full flex flex-col lg:flex-row-reverse p-4 gap-4 relative z-10">
                {/* Right side - Prize Ladder (Desktop) or Toggle (Mobile) */}
                <div className="lg:w-48 shrink-0">
                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setShowLadder(!showLadder)}
                        className="lg:hidden w-full flex items-center justify-between bg-slate-800/80 backdrop-blur px-4 py-2 rounded-xl border border-yellow-500/30 mb-2"
                    >
                        <span className="text-yellow-400 font-bold text-sm">Prêmios</span>
                        <span className="text-lg font-black text-white">{formatPrize(currentPrize.prize)}</span>
                    </button>

                    {/* Prize Ladder */}
                    <div className={clsx(
                        'lg:block bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 overflow-hidden',
                        showLadder ? 'block' : 'hidden'
                    )}>
                        <div className="p-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-b border-yellow-500/30 flex items-center justify-center gap-1">
                            <DollarSign className="w-4 h-4 text-yellow-400" />
                            <h2 className="text-center font-bold text-yellow-400 text-sm">PRÊMIOS</h2>
                        </div>
                        <div className="p-1 space-y-0.5">
                            {[...prizeLadder].reverse().map((step) => {
                                const isCurrent = step.level === gameState.currentLevel;
                                const isPassed = step.level < gameState.currentLevel;

                                return (
                                    <div
                                        key={step.level}
                                        className={clsx(
                                            'flex items-center justify-between px-2 py-1.5 rounded text-xs transition-all',
                                            isCurrent && 'bg-gradient-to-r from-yellow-500 to-amber-500 shadow-sm',
                                            isPassed && 'bg-emerald-500/20',
                                            !isCurrent && !isPassed && step.safe && 'bg-cyan-500/10',
                                            !isCurrent && !isPassed && !step.safe && 'bg-slate-700/30'
                                        )}
                                    >
                                        <span className={clsx(
                                            'text-xs font-bold',
                                            isCurrent ? 'text-slate-900' : isPassed ? 'text-emerald-400' : step.safe ? 'text-cyan-400' : 'text-slate-500'
                                        )}>
                                            {step.level}
                                        </span>
                                        <span className={clsx(
                                            'font-bold text-xs flex items-center gap-1',
                                            isCurrent ? 'text-slate-900' : isPassed ? 'text-emerald-400' : step.safe ? 'text-cyan-400' : 'text-slate-400'
                                        )}>
                                            {formatPrize(step.prize)}
                                            {step.safe && !isCurrent && <Shield className="w-2.5 h-2.5" />}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Game Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowQuitConfirm(true)}
                                className="w-12 h-12 rounded-xl bg-slate-800/80 backdrop-blur flex items-center justify-center text-slate-400 hover:text-white border border-slate-700"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
                                    <Coins className="w-6 h-6 text-yellow-400" /> MedMilhão
                                </h1>
                                <p className="text-sm text-slate-400">Pergunta {gameState.currentLevel} de 12</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className="w-10 h-10 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white"
                            >
                                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                            </button>
                            <div className="bg-gradient-to-r from-yellow-500/30 to-amber-500/30 px-4 py-2 rounded-xl border border-yellow-500/50">
                                <p className="text-xs text-yellow-200">Prêmio</p>
                                <p className="text-xl font-black text-yellow-400">{currentPrize.prize.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-slate-800/80 backdrop-blur border border-indigo-500/30 rounded-2xl p-6 mb-4 shadow-xl shadow-indigo-500/10">
                        <p className="text-lg lg:text-xl text-white font-medium leading-relaxed">{currentQuestion.question}</p>
                    </div>

                    {/* Help Results */}
                    {gameState.audienceHelp && (
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-4 animate-fade-in">
                            <div className="flex items-center gap-2 text-purple-400 mb-3">
                                <Users className="w-5 h-5" />
                                <span className="font-bold">Universitários votaram:</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {['A', 'B', 'C', 'D'].map((letter, i) => (
                                    <div key={i} className="text-center">
                                        <div className="h-20 bg-slate-700/50 rounded relative overflow-hidden">
                                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-purple-400 transition-all duration-1000" style={{ height: `${gameState.audienceHelp![i]}%` }} />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{letter}: {gameState.audienceHelp![i]}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {gameState.callHelp && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4 animate-fade-in">
                            <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                <Phone className="w-5 h-5" />
                                <span className="font-bold">Especialista diz:</span>
                            </div>
                            <p className="text-slate-300 italic">{gameState.callHelp}</p>
                        </div>
                    )}

                    {/* Answer Options */}
                    <div className="flex-1 overflow-y-auto mb-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {currentQuestion.options.map((option, index) => {
                                const isRemoved = gameState.removedOptions.includes(index);
                                const isSelected = gameState.selectedAnswer === index;
                                const isCorrect = index === currentQuestion.correctIndex;
                                const letter = String.fromCharCode(65 + index);

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectAnswer(index)}
                                        disabled={gameState.showResult || isRemoved || gameState.isConfirming}
                                        className={clsx(
                                            'relative text-left p-3 rounded-xl border-2 transition-colors duration-200',
                                            isRemoved && 'opacity-20 cursor-not-allowed',
                                            !isRemoved && !gameState.showResult && !gameState.isConfirming && 'hover:border-slate-500',
                                            gameState.showResult
                                                ? isCorrect
                                                    ? 'bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 border-emerald-400'
                                                    : isSelected
                                                        ? 'bg-red-500/20 border-red-500 shake-animation'
                                                        : 'bg-slate-800/50 border-slate-700'
                                                : isSelected
                                                    ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border-yellow-400'
                                                    : 'bg-slate-800/80 border-slate-600 hover:border-slate-500'
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black transition-all',
                                                gameState.showResult
                                                    ? isCorrect
                                                        ? 'bg-emerald-500 text-white'
                                                        : isSelected
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-slate-700 text-slate-500'
                                                    : isSelected
                                                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900'
                                                        : 'bg-slate-700 text-slate-400'
                                            )}>
                                                {gameState.showResult && isCorrect ? <Check className="w-5 h-5" /> :
                                                    gameState.showResult && isSelected && !isCorrect ? <X className="w-5 h-5" /> :
                                                        letter}
                                            </div>
                                            <span className={clsx(
                                                'flex-1 font-medium text-sm',
                                                gameState.showResult
                                                    ? isCorrect ? 'text-emerald-300' : isSelected ? 'text-red-300' : 'text-slate-500'
                                                    : isSelected ? 'text-white' : 'text-slate-300'
                                            )}>{option}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Help Buttons */}
                    {!gameState.showResult && !gameState.isConfirming && (
                        <div className="flex gap-2 flex-wrap mb-4 shrink-0">
                            {[
                                { type: 'cards' as HelpType, icon: HelpCircle, label: 'Cartas', color: 'orange' },
                                { type: 'audience' as HelpType, icon: Users, label: 'Plateia', color: 'purple' },
                                { type: 'call' as HelpType, icon: Phone, label: 'Ligar', color: 'emerald' },
                                { type: 'skip' as HelpType, icon: SkipForward, label: 'Pular', color: 'cyan', disabled: gameState.currentLevel >= 11 }
                            ].map(({ type, icon: Icon, label, color, disabled }) => (
                                <button
                                    key={type}
                                    onClick={() => useHelp(type)}
                                    disabled={gameState.usedHelps.includes(type) || disabled}
                                    className={clsx(
                                        'flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all',
                                        gameState.usedHelps.includes(type) || disabled
                                            ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                                            : `bg-${color}-500/20 text-${color}-400 border border-${color}-500/30 hover:bg-${color}-500/30 hover:scale-105`
                                    )}
                                    style={!gameState.usedHelps.includes(type) && !disabled ? {
                                        backgroundColor: `rgba(var(--${color}-500), 0.2)`,
                                        borderColor: `rgba(var(--${color}-500), 0.3)`
                                    } : undefined}
                                >
                                    <Icon className="w-5 h-5" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="shrink-0">
                        {!gameState.showResult && !gameState.isConfirming ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowQuitConfirm(true)}
                                    className="px-8 py-4 bg-slate-700/80 backdrop-blur text-white font-bold rounded-xl hover:bg-slate-600/80 border border-slate-600"
                                >
                                    Parar
                                </button>
                                <button
                                    onClick={handleConfirmAnswer}
                                    disabled={gameState.selectedAnswer === null}
                                    className={clsx(
                                        'flex-1 py-4 rounded-xl font-black text-lg transition-all',
                                        gameState.selectedAnswer !== null
                                            ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:scale-[1.01] shadow-lg shadow-yellow-500/30'
                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    )}
                                >
                                    CONFIRMAR RESPOSTA
                                </button>
                            </div>
                        ) : gameState.showResult && (
                            <button
                                onClick={handleNext}
                                className={clsx(
                                    'w-full py-4 rounded-xl font-black text-lg transition-all',
                                    gameState.isCorrect
                                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-[1.01]'
                                        : 'bg-red-500 text-white'
                                )}
                            >
                                {gameState.isCorrect
                                    ? gameState.currentLevel >= 12 ? '🎉 COLETAR 1 MILHÃO!' : 'PRÓXIMA PERGUNTA →'
                                    : 'VER RESULTADO'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quit Confirmation Modal */}
            {showQuitConfirm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-yellow-500/30 rounded-2xl p-8 max-w-sm w-full">
                        <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-white text-center mb-2">Parar agora?</h3>
                        <p className="text-slate-400 text-center mb-6">
                            Você levará <span className="text-yellow-400 font-bold">
                                {gameState.currentLevel > 1 ? prizeLadder[gameState.currentLevel - 2].prize.toLocaleString() : '0'}
                            </span> MediCoins
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowQuitConfirm(false)}
                                className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600"
                            >
                                Continuar
                            </button>
                            <button
                                onClick={handleQuit}
                                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600"
                            >
                                Parar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .shake-animation {
                    animation: shake 0.5s ease-in-out;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.7);
                }
            `}</style>
        </div>
    );
};
