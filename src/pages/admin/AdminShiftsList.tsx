import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Plus,
    Edit,
    Trash2,
    Stethoscope,
    MapPin,
    Clock,
    Coins,
    FileText,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { loadShifts, deleteShift } from '../../lib/shiftsSync';
import { Shift, shiftDifficultyLabels, shiftDifficultyColors } from '../../lib/shifts';
import { useToastStore } from '../../store/toastStore';
import clsx from 'clsx';

export const AdminShiftsList: React.FC = () => {
    const navigate = useNavigate();
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await loadShifts();
        setShifts(data);
        setLoading(false);
    };

    const handleDelete = async (shift: Shift) => {
        if (!confirm(`Excluir o plantão "${shift.title}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        setDeleting(shift.id);
        const success = await deleteShift(shift.id);

        if (success) {
            useToastStore.getState().addToast('Plantão excluído com sucesso', 'success');
            setShifts(prev => prev.filter(s => s.id !== shift.id));
        } else {
            useToastStore.getState().addToast('Erro ao excluir plantão', 'error');
        }
        setDeleting(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Stethoscope className="w-7 h-7 text-cyan-400" />
                        Gerenciar Plantões
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {shifts.length} plantão(ões) cadastrado(s)
                    </p>
                </div>

                <Link
                    to="/admin/shifts/new"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-lg hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" />
                    Novo Plantão
                </Link>
            </div>

            {/* Empty State */}
            {shifts.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Nenhum plantão cadastrado</h3>
                    <p className="text-slate-400 mb-6">Crie seu primeiro plantão para começar.</p>
                    <Link
                        to="/admin/shifts/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Criar Plantão
                    </Link>
                </div>
            ) : (
                /* Shifts List */
                <div className="space-y-3">
                    {shifts.map((shift) => (
                        <div
                            key={shift.id}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center text-3xl shrink-0">
                                    {shift.icon}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white truncate">{shift.title}</h3>
                                        <span className={clsx(
                                            'px-2 py-0.5 rounded text-[10px] font-bold border',
                                            shiftDifficultyColors[shift.difficulty]
                                        )}>
                                            {shiftDifficultyLabels[shift.difficulty]}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-slate-400 mb-2">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {shift.location}
                                        </span>
                                        <span>•</span>
                                        <span>{shift.specialty}</span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="flex items-center gap-1 text-slate-300">
                                            <Clock className="w-4 h-4 text-slate-500" />
                                            {shift.duration}h
                                        </span>
                                        <span className="flex items-center gap-1 text-yellow-400">
                                            <Coins className="w-4 h-4" />
                                            {shift.payment}
                                        </span>
                                        <span className="flex items-center gap-1 text-slate-300">
                                            <FileText className="w-4 h-4 text-slate-500" />
                                            {shift.cases.length} caso(s)
                                        </span>
                                        <span className="text-slate-500">
                                            Nível {shift.requiredLevel}+
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => navigate(`/admin/shifts/edit/${shift.id}`)}
                                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(shift)}
                                        disabled={deleting === shift.id}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                        title="Excluir"
                                    >
                                        {deleting === shift.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
