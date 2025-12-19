import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, ChevronRight, Search, Heart, Brain, Activity, Stethoscope, Upload, Copy, Check, AlertTriangle, FileJson } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { osceCases } from '../../lib/osceCases';
import { useToastStore } from '../../store/toastStore';
import clsx from 'clsx';

const categoryIcons: Record<string, React.ElementType> = {
    'Cardiologia': Heart,
    'Neurologia': Brain,
    'Cardiologia/Pneumologia': Stethoscope,
    'default': Activity,
};

const difficultyColors = {
    facil: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    medio: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    dificil: 'text-red-400 bg-red-500/20 border-red-500/30',
};

const difficultyLabels = {
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Difícil',
};

export const AdminOsceCasesList: React.FC = () => {
    const navigate = useNavigate();
    const { customOsceCases, deleteOsceCase, addOsceCase } = useAdminStore();
    const { addToast } = useToastStore();
    const [search, setSearch] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchJson, setBatchJson] = useState('');
    const [batchError, setBatchError] = useState<string | null>(null);
    const [copiedTemplate, setCopiedTemplate] = useState(false);

    const allCases = [...osceCases, ...customOsceCases];
    const filteredCases = allCases.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.patientName.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id: string) => {
        deleteOsceCase(id);
        setShowDeleteModal(null);
    };

    const isCustom = (id: string) => customOsceCases.some(c => c.id === id);

    // JSON template for batch import
    const jsonTemplate = `[
  {
    "title": "Título do Caso",
    "patientName": "Nome do Paciente",
    "patientAge": 45,
    "patientGender": "M",
    "patientAvatar": "👨",
    "chiefComplaint": "Queixa principal",
    "difficulty": "medio",
    "category": "Cardiologia",
    "timeLimit": 600,
    "xpReward": 200,
    "coinsReward": 100,
    "secretHistory": {
      "hda": {
        "inicio": "Há 3 dias",
        "localizacao": "Precordial",
        "caracteristica": "Aperto",
        "intensidade": "8/10",
        "irradiacao": "Braço esquerdo",
        "fatoresAgravantes": ["Esforço físico"],
        "fatoresAtenuantes": ["Repouso"],
        "sintomasAssociados": ["Sudorese", "Dispneia"],
        "evolucao": "Piorando progressivamente",
        "frequencia": "Constante",
        "duracao": "3 dias",
        "episodiosAnteriores": "Nunca teve antes",
        "oQueEstavaFazendo": "Subindo escadas",
        "tratamentosTentados": "Tomou AAS por conta"
      },
      "antecedentes": {
        "doencasCronicas": ["HAS", "DM2"],
        "cirurgias": [],
        "internacoes": [],
        "alergias": [],
        "historicoFamiliar": ["Pai faleceu de IAM"],
        "vacinacao": "Em dia",
        "transfusoes": "Nunca",
        "doencasInfancia": "Sem intercorrências"
      },
      "medicacoes": ["Losartana 50mg", "Metformina 850mg"],
      "habitos": {
        "tabagismo": "20 anos-maço, parou há 5 anos",
        "etilismo": "Social",
        "drogas": "Nega",
        "alimentacao": "Dieta irregular",
        "atividadeFisica": "Sedentário",
        "sono": "Regular",
        "cafeina": "3 cafés por dia",
        "agua": "Pouca água",
        "estresse": "Trabalho estressante"
      },
      "revisaoSistemas": {},
      "contextoSocial": {
        "profissao": "Bancário",
        "condicoesTrabalho": "Escritório, muito estresse",
        "moradia": "Casa própria",
        "estadoCivil": "Casado",
        "filhos": "2 filhos",
        "religiao": "Católico",
        "escolaridade": "Superior completo",
        "renda": "5 salários mínimos",
        "planoSaude": "Plano empresarial"
      },
      "dadosFisicos": {
        "peso": "90kg",
        "altura": "1,75m",
        "mudancaPeso": "Ganhou 5kg no último ano",
        "febre": "Não teve",
        "pressaoArterial": "150x90 geralmente",
        "glicemia": "130 em jejum"
      },
      "exposicoes": {
        "viagensRecentes": "Não viajou",
        "contatoDoentes": "Não",
        "animais": "1 cachorro",
        "ambienteTrabalho": "Ar condicionado",
        "agua": "Filtrada",
        "alimentosRecentes": "Normal"
      },
      "estadoEmocional": {
        "comoSeSente": "Muito preocupado",
        "medos": "Medo de ser infarto",
        "expectativas": "Quer saber o que tem",
        "impactoVida": "Não consegue trabalhar",
        "apoioFamiliar": "Esposa apoiando"
      },
      "personalidade": "colaborativo",
      "detalhesExtras": ""
    },
    "essentialQuestions": [
      {
        "id": "eq1",
        "category": "hda",
        "keywords": ["quando", "começou", "início"],
        "weight": 10,
        "description": "Perguntar quando a dor começou"
      }
    ],
    "expectedAnamnesis": {
      "queixaPrincipal": "Dor torácica há 3 dias",
      "hda": ["Dor precordial em aperto", "Irradia para MSE"],
      "antecedentes": ["HAS", "DM2"],
      "medicacoes": ["Losartana", "Metformina"],
      "habitos": ["Ex-tabagista"],
      "revisaoSistemas": []
    },
    "availableExams": [
      { "id": "ecg", "name": "ECG", "category": "funcional" },
      { "id": "troponina", "name": "Troponina", "category": "laboratorio" }
    ],
    "examResults": [
      {
        "examId": "ecg",
        "examName": "ECG",
        "result": "Supra de ST em V1-V4",
        "isAbnormal": true,
        "criticalFindings": ["IAM anterior"]
      },
      {
        "examId": "troponina",
        "examName": "Troponina",
        "result": "0.8 ng/mL (VR < 0.04)",
        "isAbnormal": true,
        "criticalFindings": ["Elevada"]
      }
    ],
    "expectedDiagnoses": {
      "primary": "Infarto Agudo do Miocárdio",
      "differentials": ["Angina Instável", "TEP"]
    },
    "expectedPrescription": {
      "medicamentos": ["AAS 300mg", "Clopidogrel 300mg", "Enoxaparina"],
      "dieta": "Zero",
      "repouso": "Absoluto",
      "encaminhamentos": ["UTI Coronariana", "Cardiologia"],
      "orientacoes": ["Monitorização contínua"]
    }
  }
]`;

    const copyTemplate = () => {
        navigator.clipboard.writeText(jsonTemplate);
        setCopiedTemplate(true);
        setTimeout(() => setCopiedTemplate(false), 2000);
        addToast('Template copiado!', 'success');
    };

    const handleBatchImport = () => {
        setBatchError(null);
        try {
            const cases = JSON.parse(batchJson);

            if (!Array.isArray(cases)) {
                setBatchError('O JSON deve ser um array de casos.');
                return;
            }

            let imported = 0;
            for (const caseData of cases) {
                // Validate required fields
                if (!caseData.title || !caseData.patientName || !caseData.chiefComplaint) {
                    setBatchError(`Caso inválido: faltando campos obrigatórios (title, patientName, chiefComplaint)`);
                    return;
                }

                // Generate unique ID
                const newCase = {
                    ...caseData,
                    id: `osce-batch-${Date.now()}-${imported}`,
                    patientAge: caseData.patientAge || 45,
                    patientGender: caseData.patientGender || 'M',
                    patientAvatar: caseData.patientAvatar || '👨',
                    difficulty: caseData.difficulty || 'medio',
                    category: caseData.category || 'Clínica Médica',
                    timeLimit: caseData.timeLimit || 180,
                    xpReward: caseData.xpReward || 200,
                    coinsReward: caseData.coinsReward || 100,
                    secretHistory: caseData.secretHistory || {
                        hda: { inicio: '', localizacao: '', caracteristica: '', intensidade: '', irradiacao: '', fatoresAgravantes: [], fatoresAtenuantes: [], sintomasAssociados: [] },
                        antecedentes: { doencasCronicas: [], cirurgias: [], internacoes: [], alergias: [], historicoFamiliar: [] },
                        medicacoes: [],
                        habitos: { tabagismo: '', etilismo: '', drogas: '', alimentacao: '', atividadeFisica: '', sono: '' },
                        revisaoSistemas: {},
                        personalidade: 'colaborativo',
                        detalhesExtras: ''
                    },
                    essentialQuestions: caseData.essentialQuestions || [],
                    expectedAnamnesis: caseData.expectedAnamnesis || { queixaPrincipal: '', hda: [], antecedentes: [], medicacoes: [], habitos: [], revisaoSistemas: [] }
                };

                addOsceCase(newCase);
                imported++;
            }

            addToast(`${imported} caso(s) importado(s) com sucesso!`, 'success');
            setShowBatchModal(false);
            setBatchJson('');
        } catch (e) {
            setBatchError(`Erro ao parsear JSON: ${(e as Error).message}`);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar casos OSCE..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowBatchModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-600 transition-colors border border-slate-600"
                    >
                        <Upload className="w-4 h-4" />
                        Importar em Lote
                    </button>
                    <Link
                        to="/admin/osce/new"
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-400 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Caso
                    </Link>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl p-4">
                <h3 className="text-purple-400 font-bold mb-1">Consulta Express (Modo OSCE)</h3>
                <p className="text-slate-400 text-sm">
                    Casos de anamnese interativa onde o jogador conversa com um paciente virtual
                    e depois escreve o prontuário. A IA avalia a qualidade da consulta.
                </p>
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
                                custom ? "border-purple-500/30" : "border-slate-700"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 text-2xl">
                                    {case_.patientAvatar}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="font-bold text-white truncate">{case_.title}</h3>
                                        {custom && (
                                            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                                                Personalizado
                                            </span>
                                        )}
                                        <span className={clsx(
                                            "text-[10px] px-2 py-0.5 rounded border",
                                            difficultyColors[case_.difficulty]
                                        )}>
                                            {difficultyLabels[case_.difficulty]}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Icon className="w-3 h-3" />
                                            {case_.category}
                                        </span>
                                        <span>•</span>
                                        <span>{case_.patientName}, {case_.patientAge}a, {case_.patientGender === 'M' ? 'Masc' : 'Fem'}</span>
                                        <span>•</span>
                                        <span>⏱️ {Math.floor(case_.timeLimit / 60)}min</span>
                                        <span>•</span>
                                        <span>💰 {case_.coinsReward} | ⭐ {case_.xpReward}XP</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 truncate">
                                        Queixa: "{case_.chiefComplaint}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {custom && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/admin/osce/edit/${case_.id}`)}
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
                        <p className="text-slate-400">Nenhum caso OSCE encontrado</p>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-white mb-2">Confirmar Exclusão</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Tem certeza que deseja excluir este caso OSCE? Esta ação não pode ser desfeita.
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

            {/* Batch Import Modal */}
            {showBatchModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-4xl w-full my-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <FileJson className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Importar Casos em Lote</h3>
                                <p className="text-sm text-slate-400">Cole um array JSON com os casos OSCE</p>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4">
                            <h4 className="text-sm font-bold text-cyan-400 mb-2">📋 Instruções</h4>
                            <ul className="text-xs text-slate-400 space-y-1">
                                <li>• O JSON deve ser um <strong className="text-white">array</strong> de objetos (mesmo para 1 caso)</li>
                                <li>• Campos obrigatórios: <code className="text-cyan-300">title</code>, <code className="text-cyan-300">patientName</code>, <code className="text-cyan-300">chiefComplaint</code></li>
                                <li>• O <code className="text-cyan-300">secretHistory</code> contém os dados que o paciente IA vai revelar</li>
                                <li>• <code className="text-cyan-300">expectedDiagnoses</code> e <code className="text-cyan-300">expectedPrescription</code> são usados na avaliação</li>
                                <li>• IDs são gerados automaticamente</li>
                            </ul>
                        </div>

                        {/* Template */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Template de exemplo:</span>
                                <button
                                    onClick={copyTemplate}
                                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                                >
                                    {copiedTemplate ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedTemplate ? 'Copiado!' : 'Copiar template'}
                                </button>
                            </div>
                            <pre className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto max-h-48 overflow-y-auto">
                                {jsonTemplate}
                            </pre>
                        </div>

                        {/* Input */}
                        <div className="mb-4">
                            <label className="block text-sm text-slate-400 mb-2">Cole seu JSON aqui:</label>
                            <textarea
                                value={batchJson}
                                onChange={(e) => setBatchJson(e.target.value)}
                                placeholder="[{ ... }]"
                                className="w-full h-48 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white font-mono text-sm resize-none focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        {/* Error */}
                        {batchError && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">{batchError}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowBatchModal(false); setBatchJson(''); setBatchError(null); }}
                                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 hover:bg-slate-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBatchImport}
                                disabled={!batchJson.trim()}
                                className="flex-1 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Importar Casos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
