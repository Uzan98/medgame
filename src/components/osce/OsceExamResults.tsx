import React, { useState } from 'react';
import { ChevronRight, FileText, AlertTriangle, CheckCircle, XCircle, ZoomIn } from 'lucide-react';
import { useOsceStore } from '../../store/osceStore';
import type { OsceCaseExtended, ExamResult } from '../../lib/osceTypes';
import clsx from 'clsx';

// Default results for demo (when admin hasn't configured)
const defaultResults: Record<string, ExamResult> = {
    'hemograma': { examId: 'hemograma', examName: 'Hemograma Completo', result: 'Hb: 14.2 g/dL, Ht: 42%, Leucócitos: 8.500/mm³, Plaquetas: 250.000/mm³', isAbnormal: false },
    'glicemia': { examId: 'glicemia', examName: 'Glicemia de Jejum', result: '95 mg/dL', isAbnormal: false },
    'ureia-creatinina': { examId: 'ureia-creatinina', examName: 'Uréia e Creatinina', result: 'Uréia: 35 mg/dL, Creatinina: 0.9 mg/dL', isAbnormal: false },
    'eletrolitos': { examId: 'eletrolitos', examName: 'Eletrólitos', result: 'Na: 140 mEq/L, K: 4.2 mEq/L, Cl: 102 mEq/L', isAbnormal: false },
    'troponina': { examId: 'troponina', examName: 'Troponina', result: '0.8 ng/mL (VR < 0.04)', isAbnormal: true, criticalFindings: ['Troponina elevada - sugestivo de lesão miocárdica'] },
    'ecg': { examId: 'ecg', examName: 'ECG', result: 'Supradesnivelamento de ST em DII, DIII, aVF. FC: 88bpm. Ritmo sinusal.', isAbnormal: true, criticalFindings: ['Supra ST em parede inferior'] },
    'rx-torax': { examId: 'rx-torax', examName: 'Raio-X de Tórax', result: 'Área cardíaca normal. Campos pulmonares limpos. Seios costofrênicos livres.', isAbnormal: false },
    'dimer-d': { examId: 'dimer-d', examName: 'D-Dímero', result: '250 ng/mL (VR < 500)', isAbnormal: false },
    'bnp': { examId: 'bnp', examName: 'BNP', result: '180 pg/mL (VR < 100)', isAbnormal: true, criticalFindings: ['BNP levemente elevado'] },
    'gasometria': { examId: 'gasometria', examName: 'Gasometria Arterial', result: 'pH: 7.42, pCO2: 38, pO2: 92, HCO3: 24, SatO2: 97%', isAbnormal: false },
};

export const OsceExamResults: React.FC = () => {
    const { currentCase, requestedExams, revealedResults, advanceToPrescricao } = useOsceStore();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const extendedCase = currentCase as OsceCaseExtended | null;

    const getResultForExam = (examId: string): ExamResult | null => {
        // First check if case has configured results
        if (extendedCase?.examResults) {
            const configured = extendedCase.examResults.find(r => r.examId === examId);
            if (configured) return configured;
        }
        // Fall back to default results
        return defaultResults[examId] || null;
    };

    const revealedExamResults = revealedResults
        .map(examId => getResultForExam(examId))
        .filter((r): r is ExamResult => r !== null);

    const abnormalCount = revealedExamResults.filter(r => r.isAbnormal).length;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 p-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Resultados dos Exames</h3>
                            <p className="text-sm text-slate-400">
                                Analise os resultados para confirmar seu diagnóstico
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="text-center">
                            <div className="text-lg font-bold text-emerald-400">{revealedExamResults.length - abnormalCount}</div>
                            <p className="text-[10px] text-slate-400">Normais</p>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-red-400">{abnormalCount}</div>
                            <p className="text-[10px] text-slate-400">Alterados</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {revealedExamResults.map((result) => (
                    <div
                        key={result.examId}
                        className={clsx(
                            "bg-slate-800/50 border rounded-xl p-4",
                            result.isAbnormal ? "border-red-500/30" : "border-slate-700"
                        )}
                    >
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                                {result.isAbnormal ? (
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                )}
                                <h4 className="font-bold text-white">{result.examName}</h4>
                            </div>
                            {result.imageUrl && (
                                <button
                                    onClick={() => setSelectedImage(result.imageUrl!)}
                                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-sm"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                    Ver Imagem
                                </button>
                            )}
                        </div>

                        <div className="bg-slate-900/50 rounded-lg p-3 mb-2">
                            <p className="text-sm text-slate-200 font-mono">{result.result}</p>
                        </div>

                        {result.interpretation && (
                            <p className="text-sm text-slate-400 italic mb-2">{result.interpretation}</p>
                        )}

                        {result.criticalFindings && result.criticalFindings.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                <p className="text-xs text-red-400 font-medium mb-1">⚠️ Achados Críticos:</p>
                                <ul className="text-sm text-red-300 space-y-1">
                                    {result.criticalFindings.map((finding, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <XCircle className="w-3 h-3 mt-1 shrink-0" />
                                            {finding}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}

                {requestedExams.length > revealedResults.length && (
                    <div className="text-center py-4">
                        <p className="text-sm text-slate-500">
                            Aguardando mais {requestedExams.length - revealedResults.length} resultado(s)...
                        </p>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="p-4 bg-slate-800/50 border-t border-slate-700 shrink-0">
                <button
                    onClick={advanceToPrescricao}
                    className={clsx(
                        'w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2',
                        'bg-gradient-to-r from-teal-500 to-emerald-500 text-white',
                        'hover:scale-[1.02] active:scale-[0.98]',
                        'shadow-[0_0_30px_rgba(20,184,166,0.3)]'
                    )}
                >
                    Elaborar Prescrição
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="max-w-4xl max-h-full">
                        <img
                            src={selectedImage}
                            alt="Resultado do exame"
                            className="max-w-full max-h-[80vh] rounded-lg"
                        />
                        <p className="text-center text-slate-400 mt-2 text-sm">Clique para fechar</p>
                    </div>
                </div>
            )}
        </div>
    );
};
