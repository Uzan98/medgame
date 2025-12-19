import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, ChevronRight, Search, Heart, Brain, Bone, Activity } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { sampleCases } from '../../lib/cases';
import clsx from 'clsx';

const categoryIcons: Record<string, React.ElementType> = {
    'Cardiologia': Heart,
    'Neurologia': Brain,
    'Ortopedia': Bone,
    'default': Activity,
};

export const AdminCasesList: React.FC = () => {
    const navigate = useNavigate();
    const { customCases, deleteCase } = useAdminStore();
    const [search, setSearch] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

    const allCases = [...sampleCases, ...customCases];
    const filteredCases = allCases.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id: string) => {
        deleteCase(id);
        setShowDeleteModal(null);
    };

    const isCustom = (id: string) => customCases.some(c => c.id === id);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar casos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <Link
                    to="/admin/cases/new"
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-400 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Novo Caso
                </Link>
            </div>

            {/* Cases List */}
            <div className="space-y-3">
                {filteredCases.map((case_) => {
                    const Icon = categoryIcons[case_.category] || categoryIcons.default;
                    const custom = isCustom(case_.id);

                    return (
                        <div
                            key={case_.id}
                            className={clsx(
                                "bg-slate-800/50 border rounded-xl p-4 transition-colors",
                                custom ? "border-cyan-500/30" : "border-slate-700"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                                    <Icon className="w-6 h-6 text-cyan-400" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white truncate">{case_.title}</h3>
                                        {custom && (
                                            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                                                Personalizado
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span>{case_.category}</span>
                                        <span>•</span>
                                        <span className="capitalize">{case_.difficulty}</span>
                                        <span>•</span>
                                        <span>{case_.questions.length} questões</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {custom && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/admin/cases/edit/${case_.id}`)}
                                                className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteModal(case_.id)}
                                                className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    <ChevronRight className="w-5 h-5 text-slate-600" />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredCases.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-400">Nenhum caso encontrado</p>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-white mb-2">Confirmar Exclusão</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Tem certeza que deseja excluir este caso? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteModal)}
                                className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-400"
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
