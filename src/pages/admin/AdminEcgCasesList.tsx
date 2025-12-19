import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Search, Heart, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToastStore } from '../../store/toastStore';
import type { EcgCase } from '../../lib/ecgTypes';
import clsx from 'clsx';

const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    hard: 'text-red-400 bg-red-500/20 border-red-500/30',
};

const difficultyLabels = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
};

export const AdminEcgCasesList: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToastStore();
    const [cases, setCases] = useState<EcgCase[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

    // Load cases from Supabase
    const loadCases = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('ecg_cases')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCases(data || []);
        } catch (err) {
            console.error('Error loading ECG cases:', err);
            addToast('Erro ao carregar casos', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCases();
    }, []);

    const filteredCases = cases.filter(c =>
        c.clinical_context.toLowerCase().includes(search.toLowerCase()) ||
        c.correct_answer.toLowerCase().includes(search.toLowerCase()) ||
        c.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('ecg_cases')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setCases(cases.filter(c => c.id !== id));
            addToast('Caso excluído!', 'success');
        } catch (err) {
            console.error('Error deleting case:', err);
            addToast('Erro ao excluir caso', 'error');
        }
        setShowDeleteModal(null);
    };

    const toggleActive = async (id: string, currentActive: boolean) => {
        try {
            const { error } = await supabase
                .from('ecg_cases')
                .update({ is_active: !currentActive })
                .eq('id', id);

            if (error) throw error;

            setCases(cases.map(c =>
                c.id === id ? { ...c, is_active: !currentActive } : c
            ));
            addToast(currentActive ? 'Caso desativado' : 'Caso ativado', 'success');
        } catch (err) {
            console.error('Error toggling case:', err);
            addToast('Erro ao alterar status', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">🫀 Casos de ECG</h1>
                    <p className="text-slate-400">Gerencie os casos do game "Diagnostique o ECG"</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadCases}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
                        Atualizar
                    </button>
                    <Link
                        to="/admin/ecg/new"
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white font-medium flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Caso
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar casos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{cases.length}</div>
                    <div className="text-sm text-slate-400">Total</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">{cases.filter(c => c.is_active).length}</div>
                    <div className="text-sm text-slate-400">Ativos</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{cases.filter(c => c.difficulty === 'medium').length}</div>
                    <div className="text-sm text-slate-400">Médio</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{cases.filter(c => c.difficulty === 'hard').length}</div>
                    <div className="text-sm text-slate-400">Difícil</div>
                </div>
            </div>

            {/* Cases List */}
            {loading ? (
                <div className="text-center py-12 text-slate-400">Carregando...</div>
            ) : filteredCases.length === 0 ? (
                <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">Nenhum caso encontrado</p>
                    <Link
                        to="/admin/ecg/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Criar primeiro caso
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredCases.map(ecgCase => (
                        <div
                            key={ecgCase.id}
                            className={clsx(
                                "bg-slate-800/50 border rounded-xl p-4 transition-all",
                                ecgCase.is_active ? "border-slate-700" : "border-slate-700/50 opacity-60"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                {/* ECG Thumbnail */}
                                <img
                                    src={ecgCase.ecg_image_url}
                                    alt="ECG"
                                    className="w-24 h-16 object-cover rounded-lg border border-slate-600 shrink-0"
                                />

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={clsx(
                                            'text-xs px-2 py-0.5 rounded-full border',
                                            difficultyColors[ecgCase.difficulty]
                                        )}>
                                            {difficultyLabels[ecgCase.difficulty]}
                                        </span>
                                        {!ecgCase.is_active && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-600 text-slate-300">
                                                Inativo
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-medium text-white truncate">{ecgCase.correct_answer}</h3>
                                    <p className="text-sm text-slate-400 line-clamp-2">{ecgCase.clinical_context}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                        <span>🎯 {ecgCase.xp_reward} XP</span>
                                        <span>💰 {ecgCase.coins_reward} coins</span>
                                        <span>📊 {ecgCase.alternatives?.length || 0} alternativas</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => toggleActive(ecgCase.id, ecgCase.is_active)}
                                        className={clsx(
                                            "p-2 rounded-lg transition-colors",
                                            ecgCase.is_active
                                                ? "text-emerald-400 hover:bg-emerald-500/20"
                                                : "text-slate-400 hover:bg-slate-700"
                                        )}
                                        title={ecgCase.is_active ? "Desativar" : "Ativar"}
                                    >
                                        {ecgCase.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/ecg/${ecgCase.id}`)}
                                        className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(ecgCase.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-white mb-4">Confirmar Exclusão</h3>
                        <p className="text-slate-300 mb-6">
                            Tem certeza que deseja excluir este caso de ECG? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteModal)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
