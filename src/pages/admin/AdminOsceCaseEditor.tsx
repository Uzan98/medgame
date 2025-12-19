import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp, Image } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { osceCases } from '../../lib/osceCases';
import type { OsceCase, OsceSecretData, EssentialQuestion, ExpectedAnamnesis, AvailableExam, ExamResult } from '../../lib/osceTypes';

const defaultHDA = {
    inicio: '',
    localizacao: '',
    caracteristica: '',
    intensidade: '',
    irradiacao: '',
    fatoresAgravantes: [],
    fatoresAtenuantes: [],
    sintomasAssociados: []
};

const defaultAntecedentes = {
    doencasCronicas: [],
    cirurgias: [],
    internacoes: [],
    alergias: [],
    historicoFamiliar: []
};

const defaultHabitos = {
    tabagismo: '',
    etilismo: '',
    drogas: '',
    alimentacao: '',
    atividadeFisica: '',
    sono: ''
};

const defaultSecretHistory: OsceSecretData = {
    hda: defaultHDA,
    antecedentes: defaultAntecedentes,
    medicacoes: [],
    habitos: defaultHabitos,
    revisaoSistemas: {},
    personalidade: 'colaborativo',
    detalhesExtras: ''
};

const defaultExpectedAnamnesis: ExpectedAnamnesis = {
    queixaPrincipal: '',
    hda: [],
    antecedentes: [],
    medicacoes: [],
    habitos: [],
    revisaoSistemas: []
};

const emptyCase: OsceCase & {
    availableExams?: AvailableExam[];
    examResults?: ExamResult[];
    expectedDiagnoses?: { primary: string; differentials: string[] };
    expectedPrescription?: { medicamentos: string[]; dieta?: string; repouso?: string; encaminhamentos?: string[]; orientacoes?: string[] };
} = {
    id: '',
    title: '',
    patientName: '',
    patientAge: 45,
    patientGender: 'M',
    patientAvatar: '👨',
    chiefComplaint: '',
    difficulty: 'medio',
    category: 'Clínica Médica',
    timeLimit: 180,
    xpReward: 200,
    coinsReward: 100,
    secretHistory: defaultSecretHistory,
    essentialQuestions: [],
    expectedAnamnesis: defaultExpectedAnamnesis,
    // Extended fields
    availableExams: [],
    examResults: [],
    expectedDiagnoses: { primary: '', differentials: [] },
    expectedPrescription: { medicamentos: [], dieta: '', repouso: '', encaminhamentos: [], orientacoes: [] }
};

const avatarOptions = ['👨', '👩', '👴', '👵', '👨‍🦳', '👩‍🦳', '🧔', '👱‍♂️', '👱‍♀️'];
const categoryOptions = ['Cardiologia', 'Neurologia', 'Pneumologia', 'Gastroenterologia', 'Nefrologia', 'Endocrinologia', 'Infectologia', 'Clínica Médica', 'Cardiologia/Pneumologia'];
const personalityOptions: OsceSecretData['personalidade'][] = ['ansioso', 'colaborativo', 'reservado', 'irritado'];
const essentialCategories: EssentialQuestion['category'][] = ['hda', 'antecedentes', 'medicacoes', 'habitos', 'revisao'];

