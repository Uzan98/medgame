import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Sparkles
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';
import clsx from 'clsx';

// Prize ladder (in MediCoins)
const prizeLadder = [
    { level: 1, prize: 1000, safe: false },
    { level: 2, prize: 2000, safe: false },
    { level: 3, prize: 5000, safe: false },
    { level: 4, prize: 10000, safe: false },
    { level: 5, prize: 20000, safe: true },  // Safe point
    { level: 6, prize: 40000, safe: false },
    { level: 7, prize: 80000, safe: false },
    { level: 8, prize: 150000, safe: false },
    { level: 9, prize: 300000, safe: false },
    { level: 10, prize: 500000, safe: true },  // Safe point
    { level: 11, prize: 750000, safe: false },
    { level: 12, prize: 1000000, safe: true }  // 1 MILLION!
];

// Sample medical questions
const sampleQuestions = [
    {
        id: 'q1',
        question: 'Qual é o principal neurotransmissor inibitório do sistema nervoso central?',
        options: ['Glutamato', 'GABA', 'Dopamina', 'Serotonina'],
        correctIndex: 1,
        difficulty: 1
    },
    {
        id: 'q2',
        question: 'A tríade de Cushing (hipertensão, bradicardia e respiração irregular) indica:',
        options: ['Choque séptico', 'Hipertensão intracraniana', 'Infarto do miocárdio', 'Embolia pulmonar'],
        correctIndex: 1,
        difficulty: 2
    },
    {
        id: 'q3',
        question: 'Qual antibiótico é contraindicado em crianças devido ao risco de deposição em cartilagens?',
        options: ['Amoxicilina', 'Azitromicina', 'Ciprofloxacino', 'Cefalexina'],
        correctIndex: 2,
        difficulty: 3
    },
    {
        id: 'q4',
        question: 'O sinal de Blumberg positivo é característico de:',
        options: ['Apendicite aguda', 'Colecistite', 'Pancreatite', 'Peritonite'],
        correctIndex: 3,
        difficulty: 4
    },
    {
        id: 'q5',
        question: 'Qual a principal causa de morte súbita em jovens atletas?',
        options: ['Infarto agudo do miocárdio', 'Cardiomiopatia hipertrófica', 'Arritmia ventricular', 'Dissecção de aorta'],
        correctIndex: 1,
        difficulty: 5
    },
    {
        id: 'q6',
        question: 'O antídoto para intoxicação por paracetamol é:',
        options: ['Flumazenil', 'N-acetilcisteína', 'Naloxona', 'Atropina'],
        correctIndex: 1,
        difficulty: 6
    },
    {
        id: 'q7',
        question: 'Na síndrome de Guillain-Barré, o achado clássico no líquor é:',
        options: ['Pleocitose', 'Dissociação albumino-citológica', 'Hipoglicorraquia', 'Bandas oligoclonais'],
        correctIndex: 1,
        difficulty: 7
    },
    {
        id: 'q8',
        question: 'Qual é o marcador tumoral mais específico para carcinoma hepatocelular?',
        options: ['CEA', 'CA 19-9', 'AFP', 'CA 125'],
        correctIndex: 2,
        difficulty: 8
    },
    {
        id: 'q9',
        question: 'A síndrome de Wernicke-Korsakoff é causada pela deficiência de:',
        options: ['Vitamina B12', 'Vitamina B1 (Tiamina)', 'Vitamina B6', 'Ácido fólico'],
        correctIndex: 1,
        difficulty: 9
    },
    {
        id: 'q10',
        question: 'Qual síndrome paraneoplásica está mais associada ao carcinoma de pequenas células do pulmão?',
        options: ['Hipercalcemia', 'Síndrome de SIADH', 'Síndrome carcinoide', 'Policitemia'],
        correctIndex: 1,
        difficulty: 10
    },
    {
        id: 'q11',
        question: 'O fenômeno de Raynaud secundário está mais frequentemente associado a:',
        options: ['Lúpus eritematoso', 'Esclerose sistêmica', 'Artrite reumatoide', 'Dermatomiosite'],
        correctIndex: 1,
        difficulty: 11
    },
    {
        id: 'q12',
        question: 'Qual a mutação genética mais comum na fibrose cística?',
        options: ['TP53', 'BRCA1', 'F508del', 'CFTR-G551D'],
        correctIndex: 2,
        difficulty: 12
    }
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
}

