import React from 'react';
import { ChevronRight, FlaskConical, Plus, Check } from 'lucide-react';
import { useOsceStore } from '../../store/osceStore';
import type { OsceCaseExtended, AvailableExam } from '../../lib/osceTypes';
import clsx from 'clsx';

const categoryIcons: Record<AvailableExam['category'], string> = {
    laboratorio: '🧪',
    imagem: '📷',
    funcional: '📊',
    outros: '🔬',
};

const categoryLabels: Record<AvailableExam['category'], string> = {
    laboratorio: 'Laboratório',
    imagem: 'Imagem',
    funcional: 'Funcional',
    outros: 'Outros',
};

// Default exams if case doesn't have configured ones
const defaultExams: AvailableExam[] = [
    { id: 'hemograma', name: 'Hemograma Completo', category: 'laboratorio' },
    { id: 'glicemia', name: 'Glicemia de Jejum', category: 'laboratorio' },
    { id: 'ureia-creatinina', name: 'Uréia e Creatinina', category: 'laboratorio' },
    { id: 'eletrolitos', name: 'Eletrólitos (Na, K, Cl)', category: 'laboratorio' },
    { id: 'tgo-tgp', name: 'TGO/TGP', category: 'laboratorio' },
    { id: 'troponina', name: 'Troponina', category: 'laboratorio' },
    { id: 'bnp', name: 'BNP/NT-proBNP', category: 'laboratorio' },
    { id: 'dimer-d', name: 'D-Dímero', category: 'laboratorio' },
    { id: 'pcr', name: 'PCR', category: 'laboratorio' },
    { id: 'eas', name: 'EAS (Urina)', category: 'laboratorio' },
    { id: 'gasometria', name: 'Gasometria Arterial', category: 'laboratorio' },
    { id: 'ecg', name: 'ECG (Eletrocardiograma)', category: 'funcional' },
    { id: 'rx-torax', name: 'Raio-X de Tórax', category: 'imagem' },
    { id: 'tc-torax', name: 'TC de Tórax', category: 'imagem' },
    { id: 'eco', name: 'Ecocardiograma', category: 'imagem' },
    { id: 'usg-abdominal', name: 'USG Abdominal', category: 'imagem' },
    { id: 'tc-cranio', name: 'TC de Crânio', category: 'imagem' },
];

export const OsceExamRequest: React.FC = () => {
    const { currentCase, requestedExams, requestExam, advanceToResultados } = useOsceStore();

    const extendedCase = currentCase as OsceCaseExtended | null;
    const availableExams = extendedCase?.availableExams?.length
        ? extendedCase.availableExams
        : defaultExams;

    // Group by category
    const examsByCategory = availableExams.reduce((acc, exam) => {
        if (!acc[exam.category]) acc[exam.category] = [];
        acc[exam.category].push(exam);
        return acc;
    }, {} as Record<string, AvailableExam[]>);

    const toggleExam = (examId: string) => {
        requestExam(examId);
    };

    const isSelected = (examId: string) => requestedExams.includes(examId);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 p-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <FlaskConical className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Solicitação de Exames</h3>
                            <p className="text-sm text-slate-400">
                                Selecione os exames para confirmar suas hipóteses
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-cyan-400">{requestedExams.length}</div>
                        <p className="text-xs text-slate-400">selecionados</p>
                    </div>
                </div>
            </div>

            {/* Exams by Category */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {Object.entries(examsByCategory).map(([category, exams]) => (
                    <div key={category}>
                        <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                            <span>{categoryIcons[category as AvailableExam['category']]}</span>
                            {categoryLabels[category as AvailableExam['category']]}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {exams.map((exam) => (
                                <button
                                    key={exam.id}
                                    onClick={() => toggleExam(exam.id)}
                                    className={clsx(
                                        "text-left p-3 rounded-xl border transition-all",
                                        isSelected(exam.id)
                                            ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                                            : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{exam.name}</span>
                                        {isSelected(exam.id) ? (
                                            <Check className="w-4 h-4 text-blue-400" />
                                        ) : (
                                            <Plus className="w-4 h-4 text-slate-500" />
                                        )}
                                    </div>
                                    {exam.description && (
                                        <p className="text-xs text-slate-500 mt-1">{exam.description}</p>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Button */}
            <div className="p-4 bg-slate-800/50 border-t border-slate-700 shrink-0">
                <button
                    onClick={advanceToResultados}
                    disabled={requestedExams.length === 0}
                    className={clsx(
                        'w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2',
                        'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
                        'hover:scale-[1.02] active:scale-[0.98]',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                        'shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                    )}
                >
                    Ver Resultados
                    <ChevronRight className="w-5 h-5" />
                </button>
                {requestedExams.length === 0 && (
                    <p className="text-xs text-slate-500 text-center mt-2">
                        Selecione pelo menos um exame
                    </p>
                )}
            </div>
        </div>
    );
};
