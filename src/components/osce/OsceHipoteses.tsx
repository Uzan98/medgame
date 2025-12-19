import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, Brain } from 'lucide-react';
import { useOsceStore } from '../../store/osceStore';
import type { DiagnosticHypothesis } from '../../lib/osceTypes';
import clsx from 'clsx';

const probabilityColors = {
    alta: 'text-red-400 bg-red-500/20 border-red-500/30',
    media: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    baixa: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
};

const probabilityLabels = {
    alta: 'Alta Probabilidade',
    media: 'Média Probabilidade',
    baixa: 'Baixa Probabilidade (Diferencial)',
};

export const OsceHipoteses: React.FC = () => {
    const { hypotheses, addHypothesis, removeHypothesis, advanceToExames } = useOsceStore();

    const [newDiagnosis, setNewDiagnosis] = useState('');
    const [newProbability, setNewProbability] = useState<DiagnosticHypothesis['probability']>('alta');
    const [newJustification, setNewJustification] = useState('');

    const handleAdd = () => {
        if (!newDiagnosis.trim()) return;

        addHypothesis({
            diagnosis: newDiagnosis.trim(),
            probability: newProbability,
            justification: newJustification.trim()
        });

        setNewDiagnosis('');
        setNewJustification('');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 p-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Hipóteses Diagnósticas</h3>
                        <p className="text-sm text-slate-400">
                            Formule suas hipóteses baseado na anamnese
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Hypotheses */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {hypotheses.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-400">Suas Hipóteses:</h4>
                        {hypotheses.map((hyp) => (
                            <div
                                key={hyp.id}
                                className={clsx(
                                    "bg-slate-800/50 border rounded-xl p-4",
                                    probabilityColors[hyp.probability].replace('text-', 'border-').split(' ')[0] + '/30'
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white">{hyp.diagnosis}</span>
                                            <span className={clsx(
                                                "text-xs px-2 py-0.5 rounded border",
                                                probabilityColors[hyp.probability]
                                            )}>
                                                {probabilityLabels[hyp.probability]}
                                            </span>
                                        </div>
                                        {hyp.justification && (
                                            <p className="text-sm text-slate-400">{hyp.justification}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeHypothesis(hyp.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add New Hypothesis Form */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 space-y-4">
                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                        <Plus className="w-4 h-4 text-cyan-400" />
                        Adicionar Hipótese
                    </h4>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Diagnóstico</label>
                        <input
                            type="text"
                            value={newDiagnosis}
                            onChange={(e) => setNewDiagnosis(e.target.value)}
                            placeholder="Ex: Síndrome Coronariana Aguda"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Probabilidade</label>
                        <select
                            value={newProbability}
                            onChange={(e) => setNewProbability(e.target.value as DiagnosticHypothesis['probability'])}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                            <option value="alta">Alta - Diagnóstico mais provável</option>
                            <option value="media">Média - Deve ser considerado</option>
                            <option value="baixa">Baixa - Diagnóstico diferencial</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Justificativa (opcional)</label>
                        <textarea
                            value={newJustification}
                            onChange={(e) => setNewJustification(e.target.value)}
                            placeholder="Explique por que você considera esse diagnóstico..."
                            rows={2}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={!newDiagnosis.trim()}
                        className="w-full py-2 bg-cyan-500/20 text-cyan-400 font-medium rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Hipótese
                    </button>
                </div>
            </div>

            {/* Action Button */}
            <div className="p-4 bg-slate-800/50 border-t border-slate-700 shrink-0">
                <button
                    onClick={advanceToExames}
                    disabled={hypotheses.length === 0}
                    className={clsx(
                        'w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2',
                        'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                        'hover:scale-[1.02] active:scale-[0.98]',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                        'shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                    )}
                >
                    Solicitar Exames
                    <ChevronRight className="w-5 h-5" />
                </button>
                {hypotheses.length === 0 && (
                    <p className="text-xs text-slate-500 text-center mt-2">
                        Adicione pelo menos uma hipótese diagnóstica
                    </p>
                )}
            </div>
        </div>
    );
};
