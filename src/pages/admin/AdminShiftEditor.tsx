import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Image,
    Video,
    Volume2,
    Loader2
} from 'lucide-react';
import { ShiftCase, ShiftQuestion } from '../../lib/shifts';
import {
    loadShifts,
    saveShift,
    saveShiftCase,
    saveShiftQuestion,
    deleteShiftCase,
    deleteShiftQuestion,
    uploadShiftMedia
} from '../../lib/shiftsSync';
import { useToastStore } from '../../store/toastStore';
import clsx from 'clsx';

const emptyQuestion: Omit<ShiftQuestion, 'id'> = {
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    points: 50
};

const emptyCase: Omit<ShiftCase, 'id'> = {
    title: '',
    patientInfo: '',
    description: '',
    mediaType: 'none',
    media: { images: [], video: undefined, audio: undefined },
    questions: [],
    totalPoints: 0
};

export const AdminShiftEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    // Shift form state
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [specialty, setSpecialty] = useState('Emergência');
    const [icon, setIcon] = useState('🏥');
    const [duration, setDuration] = useState(6);
    const [payment, setPayment] = useState(300);
    const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
    const [requiredLevel, setRequiredLevel] = useState(1);
    const [description, setDescription] = useState('');

    // Cases state
    const [cases, setCases] = useState<(ShiftCase & { isNew?: boolean })[]>([]);
    const [expandedCase, setExpandedCase] = useState<string | null>(null);

    // Load existing shift if editing
    useEffect(() => {
        if (isEditing && id) {
            loadExistingShift();
        }
    }, [id, isEditing]);

    const loadExistingShift = async () => {
        setLoading(true);
        const allShifts = await loadShifts();
        const shift = allShifts.find(s => s.id === id);

        if (shift) {
            setTitle(shift.title);
            setLocation(shift.location);
            setSpecialty(shift.specialty);
            setIcon(shift.icon);
            setDuration(shift.duration);
            setPayment(shift.payment);
            setDifficulty(shift.difficulty);
            setRequiredLevel(shift.requiredLevel);
            setDescription(shift.description);
            setCases(shift.cases);
            if (shift.cases.length > 0) {
                setExpandedCase(shift.cases[0].id);
            }
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!title || !location || !specialty) {
            useToastStore.getState().addToast('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        setSaving(true);

        // Save shift
        const shiftId = await saveShift({
            id: isEditing ? id : undefined,
            title,
            location,
            specialty,
            icon,
            duration,
            payment,
            difficulty,
            requiredLevel,
            description
        });

        if (!shiftId) {
            useToastStore.getState().addToast('Erro ao salvar plantão', 'error');
            setSaving(false);
            return;
        }

        // Save cases and questions
        for (let i = 0; i < cases.length; i++) {
            const caseData = cases[i];
            const caseId = await saveShiftCase(shiftId, caseData, i);

            if (caseId && caseData.questions) {
                for (let j = 0; j < caseData.questions.length; j++) {
                    await saveShiftQuestion(caseId, caseData.questions[j], j);
                }
            }
        }

        useToastStore.getState().addToast('Plantão salvo com sucesso!', 'success');
        setSaving(false);
        navigate('/admin/shifts');
    };

    const addCase = () => {
        const newCase = {
            ...emptyCase,
            id: `new-${Date.now()}`,
            isNew: true,
            questions: []
        };
        setCases([...cases, newCase]);
        setExpandedCase(newCase.id);
    };

    const removeCase = async (caseId: string) => {
        const caseData = cases.find(c => c.id === caseId);
        if (!caseData?.isNew && caseId) {
            await deleteShiftCase(caseId);
        }
        setCases(cases.filter(c => c.id !== caseId));
    };

    const updateCase = (caseId: string, updates: Partial<ShiftCase>) => {
        setCases(cases.map(c =>
            c.id === caseId ? { ...c, ...updates } : c
        ));
    };

    const addQuestion = (caseId: string) => {
        setCases(cases.map(c => {
            if (c.id === caseId) {
                return {
                    ...c,
                    questions: [...c.questions, { ...emptyQuestion, id: `new-q-${Date.now()}` }]
                };
            }
            return c;
        }));
    };

    const updateQuestion = (caseId: string, questionId: string, updates: Partial<ShiftQuestion>) => {
        setCases(cases.map(c => {
            if (c.id === caseId) {
                return {
                    ...c,
                    questions: c.questions.map(q =>
                        q.id === questionId ? { ...q, ...updates } : q
                    )
                };
            }
            return c;
        }));
    };

    const removeQuestion = async (caseId: string, questionId: string) => {
        const caseData = cases.find(c => c.id === caseId);
        const question = caseData?.questions.find(q => q.id === questionId);
        if (question && !question.id.startsWith('new-')) {
            await deleteShiftQuestion(questionId);
        }

        setCases(cases.map(c => {
            if (c.id === caseId) {
                return {
                    ...c,
                    questions: c.questions.filter(q => q.id !== questionId)
                };
            }
            return c;
        }));
    };

    const handleMediaUpload = async (caseId: string, type: 'image' | 'video' | 'audio', file: File) => {
        const url = await uploadShiftMedia(file, type);
        if (url) {
            const caseData = cases.find(c => c.id === caseId);
            if (caseData) {
                if (type === 'image') {
                    updateCase(caseId, {
                        media: { ...caseData.media, images: [...(caseData.media.images || []), url] },
                        mediaType: caseData.media.video || caseData.media.audio ? 'mixed' : 'image'
                    });
                } else if (type === 'video') {
                    updateCase(caseId, {
                        media: { ...caseData.media, video: url },
                        mediaType: caseData.media.images?.length || caseData.media.audio ? 'mixed' : 'video'
                    });
                } else if (type === 'audio') {
                    updateCase(caseId, {
                        media: { ...caseData.media, audio: url },
                        mediaType: caseData.media.images?.length || caseData.media.video ? 'mixed' : 'audio'
                    });
                }
            }
            useToastStore.getState().addToast('Mídia enviada com sucesso!', 'success');
        }
    };

    const specialties = ['Emergência', 'Cardiologia', 'Pediatria', 'Neurologia', 'Clínica Médica', 'Cirurgia', 'Ortopedia', 'Psiquiatria'];
    const icons = ['🏥', '🌙', '☀️', '❤️', '🧠', '👶', '🩺', '💉', '🚑', '⚕️'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/shifts')}
                    className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">
                        {isEditing ? 'Editar Plantão' : 'Novo Plantão'}
                    </h1>
                    <p className="text-sm text-slate-400">Preencha as informações do plantão</p>
                </div>
            </div>

            {/* Shift Info */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-white mb-4">Informações do Plantão</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Título *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Plantão Noturno - PS"
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Local *</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Ex: Hospital Central"
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Especialidade *</label>
                        <select
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        >
                            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Ícone</label>
                        <div className="flex gap-2 flex-wrap">
                            {icons.map(i => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setIcon(i)}
                                    className={clsx(
                                        'w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-colors',
                                        icon === i
                                            ? 'bg-cyan-500/20 border-cyan-500'
                                            : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                                    )}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Duração (horas)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min={1}
                            max={24}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Pagamento (MediCoins)</label>
                        <input
                            type="number"
                            value={payment}
                            onChange={(e) => setPayment(Number(e.target.value))}
                            min={0}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Dificuldade</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as any)}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        >
                            <option value="facil">Fácil</option>
                            <option value="medio">Médio</option>
                            <option value="dificil">Difícil</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Nível Mínimo</label>
                        <input
                            type="number"
                            value={requiredLevel}
                            onChange={(e) => setRequiredLevel(Number(e.target.value))}
                            min={1}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="Descreva o plantão..."
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none resize-none"
                    />
                </div>
            </div>

            {/* Cases Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Casos do Plantão</h2>
                    <button
                        onClick={addCase}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Caso
                    </button>
                </div>

                {cases.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        Nenhum caso adicionado. Clique em "Adicionar Caso" para começar.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cases.map((caseData, caseIndex) => (
                            <div key={caseData.id} className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden">
                                {/* Case Header */}
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/50"
                                    onClick={() => setExpandedCase(expandedCase === caseData.id ? null : caseData.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-cyan-500/20 text-cyan-400 rounded-lg flex items-center justify-center font-bold text-sm">
                                            {caseIndex + 1}
                                        </span>
                                        <div>
                                            <h3 className="font-medium text-white">
                                                {caseData.title || 'Novo Caso'}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                {caseData.questions.length} pergunta(s)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeCase(caseData.id); }}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        {expandedCase === caseData.id ? (
                                            <ChevronUp className="w-5 h-5 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Case Content */}
                                {expandedCase === caseData.id && (
                                    <div className="p-4 border-t border-slate-700 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Título do Caso</label>
                                                <input
                                                    type="text"
                                                    value={caseData.title}
                                                    onChange={(e) => updateCase(caseData.id, { title: e.target.value })}
                                                    placeholder="Ex: Dor Torácica Aguda"
                                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Info do Paciente</label>
                                                <input
                                                    type="text"
                                                    value={caseData.patientInfo}
                                                    onChange={(e) => updateCase(caseData.id, { patientInfo: e.target.value })}
                                                    placeholder="Ex: Homem, 55 anos"
                                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Descrição do Caso</label>
                                            <textarea
                                                value={caseData.description}
                                                onChange={(e) => updateCase(caseData.id, { description: e.target.value })}
                                                rows={3}
                                                placeholder="Descreva a apresentação clínica..."
                                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
                                            />
                                        </div>

                                        {/* Media Upload */}
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-2">Mídia</label>
                                            <div className="flex gap-3">
                                                <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:border-cyan-500/50 transition-colors">
                                                    <Image className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm text-slate-300">Imagem</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => e.target.files?.[0] && handleMediaUpload(caseData.id, 'image', e.target.files[0])}
                                                    />
                                                </label>
                                                <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:border-cyan-500/50 transition-colors">
                                                    <Volume2 className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm text-slate-300">Áudio</span>
                                                    <input
                                                        type="file"
                                                        accept="audio/*"
                                                        className="hidden"
                                                        onChange={(e) => e.target.files?.[0] && handleMediaUpload(caseData.id, 'audio', e.target.files[0])}
                                                    />
                                                </label>
                                                <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:border-cyan-500/50 transition-colors">
                                                    <Video className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm text-slate-300">Vídeo</span>
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        className="hidden"
                                                        onChange={(e) => e.target.files?.[0] && handleMediaUpload(caseData.id, 'video', e.target.files[0])}
                                                    />
                                                </label>
                                            </div>

                                            {/* Show uploaded media */}
                                            {((caseData.media.images && caseData.media.images.length > 0) || caseData.media.video || caseData.media.audio) && (
                                                <div className="mt-3 flex gap-2 flex-wrap">
                                                    {caseData.media.images?.map((img, i) => (
                                                        <div key={i} className="relative">
                                                            <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                                                        </div>
                                                    ))}
                                                    {caseData.media.video && (
                                                        <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs flex items-center gap-1">
                                                            <Video className="w-3 h-3" /> Vídeo
                                                        </div>
                                                    )}
                                                    {caseData.media.audio && (
                                                        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-1">
                                                            <Volume2 className="w-3 h-3" /> Áudio
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Questions */}
                                        <div className="border-t border-slate-700 pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-sm text-slate-400">Perguntas</label>
                                                <button
                                                    onClick={() => addQuestion(caseData.id)}
                                                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    Adicionar Pergunta
                                                </button>
                                            </div>

                                            {caseData.questions.length === 0 ? (
                                                <p className="text-sm text-slate-500 text-center py-4">Nenhuma pergunta adicionada.</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {caseData.questions.map((question, qIndex) => (
                                                        <div key={question.id} className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                                <span className="text-xs text-cyan-400 font-bold">Q{qIndex + 1}</span>
                                                                <button
                                                                    onClick={() => removeQuestion(caseData.id, question.id)}
                                                                    className="text-slate-400 hover:text-red-400"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                            <textarea
                                                                value={question.question}
                                                                onChange={(e) => updateQuestion(caseData.id, question.id, { question: e.target.value })}
                                                                placeholder="Pergunta..."
                                                                rows={2}
                                                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm mb-3 resize-none focus:border-cyan-500 focus:outline-none"
                                                            />

                                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                                {question.options.map((opt, optIndex) => (
                                                                    <div key={optIndex} className="flex items-center gap-2">
                                                                        <input
                                                                            type="radio"
                                                                            name={`correct-${question.id}`}
                                                                            checked={question.correctIndex === optIndex}
                                                                            onChange={() => updateQuestion(caseData.id, question.id, { correctIndex: optIndex })}
                                                                            className="text-emerald-500"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={opt}
                                                                            onChange={(e) => {
                                                                                const newOpts = [...question.options];
                                                                                newOpts[optIndex] = e.target.value;
                                                                                updateQuestion(caseData.id, question.id, { options: newOpts });
                                                                            }}
                                                                            placeholder={`Opção ${optIndex + 1}`}
                                                                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:border-cyan-500 focus:outline-none"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <input
                                                                        type="text"
                                                                        value={question.explanation}
                                                                        onChange={(e) => updateQuestion(caseData.id, question.id, { explanation: e.target.value })}
                                                                        placeholder="Explicação da resposta"
                                                                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:border-cyan-500 focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <input
                                                                        type="number"
                                                                        value={question.points}
                                                                        onChange={(e) => updateQuestion(caseData.id, question.id, { points: Number(e.target.value) })}
                                                                        placeholder="Pontos"
                                                                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:border-cyan-500 focus:outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    Salvar Plantão
                </button>
            </div>
        </div>
    );
};
