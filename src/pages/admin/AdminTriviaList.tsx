import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Search, Filter, RefreshCw, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useTriviaStore } from '../../store/triviaStore';
import { TRIVIA_CATEGORIES, TriviaQuestion } from '../../lib/triviaTypes';
import clsx from 'clsx';

export const AdminTriviaList: React.FC = () => {
    const navigate = useNavigate();
    const { questions, isLoading, fetchQuestions, deleteQuestion, addBatchQuestions } = useTriviaStore();

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Batch import state
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchJson, setBatchJson] = useState('');
    const [batchError, setBatchError] = useState<string | null>(null);
    const [isBatchLoading, setIsBatchLoading] = useState(false);
    const [batchResult, setBatchResult] = useState<{ success: boolean; added: number } | null>(null);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    // Filter questions
    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || q.categoryId === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Group by category for display
    const questionsByCategory = TRIVIA_CATEGORIES.map(cat => ({
        category: cat,
        questions: filteredQuestions.filter(q => q.categoryId === cat.id)
    })).filter(group => group.questions.length > 0);

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        const result = await deleteQuestion(id);
        setIsDeleting(false);
        if (result.success) {
            setShowDeleteModal(null);
        }
    };

    // Batch import handler
    const handleBatchImport = async () => {
        setBatchError(null);
        setBatchResult(null);

        try {
            const parsed = JSON.parse(batchJson);

            if (!Array.isArray(parsed)) {
                setBatchError('O JSON deve ser um array de perguntas');
                return;
            }

            // Validate each question
            const validQuestions: Omit<TriviaQuestion, 'id'>[] = [];
            for (let i = 0; i < parsed.length; i++) {
                const q = parsed[i];
                if (!q.categoryId || !q.question || !q.options || q.correctIndex === undefined) {
                    setBatchError(`Pergunta ${i + 1}: campos obrigatórios faltando (categoryId, question, options, correctIndex)`);
                    return;
                }
                if (!Array.isArray(q.options) || q.options.length < 2) {
                    setBatchError(`Pergunta ${i + 1}: options deve ter pelo menos 2 itens`);
                    return;
                }
                validQuestions.push({
                    categoryId: q.categoryId,
                    question: q.question,
                    options: q.options,
                    correctIndex: q.correctIndex,
                    difficulty: q.difficulty || 'medium',
                    explanation: q.explanation
                });
            }

            setIsBatchLoading(true);
            const result = await addBatchQuestions(validQuestions);
            setIsBatchLoading(false);

            if (result.success) {
                setBatchResult({ success: true, added: result.added });
                setBatchJson('');
            } else {
                setBatchError(result.error || 'Erro ao importar perguntas');
            }
        } catch (e: any) {
            setBatchError(`JSON inválido: ${e.message}`);
        }
    };

    const getCategoryColor = (categoryId: string) => {
        const colors: Record<string, string> = {
            clinica: 'bg-red-500/20 text-red-400 border-red-500/30',
            cirurgia: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            pediatria: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            go: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            neuro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            coletiva: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        };
        return colors[categoryId] || 'bg-slate-500/20 text-slate-400';
    };

    const getDifficultyBadge = (difficulty: string) => {
        const styles: Record<string, string> = {
            easy: 'bg-emerald-500/20 text-emerald-400',
            medium: 'bg-yellow-500/20 text-yellow-400',
            hard: 'bg-red-500/20 text-red-400'
        };
        const labels: Record<string, string> = {
            easy: 'Fácil',
            medium: 'Média',
            hard: 'Difícil'
        };
        return (
            <span className={clsx('text-[10px] px-2 py-0.5 rounded', styles[difficulty])}>
                {labels[difficulty]}
            </span>
        );
    };

    // Check if question is from sample data (has simple IDs like c1, s2, etc)
    const isSampleQuestion = (id: string) => /^[a-z]{1,2}\d+$/.test(id);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar perguntas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                        >
                            <option value="all">Todas Categorias</option>
                            {TRIVIA_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => fetchQuestions()}
                        disabled={isLoading}
                        className="p-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={clsx("w-5 h-5", isLoading && "animate-spin")} />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => { setShowBatchModal(true); setBatchError(null); setBatchResult(null); }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-400 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        Importar em Lote
                    </button>
                    <Link
                        to="/admin/trivia/new"
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-400 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Pergunta
                    </Link>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="flex gap-2 flex-wrap">
                {TRIVIA_CATEGORIES.map(cat => {
                    const count = questions.filter(q => q.categoryId === cat.id).length;
                    return (
                        <div
                            key={cat.id}
                            className={clsx(
                                'px-3 py-1.5 rounded-lg text-xs font-medium border',
                                getCategoryColor(cat.id)
                            )}
                        >
                            {cat.name}: {count}
                        </div>
                    );
                })}
            </div>

            {/* Questions List */}
            {isLoading ? (
                <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-slate-500 animate-spin mx-auto mb-2" />
                    <p className="text-slate-400">Carregando perguntas...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {questionsByCategory.map(({ category, questions: catQuestions }) => (
                        <div key={category.id}>
                            <h3 className={clsx(
                                'text-sm font-bold mb-3 flex items-center gap-2',
                                category.textColor
                            )}>
                                <span className={clsx('w-3 h-3 rounded-full', category.bgColor)} />
                                {category.name} ({catQuestions.length})
                            </h3>

                            <div className="space-y-2">
                                {catQuestions.map((question) => {
                                    const isSample = isSampleQuestion(question.id);

                                    return (
                                        <div
                                            key={question.id}
                                            className={clsx(
                                                "bg-slate-800/50 border rounded-xl p-4 transition-colors",
                                                isSample ? "border-slate-700/50 opacity-60" : "border-slate-700"
                                            )}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        {getDifficultyBadge(question.difficulty)}
                                                        {isSample && (
                                                            <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded">
                                                                Exemplo
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-white text-sm mb-2 line-clamp-2">
                                                        {question.question}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {question.options.map((opt, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={clsx(
                                                                    'text-[10px] px-2 py-0.5 rounded',
                                                                    idx === question.correctIndex
                                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                                        : 'bg-slate-700/50 text-slate-500'
                                                                )}
                                                            >
                                                                {opt}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {!isSample && (
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                            onClick={() => navigate(`/admin/trivia/edit/${question.id}`)}
                                                            className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteModal(question.id)}
                                                            className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredQuestions.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-400">Nenhuma pergunta encontrada</p>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-white mb-2">Confirmar Exclusão</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Tem certeza que deseja excluir esta pergunta?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                disabled={isDeleting}
                                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteModal)}
                                disabled={isDeleting}
                                className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-400 disabled:opacity-50"
                            >
                                {isDeleting ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Import Modal */}
            {showBatchModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Importar Perguntas em Lote</h3>
                            <button
                                onClick={() => setShowBatchModal(false)}
                                className="p-1 text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Instructions */}
                        <div className="bg-slate-800/50 rounded-xl p-4 mb-4 text-sm">
                            <p className="text-slate-300 mb-2 font-medium">Formato JSON esperado:</p>
                            <pre className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg overflow-x-auto">
                                {`[
  {
    "categoryId": "clinica",
    "question": "Sua pergunta aqui?",
    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correctIndex": 0,
    "difficulty": "medium",
    "explanation": "Explicação opcional"
  }
]`}
                            </pre>
                            <p className="text-slate-500 mt-2 text-xs">
                                Categorias válidas: clinica, cirurgia, pediatria, go, neuro, coletiva
                            </p>
                        </div>

                        {/* JSON Input */}
                        <textarea
                            value={batchJson}
                            onChange={(e) => setBatchJson(e.target.value)}
                            placeholder="Cole o JSON aqui..."
                            rows={10}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500 resize-none mb-4"
                        />

                        {/* Error Message */}
                        {batchError && (
                            <div className="flex items-start gap-2 bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-red-400 text-sm">{batchError}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {batchResult?.success && (
                            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 mb-4">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                <p className="text-emerald-400 text-sm">
                                    {batchResult.added} pergunta(s) importada(s) com sucesso!
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBatchModal(false)}
                                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={handleBatchImport}
                                disabled={isBatchLoading || !batchJson.trim()}
                                className="flex-1 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-400 disabled:opacity-50 font-medium"
                            >
                                {isBatchLoading ? 'Importando...' : 'Importar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
