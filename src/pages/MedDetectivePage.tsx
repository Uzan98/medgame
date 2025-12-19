import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Play,
    Clock,
    AlertTriangle,
    User,
    FileText,
    Stethoscope,
    FlaskConical,
    Lightbulb,
    Plus,
    X,
    Star,
    CheckCircle,
    Heart,
    Activity,
    Thermometer,
    Wind,
    Droplets,
    Brain,
    Send,
    Zap,
    Coins,
    BookOpen,
    Pin,
    Syringe,
    Lock
} from 'lucide-react';
import { useDetectiveStore } from '../store/detectiveStore';
import { useAdminStore } from '../store/adminStore';
import { useGameStore } from '../store/gameStore';
import { EvidenceBoard } from '../components/detective/EvidenceBoard';
import { VitalMonitor } from '../components/detective/VitalMonitor';
import { NarrativePlayer } from '../components/detective/NarrativePlayer';
import clsx from 'clsx';

const urgencyColors = {
    baixa: 'text-green-400 bg-green-500/20 border-green-500/30',
    media: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    alta: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    critica: 'text-red-400 bg-red-500/20 border-red-500/30 animate-pulse'
};

const urgencyLabels = {
    baixa: 'Baixa Urgência',
    media: 'Média Urgência',
    alta: 'Alta Urgência',
    critica: 'CRÍTICO'
};

