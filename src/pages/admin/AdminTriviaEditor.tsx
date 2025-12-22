import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useTriviaStore } from '../../store/triviaStore';
import { TRIVIA_CATEGORIES, TriviaQuestion } from '../../lib/triviaTypes';
import clsx from 'clsx';

export const AdminTriviaEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const { questions, addQuestion, updateQuestion, fetchQuestions } = useTriviaStore();

    const isEditing = !!id;
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        categoryId: 'clinica',
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        explanation: ''
    });

    // Load existing question for editing
    useEffect(() => {
        if (isEditing && id) {
            const existingQuestion = questions.find(q => q.id === id);
            if (existingQuestion) {
                setFormData({
                    categoryId: existingQuestion.categoryId,
                    question: existingQuestion.question,
                    options: [...existingQuestion.options],
                    correctIndex: existingQuestion.correctIndex,
                    difficulty: existingQuestion.difficulty,
                    explanation: existingQuestion.explanation || ''
                });
            } else {
                // Question not found, refetch
                fetchQuestions();
            }
        }
    }, [isEditing, id, questions, fetchQuestions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.question.trim()) {
            setError('A pergunta é obrigatória');
            return;
        }

        const filledOptions = formData.options.filter(o => o.trim() !== '');
        if (filledOptions.length < 2) {
            setError('Preencha pelo menos 2 opções');
            return;
        }

        if (formData.correctIndex >= filledOptions.length) {
            setError('Selecione uma resposta correta válida');
            return;
        }

        setIsSaving(true);

        const questionData: Omit<TriviaQuestion, 'id'> = {
            categoryId: formData.categoryId,
            question: formData.question.trim(),
            options: formData.options.filter(o => o.trim() !== ''),
            correctIndex: formData.correctIndex,
            difficulty: formData.difficulty,
            explanation: formData.explanation.trim() || undefined
        };

        let result;
        if (isEditing && id) {
            result = await updateQuestion(id, questionData);
        } else {
            result = await addQuestion(questionData);
        }

        setIsSaving(false);

        if (result.success) {
            navigate('/admin/trivia');
        } else {
            setError(result.error || 'Erro ao salvar pergunta');
        }
    };

    const updateOption = (index: number, value: string) => {
        const updated = [...formData.options];
        updated[index] = value;
        setFormData({ ...formData, options: updated });
    };

    const getCategoryBadge = (categoryId: string) => {
        const cat = TRIVIA_CATEGORIES.find(c => c.id === categoryId);
        if (!cat) return null;
        return (
            <span className={clsx('px-3 py-1 rounded-lg text-sm font-medium', cat.bgColor, 'text-white')}>
                {cat.name}
            </span>
        );
    };

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/trivia')}
                        className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            {isEditing ? 'Editar Pergunta' : 'Nova Pergunta'}
                        </h1>
                        <p className="text-sm text-slate-400">
                            {isEditing ? 'Modifique os campos abaixo' : 'Crie uma nova pergunta para o MedTrivia'}
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Category & Difficulty */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                    <h2 className="font-bold text-white mb-4">Categorização</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                            >
                                {TRIVIA_CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Dificuldade</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                            >
                                <option value="easy">Fácil</option>
                                <option value="medium">Média</option>
                                <option value="hard">Difícil</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2">
                        {getCategoryBadge(formData.categoryId)}
                    </div>
                </div>

                {/* Question */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="font-bold text-white mb-4">Pergunta</h2>

                    <textarea
                        required
                        rows={3}
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none"
                        placeholder="Digite a pergunta aqui..."
                    />
                </div>

                {/* Options */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="font-bold text-white mb-4">Opções de Resposta</h2>
                    <p className="text-sm text-slate-400 mb-4">
                        Clique na letra para marcar como resposta correta
                    </p>

                    <div className="space-y-3">
                        {formData.options.map((option, index) => {
                            const isCorrect = index === formData.correctIndex;
                            const letters = ['A', 'B', 'C', 'D'];

                            return (
                                <div key={index} className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, correctIndex: index })}
                                        className={clsx(
                                            'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all',
                                            isCorrect
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        )}
                                    >
                                        {letters[index]}
                                    </button>
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        className={clsx(
                                            'flex-1 px-4 py-2 bg-slate-900/50 border rounded-xl text-white focus:outline-none',
                                            isCorrect
                                                ? 'border-emerald-500/50 focus:border-emerald-500'
                                                : 'border-slate-700 focus:border-cyan-500'
                                        )}
                                        placeholder={`Opção ${letters[index]}...`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="font-bold text-white mb-4">Explicação (Opcional)</h2>
                    <p className="text-sm text-slate-400 mb-4">
                        Mostrada após o jogador responder
                    </p>

                    <textarea
                        rows={3}
                        value={formData.explanation}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none"
                        placeholder="Explique por que esta é a resposta correta..."
                    />
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/trivia')}
                        className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {isSaving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Pergunta')}
                    </button>
                </div>
            </form>
        </div>
    );
};