export const MedMilhaoPage: React.FC = () => {
    const navigate = useNavigate();
    const { addCoins, addXP } = useGameStore();

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
        removedOptions: []
    });

    const [showQuitConfirm, setShowQuitConfirm] = useState(false);
    const [questions] = useState(() => [...sampleQuestions].sort(() => Math.random() - 0.5));

    const currentQuestion = questions[gameState.currentLevel - 1];
    const currentPrize = prizeLadder[gameState.currentLevel - 1];

    // Get safe prize (last safe point passed)
    const getSafePrize = () => {
        for (let i = gameState.currentLevel - 2; i >= 0; i--) {
            if (prizeLadder[i].safe) {
                return prizeLadder[i].prize;
            }
        }
        return 0;
    };

    const handleSelectAnswer = (index: number) => {
        if (gameState.showResult || gameState.removedOptions.includes(index)) return;
        setGameState(prev => ({ ...prev, selectedAnswer: index }));
    };

    const handleConfirmAnswer = () => {
        if (gameState.selectedAnswer === null) return;

        const isCorrect = gameState.selectedAnswer === currentQuestion.correctIndex;

        setGameState(prev => ({
            ...prev,
            showResult: true,
            isCorrect
        }));
    };

    const handleNext = () => {
        if (gameState.isCorrect) {
            if (gameState.currentLevel >= 12) {
                // WON THE MILLION!
                endGame(prizeLadder[11].prize);
            } else {
                // Next question
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
            // Wrong answer - lose to safe point
            endGame(getSafePrize());
        }
    };

    const handleQuit = () => {
        // Take current prize
        const prevPrize = gameState.currentLevel > 1 ? prizeLadder[gameState.currentLevel - 2].prize : 0;
        endGame(prevPrize);
    };

    const endGame = (prize: number) => {
        setGameState(prev => ({
            ...prev,
            gameOver: true,
            wonPrize: prize
        }));

        if (prize > 0) {
            // Convert to reasonable in-game amount (divide by 100)
            const actualPrize = Math.floor(prize / 100);
            addCoins(actualPrize);
            addXP(actualPrize);
            useToastStore.getState().addToast(`Você ganhou ${actualPrize} MediCoins! 🎉`, 'success');
        }
    };

    const useHelp = (helpType: HelpType) => {
        if (gameState.usedHelps.includes(helpType)) return;

        const newHelps = [...gameState.usedHelps, helpType];

        switch (helpType) {
            case 'skip':
                // Skip question - move to next
                setGameState(prev => ({
                    ...prev,
                    usedHelps: newHelps,
                    currentLevel: prev.currentLevel + 1,
                    selectedAnswer: null,
                    removedOptions: []
                }));
                break;

            case 'audience':
                // Simulate audience votes (favor correct answer)
                const correct = currentQuestion.correctIndex;
                const votes = [0, 0, 0, 0];
                votes[correct] = 40 + Math.floor(Math.random() * 30); // 40-70%
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
                // Simulate friend call (80% chance correct)
                const isRight = Math.random() < 0.8;
                const suggestion = isRight
                    ? currentQuestion.options[currentQuestion.correctIndex]
                    : currentQuestion.options[(currentQuestion.correctIndex + 1) % 4];
                const confidence = isRight ? 'quase certeza' : 'acho que';
                setGameState(prev => ({
                    ...prev,
                    usedHelps: newHelps,
                    callHelp: `"Olha, eu tenho ${confidence} que é ${suggestion}..."`
                }));
                break;

            case 'cards':
                // Remove 2 wrong answers
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
            currentLevel: 1,
            selectedAnswer: null,
            showResult: false,
            isCorrect: false,
            gameOver: false,
            wonPrize: 0,
            usedHelps: [],
            audienceHelp: null,
            callHelp: null,
            removedOptions: []
        });
    };

    // Game Over Screen
    if (gameState.gameOver) {
        const actualPrize = Math.floor(gameState.wonPrize / 100);
        return (
            <div className="h-full flex items-center justify-center">
                <div className="max-w-md w-full bg-slate-800/50 border border-yellow-500/30 rounded-2xl p-6 text-center">
                    <div className={clsx(
                        'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4',
                        gameState.wonPrize >= 1000000
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-600 animate-pulse'
                            : 'bg-slate-700'
                    )}>
                        {gameState.wonPrize >= 1000000 ? (
                            <Sparkles className="w-12 h-12 text-white" />
                        ) : gameState.wonPrize > 0 ? (
                            <Trophy className="w-12 h-12 text-yellow-400" />
                        ) : (
                            <X className="w-12 h-12 text-red-400" />
                        )}
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">
                        {gameState.wonPrize >= 1000000
                            ? '🎉 VOCÊ GANHOU O MILHÃO! 🎉'
                            : gameState.wonPrize > 0
                                ? 'Parabéns!'
                                : 'Que pena!'}
                    </h2>

                    <p className="text-slate-400 mb-6">
                        {gameState.wonPrize >= 1000000
                            ? 'Incrível! Você respondeu todas as perguntas!'
                            : gameState.wonPrize > 0
                                ? `Você chegou até a pergunta ${gameState.currentLevel}`
                                : 'Não foi dessa vez, mas tente novamente!'}
                    </p>

                    <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
                        <div className="text-3xl font-black text-yellow-400 flex items-center justify-center gap-2">
                            <Coins className="w-8 h-8" />
                            {actualPrize.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">MediCoins Ganhos</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/games')}
                            className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={restartGame}
                            className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform"
                        >
                            Jogar Novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowQuitConfirm(true)}
                        className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">MedMilhão</h1>
                        <p className="text-xs text-slate-400">Pergunta {gameState.currentLevel} de 12</p>
                    </div>
                </div>
                <div className="bg-yellow-500/20 px-4 py-2 rounded-xl border border-yellow-500/30">
                    <p className="text-xs text-yellow-200">Prêmio atual</p>
                    <p className="text-lg font-black text-yellow-400">{currentPrize.prize.toLocaleString()}</p>
                </div>
            </div>

            {/* Prize Ladder - Horizontal scroll on mobile */}
            <div className="mb-4 shrink-0 overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                    {[...prizeLadder].reverse().map((step, idx) => {
                        const actualLevel = 12 - idx;
                        const isCurrent = actualLevel === gameState.currentLevel;
                        const isPassed = actualLevel < gameState.currentLevel;

                        return (
                            <div
                                key={step.level}
                                className={clsx(
                                    'px-2 py-1 rounded text-xs font-medium transition-all',
                                    isCurrent
                                        ? 'bg-yellow-500 text-slate-900'
                                        : isPassed
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : step.safe
                                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                : 'bg-slate-800/50 text-slate-500'
                                )}
                            >
                                {step.prize >= 1000 ? `${step.prize / 1000}k` : step.prize}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Question */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <p className="text-white font-medium leading-relaxed">{currentQuestion.question}</p>
                </div>

                {/* Audience Help */}
                {gameState.audienceHelp && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-purple-400 mb-3">
                            <Users className="w-4 h-4" />
                            <span className="font-bold">Ajuda dos Universitários</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {gameState.audienceHelp.map((vote, i) => (
                                <div key={i} className="text-center">
                                    <div className="h-16 bg-slate-700 rounded relative overflow-hidden">
                                        <div
                                            className="absolute bottom-0 w-full bg-purple-500 transition-all"
                                            style={{ height: `${vote}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">{vote}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Call Help */}
                {gameState.callHelp && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-emerald-400 mb-2">
                            <Phone className="w-4 h-4" />
                            <span className="font-bold">Ligação para o Especialista</span>
                        </div>
                        <p className="text-sm text-slate-300 italic">{gameState.callHelp}</p>
                    </div>
                )}

                {/* Options */}
                <div className="grid grid-cols-1 gap-2">
                    {currentQuestion.options.map((option, index) => {
                        const isRemoved = gameState.removedOptions.includes(index);
                        const isSelected = gameState.selectedAnswer === index;
                        const isCorrect = index === currentQuestion.correctIndex;

                        return (
                            <button
                                key={index}
                                onClick={() => handleSelectAnswer(index)}
                                disabled={gameState.showResult || isRemoved}
                                className={clsx(
                                    'w-full text-left p-4 rounded-xl border-2 transition-all',
                                    isRemoved
                                        ? 'opacity-30 cursor-not-allowed bg-slate-800/30 border-slate-700'
                                        : gameState.showResult
                                            ? isCorrect
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                                : isSelected
                                                    ? 'bg-red-500/20 border-red-500 text-red-300'
                                                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                                            : isSelected
                                                ? 'bg-yellow-500/20 border-yellow-500 text-white'
                                                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold',
                                        isRemoved
                                            ? 'border-slate-600 text-slate-600'
                                            : gameState.showResult
                                                ? isCorrect
                                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                                    : isSelected
                                                        ? 'border-red-500 bg-red-500 text-white'
                                                        : 'border-slate-600 text-slate-500'
                                                : isSelected
                                                    ? 'border-yellow-500 bg-yellow-500 text-slate-900'
                                                    : 'border-slate-600 text-slate-500'
                                    )}>
                                        {gameState.showResult && isCorrect ? (
                                            <Check className="w-4 h-4" />
                                        ) : gameState.showResult && isSelected && !isCorrect ? (
                                            <X className="w-4 h-4" />
                                        ) : (
                                            String.fromCharCode(65 + index)
                                        )}
                                    </div>
                                    <span>{option}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Help Buttons */}
                {!gameState.showResult && (
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => useHelp('cards')}
                            disabled={gameState.usedHelps.includes('cards')}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                gameState.usedHelps.includes('cards')
                                    ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
                            )}
                        >
                            <HelpCircle className="w-4 h-4" />
                            Cartas
                        </button>
                        <button
                            onClick={() => useHelp('audience')}
                            disabled={gameState.usedHelps.includes('audience')}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                gameState.usedHelps.includes('audience')
                                    ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                            )}
                        >
                            <Users className="w-4 h-4" />
                            Universitários
                        </button>
                        <button
                            onClick={() => useHelp('call')}
                            disabled={gameState.usedHelps.includes('call')}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                gameState.usedHelps.includes('call')
                                    ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                            )}
                        >
                            <Phone className="w-4 h-4" />
                            Ligar
                        </button>
                        <button
                            onClick={() => useHelp('skip')}
                            disabled={gameState.usedHelps.includes('skip') || gameState.currentLevel >= 11}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                gameState.usedHelps.includes('skip') || gameState.currentLevel >= 11
                                    ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
                            )}
                        >
                            <SkipForward className="w-4 h-4" />
                            Pular
                        </button>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="mt-4 shrink-0">
                {!gameState.showResult ? (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowQuitConfirm(true)}
                            className="px-6 py-3 bg-slate-700 text-white font-bold rounded-xl"
                        >
                            Parar
                        </button>
                        <button
                            onClick={handleConfirmAnswer}
                            disabled={gameState.selectedAnswer === null}
                            className={clsx(
                                'flex-1 py-3 rounded-xl font-bold transition-all',
                                gameState.selectedAnswer !== null
                                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:scale-[1.01]'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            )}
                        >
                            Confirmar Resposta
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleNext}
                        className={clsx(
                            'w-full py-3 rounded-xl font-bold transition-all',
                            gameState.isCorrect
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                                : 'bg-red-500 text-white'
                        )}
                    >
                        {gameState.isCorrect
                            ? gameState.currentLevel >= 12
                                ? '🎉 Coletar 1 Milhão!'
                                : 'Próxima Pergunta'
                            : 'Ver Resultado'}
                    </button>
                )}
            </div>

            {/* Quit Confirmation Modal */}
            {showQuitConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full">
                        <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white text-center mb-2">Tem certeza?</h3>
                        <p className="text-slate-400 text-center text-sm mb-6">
                            Você levará {gameState.currentLevel > 1
                                ? `${prizeLadder[gameState.currentLevel - 2].prize.toLocaleString()} MediCoins`
                                : '0 MediCoins'
                            } se parar agora.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowQuitConfirm(false)}
                                className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-xl"
                            >
                                Continuar
                            </button>
                            <button
                                onClick={handleQuit}
                                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl"
                            >
                                Parar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
