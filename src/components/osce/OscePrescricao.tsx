import React, { useState } from 'react';
import { Plus, Trash2, Pill, Utensils, Bed, UserPlus, Info, Loader2 } from 'lucide-react';
import { useOsceStore } from '../../store/osceStore';
import type { PrescriptionItem, PrescriptionType } from '../../lib/osceTypes';
import clsx from 'clsx';

const typeConfig: Record<PrescriptionType, { icon: React.ElementType; label: string; color: string }> = {
    medicamento: { icon: Pill, label: 'Medicamento', color: 'text-purple-400 bg-purple-500/20 border-purple-500/30' },
    dieta: { icon: Utensils, label: 'Dieta', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' },
    repouso: { icon: Bed, label: 'Repouso', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
    encaminhamento: { icon: UserPlus, label: 'Encaminhamento', color: 'text-orange-400 bg-orange-500/20 border-orange-500/30' },
    orientacao: { icon: Info, label: 'Orientação', color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30' },
};

export const OscePrescricao: React.FC = () => {
    const { prescription, addPrescriptionItem, removePrescriptionItem, submitFinal, isLoading } = useOsceStore();

    const [newType, setNewType] = useState<PrescriptionType>('medicamento');
    const [newDescription, setNewDescription] = useState('');
    const [newDosage, setNewDosage] = useState('');
    const [newFrequency, setNewFrequency] = useState('');
    const [newDuration, setNewDuration] = useState('');
    const [newNotes, setNewNotes] = useState('');

    const handleAdd = () => {
        if (!newDescription.trim()) return;

        addPrescriptionItem({
            type: newType,
            description: newDescription.trim(),
            dosage: newDosage.trim() || undefined,
            frequency: newFrequency.trim() || undefined,
            duration: newDuration.trim() || undefined,
            notes: newNotes.trim() || undefined,
        });

        setNewDescription('');
        setNewDosage('');
        setNewFrequency('');
        setNewDuration('');
        setNewNotes('');
    };

    const groupedPrescription = prescription.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, {} as Record<PrescriptionType, PrescriptionItem[]>);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 p-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                        <Pill className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Prescrição Médica</h3>
                        <p className="text-sm text-slate-400">
                            Elabore o plano terapêutico completo
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Prescription */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Grouped Items */}
                {Object.entries(groupedPrescription).map(([type, items]) => {
                    const config = typeConfig[type as PrescriptionType];
                    const Icon = config.icon;

                    return (
                        <div key={type} className="space-y-2">
                            <h4 className={clsx("text-sm font-medium flex items-center gap-2", config.color.split(' ')[0])}>
                                <Icon className="w-4 h-4" />
                                {config.label}s
                            </h4>
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className={clsx("border rounded-xl p-3", config.color)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <span className="font-medium text-white">{item.description}</span>
                                            {(item.dosage || item.frequency || item.duration) && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {[item.dosage, item.frequency, item.duration].filter(Boolean).join(' • ')}
                                                </p>
                                            )}
                                            {item.notes && (
                                                <p className="text-xs text-slate-500 mt-1 italic">{item.notes}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removePrescriptionItem(item.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}

                {prescription.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhum item na prescrição</p>
                    </div>
                )}

                {/* Add New Item Form */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 space-y-4">
                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                        <Plus className="w-4 h-4 text-cyan-400" />
                        Adicionar Item
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(typeConfig).map(([type, config]) => {
                            const Icon = config.icon;
                            return (
                                <button
                                    key={type}
                                    onClick={() => setNewType(type as PrescriptionType)}
                                    className={clsx(
                                        "p-2 rounded-lg border text-sm flex items-center gap-2 transition-colors",
                                        newType === type
                                            ? config.color
                                            : "bg-slate-800/50 border-slate-700 text-slate-400"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">
                            {newType === 'medicamento' ? 'Nome do medicamento' : 'Descrição'}
                        </label>
                        <input
                            type="text"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder={newType === 'medicamento' ? 'Ex: Dipirona' : 'Descreva...'}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm"
                        />
                    </div>

                    {newType === 'medicamento' && (
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Dose</label>
                                <input
                                    type="text"
                                    value={newDosage}
                                    onChange={(e) => setNewDosage(e.target.value)}
                                    placeholder="500mg"
                                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Frequência</label>
                                <input
                                    type="text"
                                    value={newFrequency}
                                    onChange={(e) => setNewFrequency(e.target.value)}
                                    placeholder="8/8h"
                                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Duração</label>
                                <input
                                    type="text"
                                    value={newDuration}
                                    onChange={(e) => setNewDuration(e.target.value)}
                                    placeholder="7 dias"
                                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Observações (opcional)</label>
                        <input
                            type="text"
                            value={newNotes}
                            onChange={(e) => setNewNotes(e.target.value)}
                            placeholder="Notas adicionais..."
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm"
                        />
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={!newDescription.trim()}
                        className="w-full py-2 bg-cyan-500/20 text-cyan-400 font-medium rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <div className="p-4 bg-slate-800/50 border-t border-slate-700 shrink-0">
                <button
                    onClick={submitFinal}
                    disabled={isLoading || prescription.length === 0}
                    className={clsx(
                        'w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2',
                        'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
                        'hover:scale-[1.02] active:scale-[0.98]',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                        'shadow-[0_0_30px_rgba(236,72,153,0.3)]'
                    )}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Avaliando...
                        </>
                    ) : (
                        'Finalizar e Ver Avaliação'
                    )}
                </button>
                {prescription.length === 0 && (
                    <p className="text-xs text-slate-500 text-center mt-2">
                        Adicione pelo menos um item na prescrição
                    </p>
                )}
            </div>
        </div>
    );
};
