import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Loader2,
    Check
} from 'lucide-react';
import { savePlantaoCase, loadAllPlantaoCases } from '../../lib/plantaoSync';
import { useToastStore } from '../../store/toastStore';
import clsx from 'clsx';

const specialties = ['Clínica', 'Cardio', 'Neuro', 'Pediatria', 'Trauma', 'Cirurgia', 'Ortopedia'];

export const AdminPlantaoCaseEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = id && id !== 'new';

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [specialty, setSpecialty] = useState('Clínica');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (isEditing) {
            loadCase();
        }
    }, [id]);

    const loadCase = async () => {
        const cases = await loadAllPlantaoCases();
        const caseData = cases.find(c => c.id === id);
        if (caseData) {
            setSpecialty(caseData.specialty);
            setQuestion(caseData.question);
            setOptions(caseData.options);
            setCorrectIndex(caseData.correct_index);
            setIsActive(caseData.is_active ?? true);
        }
        setLoading(false);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSave = async () => {
        if (!question.trim()) {
            useToastStore.getState().addToast('Preencha a pergunta', 'error');
            return;
        }
        if (options.some(o => !o.trim())) {
            useToastStore.getState().addToast('Preencha todas as opções', 'error');
            return;
        }

        setSaving(true);
        const result = await savePlantaoCase({
            id: isEditing ? id : undefined,
            specialty,
            question,
            options,
            correct_index: correctIndex,
            is_active: isActive
        });

        setSaving(false);

        if (result) {
            useToastStore.getState().addToast('Caso salvo com sucesso!', 'success');
            navigate('/admin/plantao');
        } else {
            useToastStore.getState().addToast('Erro ao salvar caso', 'error');
        }
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
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/plantao')}
                    className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">
                        {isEditing ? 'Editar Caso' : 'Novo Caso'}
                    </h1>
                    <p className="text-sm text-slate-400">Plantão Infinito</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-6">
                {/* Specialty */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Especialidade
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {specialties.map(s => (
                            <button
                                key={s}
                                onClick={() => setSpecialty(s)}
                                className={clsx(
                                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                    specialty === s
                                        ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50'
                                        : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500'
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Pergunta
                    </label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ex: Paciente 45 anos, dor torácica há 2h, ECG com supra ST V1-V4. Conduta?"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
                        rows={3}
                    />
                </div>

                {/* Options */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Opções de Resposta
                    </label>
                    <div className="space-y-3">
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <button
                                    onClick={() => setCorrectIndex(index)}
                                    className={clsx(
                                        'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all shrink-0',
                                        correctIndex === index
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                    )}
                                >
                                    {correctIndex === index ? <Check className="w-5 h-5" /> : String.fromCharCode(65 + index)}
                                </button>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                                    className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Clique na letra para definir a resposta correta (marcada em verde)
                    </p>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={clsx(
                            'w-12 h-6 rounded-full transition-all relative',
                            isActive ? 'bg-emerald-500' : 'bg-slate-600'
                        )}
                    >
                        <div className={clsx(
                            'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all',
                            isActive ? 'left-6' : 'left-0.5'
                        )} />
                    </button>
                    <span className="text-sm text-slate-300">
                        {isActive ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-[1.01] transition-transform disabled:opacity-50"
            >
                {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Save className="w-5 h-5" />
                )}
                {saving ? 'Salvando...' : 'Salvar Caso'}
            </button>
        </div>
    );
};