export const AdminOsceCaseEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { customOsceCases, addOsceCase, updateOsceCase } = useAdminStore();

    const [formData, setFormData] = useState<OsceCase>({ ...emptyCase, id: `osce-custom-${Date.now()}` });
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        basic: true,
        hda: false,
        antecedentes: false,
        medicacoes: false,
        habitos: false,
        revisao: false,
        essential: false,
        expected: false,
        exams: false,
        examResults: false,
        diagnoses: false,
        prescription: false,
        // New sections
        contextoSocial: false,
        dadosFisicos: false,
        vidaSexual: false,
        exposicoes: false,
        estadoEmocional: false
    });

    useEffect(() => {
        if (id) {
            const existingCase = [...osceCases, ...customOsceCases].find(c => c.id === id);
            if (existingCase) {
                setFormData(existingCase);
            }
        }
    }, [id, customOsceCases]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (id) {
            updateOsceCase(id, formData);
        } else {
            addOsceCase(formData);
        }
        navigate('/admin/osce');
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // HDA array helpers
    const addToArray = (path: string) => {
        const keys = path.split('.');
        setFormData(prev => {
            const newData = { ...prev };
            let obj: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = [...obj[keys[keys.length - 1]], ''];
            return newData;
        });
    };

    const updateArrayItem = (path: string, index: number, value: string) => {
        const keys = path.split('.');
        setFormData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            let obj: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]][index] = value;
            return newData;
        });
    };

    const removeArrayItem = (path: string, index: number) => {
        const keys = path.split('.');
        setFormData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            let obj: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]].splice(index, 1);
            return newData;
        });
    };

    // Essential questions helpers
    const addEssentialQuestion = () => {
        setFormData(prev => ({
            ...prev,
            essentialQuestions: [
                ...prev.essentialQuestions,
                { id: `eq-${Date.now()}`, category: 'hda', keywords: [], weight: 5, description: '' }
            ]
        }));
    };

    const updateEssentialQuestion = (index: number, field: keyof EssentialQuestion, value: any) => {
        setFormData(prev => ({
            ...prev,
            essentialQuestions: prev.essentialQuestions.map((q, i) =>
                i === index ? { ...q, [field]: value } : q
            )
        }));
    };

    const removeEssentialQuestion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            essentialQuestions: prev.essentialQuestions.filter((_, i) => i !== index)
        }));
    };

    const SectionHeader: React.FC<{ title: string; section: string; count?: number }> = ({ title, section, count }) => (
        <button
            type="button"
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors"
        >
            <span className="font-bold text-white flex items-center gap-2">
                {title}
                {count !== undefined && (
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">{count}</span>
                )}
            </span>
            {expandedSections[section] ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>
    );

    const ArrayEditor: React.FC<{ label: string; path: string; items: string[] }> = ({ label, path, items }) => (
        <div className="space-y-2">
            <label className="block text-sm text-slate-400">{label}</label>
            {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                    <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayItem(path, index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                    />
                    <button type="button" onClick={() => removeArrayItem(path, index)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <button type="button" onClick={() => addToArray(path)} className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Adicionar
            </button>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button type="button" onClick={() => navigate('/admin/osce')} className="flex items-center gap-2 text-slate-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-400">
                    <Save className="w-4 h-4" />
                    Salvar
                </button>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
                <SectionHeader title="Dados Básicos" section="basic" />
                {expandedSections.basic && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Título do Caso</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                                >
                                    {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Nome do Paciente</label>
                                <input
                                    type="text"
                                    value={formData.patientName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Idade</label>
                                <input
                                    type="number"
                                    value={formData.patientAge}
                                    onChange={(e) => setFormData(prev => ({ ...prev, patientAge: parseInt(e.target.value) }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Gênero</label>
                                <select
                                    value={formData.patientGender}
                                    onChange={(e) => setFormData(prev => ({ ...prev, patientGender: e.target.value as 'M' | 'F' }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                                >
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Avatar</label>
                                <select
                                    value={formData.patientAvatar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, patientAvatar: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-xl"
                                >
                                    {avatarOptions.map(av => <option key={av} value={av}>{av}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Queixa Principal (o que o paciente diz ao chegar)</label>
                            <input
                                type="text"
                                value={formData.chiefComplaint}
                                onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                                placeholder="Ex: Dor no peito"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Dificuldade</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                                >
                                    <option value="facil">Fácil</option>
                                    <option value="medio">Médio</option>
                                    <option value="dificil">Difícil</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Tempo (seg)</label>
                                <input
                                    type="number"
                                    value={formData.timeLimit}
                                    onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">XP</label>
                                <input
                                    type="number"
                                    value={formData.xpReward}
                                    onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Moedas</label>
                                <input
                                    type="number"
                                    value={formData.coinsReward}
                                    onChange={(e) => setFormData(prev => ({ ...prev, coinsReward: parseInt(e.target.value) }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Personalidade do Paciente</label>
                            <select
                                value={formData.secretHistory.personalidade}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    secretHistory: { ...prev.secretHistory, personalidade: e.target.value as any }
                                }))}
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                            >
                                {personalityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* HDA Section */}
            <div className="space-y-4">
                <SectionHeader title="História da Doença Atual (HDA)" section="hda" />
                {expandedSections.hda && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Início</label>
                                <input
                                    type="text"
                                    value={formData.secretHistory.hda.inicio}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        secretHistory: { ...prev.secretHistory, hda: { ...prev.secretHistory.hda, inicio: e.target.value } }
                                    }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                                    placeholder="Quando e como começou"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Localização</label>
                                <input
                                    type="text"
                                    value={formData.secretHistory.hda.localizacao}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        secretHistory: { ...prev.secretHistory, hda: { ...prev.secretHistory.hda, localizacao: e.target.value } }
                                    }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Característica</label>
                                <input
                                    type="text"
                                    value={formData.secretHistory.hda.caracteristica}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        secretHistory: { ...prev.secretHistory, hda: { ...prev.secretHistory.hda, caracteristica: e.target.value } }
                                    }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Intensidade</label>
                                <input
                                    type="text"
                                    value={formData.secretHistory.hda.intensidade}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        secretHistory: { ...prev.secretHistory, hda: { ...prev.secretHistory.hda, intensidade: e.target.value } }
                                    }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-slate-400 mb-1">Irradiação</label>
                                <input
                                    type="text"
                                    value={formData.secretHistory.hda.irradiacao}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        secretHistory: { ...prev.secretHistory, hda: { ...prev.secretHistory.hda, irradiacao: e.target.value } }
                                    }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                                />
                            </div>
                        </div>

                        <ArrayEditor label="Fatores Agravantes" path="secretHistory.hda.fatoresAgravantes" items={formData.secretHistory.hda.fatoresAgravantes} />
                        <ArrayEditor label="Fatores Atenuantes" path="secretHistory.hda.fatoresAtenuantes" items={formData.secretHistory.hda.fatoresAtenuantes} />
                        <ArrayEditor label="Sintomas Associados" path="secretHistory.hda.sintomasAssociados" items={formData.secretHistory.hda.sintomasAssociados} />

                        {/* Extended HDA Fields (optional) */}
                        <div className="border-t border-slate-600 pt-4 mt-4">
                            <h4 className="text-sm font-medium text-cyan-400 mb-3">Campos Estendidos (Opcionais)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries({
                                    evolucao: { label: 'Evolução', placeholder: 'Ex: Está piorando progressivamente' },
                                    frequencia: { label: 'Frequência', placeholder: 'Ex: Constante ou Vai e volta' },
                                    duracao: { label: 'Duração', placeholder: 'Ex: Já tem umas 6 horas' },
                                    episodiosAnteriores: { label: 'Episódios Anteriores', placeholder: 'Ex: Nunca tive isso antes' },
                                    oQueEstavaFazendo: { label: 'O que estava fazendo', placeholder: 'Ex: Subindo escada' },
                                    tratamentosTentados: { label: 'Tratamentos Tentados', placeholder: 'Ex: Tomei Buscopan' }
                                }).map(([key, config]) => (
                                    <div key={key}>
                                        <label className="block text-sm text-slate-400 mb-1">{config.label}</label>
                                        <input
                                            type="text"
                                            value={(formData.secretHistory.hda as any)[key] || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                secretHistory: { ...prev.secretHistory, hda: { ...prev.secretHistory.hda, [key]: e.target.value } }
                                            }))}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                                            placeholder={config.placeholder}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Antecedentes Section */}
            <div className="space-y-4">
                <SectionHeader title="Antecedentes" section="antecedentes" />
                {expandedSections.antecedentes && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                        <ArrayEditor label="Doenças Crônicas" path="secretHistory.antecedentes.doencasCronicas" items={formData.secretHistory.antecedentes.doencasCronicas} />
                        <ArrayEditor label="Cirurgias" path="secretHistory.antecedentes.cirurgias" items={formData.secretHistory.antecedentes.cirurgias} />
                        <ArrayEditor label="Internações" path="secretHistory.antecedentes.internacoes" items={formData.secretHistory.antecedentes.internacoes} />
                        <ArrayEditor label="Alergias" path="secretHistory.antecedentes.alergias" items={formData.secretHistory.antecedentes.alergias} />
                        <ArrayEditor label="Histórico Familiar" path="secretHistory.antecedentes.historicoFamiliar" items={formData.secretHistory.antecedentes.historicoFamiliar} />
                    </div>
                )}
            </div>

            {/* Medicações Section */}
            <div className="space-y-4">
                <SectionHeader title="Medicações" section="medicacoes" count={formData.secretHistory.medicacoes.length} />
                {expandedSections.medicacoes && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                        <ArrayEditor label="Medicações em Uso" path="secretHistory.medicacoes" items={formData.secretHistory.medicacoes} />
                    </div>
                )}
            </div>

            {/* Hábitos Section */}
            <div className="space-y-4">
                <SectionHeader title="Hábitos de Vida" section="habitos" />
                {expandedSections.habitos && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                        {Object.entries({
                            tabagismo: 'Tabagismo',
                            etilismo: 'Etilismo',
                            drogas: 'Uso de Drogas',
                            alimentacao: 'Alimentação',
                            atividadeFisica: 'Atividade Física',
                            sono: 'Sono',
                            cafeina: 'Cafeína (opcional)',
                            agua: 'Ingesta de água (opcional)',
                            estresse: 'Nível de estresse (opcional)'
                        }).map(([key, label]) => (
                            <div key={key}>
                                <label className="block text-sm text-slate-400 mb-1">{label}</label>
                                <input
                                    type="text"
                                    value={(formData.secretHistory.habitos as any)[key] || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        secretHistory: {
                                            ...prev.secretHistory,
                                            habitos: { ...prev.secretHistory.habitos, [key]: e.target.value }
                                        }
                                    }))}
                                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Essential Questions Section */}
            <div className="space-y-4">
                <SectionHeader title="Perguntas Essenciais" section="essential" count={formData.essentialQuestions.length} />
                {expandedSections.essential && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                        <p className="text-sm text-slate-400">
                            Defina as perguntas que o estudante DEVE fazer durante a consulta. Keywords são usadas pela IA para detectar se a pergunta foi feita.
                        </p>
                        {formData.essentialQuestions.map((eq, index) => (
                            <div key={eq.id} className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Pergunta #{index + 1}</span>
                                    <button type="button" onClick={() => removeEssentialQuestion(index)} className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        value={eq.category}
                                        onChange={(e) => updateEssentialQuestion(index, 'category', e.target.value)}
                                        className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                    >
                                        {essentialCategories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                    </select>
                                    <input
                                        type="number"
                                        value={eq.weight}
                                        onChange={(e) => updateEssentialQuestion(index, 'weight', parseInt(e.target.value))}
                                        className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                        placeholder="Peso (1-10)"
                                        min={1}
                                        max={10}
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={eq.description}
                                    onChange={(e) => updateEssentialQuestion(index, 'description', e.target.value)}
                                    className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                    placeholder="Descrição (ex: Perguntar sobre início da dor)"
                                />
                                <input
                                    type="text"
                                    value={eq.keywords.join(', ')}
                                    onChange={(e) => updateEssentialQuestion(index, 'keywords', e.target.value.split(',').map(k => k.trim()))}
                                    className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                    placeholder="Keywords separadas por vírgula (quando, começou, início)"
                                />
                            </div>
                        ))}
                        <button type="button" onClick={addEssentialQuestion} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
                            <Plus className="w-4 h-4" /> Adicionar Pergunta Essencial
                        </button>
                    </div>
                )}
            </div>

            {/* Expected Anamnesis Section */}
            <div className="space-y-4">
                <SectionHeader title="Anamnese Esperada (Prontuário Modelo)" section="expected" />
                {expandedSections.expected && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                        <p className="text-sm text-slate-400">
                            Defina o que é esperado que o estudante escreva no prontuário. Usado pela IA para avaliar a qualidade.
                        </p>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Queixa Principal</label>
                            <input
                                type="text"
                                value={formData.expectedAnamnesis.queixaPrincipal}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    expectedAnamnesis: { ...prev.expectedAnamnesis, queixaPrincipal: e.target.value }
                                }))}
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                            />
                        </div>
                        <ArrayEditor label="HDA (itens esperados)" path="expectedAnamnesis.hda" items={formData.expectedAnamnesis.hda} />
                        <ArrayEditor label="Antecedentes (itens esperados)" path="expectedAnamnesis.antecedentes" items={formData.expectedAnamnesis.antecedentes} />
                        <ArrayEditor label="Medicações (itens esperados)" path="expectedAnamnesis.medicacoes" items={formData.expectedAnamnesis.medicacoes} />
                        <ArrayEditor label="Hábitos (itens esperados)" path="expectedAnamnesis.habitos" items={formData.expectedAnamnesis.habitos} />
                        <ArrayEditor label="Revisão de Sistemas (itens esperados)" path="expectedAnamnesis.revisaoSistemas" items={formData.expectedAnamnesis.revisaoSistemas} />
                    </div>
                )}
            </div>
            {/* Available Exams Section */}
            <div className="space-y-4">
                <SectionHeader title="📋 Exames Disponíveis" section="exams" count={(formData as any).availableExams?.length || 0} />
                {expandedSections.exams && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                        <p className="text-sm text-slate-400">
                            Configure quais exames estarão disponíveis para o aluno solicitar neste caso.
                        </p>
                        {((formData as any).availableExams || []).map((exam: AvailableExam, index: number) => (
                            <div key={exam.id || index} className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Exame #{index + 1}</span>
                                    <button type="button" onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            availableExams: ((prev as any).availableExams || []).filter((_: any, i: number) => i !== index)
                                        } as any));
                                    }} className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        value={exam.name}
                                        onChange={(e) => {
                                            setFormData(prev => {
                                                const exams = [...((prev as any).availableExams || [])];
                                                exams[index] = { ...exams[index], name: e.target.value };
                                                return { ...prev, availableExams: exams } as any;
                                            });
                                        }}
                                        className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                        placeholder="Nome do exame"
                                    />
                                    <select
                                        value={exam.category}
                                        onChange={(e) => {
                                            setFormData(prev => {
                                                const exams = [...((prev as any).availableExams || [])];
                                                exams[index] = { ...exams[index], category: e.target.value as any };
                                                return { ...prev, availableExams: exams } as any;
                                            });
                                        }}
                                        className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                    >
                                        <option value="laboratorio">Laboratório</option>
                                        <option value="imagem">Imagem</option>
                                        <option value="funcional">Funcional</option>
                                        <option value="outros">Outros</option>
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    value={exam.description || ''}
                                    onChange={(e) => {
                                        setFormData(prev => {
                                            const exams = [...((prev as any).availableExams || [])];
                                            exams[index] = { ...exams[index], description: e.target.value };
                                            return { ...prev, availableExams: exams } as any;
                                        });
                                    }}
                                    className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                    placeholder="Descrição (opcional)"
                                />
                            </div>
                        ))}
                        <button type="button" onClick={() => {
                            setFormData(prev => ({
                                ...prev,
                                availableExams: [...((prev as any).availableExams || []), { id: `exam-${Date.now()}`, name: '', category: 'laboratorio' }]
                            } as any));
                        }} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
                            <Plus className="w-4 h-4" /> Adicionar Exame
                        </button>
                    </div>
                )}
            </div>

            {/* Exam Results Section */}
            <div className="space-y-4">
                <SectionHeader title="🔬 Resultados de Exames" section="examResults" count={(formData as any).examResults?.length || 0} />
                {expandedSections.examResults && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                        <p className="text-sm text-slate-400">
                            Pré-configure os resultados que aparecerão quando o aluno solicitar cada exame. Você pode adicionar imagens (URLs do Supabase Storage).
                        </p>
                        {((formData as any).examResults || []).map((result: ExamResult, index: number) => (
                            <div key={result.examId || index} className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Resultado #{index + 1}</span>
                                    <button type="button" onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            examResults: ((prev as any).examResults || []).filter((_: any, i: number) => i !== index)
                                        } as any));
                                    }} className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" value={result.examId} onChange={(e) => {
                                        setFormData(prev => {
                                            const results = [...((prev as any).examResults || [])];
                                            results[index] = { ...results[index], examId: e.target.value };
                                            return { ...prev, examResults: results } as any;
                                        });
                                    }} className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm" placeholder="ID do exame" />
                                    <input type="text" value={result.examName} onChange={(e) => {
                                        setFormData(prev => {
                                            const results = [...((prev as any).examResults || [])];
                                            results[index] = { ...results[index], examName: e.target.value };
                                            return { ...prev, examResults: results } as any;
                                        });
                                    }} className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm" placeholder="Nome do exame" />
                                </div>
                                <textarea
                                    value={result.result}
                                    onChange={(e) => {
                                        setFormData(prev => {
                                            const results = [...((prev as any).examResults || [])];
                                            results[index] = { ...results[index], result: e.target.value };
                                            return { ...prev, examResults: results } as any;
                                        });
                                    }}
                                    className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm resize-none"
                                    rows={2}
                                    placeholder="Resultado do exame (texto)"
                                />
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={result.isAbnormal}
                                            onChange={(e) => {
                                                setFormData(prev => {
                                                    const results = [...((prev as any).examResults || [])];
                                                    results[index] = { ...results[index], isAbnormal: e.target.checked };
                                                    return { ...prev, examResults: results } as any;
                                                });
                                            }}
                                            className="rounded border-slate-600"
                                        />
                                        <span className="text-sm text-red-400">Alterado</span>
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    value={(result.criticalFindings || []).join(', ')}
                                    onChange={(e) => {
                                        setFormData(prev => {
                                            const results = [...((prev as any).examResults || [])];
                                            results[index] = { ...results[index], criticalFindings: e.target.value.split(',').map(s => s.trim()).filter(Boolean) };
                                            return { ...prev, examResults: results } as any;
                                        });
                                    }}
                                    className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                    placeholder="Achados críticos (separados por vírgula)"
                                />
                                <div className="flex items-center gap-2">
                                    <Image className="w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={result.imageUrl || ''}
                                        onChange={(e) => {
                                            setFormData(prev => {
                                                const results = [...((prev as any).examResults || [])];
                                                results[index] = { ...results[index], imageUrl: e.target.value };
                                                return { ...prev, examResults: results } as any;
                                            });
                                        }}
                                        className="flex-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                        placeholder="URL da imagem (Supabase Storage)"
                                    />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => {
                            setFormData(prev => ({
                                ...prev,
                                examResults: [...((prev as any).examResults || []), { examId: '', examName: '', result: '', isAbnormal: false }]
                            } as any));
                        }} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
                            <Plus className="w-4 h-4" /> Adicionar Resultado
                        </button>
                    </div>
                )}
            </div>

            {/* Expected Diagnoses Section */}
            <div className="space-y-4">
                <SectionHeader title="🎯 Diagnósticos Esperados" section="diagnoses" />
                {expandedSections.diagnoses && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                        <p className="text-sm text-slate-400">
                            Defina os diagnósticos corretos (principal e diferenciais) para avaliação.
                        </p>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Diagnóstico Principal</label>
                            <input
                                type="text"
                                value={(formData as any).expectedDiagnoses?.primary || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    expectedDiagnoses: { ...((prev as any).expectedDiagnoses || {}), primary: e.target.value }
                                } as any))}
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                                placeholder="Ex: Infarto Agudo do Miocárdio"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm text-slate-400">Diagnósticos Diferenciais</label>
                            {((formData as any).expectedDiagnoses?.differentials || []).map((diff: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={diff}
                                        onChange={(e) => {
                                            setFormData(prev => {
                                                const diffs = [...((prev as any).expectedDiagnoses?.differentials || [])];
                                                diffs[index] = e.target.value;
                                                return { ...prev, expectedDiagnoses: { ...((prev as any).expectedDiagnoses || {}), differentials: diffs } } as any;
                                            });
                                        }}
                                        className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                                    />
                                    <button type="button" onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            expectedDiagnoses: {
                                                ...((prev as any).expectedDiagnoses || {}),
                                                differentials: ((prev as any).expectedDiagnoses?.differentials || []).filter((_: any, i: number) => i !== index)
                                            }
                                        } as any));
                                    }} className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    expectedDiagnoses: {
                                        ...((prev as any).expectedDiagnoses || {}),
                                        differentials: [...((prev as any).expectedDiagnoses?.differentials || []), '']
                                    }
                                } as any));
                            }} className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Adicionar Diferencial
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Expected Prescription Section */}
            <div className="space-y-4">
                <SectionHeader title="💊 Prescrição Esperada" section="prescription" />
                {expandedSections.prescription && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                        <p className="text-sm text-slate-400">
                            Defina o plano terapêutico esperado (para avaliação do aluno).
                        </p>
                        <div className="space-y-2">
                            <label className="block text-sm text-slate-400">Medicamentos</label>
                            {((formData as any).expectedPrescription?.medicamentos || []).map((med: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                    <input type="text" value={med} onChange={(e) => {
                                        setFormData(prev => {
                                            const meds = [...((prev as any).expectedPrescription?.medicamentos || [])];
                                            meds[index] = e.target.value;
                                            return { ...prev, expectedPrescription: { ...((prev as any).expectedPrescription || {}), medicamentos: meds } } as any;
                                        });
                                    }} className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
                                    <button type="button" onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            expectedPrescription: { ...((prev as any).expectedPrescription || {}), medicamentos: ((prev as any).expectedPrescription?.medicamentos || []).filter((_: any, i: number) => i !== index) }
                                        } as any));
                                    }} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    expectedPrescription: { ...((prev as any).expectedPrescription || {}), medicamentos: [...((prev as any).expectedPrescription?.medicamentos || []), ''] }
                                } as any));
                            }} className="text-cyan-400 text-sm flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar</button>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Dieta</label>
                            <input type="text" value={(formData as any).expectedPrescription?.dieta || ''} onChange={(e) => setFormData(prev => ({ ...prev, expectedPrescription: { ...((prev as any).expectedPrescription || {}), dieta: e.target.value } } as any))} className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" placeholder="Ex: Dieta hipossódica" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Repouso</label>
                            <input type="text" value={(formData as any).expectedPrescription?.repouso || ''} onChange={(e) => setFormData(prev => ({ ...prev, expectedPrescription: { ...((prev as any).expectedPrescription || {}), repouso: e.target.value } } as any))} className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" placeholder="Ex: Repouso relativo" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm text-slate-400">Encaminhamentos</label>
                            {((formData as any).expectedPrescription?.encaminhamentos || []).map((enc: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                    <input type="text" value={enc} onChange={(e) => {
                                        setFormData(prev => {
                                            const encs = [...((prev as any).expectedPrescription?.encaminhamentos || [])];
                                            encs[index] = e.target.value;
                                            return { ...prev, expectedPrescription: { ...((prev as any).expectedPrescription || {}), encaminhamentos: encs } } as any;
                                        });
                                    }} className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
                                    <button type="button" onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            expectedPrescription: { ...((prev as any).expectedPrescription || {}), encaminhamentos: ((prev as any).expectedPrescription?.encaminhamentos || []).filter((_: any, i: number) => i !== index) }
                                        } as any));
                                    }} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    expectedPrescription: { ...((prev as any).expectedPrescription || {}), encaminhamentos: [...((prev as any).expectedPrescription?.encaminhamentos || []), ''] }
                                } as any));
                            }} className="text-cyan-400 text-sm flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar</button>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm text-slate-400">Orientações</label>
                            {((formData as any).expectedPrescription?.orientacoes || []).map((ori: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                    <input type="text" value={ori} onChange={(e) => {
                                        setFormData(prev => {
                                            const oris = [...((prev as any).expectedPrescription?.orientacoes || [])];
                                            oris[index] = e.target.value;
                                            return { ...prev, expectedPrescription: { ...((prev as any).expectedPrescription || {}), orientacoes: oris } } as any;
                                        });
                                    }} className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
                                    <button type="button" onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            expectedPrescription: { ...((prev as any).expectedPrescription || {}), orientacoes: ((prev as any).expectedPrescription?.orientacoes || []).filter((_: any, i: number) => i !== index) }
                                        } as any));
                                    }} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    expectedPrescription: { ...((prev as any).expectedPrescription || {}), orientacoes: [...((prev as any).expectedPrescription?.orientacoes || []), ''] }
                                } as any));
                            }} className="text-cyan-400 text-sm flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform">
                    <Save className="w-5 h-5" />
                    {id ? 'Atualizar Caso' : 'Criar Caso'}
                </button>
            </div>
        </form>
    );
};
