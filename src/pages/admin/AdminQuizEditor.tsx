import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { QuizCase } from '../../lib/quizCases';

export const AdminQuizEditor: React.FC = () => {
    const navigate = useNavigate();
    const { addQuiz } = useAdminStore();

    const [formData, setFormData] = useState({
        initialInfo: '',
        correctDiagnosis: '',
        explanation: '',
        category: 'Cardiologia',
    });

    const [hints, setHints] = useState<string[]>(['', '', '', '', '']);
    const [wrongOptions, setWrongOptions] = useState<string[]>(['', '', '']);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newQuiz: QuizCase = {
            id: `quiz-${Date.now()}`,
            initialInfo: formData.initialInfo,
            hints: hints.filter(h => h.trim() !== ''),
            correctDiagnosis: formData.correctDiagnosis,
            wrongOptions: wrongOptions.filter(o => o.trim() !== ''),
            explanation: formData.explanation,
            category: formData.category,
        };

        addQuiz(newQuiz);
        navigate('/admin/quizzes');
    };

    const updateHint = (index: number, value: string) => {
        const updated = [...hints];
        updated[index] = value;
        setHints(updated);
    };

    const updateWrongOption = (index: number, value: string) => {
        const updated = [...wrongOptions];
        updated[index] = value;
        setWrongOptions(updated);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/quizzes')}
                        className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">Novo Quiz</h1>
                        <p className="text-sm text-slate-400">Crie um quiz de diagnóstico rápido</p>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                    <h2 className="font-bold text-white mb-4">Informações do Caso</h2>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        >
                            <option>Cardiologia</option>
                            <option>Neurologia</option>
                            <option>Emergência</option>
                            <option>Pediatria</option>
                            <option>Infectologia</option>
                            <option>Nefrologia</option>
                            <option>Pneumologia</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Informação Inicial do Paciente</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.initialInfo}
                            onChange={(e) => setFormData({ ...formData, initialInfo: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none"
                            placeholder="Ex: Homem, 55 anos, chega ao PS com dor torácica há 2 horas..."
                        />
                    </div>
                </div>

                {/* Hints */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="font-bold text-white mb-4">Pistas Progressivas</h2>
                    <p className="text-sm text-slate-400 mb-4">
                        As pistas serão reveladas a cada 5 segundos durante o quiz.
                    </p>
                    <div className="space-y-3">
                        {hints.map((hint, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold shrink-0">
                                    {index + 1}
                                </span>
                                <input
                                    type="text"
                                    value={hint}
                                    onChange={(e) => updateHint(index, e.target.value)}
                                    className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                                    placeholder={`Pista ${index + 1}...`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Answer */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                    <h2 className="font-bold text-white mb-4">Resposta</h2>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Diagnóstico Correto</label>
                        <input
                            type="text"
                            required
                            value={formData.correctDiagnosis}
                            onChange={(e) => setFormData({ ...formData, correctDiagnosis: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium focus:outline-none focus:border-emerald-500"
                            placeholder="Ex: Infarto Agudo do Miocárdio"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Opções Erradas</label>
                        <div className="space-y-2">
                            {wrongOptions.map((option, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateWrongOption(index, e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                                    placeholder={`Opção errada ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Explicação</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.explanation}
                            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none"
                            placeholder="Explique por que este é o diagnóstico correto..."
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/quizzes')}
                        className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        Salvar Quiz
                    </button>
                </div>
            </form>
        </div>
    );
};
