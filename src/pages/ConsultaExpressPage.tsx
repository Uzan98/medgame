import React from 'react';
import { Link } from 'react-router-dom';
import {
    Stethoscope,
    ArrowLeft,
    ChevronRight,
    Clock,
    Star,
    Coins,
    Trophy
} from 'lucide-react';
import { useOsceStore } from '../store/osceStore';
import { useGameStore } from '../store/gameStore';
import { useAdminStore } from '../store/adminStore';
import { osceCases } from '../lib/osceCases';
import { OscePatientChat } from '../components/osce/OscePatientChat';
import { OsceProntuario } from '../components/osce/OsceProntuario';
import { OsceResults } from '../components/osce/OsceResults';
import { OsceHipoteses } from '../components/osce/OsceHipoteses';
import { OsceExamRequest } from '../components/osce/OsceExamRequest';
import { OsceExamResults } from '../components/osce/OsceExamResults';
import { OscePrescricao } from '../components/osce/OscePrescricao';
import clsx from 'clsx';

export const ConsultaExpressPage: React.FC = () => {
    const { phase, currentCase, startCase, reset } = useOsceStore();
    const { customOsceCases } = useAdminStore();
    useGameStore(); // For future use (level-locked cases)

    // Merge default and custom cases
    const allCases = [...osceCases, ...customOsceCases];

    const difficultyColors = {
        facil: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
        medio: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
        dificil: 'text-red-400 bg-red-500/20 border-red-500/30'
    };

    const difficultyLabels = {
        facil: 'Fácil',
        medio: 'Médio',
        dificil: 'Difícil'
    };

    // Intro/Case Selection Screen
    if (phase === 'intro') {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                {/* Header */}
                <div className="mb-6 shrink-0">
                    <Link
                        to="/games"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Voltar aos Jogos</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                            <Stethoscope className="w-9 h-9 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Consulta Express</h1>
                            <p className="text-slate-400">Modo OSCE — Anamnese com Paciente IA</p>
                        </div>
                    </div>
                </div>

                {/* How to Play */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/30 rounded-2xl p-4 mb-6 shrink-0">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-cyan-400" />
                        Como Jogar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-cyan-400 font-bold">1</span>
                            </div>
                            <div>
                                <p className="font-medium text-white">Fase 1: Consulta</p>
                                <p className="text-slate-400">Faça perguntas livres ao paciente. Colete informações para a anamnese.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-purple-400 font-bold">2</span>
                            </div>
                            <div>
                                <p className="font-medium text-white">Fase 2: Prontuário</p>
                                <p className="text-slate-400">Escreva a anamnese estruturada. A IA avaliará sua coleta e registro.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Case Selection */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <h2 className="text-lg font-bold text-white mb-4">Escolha um Caso</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allCases.map((osceCase) => (
                            <button
                                key={osceCase.id}
                                onClick={() => startCase(osceCase.id)}
                                className="text-left bg-slate-800/50 border border-slate-700 rounded-2xl p-5 hover:border-cyan-500/50 hover:scale-[1.02] transition-all group"
                            >
                                {/* Patient Avatar and Info */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="text-4xl">{osceCase.patientAvatar}</div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white truncate">{osceCase.title}</h3>
                                        <p className="text-sm text-slate-400">{osceCase.category}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                </div>

                                {/* Case Details */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={clsx(
                                        'text-xs px-2 py-1 rounded-full border',
                                        difficultyColors[osceCase.difficulty]
                                    )}>
                                        {difficultyLabels[osceCase.difficulty]}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {Math.floor(osceCase.timeLimit / 60)} min
                                    </span>
                                </div>

                                {/* Rewards */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-xs text-purple-400">
                                        <Star className="w-3.5 h-3.5" />
                                        <span>+{osceCase.xpReward} XP</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-yellow-400">
                                        <Coins className="w-3.5 h-3.5" />
                                        <span>+{osceCase.coinsReward}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Active Game Phases
    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Compact Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 p-3 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={reset}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                            title="Abandonar caso"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="font-bold text-white text-sm">{currentCase?.title}</h2>
                            <p className="text-xs text-slate-400">
                                {phase === 'consultation' && 'Fase 1: Consulta'}
                                {phase === 'prontuario' && 'Fase 2: Prontuário'}
                                {phase === 'hipoteses' && 'Fase 3: Hipóteses'}
                                {phase === 'exames' && 'Fase 4: Exames'}
                                {phase === 'resultados' && 'Fase 5: Resultados'}
                                {phase === 'prescricao' && 'Fase 6: Prescrição'}
                                {phase === 'results' && 'Resultado Final'}
                            </p>
                        </div>
                    </div>

                    {/* Phase Indicator */}
                    <div className="flex items-center gap-1.5">
                        <div className={clsx('w-2.5 h-2.5 rounded-full', phase === 'consultation' ? 'bg-cyan-500' : 'bg-slate-600')} />
                        <div className={clsx('w-2.5 h-2.5 rounded-full', phase === 'hipoteses' ? 'bg-amber-500' : 'bg-slate-600')} />
                        <div className={clsx('w-2.5 h-2.5 rounded-full', phase === 'exames' ? 'bg-blue-500' : 'bg-slate-600')} />
                        <div className={clsx('w-2.5 h-2.5 rounded-full', phase === 'resultados' ? 'bg-teal-500' : 'bg-slate-600')} />
                        <div className={clsx('w-2.5 h-2.5 rounded-full', phase === 'prescricao' ? 'bg-pink-500' : 'bg-slate-600')} />
                        <div className={clsx('w-2.5 h-2.5 rounded-full', phase === 'results' ? 'bg-emerald-500' : 'bg-slate-600')} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
                {/* Consultation Phase: Chat + Prontuario side by side */}
                {phase === 'consultation' && (
                    <>
                        {/* Left: Patient Chat */}
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-800/30 rounded-xl border border-slate-700">
                            <OscePatientChat />
                        </div>

                        {/* Right: Prontuario */}
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-800/30 rounded-xl border border-slate-700">
                            <OsceProntuario />
                        </div>
                    </>
                )}

                {/* Other phases: single component */}
                {phase !== 'consultation' && phase !== 'results' && (
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        {phase === 'hipoteses' && <OsceHipoteses />}
                        {phase === 'exames' && <OsceExamRequest />}
                        {phase === 'resultados' && <OsceExamResults />}
                        {phase === 'prescricao' && <OscePrescricao />}
                    </div>
                )}

                {/* Results phase */}
                {phase === 'results' && (
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <OsceResults />
                    </div>
                )}
            </div>
        </div>
    );
};
