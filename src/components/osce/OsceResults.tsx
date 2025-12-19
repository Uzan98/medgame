import React from 'react';
import {
    Star,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Coins,
    Sparkles,
    RotateCcw,
    Home,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOsceStore } from '../../store/osceStore';
import clsx from 'clsx';

export const OsceResults: React.FC = () => {
    const { currentCase, evaluation, reset } = useOsceStore();
    const [showDetails, setShowDetails] = React.useState(false);

    if (!currentCase || !evaluation) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-emerald-500 to-teal-500';
        if (score >= 60) return 'from-yellow-500 to-amber-500';
        if (score >= 40) return 'from-orange-500 to-red-500';
        return 'from-red-500 to-pink-500';
    };

    const getScoreMessage = (score: number) => {
        if (score >= 90) return 'Excelente! Anamnese completa e bem estruturada! 🏆';
        if (score >= 80) return 'Muito bom! Poucos pontos a melhorar. 🌟';
        if (score >= 70) return 'Bom trabalho! Continue praticando. 👍';
        if (score >= 60) return 'Satisfatório. Há espaço para melhoras. 📚';
        if (score >= 50) return 'Regular. Revise os conceitos de anamnese. 📖';
        return 'Precisa melhorar. Pratique mais com outros casos. 💪';
    };

    const categoryLabels: Record<string, string> = {
        queixaPrincipal: 'Queixa Principal',
        hda: 'HDA',
        antecedentes: 'Antecedentes',
        medicacoes: 'Medicações',
        habitos: 'Hábitos',
        revisaoSistemas: 'Revisão de Sistemas'
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {/* Header with Score */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-center relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

                <div className="relative z-10">
                    <h2 className="text-xl font-bold text-white mb-4">Resultado da Avaliação</h2>

                    {/* Main Score */}
                    <div className={clsx(
                        'text-7xl font-black mb-2',
                        getScoreColor(evaluation.scoreTotal)
                    )}>
                        {evaluation.scoreTotal}%
                    </div>

                    <p className="text-slate-300 mb-4">{getScoreMessage(evaluation.scoreTotal)}</p>

                    {/* Rewards */}
                    <div className="flex justify-center gap-4">
                        <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl px-4 py-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            <span className="font-bold text-purple-300">+{evaluation.xpGanho} XP</span>
                        </div>
                        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl px-4 py-2 flex items-center gap-2">
                            <Coins className="w-5 h-5 text-yellow-400" />
                            <span className="font-bold text-yellow-300">+{evaluation.coinsGanho}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score Breakdown */}
            <div className="p-4 space-y-4">
                {/* Score Categories */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'Coleta', score: evaluation.scoreColeta, icon: '📝' },
                        { label: 'Comunicação', score: evaluation.scoreComunicacao, icon: '💬' },
                        { label: 'Prontuário', score: evaluation.scoreProntuario, icon: '📋' },
                        { label: 'Segurança', score: evaluation.scoreSeguranca, icon: '🛡️' },
                        { label: 'Diagnóstico', score: (evaluation as any).scoreDiagnostico, icon: '🎯' },
                        { label: 'Exames', score: (evaluation as any).scoreExames, icon: '🔬' },
                        { label: 'Prescrição', score: (evaluation as any).scorePrescricao, icon: '💊' }
                    ].filter(item => item.score !== undefined).map(({ label, score, icon }) => (
                        <div key={label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">{icon} {label}</span>
                                <span className={clsx('font-bold', getScoreColor(score))}>{score}%</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={clsx('h-full rounded-full bg-gradient-to-r', getScoreGradient(score))}
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Perguntas Essenciais */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        Perguntas Essenciais
                    </h3>

                    <div className="space-y-2">
                        {evaluation.perguntasEssenciaisFeitas.length > 0 && (
                            <div className="space-y-1">
                                {evaluation.perguntasEssenciaisFeitas.slice(0, 5).map((p, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-emerald-300">
                                        <CheckCircle className="w-4 h-4 shrink-0" />
                                        <span>{p}</span>
                                    </div>
                                ))}
                                {evaluation.perguntasEssenciaisFeitas.length > 5 && (
                                    <p className="text-xs text-slate-500 pl-6">
                                        +{evaluation.perguntasEssenciaisFeitas.length - 5} mais...
                                    </p>
                                )}
                            </div>
                        )}

                        {evaluation.perguntasEssenciaisFaltantes.length > 0 && (
                            <div className="space-y-1 mt-3">
                                <p className="text-xs text-red-400 mb-1">Faltou perguntar:</p>
                                {evaluation.perguntasEssenciaisFaltantes.slice(0, 3).map((p, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-red-300">
                                        <XCircle className="w-4 h-4 shrink-0" />
                                        <span>{p}</span>
                                    </div>
                                ))}
                                {evaluation.perguntasEssenciaisFaltantes.length > 3 && (
                                    <p className="text-xs text-slate-500 pl-6">
                                        +{evaluation.perguntasEssenciaisFaltantes.length - 3} mais...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Diagnostic Feedback */}
                {(evaluation as any).diagnosticoFeedback && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                        <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                            🎯 Avaliação Diagnóstica
                            <span className={clsx('ml-auto text-lg', getScoreColor((evaluation as any).scoreDiagnostico))}>
                                {(evaluation as any).scoreDiagnostico}%
                            </span>
                        </h3>
                        <div className="space-y-2">
                            {(evaluation as any).diagnosticoFeedback.acertos.map((item: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-emerald-300">
                                    <CheckCircle className="w-4 h-4 shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                            {(evaluation as any).diagnosticoFeedback.erros.map((item: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-red-300">
                                    <XCircle className="w-4 h-4 shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                            {(evaluation as any).diagnosticoFeedback.faltou.map((item: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-yellow-300">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Exams Feedback */}
                {(evaluation as any).examesFeedback && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                            🔬 Avaliação dos Exames
                            <span className={clsx('ml-auto text-lg', getScoreColor((evaluation as any).scoreExames))}>
                                {(evaluation as any).scoreExames}%
                            </span>
                        </h3>
                        <div className="space-y-2">
                            {(evaluation as any).examesFeedback.adequados.length > 0 && (
                                <div className="text-sm text-emerald-300">
                                    <span className="font-medium">✓ Exames adequados:</span>{' '}
                                    {(evaluation as any).examesFeedback.adequados.join(', ')}
                                </div>
                            )}
                            {(evaluation as any).examesFeedback.desnecessarios.length > 0 && (
                                <div className="text-sm text-orange-300">
                                    <span className="font-medium">⚠ Desnecessários:</span>{' '}
                                    {(evaluation as any).examesFeedback.desnecessarios.join(', ')}
                                </div>
                            )}
                            {(evaluation as any).examesFeedback.faltantes.length > 0 && (
                                <div className="text-sm text-red-300">
                                    <span className="font-medium">✗ Faltaram:</span>{' '}
                                    {(evaluation as any).examesFeedback.faltantes.join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Prescription Feedback */}
                {(evaluation as any).prescricaoFeedback && (
                    <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                        <h3 className="font-bold text-pink-400 mb-3 flex items-center gap-2">
                            💊 Avaliação da Prescrição
                            <span className={clsx('ml-auto text-lg', getScoreColor((evaluation as any).scorePrescricao))}>
                                {(evaluation as any).scorePrescricao}%
                            </span>
                        </h3>
                        <div className="space-y-2">
                            {(evaluation as any).prescricaoFeedback.corretos.map((item: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-emerald-300">
                                    <CheckCircle className="w-4 h-4 shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                            {(evaluation as any).prescricaoFeedback.incorretos.map((item: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-red-300">
                                    <XCircle className="w-4 h-4 shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                            {(evaluation as any).prescricaoFeedback.faltantes.map((item: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-yellow-300">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Erros Graves */}
                {evaluation.errosGraves.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <h3 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Erros Graves
                        </h3>
                        <ul className="space-y-2">
                            {evaluation.errosGraves.map((erro, i) => (
                                <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                                    <span className="shrink-0">•</span>
                                    <span>{erro}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Feedback Educacional */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <h3 className="font-bold text-cyan-400 mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Feedback Educacional
                    </h3>
                    <ul className="space-y-2">
                        {evaluation.feedbackEducacional.map((fb, i) => (
                            <li key={i} className="text-sm text-cyan-200 flex items-start gap-2">
                                <span className="shrink-0">💡</span>
                                <span>{fb}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Qualidade da Escrita */}
                {evaluation.qualidadeEscrita && (
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                        <h3 className="font-bold text-purple-400 mb-4 flex items-center gap-2">
                            ✍️ Qualidade da Escrita
                            <span className={clsx('ml-auto text-lg', getScoreColor(evaluation.qualidadeEscrita.scoreEscrita))}>
                                {evaluation.qualidadeEscrita.scoreEscrita}%
                            </span>
                        </h3>

                        {/* Writing sub-scores */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {[
                                { label: 'Terminologia', score: evaluation.qualidadeEscrita.terminologia.score, icon: '📖' },
                                { label: 'Coesão', score: evaluation.qualidadeEscrita.coesao.score, icon: '🔗' },
                                { label: 'Coerência', score: evaluation.qualidadeEscrita.coerencia.score, icon: '🧩' },
                                { label: 'Estrutura', score: evaluation.qualidadeEscrita.estrutura.score, icon: '🏗️' }
                            ].map(({ label, score, icon }) => (
                                <div key={label} className="flex items-center justify-between bg-slate-800/40 rounded-lg p-2">
                                    <span className="text-xs text-slate-400">{icon} {label}</span>
                                    <span className={clsx('text-sm font-bold', getScoreColor(score))}>{score}%</span>
                                </div>
                            ))}
                        </div>

                        {/* Terminologia - Terms to improve */}
                        {evaluation.qualidadeEscrita.terminologia.termosIncorretos.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs text-purple-300 font-medium mb-1">📝 Termos a melhorar:</p>
                                <ul className="text-xs text-slate-300 space-y-1">
                                    {evaluation.qualidadeEscrita.terminologia.termosIncorretos.slice(0, 5).map((t, i) => (
                                        <li key={i} className="bg-slate-800/40 px-2 py-1 rounded flex items-center gap-2">
                                            <span className="text-red-400">✗</span>
                                            <span>{t}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Good terms used */}
                        {evaluation.qualidadeEscrita.terminologia.termosCorretos.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs text-purple-300 font-medium mb-1">✓ Bom uso de termos:</p>
                                <div className="flex flex-wrap gap-1">
                                    {evaluation.qualidadeEscrita.terminologia.termosCorretos.slice(0, 6).map((t, i) => (
                                        <span key={i} className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* General tips */}
                        {evaluation.qualidadeEscrita.dicasGerais.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs text-purple-300 font-medium mb-1">💡 Dicas de Escrita:</p>
                                <ul className="text-xs text-slate-300 space-y-1">
                                    {evaluation.qualidadeEscrita.dicasGerais.slice(0, 4).map((d, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-purple-400 shrink-0">→</span>
                                            <span>{d}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Example rewrite */}
                        {evaluation.qualidadeEscrita.exemploReescrita && (
                            <div className="mt-3 bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                <p className="text-xs text-teal-400 font-medium mb-2">📝 Exemplo de Reescrita:</p>
                                <p className="text-xs text-slate-300 italic leading-relaxed">
                                    "{evaluation.qualidadeEscrita.exemploReescrita}"
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Detailed Breakdown Toggle */}
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex items-center justify-between text-slate-400 hover:text-white transition-colors"
                >
                    <span className="text-sm">Ver avaliação detalhada por categoria</span>
                    {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {/* Detailed Categories */}
                {showDetails && (
                    <div className="space-y-3">
                        {Object.entries(evaluation.avaliacao).map(([key, cat]) => (
                            <div key={key} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-white">
                                        {categoryLabels[key] || key}
                                    </span>
                                    <span className={clsx('font-bold text-sm', getScoreColor(cat.completude))}>
                                        {cat.completude}%
                                    </span>
                                </div>

                                {cat.faltou.length > 0 && (
                                    <div className="mb-1">
                                        <span className="text-xs text-red-400">Faltou: </span>
                                        <span className="text-xs text-red-300">{cat.faltou.join(', ')}</span>
                                    </div>
                                )}

                                {cat.inventou.length > 0 && (
                                    <div>
                                        <span className="text-xs text-orange-400">Não coletado mas escrito: </span>
                                        <span className="text-xs text-orange-300">{cat.inventou.join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-slate-800/50 border-t border-slate-700 shrink-0 space-y-3">
                <button
                    onClick={reset}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                    <RotateCcw className="w-5 h-5" />
                    Jogar Novamente
                </button>

                <Link
                    to="/games"
                    className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors"
                >
                    <Home className="w-5 h-5" />
                    Voltar aos Jogos
                </Link>
            </div>
        </div>
    );
};
