import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { ClinicalCase, ClinicalQuestion, VitalSigns, ExamResult, LabResult } from '../../lib/cases';
import clsx from 'clsx';

const emptyVitals: VitalSigns = {
    heartRate: 80,
    bloodPressure: '120/80',
    respiratoryRate: 16,
    temperature: 36.5,
    oxygenSaturation: 98,
};

const emptyQuestion: ClinicalQuestion = {
    id: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points: 100,
};

const emptyExam: ExamResult = {
    type: 'ecg',
    title: '',
    description: '',
    findings: [],
};

const emptyLabResult: LabResult = {
    name: '',
    value: '',
    unit: '',
    reference: '',
    isAbnormal: false,
};

const examTypes = [
    { value: 'ecg', label: 'ECG' },
    { value: 'xray', label: 'Raio-X' },
    { value: 'ct', label: 'Tomografia' },
    { value: 'mri', label: 'Ressonância' },
    { value: 'ultrasound', label: 'Ultrassom' },
    { value: 'lab', label: 'Laboratorial' },
];

export const AdminCaseEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { addCase, updateCase, customCases } = useAdminStore();

    const isEditing = Boolean(id);
    const existingCase = isEditing ? customCases.find(c => c.id === id) : null;

    const [formData, setFormData] = useState({
        title: '',
        patientName: '',
        patientAge: 45,
        patientGender: 'M' as 'M' | 'F',
        chiefComplaint: '',
        history: '',
        physicalExam: '',
        category: 'Cardiologia',
        difficulty: 'medio' as 'facil' | 'medio' | 'dificil',
        estimatedTime: 15,
        requiredLevel: 1,
    });

    const [vitals, setVitals] = useState<VitalSigns>(emptyVitals);
    const [exams, setExams] = useState<ExamResult[]>([]);
    const [questions, setQuestions] = useState<ClinicalQuestion[]>([{ ...emptyQuestion, id: 'q1' }]);

    // Load existing case data when editing
    useEffect(() => {
        if (existingCase) {
            setFormData({
                title: existingCase.title,
                patientName: existingCase.patientName,
                patientAge: existingCase.patientAge,
                patientGender: existingCase.patientGender,
                chiefComplaint: existingCase.chiefComplaint,
                history: existingCase.history,
                physicalExam: existingCase.physicalExam,
                category: existingCase.category,
                difficulty: existingCase.difficulty,
                estimatedTime: existingCase.estimatedTime,
                requiredLevel: existingCase.requiredLevel || 1,
            });
            setVitals(existingCase.vitalSigns);
            setExams(existingCase.exams || []);
            setQuestions(existingCase.questions.length > 0 ? existingCase.questions : [{ ...emptyQuestion, id: 'q1' }]);
        }
    }, [existingCase]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const caseData: ClinicalCase = {
            id: isEditing && id ? id : `custom-${Date.now()}`,
            ...formData,
            vitalSigns: vitals,
            exams,
            questions,
            totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
        };

        if (isEditing && id) {
            updateCase(id, caseData);
        } else {
            addCase(caseData);
        }

        navigate('/admin/cases');
    };

    // Question handlers
    const addQuestion = () => {
        setQuestions([...questions, { ...emptyQuestion, id: `q${questions.length + 1}` }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const updateQuestion = (index: number, field: keyof ClinicalQuestion, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions];
        const newOptions = [...updated[qIndex].options];
        newOptions[oIndex] = value;
        updated[qIndex] = { ...updated[qIndex], options: newOptions };
        setQuestions(updated);
    };

    // Exam handlers
    const addExam = () => {
        setExams([...exams, { ...emptyExam }]);
    };

    const removeExam = (index: number) => {
        setExams(exams.filter((_, i) => i !== index));
    };

    const updateExam = (index: number, field: keyof ExamResult, value: any) => {
        const updated = [...exams];
        updated[index] = { ...updated[index], [field]: value };
        setExams(updated);
    };

    const addFinding = (examIndex: number) => {
        const updated = [...exams];
        const findings = updated[examIndex].findings || [];
        updated[examIndex] = { ...updated[examIndex], findings: [...findings, ''] };
        setExams(updated);
    };

    const updateFinding = (examIndex: number, findingIndex: number, value: string) => {
        const updated = [...exams];
        const findings = [...(updated[examIndex].findings || [])];
        findings[findingIndex] = value;
        updated[examIndex] = { ...updated[examIndex], findings };
        setExams(updated);
    };

    const removeFinding = (examIndex: number, findingIndex: number) => {
        const updated = [...exams];
        const findings = (updated[examIndex].findings || []).filter((_, i) => i !== findingIndex);
        updated[examIndex] = { ...updated[examIndex], findings };
        setExams(updated);
    };

    const addLabResult = (examIndex: number) => {
        const updated = [...exams];
        const labResults = updated[examIndex].labResults || [];
        updated[examIndex] = { ...updated[examIndex], labResults: [...labResults, { ...emptyLabResult }] };
        setExams(updated);
    };

    const updateLabResult = (examIndex: number, labIndex: number, field: keyof LabResult, value: any) => {
        const updated = [...exams];
        const labResults = [...(updated[examIndex].labResults || [])];
        labResults[labIndex] = { ...labResults[labIndex], [field]: value };
        updated[examIndex] = { ...updated[examIndex], labResults };
        setExams(updated);
    };

    const removeLabResult = (examIndex: number, labIndex: number) => {
        const updated = [...exams];
        const labResults = (updated[examIndex].labResults || []).filter((_, i) => i !== labIndex);
        updated[examIndex] = { ...updated[examIndex], labResults };
        setExams(updated);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/cases')}
                        className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">{isEditing ? 'Editar Caso Clínico' : 'Novo Caso Clínico'}</h1>
                        <p className="text-sm text-slate-400">{isEditing ? 'Modifique os campos necessários' : 'Preencha os campos abaixo'}</p>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                    <h2 className="font-bold text-white mb-4">Informações Básicas</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Título do Caso</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                                placeholder="Ex: Dor Torácica Aguda"
                            />
                        </div>

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
                                <option>Ortopedia</option>
                                <option>Infectologia</option>
                                <option>Pneumologia</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Nome do Paciente</label>
                            <input
                                type="text"
                                required
                                value={formData.patientName}
                                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                                placeholder="Ex: João Silva"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Idade</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.patientAge}
                                    onChange={(e) => setFormData({ ...formData, patientAge: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Sexo</label>
                                <select
                                    value={formData.patientGender}
                                    onChange={(e) => setFormData({ ...formData, patientGender: e.target.value as 'M' | 'F' })}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Dificuldade</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                            >
                                <option value="facil">Fácil</option>
                                <option value="medio">Médio</option>
                                <option value="dificil">Difícil</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Tempo Estimado (min)</label>
                            <input
                                type="number"
                                value={formData.estimatedTime}
                                onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Nível Mínimo</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={formData.requiredLevel}
                                onChange={(e) => setFormData({ ...formData, requiredLevel: parseInt(e.target.value) || 1 })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Jogadores precisam estar neste nível para desbloquear</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Queixa Principal</label>
                        <input
                            type="text"
                            required
                            value={formData.chiefComplaint}
                            onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                            placeholder="Ex: Dor no peito há 2 horas"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">História Clínica</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.history}
                            onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none"
                            placeholder="Descreva a história clínica completa..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Exame Físico</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.physicalExam}
                            onChange={(e) => setFormData({ ...formData, physicalExam: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none"
                            placeholder="Descreva os achados do exame físico..."
                        />
                    </div>
                </div>

                {/* Vital Signs */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="font-bold text-white mb-4">Sinais Vitais</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">FC (bpm)</label>
                            <input
                                type="number"
                                value={vitals.heartRate}
                                onChange={(e) => setVitals({ ...vitals, heartRate: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-center focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">PA (mmHg)</label>
                            <input
                                type="text"
                                value={vitals.bloodPressure}
                                onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-center focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">FR (irpm)</label>
                            <input
                                type="number"
                                value={vitals.respiratoryRate}
                                onChange={(e) => setVitals({ ...vitals, respiratoryRate: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-center focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Temp (°C)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={vitals.temperature}
                                onChange={(e) => setVitals({ ...vitals, temperature: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-center focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">SpO2 (%)</label>
                            <input
                                type="number"
                                value={vitals.oxygenSaturation}
                                onChange={(e) => setVitals({ ...vitals, oxygenSaturation: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-center focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Exams */}
                <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-white">Exames Complementares ({exams.length})</h2>
                        <button
                            type="button"
                            onClick={addExam}
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar Exame
                        </button>
                    </div>

                    {exams.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>Nenhum exame adicionado ainda.</p>
                            <p className="text-sm">Clique em "Adicionar Exame" para incluir ECG, raio-X, laboratoriais, etc.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {exams.map((exam, examIndex) => (
                                <div key={examIndex} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-bold text-emerald-400">Exame {examIndex + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeExam(examIndex)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Tipo de Exame</label>
                                                <select
                                                    value={exam.type}
                                                    onChange={(e) => updateExam(examIndex, 'type', e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                                                >
                                                    {examTypes.map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Título</label>
                                                <input
                                                    type="text"
                                                    value={exam.title}
                                                    onChange={(e) => updateExam(examIndex, 'title', e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                                                    placeholder="Ex: ECG de 12 derivações"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                                            <textarea
                                                rows={2}
                                                value={exam.description}
                                                onChange={(e) => updateExam(examIndex, 'description', e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
                                                placeholder="Descreva o exame..."
                                            />
                                        </div>

                                        {/* Findings (for non-lab exams) */}
                                        {exam.type !== 'lab' && (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm text-slate-400">Achados</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => addFinding(examIndex)}
                                                        className="text-xs text-cyan-400 hover:text-cyan-300"
                                                    >
                                                        + Adicionar Achado
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {(exam.findings || []).map((finding, fIndex) => (
                                                        <div key={fIndex} className="flex items-center gap-2">
                                                            <span className="text-cyan-400 text-sm">•</span>
                                                            <input
                                                                type="text"
                                                                value={finding}
                                                                onChange={(e) => updateFinding(examIndex, fIndex, e.target.value)}
                                                                className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                                                                placeholder="Descreva o achado..."
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFinding(examIndex, fIndex)}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Lab Results (for lab exams) */}
                                        {exam.type === 'lab' && (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm text-slate-400">Resultados Laboratoriais</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => addLabResult(examIndex)}
                                                        className="text-xs text-cyan-400 hover:text-cyan-300"
                                                    >
                                                        + Adicionar Resultado
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {(exam.labResults || []).map((lab, labIndex) => (
                                                        <div key={labIndex} className="grid grid-cols-12 gap-2 items-center">
                                                            <input
                                                                type="text"
                                                                value={lab.name}
                                                                onChange={(e) => updateLabResult(examIndex, labIndex, 'name', e.target.value)}
                                                                className="col-span-3 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
                                                                placeholder="Nome"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={lab.value}
                                                                onChange={(e) => updateLabResult(examIndex, labIndex, 'value', e.target.value)}
                                                                className="col-span-2 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
                                                                placeholder="Valor"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={lab.unit}
                                                                onChange={(e) => updateLabResult(examIndex, labIndex, 'unit', e.target.value)}
                                                                className="col-span-2 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
                                                                placeholder="Unidade"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={lab.reference}
                                                                onChange={(e) => updateLabResult(examIndex, labIndex, 'reference', e.target.value)}
                                                                className="col-span-2 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
                                                                placeholder="Ref"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => updateLabResult(examIndex, labIndex, 'isAbnormal', !lab.isAbnormal)}
                                                                className={clsx(
                                                                    "col-span-2 px-2 py-1.5 rounded-lg text-xs font-medium",
                                                                    lab.isAbnormal
                                                                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                                                        : "bg-slate-700 text-slate-400 border border-slate-600"
                                                                )}
                                                            >
                                                                {lab.isAbnormal ? 'Alterado' : 'Normal'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeLabResult(examIndex, labIndex)}
                                                                className="col-span-1 text-red-400 hover:text-red-300"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Questions */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-white">Questões ({questions.length})</h2>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar
                        </button>
                    </div>

                    <div className="space-y-6">
                        {questions.map((q, qIndex) => (
                            <div key={q.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-bold text-cyan-400">Questão {qIndex + 1}</span>
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(qIndex)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Pergunta</label>
                                        <input
                                            type="text"
                                            required
                                            value={q.question}
                                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                                            placeholder="Qual é o diagnóstico mais provável?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Opções</label>
                                        <div className="space-y-2">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                                        className={clsx(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                                                            q.correctAnswer === oIndex
                                                                ? "bg-emerald-500 text-white"
                                                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                                        )}
                                                    >
                                                        {String.fromCharCode(65 + oIndex)}
                                                    </button>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={opt}
                                                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                                                        placeholder={`Opção ${String.fromCharCode(65 + oIndex)}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1">Clique na letra para marcar a resposta correta</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Explicação</label>
                                        <textarea
                                            required
                                            rows={2}
                                            value={q.explanation}
                                            onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
                                            placeholder="Explique por que esta é a resposta correta..."
                                        />
                                    </div>

                                    <div className="w-32">
                                        <label className="block text-sm text-slate-400 mb-1">Pontos</label>
                                        <input
                                            type="number"
                                            value={q.points}
                                            onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-center focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/cases')}
                        className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        Salvar Caso
                    </button>
                </div>
            </form>
        </div>
    );
};