export const MedDetectivePage: React.FC = () => {
    const store = useDetectiveStore();
    const { customDetectiveCases } = useAdminStore();
    const { addXP, addCoins, completeDetectiveCase, completedDetectiveCases } = useGameStore();
    const [activeTab, setActiveTab] = useState<'investigation' | 'anamnesis' | 'exam' | 'exams' | 'actions'>('investigation');
    const [hypothesisInput, setHypothesisInput] = useState('');
    const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
    const [selectedConduct, setSelectedConduct] = useState('');

    // All cases now come from Supabase
    const cases = customDetectiveCases;
    const currentCase = store.currentCase;

    // Generate decision options (memoized to avoid reshuffling)
    const diagnosisOptions = useMemo(() => {
        if (!currentCase) return [];
        if (currentCase.diagnosisOptions && currentCase.diagnosisOptions.length >= 5) {
            const options = [...currentCase.diagnosisOptions];
            return options.sort(() => Math.random() - 0.5);
        }
        // Generate fake alternatives automatically
        const fakeOptions = [
            'Pneumonia Bacteriana',
            'Tromboembolismo Pulmonar',
            'Insuficiência Cardíaca Descompensada',
            'Sepse de Foco Pulmonar',
            'Crise Asmática Grave',
            'Derrame Pleural',
            'DPOC Exacerbado',
            'Angina Instável',
            'Pericardite Aguda',
            'Dissecção de Aorta'
        ].filter(opt => opt.toLowerCase() !== currentCase.correctDiagnosis.toLowerCase());
        const selected = fakeOptions.sort(() => Math.random() - 0.5).slice(0, 4);
        return [currentCase.correctDiagnosis, ...selected].sort(() => Math.random() - 0.5);
    }, [currentCase?.id]);

    const conductOptions = useMemo(() => {
        if (!currentCase) return [];
        if (currentCase.conductOptions && currentCase.conductOptions.length >= 5) {
            const options = [...currentCase.conductOptions];
            return options.sort(() => Math.random() - 0.5);
        }
        // Generate fake alternatives automatically
        const fakeOptions = [
            'Observação clínica apenas',
            'Alta com analgésicos',
            'Internação para investigação',
            'Encaminhar para cirurgia de emergência',
            'Iniciar antibioticoterapia empírica',
            'Solicitar mais exames antes de decidir',
            'Transferir para UTI',
            'Trombólise imediata',
            'Anticoagulação plena',
            'Suporte ventilatório e observação'
        ].filter(opt => opt.toLowerCase() !== currentCase.correctConduct.toLowerCase());
        const selected = fakeOptions.sort(() => Math.random() - 0.5).slice(0, 4);
        return [currentCase.correctConduct, ...selected].sort(() => Math.random() - 0.5);
    }, [currentCase?.id]);

    // Timer
    useEffect(() => {
        if (store.phase === 'investigation' && !store.isPaused) {
            const timer = setInterval(() => {
                store.tick();
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [store.phase, store.isPaused]);

    // Add rewards and mark case as complete when outcome is calculated
    useEffect(() => {
        if (store.phase === 'feedback' && store.outcome && currentCase) {
            addXP(store.outcome.xpEarned);
            addCoins(store.outcome.coinsEarned);
            // Mark case as completed for progression
            completeDetectiveCase(currentCase.id);
        }
    }, [store.phase, store.outcome, addXP, addCoins, currentCase, completeDetectiveCase]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Case Selection Screen
    // Sort cases by order or createdAt for trail progression
    const sortedCases = [...cases].sort((a, b) => {
        const orderA = a.order ?? a.createdAt ?? 0;
        const orderB = b.order ?? b.createdAt ?? 0;
        return orderA - orderB;
    });

    // Check if a case is unlocked (first case or previous completed)
    const isCaseUnlocked = (caseIndex: number): boolean => {
        if (caseIndex === 0) return true; // First case always unlocked
        const previousCase = sortedCases[caseIndex - 1];
        return completedDetectiveCases.includes(previousCase.id);
    };

    // Check if a case is completed
    const isCaseCompleted = (caseId: string): boolean => {
        return completedDetectiveCases.includes(caseId);
    };

    if (!currentCase) {
        return (
            <div className="h-full flex flex-col overflow-hidden p-4">
                <div className="flex items-center gap-3 mb-6">
                    <Link to="/games" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">🔍 Medical Detective</h1>
                        <p className="text-slate-400">Investigue casos clínicos e salve vidas</p>
                    </div>
                </div>

                {/* Progress indicator */}
                <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Progresso na Trilha</span>
                        <span className="text-sm font-bold text-cyan-400">
                            {completedDetectiveCases.length} / {sortedCases.length} casos
                        </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${(completedDetectiveCases.length / sortedCases.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Horizontal Trail layout */}
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="relative flex items-start gap-6 px-8 py-6 min-w-max">
                        {/* Horizontal trail line */}
                        <div className="absolute top-[52px] left-8 right-8 h-1 bg-gradient-to-r from-cyan-500/50 via-slate-600 to-slate-700 rounded-full" />

                        {sortedCases.map((c, index) => {
                            const unlocked = isCaseUnlocked(index);
                            const completed = isCaseCompleted(c.id);

                            return (
                                <div key={c.id} className="flex flex-col items-center gap-3 w-48 shrink-0">
                                    {/* Node indicator */}
                                    <div className={clsx(
                                        "w-14 h-14 rounded-full flex items-center justify-center border-4 z-10 transition-all shadow-lg",
                                        completed
                                            ? "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/30"
                                            : unlocked
                                                ? "bg-cyan-500 border-cyan-400 text-white animate-pulse shadow-cyan-500/30"
                                                : "bg-slate-700 border-slate-600 text-slate-500"
                                    )}>
                                        {completed ? (
                                            <CheckCircle className="w-7 h-7" />
                                        ) : unlocked ? (
                                            <span className="text-xl font-bold">{index + 1}</span>
                                        ) : (
                                            <Lock className="w-6 h-6" />
                                        )}
                                    </div>

                                    {/* Case card */}
                                    <button
                                        onClick={() => unlocked && store.loadCase(c)}
                                        disabled={!unlocked}
                                        className={clsx(
                                            "w-full p-4 rounded-xl border text-center transition-all min-h-[140px]",
                                            completed
                                                ? "bg-emerald-900/30 border-emerald-600/50 hover:border-emerald-500"
                                                : unlocked
                                                    ? "bg-slate-800/80 border-cyan-500/50 hover:border-cyan-400 hover:scale-105 cursor-pointer shadow-lg shadow-cyan-500/10"
                                                    : "bg-slate-900/50 border-slate-700 opacity-60 cursor-not-allowed"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2",
                                            completed
                                                ? "bg-emerald-500/20"
                                                : unlocked
                                                    ? "bg-gradient-to-br from-cyan-500 to-blue-600"
                                                    : "bg-slate-700"
                                        )}>
                                            {completed ? (
                                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                            ) : unlocked ? (
                                                <Brain className="w-5 h-5 text-white" />
                                            ) : (
                                                <Lock className="w-4 h-4 text-slate-500" />
                                            )}
                                        </div>

                                        <h3 className={clsx(
                                            "font-bold text-sm mb-1 line-clamp-2",
                                            unlocked ? "text-white" : "text-slate-500"
                                        )}>
                                            {c.title}
                                        </h3>

                                        {completed && (
                                            <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                                                ✓ Completo
                                            </span>
                                        )}

                                        {unlocked && !completed && (
                                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-1">
                                                <span className={clsx(
                                                    c.difficulty === 'facil' && 'text-green-400',
                                                    c.difficulty === 'medio' && 'text-yellow-400',
                                                    c.difficulty === 'dificil' && 'text-red-400'
                                                )}>
                                                    {c.difficulty === 'facil' ? '⭐' : c.difficulty === 'medio' ? '⭐⭐' : '⭐⭐⭐'}
                                                </span>
                                            </div>
                                        )}

                                        {!unlocked && (
                                            <p className="text-xs text-slate-600 mt-1">🔒 Bloqueado</p>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Narrative Screen - Cinematographic storytelling
    if (store.phase === 'narrative') {
        return <NarrativePlayer />;
    }

    // Case Intro Screen
    if (store.phase === 'intro') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-lg">
                    <div className={clsx('inline-flex px-4 py-2 rounded-full border mb-6', urgencyColors[currentCase.urgency])}>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        {urgencyLabels[currentCase.urgency]}
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">{currentCase.title}</h1>
                    <p className="text-slate-400 mb-8">{currentCase.subtitle}</p>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8 text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="w-5 h-5 text-cyan-400" />
                            <span className="font-medium text-white">
                                {currentCase.patient.name}, {currentCase.patient.age} anos, {currentCase.patient.gender === 'M' ? 'masculino' : 'feminino'}
                            </span>
                        </div>
                        <p className="text-lg text-slate-300 italic">
                            "{currentCase.patient.chiefComplaint}"
                        </p>
                        <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-5 gap-2 text-center text-sm">
                            <div>
                                <Heart className="w-4 h-4 text-red-400 mx-auto mb-1" />
                                <span className="text-white">{currentCase.patient.vitalSigns.fc}</span>
                            </div>
                            <div>
                                <Activity className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                                <span className="text-white">{currentCase.patient.vitalSigns.pa}</span>
                            </div>
                            <div>
                                <Wind className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                                <span className="text-white">{currentCase.patient.vitalSigns.fr}</span>
                            </div>
                            <div>
                                <Thermometer className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                                <span className="text-white">{currentCase.patient.vitalSigns.temp}°</span>
                            </div>
                            <div>
                                <Droplets className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                                <span className="text-white">{currentCase.patient.vitalSigns.spo2}%</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => store.startCase()}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold text-lg hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
                    >
                        <Play className="w-6 h-6" />
                        Iniciar Investigação
                    </button>

                    <button
                        onClick={() => store.reset()}
                        className="mt-4 text-slate-400 hover:text-white transition-colors"
                    >
                        ← Voltar para lista
                    </button>
                </div>
            </div>
        );
    }

    // Investigation Screen
    if (store.phase === 'investigation') {
        const timeRatio = store.elapsedTime / currentCase.timeLimit;

        return (
            <div className="h-full flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="bg-slate-800/80 border-b border-slate-700 p-3 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className={clsx('px-3 py-1 rounded-full border text-sm', urgencyColors[currentCase.urgency])}>
                                {urgencyLabels[currentCase.urgency]}
                            </span>
                            <span className="text-slate-400 text-sm">
                                💰 R$ {store.totalCost.toFixed(2)}
                            </span>
                        </div>

                        <div className={clsx(
                            'flex items-center gap-2 px-4 py-2 rounded-xl font-mono',
                            timeRatio > 0.8 ? 'bg-red-500/20 text-red-400 animate-pulse' :
                                timeRatio > 0.6 ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-slate-700 text-white'
                        )}>
                            <Clock className="w-5 h-5" />
                            {formatTime(currentCase.timeLimit - store.elapsedTime)}
                        </div>

                        <button
                            onClick={() => store.setPhase('decision')}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg text-white font-medium hover:scale-105 transition-transform"
                        >
                            Tomar Decisão
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden flex gap-4 p-4">
                    {/* Left Panel - Investigation */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-4 shrink-0 flex-wrap">
                            {/* Investigation tab - for unconscious patients */}
                            {currentCase.patient.isUnconscious && currentCase.investigation && (
                                <button
                                    onClick={() => setActiveTab('investigation')}
                                    className={clsx(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                                        activeTab === 'investigation' ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                                    )}
                                >
                                    <User className="w-4 h-4" />
                                    Investigar
                                    <span className="text-xs bg-orange-500/30 px-2 py-0.5 rounded">!</span>
                                </button>
                            )}
                            {/* Anamnesis tab - for conscious patients */}
                            {!currentCase.patient.isUnconscious && currentCase.anamnesis.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('anamnesis')}
                                    className={clsx(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                                        activeTab === 'anamnesis' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                                    )}
                                >
                                    <FileText className="w-4 h-4" />
                                    Anamnese
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('exam')}
                                className={clsx(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                                    activeTab === 'exam' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                                )}
                            >
                                <Stethoscope className="w-4 h-4" />
                                Exame Físico
                            </button>
                            <button
                                onClick={() => setActiveTab('exams')}
                                className={clsx(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                                    activeTab === 'exams' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                                )}
                            >
                                <FlaskConical className="w-4 h-4" />
                                Exames
                                {store.completedExams.length > 0 && (
                                    <span className="w-5 h-5 bg-emerald-500 rounded-full text-xs flex items-center justify-center text-white">
                                        {store.completedExams.length}
                                    </span>
                                )}
                            </button>
                            {/* Actions tab - for critical patients */}
                            {currentCase.actions && currentCase.actions.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('actions')}
                                    className={clsx(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                                        activeTab === 'actions' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                                    )}
                                >
                                    <Syringe className="w-4 h-4" />
                                    Condutas
                                    {store.performedActions.length > 0 && (
                                        <span className="w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                                            {store.performedActions.length}
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            {/* Investigation Tab - for unconscious patients */}
                            {activeTab === 'investigation' && currentCase.investigation && (
                                <div className="space-y-4">
                                    {/* Group by source */}
                                    {(['paramedic', 'family', 'witness', 'belongings'] as const).map((sourceType) => {
                                        const sourceItems = currentCase.investigation!.filter(i => i.source === sourceType);
                                        if (sourceItems.length === 0) return null;

                                        const sourceLabels = {
                                            paramedic: { label: '🚑 Paramédicos', color: 'text-blue-400' },
                                            family: { label: '👨‍👩‍👧 Família', color: 'text-pink-400' },
                                            witness: { label: '👁️ Testemunhas', color: 'text-yellow-400' },
                                            belongings: { label: '📦 Pertences', color: 'text-green-400' }
                                        };

                                        return (
                                            <div key={sourceType}>
                                                <h4 className={clsx('text-sm font-bold mb-2', sourceLabels[sourceType].color)}>
                                                    {sourceLabels[sourceType].label}
                                                </h4>
                                                <div className="space-y-2">
                                                    {sourceItems.map((item) => {
                                                        const revealed = store.revealedAnamnesis.includes(item.id);
                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className={clsx(
                                                                    'p-4 rounded-lg border transition-all',
                                                                    revealed
                                                                        ? 'bg-slate-700/50 border-slate-600'
                                                                        : 'bg-slate-800 border-slate-700 hover:border-orange-500/50 cursor-pointer'
                                                                )}
                                                            >
                                                                <div
                                                                    onClick={() => !revealed && store.revealAnamnesis(item.id)}
                                                                    className={!revealed ? 'cursor-pointer' : ''}
                                                                >
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-sm text-slate-400">{item.sourceName}</span>
                                                                        {item.critical && revealed && <Star className="w-3 h-3 text-yellow-400" />}
                                                                    </div>
                                                                    <p className="font-medium text-white">{item.question}</p>
                                                                    {revealed && (
                                                                        <p className="mt-2 text-slate-300 italic">"{item.answer}"</p>
                                                                    )}
                                                                </div>
                                                                {revealed && (
                                                                    <button
                                                                        onClick={() => store.addClue(item.answer, item.sourceName, 'anamnesis')}
                                                                        className="mt-3 flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                                                                    >
                                                                        <Pin className="w-3 h-3" />
                                                                        Salvar como pista
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === 'anamnesis' && (
                                <div className="space-y-2">
                                    {currentCase.anamnesis.map((item) => {
                                        const revealed = store.revealedAnamnesis.includes(item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                className={clsx(
                                                    'p-4 rounded-lg border transition-all',
                                                    revealed
                                                        ? 'bg-slate-700/50 border-slate-600'
                                                        : 'bg-slate-800 border-slate-700 hover:border-cyan-500/50 cursor-pointer'
                                                )}
                                            >
                                                <div
                                                    onClick={() => !revealed && store.revealAnamnesis(item.id)}
                                                    className={!revealed ? 'cursor-pointer' : ''}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs text-cyan-400 uppercase">{item.category}</span>
                                                        {item.critical && revealed && <Star className="w-3 h-3 text-yellow-400" />}
                                                    </div>
                                                    <p className="font-medium text-white">{item.question}</p>
                                                    {revealed && (
                                                        <p className="mt-2 text-slate-300 italic">"{item.answer}"</p>
                                                    )}
                                                </div>
                                                {revealed && (
                                                    <button
                                                        onClick={() => store.addClue(item.answer, `Anamnese: ${item.question}`, 'anamnesis')}
                                                        className="mt-3 flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                                                    >
                                                        <Pin className="w-3 h-3" />
                                                        Salvar como pista
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === 'exam' && (
                                <div className="space-y-2">
                                    {currentCase.physicalExam.map((item) => {
                                        const revealed = store.revealedExams.includes(item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                className={clsx(
                                                    'p-4 rounded-lg border transition-all',
                                                    revealed
                                                        ? 'bg-slate-700/50 border-slate-600'
                                                        : 'bg-slate-800 border-slate-700 hover:border-cyan-500/50 cursor-pointer'
                                                )}
                                            >
                                                <div
                                                    onClick={() => !revealed && store.revealPhysicalExam(item.id)}
                                                    className={!revealed ? 'cursor-pointer' : ''}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs text-emerald-400 uppercase">{item.system}</span>
                                                        {item.critical && revealed && <Star className="w-3 h-3 text-yellow-400" />}
                                                    </div>
                                                    {revealed ? (
                                                        <p className="text-slate-300">{item.finding}</p>
                                                    ) : (
                                                        <p className="text-slate-400">Clique para examinar</p>
                                                    )}
                                                </div>
                                                {revealed && (
                                                    <button
                                                        onClick={() => store.addClue(item.finding, `Exame: ${item.system}`, 'exam')}
                                                        className="mt-3 flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                                                    >
                                                        <Pin className="w-3 h-3" />
                                                        Salvar como pista
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === 'exams' && (
                                <div className="space-y-2">
                                    {currentCase.exams.map((item) => {
                                        const ordered = store.orderedExams.includes(item.id);
                                        const completed = store.completedExams.includes(item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                className={clsx(
                                                    'p-4 rounded-lg border',
                                                    completed ? 'bg-emerald-500/10 border-emerald-500/30' :
                                                        ordered ? 'bg-yellow-500/10 border-yellow-500/30' :
                                                            'bg-slate-800 border-slate-700'
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <span className="text-xs text-slate-400 uppercase">{item.category}</span>
                                                        <h4 className="font-medium text-white">{item.name?.replace(/\r/g, '')}</h4>
                                                    </div>
                                                    {!ordered && (
                                                        <button
                                                            onClick={() => store.orderExam(item.id)}
                                                            className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
                                                        >
                                                            Solicitar (R${item.cost})
                                                        </button>
                                                    )}
                                                    {ordered && !completed && (
                                                        <span className="text-yellow-400 text-sm animate-pulse">
                                                            ⏳ Aguardando...
                                                        </span>
                                                    )}
                                                    {completed && (
                                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                                    )}
                                                </div>
                                                {completed && (
                                                    <>
                                                        <p className="text-slate-300 text-sm bg-slate-900/50 p-3 rounded-lg mt-2">
                                                            {item.result?.replace(/\r/g, '')}
                                                        </p>
                                                        <button
                                                            onClick={() => store.addClue(item.result?.replace(/\r/g, '') || '', `Exame: ${item.name}`, 'lab')}
                                                            className="mt-2 flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                                                        >
                                                            <Pin className="w-3 h-3" />
                                                            Salvar como pista
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Actions Tab - for critical patients */}
                            {activeTab === 'actions' && currentCase.actions && (
                                <div className="space-y-4">
                                    {/* Action feedback */}
                                    {store.actionFeedback && (
                                        <div
                                            className={clsx(
                                                'p-4 rounded-lg border',
                                                store.actionFeedback.startsWith('✅')
                                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                                    : store.actionFeedback.startsWith('⚠️')
                                                        ? 'bg-red-500/10 border-red-500/30'
                                                        : 'bg-blue-500/10 border-blue-500/30'
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <p className="text-white">{store.actionFeedback}</p>
                                                <button
                                                    onClick={() => store.dismissActionFeedback()}
                                                    className="text-slate-400 hover:text-white"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Group by category */}
                                    {(['airway', 'breathing', 'circulation', 'drugs', 'monitoring', 'procedimento', 'fluidos', 'logistica', 'avaliacao'] as const).map((cat) => {
                                        const catActions = currentCase.actions!.filter(a => a.category === cat);
                                        if (catActions.length === 0) return null;

                                        const catLabels: Record<string, { label: string; color: string }> = {
                                            airway: { label: '🫁 Via Aérea (A)', color: 'text-purple-400' },
                                            breathing: { label: '💨 Respiração (B)', color: 'text-blue-400' },
                                            circulation: { label: '❤️ Circulação (C)', color: 'text-red-400' },
                                            drugs: { label: '💊 Medicações (D)', color: 'text-green-400' },
                                            monitoring: { label: '📊 Monitorização', color: 'text-cyan-400' },
                                            procedimento: { label: '🔧 Procedimentos', color: 'text-orange-400' },
                                            fluidos: { label: '💧 Fluidos', color: 'text-sky-400' },
                                            logistica: { label: '🏥 Logística', color: 'text-pink-400' },
                                            avaliacao: { label: '🔍 Avaliação', color: 'text-amber-400' }
                                        };

                                        return (
                                            <div key={cat}>
                                                <h4 className={clsx('text-sm font-bold mb-2', catLabels[cat].color)}>
                                                    {catLabels[cat].label}
                                                </h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {catActions.map((action) => {
                                                        const performed = store.performedActions.includes(action.id);
                                                        return (
                                                            <button
                                                                key={action.id}
                                                                onClick={() => !performed && store.performAction(action.id)}
                                                                disabled={performed}
                                                                className={clsx(
                                                                    'p-3 rounded-lg border text-left transition-all',
                                                                    performed
                                                                        ? 'bg-slate-700/50 border-slate-600 opacity-60'
                                                                        : 'bg-slate-800 border-slate-700 hover:border-red-500/50 cursor-pointer'
                                                                )}
                                                            >
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="font-medium text-white text-sm">{action.name}</span>
                                                                    {performed && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                                                                </div>
                                                                <p className="text-xs text-slate-400">{action.description}</p>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Monitor + Evidence Board + Hypotheses */}
                    <div className="w-96 shrink-0 flex flex-col gap-4">
                        {/* Vital Signs Monitor */}
                        <VitalMonitor />

                        {/* Evidence Board */}
                        <div className="flex-1 min-h-0 relative">
                            <EvidenceBoard />
                        </div>

                        {/* Compact Hypotheses Panel */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 shrink-0">
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="w-4 h-4 text-yellow-400" />
                                <h3 className="font-bold text-white text-sm">Diagnósticos</h3>
                            </div>

                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={hypothesisInput}
                                    onChange={(e) => setHypothesisInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && hypothesisInput.trim()) {
                                            store.addHypothesis(hypothesisInput.trim());
                                            setHypothesisInput('');
                                        }
                                    }}
                                    placeholder="Adicionar hipótese..."
                                    className="flex-1 px-2 py-1.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                                />
                                <button
                                    onClick={() => {
                                        if (hypothesisInput.trim()) {
                                            store.addHypothesis(hypothesisInput.trim());
                                            setHypothesisInput('');
                                        }
                                    }}
                                    className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="max-h-28 overflow-y-auto space-y-1">
                                {store.hypotheses.length === 0 ? (
                                    <p className="text-slate-500 text-xs text-center py-2">Sem hipóteses</p>
                                ) : (
                                    store.hypotheses.map((h) => (
                                        <div
                                            key={h.id}
                                            className={clsx(
                                                'p-2 rounded-lg text-sm flex items-center gap-2',
                                                h.priority === 'principal'
                                                    ? 'bg-yellow-500/10 text-yellow-400'
                                                    : 'bg-slate-700/50 text-slate-300'
                                            )}
                                        >
                                            <button
                                                onClick={() => store.setPrimaryHypothesis(h.id)}
                                                className={clsx(
                                                    'w-3 h-3 rounded-full border shrink-0',
                                                    h.priority === 'principal'
                                                        ? 'bg-yellow-400 border-yellow-400'
                                                        : 'border-slate-500'
                                                )}
                                            />
                                            <span className="flex-1 truncate">{h.name}</span>
                                            <button
                                                onClick={() => store.removeHypothesis(h.id)}
                                                className="text-slate-500 hover:text-red-400"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Event Notification */}
                {store.activeNotification && (
                    <div className="fixed bottom-4 right-4 max-w-sm bg-slate-800 border border-orange-500/50 rounded-xl p-4 shadow-lg animate-bounce">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-orange-400 shrink-0" />
                            <div>
                                <h4 className="font-bold text-white">{store.activeNotification.title}</h4>
                                <p className="text-sm text-slate-300">{store.activeNotification.description}</p>
                            </div>
                            <button
                                onClick={() => store.dismissNotification()}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Decision Screen - Multiple Choice
    if (store.phase === 'decision') {
        return (
            <div className="h-full flex flex-col overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto w-full">
                    <h1 className="text-2xl font-bold text-white text-center mb-2">⚖️ Hora da Decisão</h1>
                    <p className="text-slate-400 text-center mb-8">Selecione o diagnóstico correto e a conduta adequada</p>

                    <div className="space-y-8">
                        {/* Diagnosis Selection */}
                        <div>
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400">1</span>
                                Qual é o diagnóstico mais provável?
                            </h2>
                            <div className="grid gap-3">
                                {diagnosisOptions.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedDiagnosis(option)}
                                        className={clsx(
                                            'w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4',
                                            selectedDiagnosis === option
                                                ? 'bg-cyan-500/20 border-cyan-500 text-white scale-[1.02]'
                                                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                                        )}
                                    >
                                        <span className={clsx(
                                            'w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0',
                                            selectedDiagnosis === option
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-slate-700 text-slate-400'
                                        )}>
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className="flex-1">{option}</span>
                                        {selectedDiagnosis === option && (
                                            <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Conduct Selection */}
                        <div>
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">2</span>
                                Qual a conduta mais adequada?
                            </h2>
                            <div className="grid gap-3">
                                {conductOptions.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedConduct(option)}
                                        className={clsx(
                                            'w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4',
                                            selectedConduct === option
                                                ? 'bg-emerald-500/20 border-emerald-500 text-white scale-[1.02]'
                                                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                                        )}
                                    >
                                        <span className={clsx(
                                            'w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0',
                                            selectedConduct === option
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-slate-700 text-slate-400'
                                        )}>
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className="flex-1">{option}</span>
                                        {selectedConduct === option && (
                                            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={() => {
                                store.submitDecision(selectedDiagnosis, [], selectedConduct);
                                store.calculateOutcome();
                            }}
                            disabled={!selectedDiagnosis || !selectedConduct}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl text-white font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                        >
                            <Send className="w-5 h-5" />
                            Confirmar Decisão
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Feedback Screen
    if (store.phase === 'feedback' && store.outcome) {
        const isCorrect = store.outcome.diagnosisAccuracy === 'correto';
        const isPartial = store.outcome.diagnosisAccuracy === 'parcial';

        return (
            <div className="h-full overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Result Header */}
                    <div className={clsx(
                        'text-center p-8 rounded-2xl mb-6',
                        isCorrect ? 'bg-emerald-500/20 border border-emerald-500/30' :
                            isPartial ? 'bg-yellow-500/20 border border-yellow-500/30' :
                                'bg-red-500/20 border border-red-500/30'
                    )}>
                        <div className="text-6xl mb-4">
                            {isCorrect ? '🎉' : isPartial ? '🤔' : '❌'}
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {isCorrect ? 'Diagnóstico Correto!' :
                                isPartial ? 'Diagnóstico Parcialmente Correto' :
                                    'Diagnóstico Incorreto'}
                        </h1>
                        <p className="text-slate-300">
                            {isCorrect ? 'Você salvou o paciente!' :
                                isPartial ? 'O paciente foi estabilizado, mas houve atraso no tratamento.' :
                                    'O paciente precisou de cuidados intensivos.'}
                        </p>
                    </div>

                    {/* Rewards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 text-center">
                            <Zap className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-emerald-400">+{store.outcome.xpEarned} XP</div>
                        </div>
                        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                            <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-yellow-400">+{store.outcome.coinsEarned}</div>
                        </div>
                    </div>

                    {/* Correct Diagnosis */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            Diagnóstico Correto
                        </h3>
                        <p className="text-lg text-emerald-400">{currentCase.correctDiagnosis}</p>
                        <p className="text-sm text-slate-400 mt-2">Seu diagnóstico: {store.finalDiagnosis}</p>
                    </div>

                    {/* Critical Clues */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            Pistas Críticas
                        </h3>
                        <ul className="space-y-2">
                            {currentCase.criticalClues.map((clue, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-300">
                                    <span className="text-yellow-400">•</span>
                                    {clue}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Teaching Points */}
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 mb-6">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-cyan-400" />
                            Pontos de Aprendizado
                        </h3>
                        <ul className="space-y-2">
                            {currentCase.teachingPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-300">
                                    <span className="text-cyan-400">📌</span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => store.reset()}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold hover:scale-105 transition-transform"
                        >
                            Próximo Caso
                        </button>
                        <Link
                            to="/games"
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors"
                        >
                            Voltar ao Menu
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
