import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Trophy, Heart, AlertCircle, CheckCircle, XCircle, ChevronRight, FileText, Activity } from 'lucide-react';
import { getCaseById, ClinicalCase } from '../lib/cases';
import { useAdminStore } from '../store/adminStore';
import clsx from 'clsx';
import { useGameStore } from '../store/gameStore';

type GamePhase = 'intro' | 'history' | 'exam' | 'questions' | 'results';

export const GameInterface: React.FC = () => {
    const { caseId } = useParams<{ caseId: string }>();
    const navigate = useNavigate();
    const { completeCase, canPlay, changeReputation } = useGameStore();

    const [currentCase, setCurrentCase] = useState<ClinicalCase | null>(null);
    const [phase, setPhase] = useState<GamePhase>('intro');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<{ questionId: string; correct: boolean; points: number }[]>([]);
    const [examTab, setExamTab] = useState(0);
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

    // Get custom cases from admin store
    const { customCases } = useAdminStore();

    useEffect(() => {
        if (caseId) {
            // First check sample cases, then custom cases
            let case_ = getCaseById(caseId);
            if (!case_) {
                case_ = customCases.find(c => c.id === caseId);
            }
            if (case_) {
                setCurrentCase(case_);
            } else {
                navigate('/cases');
            }
        }
    }, [caseId, navigate, customCases]);

    if (!currentCase) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-slate-400">Carregando caso...</div>
            </div>
        );
    }

    const currentQuestion = currentCase.questions[currentQuestionIndex];

    const handleAnswerSelect = (index: number) => {
        if (showExplanation) return;
        setSelectedAnswer(index);
    };

    const handleConfirmAnswer = () => {
        if (selectedAnswer === null) return;

        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        const points = isCorrect ? currentQuestion.points : 0;

        if (isCorrect) {
            // Correct answer
            changeReputation(0.1);
            const newStreak = consecutiveCorrect + 1;
            setConsecutiveCorrect(newStreak);

            if (newStreak >= 5) {
                changeReputation(0.5); // Bonus for streak
                setConsecutiveCorrect(0); // Reset or keep counting? Usually reset or every 5
            }
        } else {
            // Wrong answer
            changeReputation(-0.2);
            setConsecutiveCorrect(0);
        }

        setAnswers([...answers, { questionId: currentQuestion.id, correct: isCorrect, points }]);
        setScore(score + points);
        setShowExplanation(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < currentCase.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            completeCase(currentCase.id, score);
            setPhase('results');
        }
    };

    const renderIntro = () => (
        <div className="h-full flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-4">
                    <Heart className="w-10 h-10 lg:w-12 lg:h-12 text-cyan-400" />
                </div>
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">{currentCase.title}</h1>
                <p className="text-slate-400 text-sm mb-4">{currentCase.category} • {currentCase.difficulty}</p>

                <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {currentCase.estimatedTime} min
                    </span>
                    <span className="flex items-center gap-1 text-yellow-400">
                        <Trophy className="w-4 h-4" />
                        {currentCase.totalPoints} pts
                    </span>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 max-w-md mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden">
                            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${currentCase.patientName}`} alt="Paciente" className="w-full h-full" />
                        </div>
                        <div>
                            <div className="font-bold text-white">{currentCase.patientName}</div>
                            <div className="text-xs text-slate-400">{currentCase.patientAge} anos, {currentCase.patientGender === 'M' ? 'Masculino' : 'Feminino'}</div>
                        </div>
                    </div>
                    <div className="text-sm text-slate-300">
                        <span className="text-cyan-400 font-medium">Queixa principal:</span> {currentCase.chiefComplaint}
                    </div>
                </div>
            </div>

            <button
                onClick={() => {
                    if (canPlay()) {
                        setPhase('history');
                    }
                }}
                disabled={!canPlay()}
                className={clsx(
                    "w-full font-bold py-3 rounded-xl shadow-lg transition-transform",
                    canPlay()
                        ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-slate-700 text-slate-400 cursor-not-allowed"
                )}
            >
                {canPlay() ? 'Iniciar Caso (-15 Energia)' : 'Muito Cansado (Requer 40% Energia)'}
            </button>
        </div>
    );

    const renderHistory = () => (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4">
                <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                    <h3 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> História Clínica
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{currentCase.history}</p>
                </div>

                <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                    <h3 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Exame Físico
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{currentCase.physicalExam}</p>
                </div>

                <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                    <h3 className="font-bold text-cyan-400 mb-3">Sinais Vitais</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            { label: 'FC', value: `${currentCase.vitalSigns.heartRate} bpm`, icon: '❤️' },
                            { label: 'PA', value: currentCase.vitalSigns.bloodPressure, icon: '🩸' },
                            { label: 'FR', value: `${currentCase.vitalSigns.respiratoryRate} irpm`, icon: '🫁' },
                            { label: 'Temp', value: `${currentCase.vitalSigns.temperature}°C`, icon: '🌡️' },
                            { label: 'SpO2', value: `${currentCase.vitalSigns.oxygenSaturation}%`, icon: '💨' },
                        ].map((vital, i) => (
                            <div key={i} className="bg-slate-900/50 rounded-lg p-2 text-center">
                                <div className="text-lg">{vital.icon}</div>
                                <div className="text-xs text-slate-400">{vital.label}</div>
                                <div className="text-sm font-bold text-white">{vital.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={() => setPhase('exam')}
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform mt-4 flex items-center justify-center gap-2"
            >
                Ver Exames <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );

    const renderExam = () => (
        <div className="h-full flex flex-col">
            {/* Exam Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {currentCase.exams.map((exam, i) => (
                    <button
                        key={i}
                        onClick={() => setExamTab(i)}
                        className={clsx(
                            'px-4 py-2 rounded-full text-xs lg:text-sm whitespace-nowrap transition-colors',
                            examTab === i
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-cyan-500/30'
                        )}
                    >
                        {exam.title}
                    </button>
                ))}
            </div>

            {/* Exam Content */}
            <div className="flex-1 overflow-y-auto">
                {currentCase.exams[examTab] && (
                    <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4">
                        <h3 className="font-bold text-cyan-400 mb-2">{currentCase.exams[examTab].title}</h3>
                        <p className="text-sm text-slate-300 mb-4">{currentCase.exams[examTab].description}</p>

                        {currentCase.exams[examTab].findings && (
                            <div className="space-y-2">
                                <h4 className="text-xs text-slate-400 uppercase">Achados:</h4>
                                {currentCase.exams[examTab].findings!.map((finding, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                        <span className="text-cyan-400">•</span>
                                        {finding}
                                    </div>
                                ))}
                            </div>
                        )}

                        {currentCase.exams[examTab].labResults && (
                            <div className="space-y-2">
                                <h4 className="text-xs text-slate-400 uppercase mb-2">Resultados:</h4>
                                <div className="space-y-2">
                                    {currentCase.exams[examTab].labResults!.map((lab, i) => (
                                        <div key={i} className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2">
                                            <span className="text-sm text-slate-300">{lab.name}</span>
                                            <div className="text-right">
                                                <span className={clsx('text-sm font-bold', lab.isAbnormal ? 'text-red-400' : 'text-emerald-400')}>
                                                    {lab.value} {lab.unit}
                                                </span>
                                                <div className="text-[10px] text-slate-500">Ref: {lab.reference}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={() => setPhase('questions')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform mt-4 flex items-center justify-center gap-2"
            >
                Responder Perguntas <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );

    const renderQuestions = () => (
        <div className="h-full flex flex-col">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / currentCase.questions.length) * 100}%` }}
                    />
                </div>
                <span className="text-xs text-slate-400">{currentQuestionIndex + 1}/{currentCase.questions.length}</span>
            </div>

            {/* Question */}
            <div className="flex-1 overflow-y-auto">
                <div className="bg-slate-800/50 border border-cyan-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-cyan-400" />
                        <span className="text-cyan-400 font-bold text-sm">Questão {currentQuestionIndex + 1}</span>
                        <span className="ml-auto text-xs text-yellow-400">+{currentQuestion.points} pts</span>
                    </div>
                    <p className="text-white font-medium">{currentQuestion.question}</p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    {currentQuestion.options.map((option, i) => {
                        const isSelected = selectedAnswer === i;
                        const isCorrect = i === currentQuestion.correctAnswer;
                        const showResult = showExplanation;

                        return (
                            <button
                                key={i}
                                onClick={() => handleAnswerSelect(i)}
                                disabled={showExplanation}
                                className={clsx(
                                    'w-full p-4 rounded-xl border text-left transition-all',
                                    !showResult && isSelected && 'bg-cyan-500/20 border-cyan-500/50',
                                    !showResult && !isSelected && 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/30',
                                    showResult && isCorrect && 'bg-emerald-500/20 border-emerald-500/50',
                                    showResult && isSelected && !isCorrect && 'bg-red-500/20 border-red-500/50',
                                    showResult && !isSelected && !isCorrect && 'bg-slate-800/30 border-slate-700 opacity-50'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                                        !showResult && isSelected && 'bg-cyan-500 text-white',
                                        !showResult && !isSelected && 'bg-slate-700 text-slate-400',
                                        showResult && isCorrect && 'bg-emerald-500 text-white',
                                        showResult && isSelected && !isCorrect && 'bg-red-500 text-white'
                                    )}>
                                        {showResult && isCorrect ? <CheckCircle className="w-4 h-4" /> :
                                            showResult && isSelected && !isCorrect ? <XCircle className="w-4 h-4" /> :
                                                String.fromCharCode(65 + i)}
                                    </div>
                                    <span className="text-sm text-white">{option}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                    <div className="mt-4 bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4">
                        <h4 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Explicação
                        </h4>
                        <p className="text-sm text-slate-300">{currentQuestion.explanation}</p>
                    </div>
                )}
            </div>

            {/* Action Button */}
            {!showExplanation ? (
                <button
                    onClick={handleConfirmAnswer}
                    disabled={selectedAnswer === null}
                    className={clsx(
                        'w-full font-bold py-3 rounded-xl shadow-lg transition-all mt-4',
                        selectedAnswer !== null
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    )}
                >
                    Confirmar Resposta
                </button>
            ) : (
                <button
                    onClick={handleNextQuestion}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform mt-4"
                >
                    {currentQuestionIndex < currentCase.questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
                </button>
            )}
        </div>
    );

    const renderResults = () => {
        const correctCount = answers.filter(a => a.correct).length;
        const percentage = Math.round((correctCount / currentCase.questions.length) * 100);

        return (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className={clsx(
                    'w-24 h-24 rounded-full flex items-center justify-center mb-4',
                    percentage >= 70 ? 'bg-emerald-500/20 border-2 border-emerald-500' : 'bg-yellow-500/20 border-2 border-yellow-500'
                )}>
                    {percentage >= 70 ? (
                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                    ) : (
                        <AlertCircle className="w-12 h-12 text-yellow-400" />
                    )}
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">
                    {percentage >= 70 ? 'Parabéns!' : 'Continue Praticando!'}
                </h1>
                <p className="text-slate-400 mb-6">Você completou o caso clínico</p>

                <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-6">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                        <div className="text-2xl font-bold text-cyan-400">{correctCount}/{currentCase.questions.length}</div>
                        <div className="text-xs text-slate-400">Acertos</div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                        <div className="text-2xl font-bold text-yellow-400">{score}</div>
                        <div className="text-xs text-slate-400">Pontos</div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                        <div className="text-2xl font-bold text-emerald-400">{percentage}%</div>
                        <div className="text-xs text-slate-400">Aproveitamento</div>
                    </div>
                </div>

                <div className="w-full max-w-md space-y-3">
                    <button
                        onClick={() => navigate('/cases')}
                        className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                        Voltar aos Casos
                    </button>
                    <button
                        onClick={() => {
                            setPhase('intro');
                            setCurrentQuestionIndex(0);
                            setSelectedAnswer(null);
                            setShowExplanation(false);
                            setScore(0);
                            setAnswers([]);
                        }}
                        className="w-full bg-slate-800 text-slate-300 font-bold py-3 rounded-xl border border-slate-700 hover:border-cyan-500/30 transition-colors"
                    >
                        Refazer Caso
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            {phase !== 'results' && (
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => navigate('/cases')}
                        className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/30 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <h2 className="font-bold text-white text-sm truncate">{currentCase.title}</h2>
                        <p className="text-xs text-slate-400">{currentCase.category}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-yellow-400">{score} pts</div>
                        <div className="text-[10px] text-slate-400">Pontuação</div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-h-0">
                {phase === 'intro' && renderIntro()}
                {phase === 'history' && renderHistory()}
                {phase === 'exam' && renderExam()}
                {phase === 'questions' && renderQuestions()}
                {phase === 'results' && renderResults()}
            </div>
        </div>
    );
};
