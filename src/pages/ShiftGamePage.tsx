import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    ChevronRight,
    Check,
    X,
    Image,
    Video,
    Volume2,
    Play,
    Pause,
    Coins,
    Trophy,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';
import { sampleShifts, Shift } from '../lib/shifts';
import { loadShifts } from '../lib/shiftsSync';
import clsx from 'clsx';

export const ShiftGamePage: React.FC = () => {
    const navigate = useNavigate();
    const { shiftId } = useParams<{ shiftId: string }>();
    const { level, addCoins, addXP, setActiveShift, completeShift } = useGameStore();

    // State
    const [shift, setShift] = useState<Shift | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [totalPoints, setTotalPoints] = useState(0);
    const [shiftCompleted, setShiftCompleted] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Load shift from database or fallback to sample
    useEffect(() => {
        const fetchShift = async () => {
            setLoading(true);
            const dbShifts = await loadShifts();
            const allShifts = dbShifts.length > 0 ? dbShifts : sampleShifts;
            const foundShift = allShifts.find(s => s.id === shiftId);
            setShift(foundShift || null);
            if (foundShift) {
                setActiveShift(foundShift);
            }
            setLoading(false);
        };
        fetchShift();
    }, [shiftId, setActiveShift]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    if (!shift) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-white mb-2">Plantão não encontrado</h2>
                    <button
                        onClick={() => navigate('/shifts')}
                        className="text-cyan-400 hover:underline"
                    >
                        Voltar para plantões
                    </button>
                </div>
            </div>
        );
    }

    if (level < shift.requiredLevel) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-white mb-2">Nível insuficiente</h2>
                    <p className="text-slate-400 mb-4">Você precisa ser nível {shift.requiredLevel} para este plantão.</p>
                    <button
                        onClick={() => navigate('/shifts')}
                        className="text-cyan-400 hover:underline"
                    >
                        Voltar para plantões
                    </button>
                </div>
            </div>
        );
    }

    const currentCase = shift.cases[currentCaseIndex];
    const currentQuestion = currentCase?.questions[currentQuestionIndex];
    const totalCases = shift.cases.length;
    const totalQuestions = currentCase?.questions.length || 0;

    // Check if shift has cases
    if (!currentCase || totalCases === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-white mb-2">Plantão sem casos</h2>
                    <p className="text-slate-400 mb-4">Este plantão ainda não tem casos configurados.</p>
                    <button
                        onClick={() => navigate('/shifts')}
                        className="text-cyan-400 hover:underline"
                    >
                        Voltar para plantões
                    </button>
                </div>
            </div>
        );
    }

    const handleAnswerSelect = (index: number) => {
        if (showResult) return;
        setSelectedAnswer(index);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null || !currentQuestion) return;

        const correct = selectedAnswer === currentQuestion.correctIndex;
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setTotalPoints(prev => prev + currentQuestion.points);
        }
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setShowResult(false);

        // Next question in current case
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            return;
        }

        // Next case
        if (currentCaseIndex < totalCases - 1) {
            setCurrentCaseIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
            return;
        }

        // Shift completed!
        handleShiftComplete();
    };

    const handleShiftComplete = () => {
        setShiftCompleted(true);

        // Calculate bonus based on performance
        // Use totalPoints from cases, or calculate from questions if not set
        let maxPoints = shift.cases.reduce((sum, c) => sum + (c.totalPoints || 0), 0);
        if (maxPoints === 0) {
            // Calculate from questions if totalPoints not set
            maxPoints = shift.cases.reduce((sum, c) =>
                sum + c.questions.reduce((qSum, q) => qSum + (q.points || 50), 0), 0);
        }
        const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 100;
        const bonusCoins = Math.floor((percentage / 100) * shift.payment);
        const totalCoins = shift.payment + bonusCoins;

        // Award rewards
        addCoins(totalCoins);
        addXP(totalPoints);
        completeShift(shift.id);
        setActiveShift(null);

        useToastStore.getState().addToast(`Plantão concluído! +${totalCoins} MediCoins 🎉`, 'success');
    };

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isAudioPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsAudioPlaying(!isAudioPlaying);
        }
    };

    const toggleVideo = () => {
        if (videoRef.current) {
            if (isVideoPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsVideoPlaying(!isVideoPlaying);
        }
    };

    // Completed screen
    if (shiftCompleted) {
        // Calculate max points - use totalPoints or calculate from questions
        let maxPoints = shift.cases.reduce((sum, c) => sum + (c.totalPoints || 0), 0);
        if (maxPoints === 0) {
            maxPoints = shift.cases.reduce((sum, c) =>
                sum + c.questions.reduce((qSum, q) => qSum + (q.points || 50), 0), 0);
        }
        const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 100;
        const bonusCoins = Math.floor((percentage / 100) * shift.payment);
        const totalCoins = shift.payment + bonusCoins;

        return (
            <div className="h-full flex items-center justify-center">
                <div className="max-w-md w-full bg-slate-800/50 border border-emerald-500/30 rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">Plantão Concluído!</h2>
                    <p className="text-slate-400 mb-6">{shift.title}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                                <Coins className="w-6 h-6" />
                                {totalCoins}
                            </div>
                            <p className="text-xs text-slate-500">MediCoins Ganhos</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-cyan-400">
                                {totalPoints} XP
                            </div>
                            <p className="text-xs text-slate-500">Experiência</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-slate-400 mb-2">Desempenho</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-lg font-bold text-white">{percentage}%</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/shifts')}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform"
                    >
                        Voltar aos Plantões
                    </button>
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
                        onClick={() => navigate('/shifts')}
                        className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">{shift.title}</h1>
                        <p className="text-xs text-slate-400">
                            Caso {currentCaseIndex + 1}/{totalCases} • Pergunta {currentQuestionIndex + 1}/{totalQuestions}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-lg">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-yellow-400">{totalPoints}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-800 rounded-full mb-4 shrink-0 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all"
                    style={{
                        width: `${((currentCaseIndex * totalQuestions + currentQuestionIndex + 1) /
                            (totalCases * (currentCase?.questions.length || 1))) * 100}%`
                    }}
                />
            </div>

            {/* Case Content */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
                {/* Case Header */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h2 className="font-bold text-white mb-1">{currentCase.title}</h2>
                    <p className="text-sm text-cyan-400 mb-2">{currentCase.patientInfo}</p>
                    <p className="text-sm text-slate-300">{currentCase.description}</p>
                </div>

                {/* Media Section */}
                {currentCase.media && (currentCase.media.images || currentCase.media.video || currentCase.media.audio) && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
                        {/* Images */}
                        {currentCase.media.images && currentCase.media.images.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                    <Image className="w-4 h-4" />
                                    <span>Exame de Imagem</span>
                                </div>
                                <div className="grid gap-2">
                                    {currentCase.media.images.map((img, i) => (
                                        <div key={i} className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                                            <img
                                                src={img}
                                                alt={`Exame ${i + 1}`}
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e293b/64748b?text=Imagem+Indisponível';
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Audio */}
                        {currentCase.media.audio && (
                            <div>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                    <Volume2 className="w-4 h-4" />
                                    <span>Ausculta</span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-3">
                                    <button
                                        onClick={toggleAudio}
                                        className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-400 transition-colors"
                                    >
                                        {isAudioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="h-2 bg-slate-700 rounded-full">
                                            <div className={clsx(
                                                "h-full bg-cyan-500 rounded-full transition-all",
                                                isAudioPlaying && "animate-pulse"
                                            )} style={{ width: isAudioPlaying ? '50%' : '0%' }} />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Clique para ouvir a ausculta</p>
                                    </div>
                                    <audio ref={audioRef} src={currentCase.media.audio} onEnded={() => setIsAudioPlaying(false)} />
                                </div>
                            </div>
                        )}

                        {/* Video */}
                        {currentCase.media.video && (
                            <div>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                    <Video className="w-4 h-4" />
                                    <span>Vídeo do Exame</span>
                                </div>
                                <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                                    <video
                                        ref={videoRef}
                                        src={currentCase.media.video}
                                        className="w-full h-full object-contain"
                                        onEnded={() => setIsVideoPlaying(false)}
                                    />
                                    <button
                                        onClick={toggleVideo}
                                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                                    >
                                        {isVideoPlaying ? (
                                            <Pause className="w-12 h-12 text-white" />
                                        ) : (
                                            <Play className="w-12 h-12 text-white" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Question */}
                {currentQuestion && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                        <h3 className="font-bold text-white mb-4">{currentQuestion.question}</h3>

                        <div className="space-y-2">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={showResult}
                                    className={clsx(
                                        'w-full text-left p-4 rounded-xl border-2 transition-all',
                                        showResult
                                            ? index === currentQuestion.correctIndex
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                                : selectedAnswer === index
                                                    ? 'bg-red-500/20 border-red-500 text-red-300'
                                                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                                            : selectedAnswer === index
                                                ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold',
                                            showResult
                                                ? index === currentQuestion.correctIndex
                                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                                    : selectedAnswer === index
                                                        ? 'border-red-500 bg-red-500 text-white'
                                                        : 'border-slate-600 text-slate-500'
                                                : selectedAnswer === index
                                                    ? 'border-cyan-500 bg-cyan-500 text-white'
                                                    : 'border-slate-600 text-slate-500'
                                        )}>
                                            {showResult && index === currentQuestion.correctIndex ? (
                                                <Check className="w-4 h-4" />
                                            ) : showResult && selectedAnswer === index ? (
                                                <X className="w-4 h-4" />
                                            ) : (
                                                String.fromCharCode(65 + index)
                                            )}
                                        </div>
                                        <span>{option}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Result / Explanation */}
                        {showResult && (
                            <div className={clsx(
                                'mt-4 p-4 rounded-xl',
                                isCorrect ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'
                            )}>
                                <div className="flex items-center gap-2 mb-2">
                                    {isCorrect ? (
                                        <>
                                            <Check className="w-5 h-5 text-emerald-400" />
                                            <span className="font-bold text-emerald-400">Correto! +{currentQuestion.points} pontos</span>
                                        </>
                                    ) : (
                                        <>
                                            <X className="w-5 h-5 text-red-400" />
                                            <span className="font-bold text-red-400">Incorreto</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-sm text-slate-300">{currentQuestion.explanation}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-4">
                            {!showResult ? (
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={selectedAnswer === null}
                                    className={clsx(
                                        'w-full py-3 rounded-xl font-bold transition-all',
                                        selectedAnswer !== null
                                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:scale-[1.02]'
                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    )}
                                >
                                    Confirmar Resposta
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                                >
                                    {currentCaseIndex === totalCases - 1 && currentQuestionIndex === totalQuestions - 1
                                        ? 'Finalizar Plantão'
                                        : 'Próximo'}
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
