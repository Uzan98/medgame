import React from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { useOsceStore, PRONTUARIO_LABELS, PRONTUARIO_PLACEHOLDERS } from '../../store/osceStore';
import type { ProntuarioData } from '../../lib/osceTypes';
import clsx from 'clsx';

const FIELD_ORDER: (keyof ProntuarioData)[] = [
    'queixaPrincipal',
    'hda',
    'antecedentes',
    'medicacoes',
    'habitos',
    'revisaoSistemas'
];

export const OsceProntuario: React.FC = () => {
    const {
        currentCase,
        prontuario,
        questionsAsked,
        isLoading,
        setProntuarioField,
        submitProntuario
    } = useOsceStore();

    if (!currentCase) return null;

    const handleFieldChange = (field: keyof ProntuarioData, value: string) => {
        setProntuarioField(field, value);
    };

    const getFieldSize = (field: keyof ProntuarioData): 'small' | 'medium' | 'large' => {
        switch (field) {
            case 'queixaPrincipal':
                return 'small';
            case 'hda':
                return 'large';
            case 'antecedentes':
            case 'revisaoSistemas':
                return 'medium';
            default:
                return 'medium';
        }
    };

    const getRowCount = (size: 'small' | 'medium' | 'large'): number => {
        switch (size) {
            case 'small': return 2;
            case 'medium': return 4;
            case 'large': return 6;
        }
    };

    // Calculate completeness
    const filledFields = FIELD_ORDER.filter(field => prontuario[field].trim().length > 0).length;
    const completeness = Math.round((filledFields / FIELD_ORDER.length) * 100);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 p-4 shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Prontuário Médico</h3>
                            <p className="text-sm text-slate-400">
                                Paciente: {currentCase.patientName}
                            </p>
                        </div>
                    </div>

                    {/* Completeness */}
                    <div className="text-right">
                        <div className={clsx(
                            'text-2xl font-bold',
                            completeness >= 80 ? 'text-emerald-400' :
                                completeness >= 50 ? 'text-yellow-400' : 'text-red-400'
                        )}>
                            {completeness}%
                        </div>
                        <p className="text-xs text-slate-400">Preenchido</p>
                    </div>
                </div>

                {/* Completeness Bar */}
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={clsx(
                            'h-full rounded-full transition-all duration-300',
                            completeness >= 80 ? 'bg-emerald-500' :
                                completeness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        )}
                        style={{ width: `${completeness}%` }}
                    />
                </div>
            </div>

            {/* Questions Summary */}
            <div className="bg-slate-900/50 border-b border-slate-700 p-3 shrink-0">
                <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                        <span className="text-sm text-slate-400">
                            📝 Você fez {questionsAsked.length} perguntas na consulta
                        </span>
                        <span className="text-xs text-cyan-400 group-open:hidden">Ver perguntas</span>
                        <span className="text-xs text-cyan-400 hidden group-open:inline">Ocultar</span>
                    </summary>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                        <ul className="text-xs text-slate-500 space-y-1">
                            {questionsAsked.map((q, i) => (
                                <li key={i} className="pl-3 border-l-2 border-slate-700">"{q}"</li>
                            ))}
                        </ul>
                    </div>
                </details>
            </div>

            {/* Form Fields */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {FIELD_ORDER.map((field) => {
                    const size = getFieldSize(field);
                    const rows = getRowCount(size);
                    const label = PRONTUARIO_LABELS[field];
                    const placeholder = PRONTUARIO_PLACEHOLDERS[field];
                    const value = prontuario[field];
                    const isFilled = value.trim().length > 0;

                    return (
                        <div key={field} className="group">
                            <label className={clsx(
                                'block text-sm font-medium mb-2 transition-colors',
                                isFilled ? 'text-emerald-400' : 'text-slate-400'
                            )}>
                                {isFilled && <span className="mr-1">✓</span>}
                                {label}
                            </label>
                            <textarea
                                value={value}
                                onChange={(e) => handleFieldChange(field, e.target.value)}
                                placeholder={placeholder}
                                rows={rows}
                                className={clsx(
                                    'w-full bg-slate-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500',
                                    'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none',
                                    isFilled
                                        ? 'border-emerald-500/30 focus:border-emerald-500'
                                        : 'border-slate-600 focus:border-cyan-500'
                                )}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Submit Area */}
            <div className="p-4 bg-slate-800/50 border-t border-slate-700 shrink-0 space-y-3">
                {/* Warning if incomplete */}
                {completeness < 100 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-sm text-orange-300 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>Você ainda não preencheu todos os campos. Isso pode afetar sua pontuação.</span>
                    </div>
                )}

                <button
                    onClick={submitProntuario}
                    disabled={isLoading || completeness === 0}
                    className={clsx(
                        'w-full py-4 rounded-xl font-bold text-lg transition-all',
                        'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
                        'hover:scale-[1.02] active:scale-[0.98]',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                        'shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                    )}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Avaliando Prontuário...
                        </span>
                    ) : (
                        'Enviar para Avaliação'
                    )}
                </button>
            </div>
        </div>
    );
};
