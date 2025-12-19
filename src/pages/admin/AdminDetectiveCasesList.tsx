import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Search, AlertTriangle, Clock, Users, Upload, Copy, Check, FileJson, X, Database, Loader2 } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { DETECTIVE_CASES } from '../../data/detectiveCases';
import { useToastStore } from '../../store/toastStore';
import type { DetectiveCase } from '../../lib/detectiveTypes';
import clsx from 'clsx';

const difficultyColors = {
    facil: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    medio: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    dificil: 'text-red-400 bg-red-500/20 border-red-500/30',
};

const urgencyColors = {
    baixa: 'text-green-400 bg-green-500/20',
    media: 'text-yellow-400 bg-yellow-500/20',
    alta: 'text-orange-400 bg-orange-500/20',
    critica: 'text-red-400 bg-red-500/20',
};

const difficultyLabels = {
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Difícil',
};

const urgencyLabels = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    critica: 'Crítica',
};

// Template JSON documentado
const jsonTemplate = `[
  {
    // ========== INFORMAÇÕES BÁSICAS ==========
    "title": "Título do Caso",           // Nome principal do caso
    "subtitle": "Descrição curta",        // Subtítulo opcional
    "environment": "PS",                  // Ambiente: "PS" | "UTI" | "enfermaria" | "ambulatorio"
    "urgency": "alta",                    // Urgência: "baixa" | "media" | "alta" | "critica"
    "difficulty": "medio",                // Dificuldade: "facil" | "medio" | "dificil"
    "timeLimit": 300,                     // Tempo limite em SEGUNDOS (300 = 5 min)
    "order": 1,                           // Ordem na trilha (1 = primeiro caso, 2 = segundo, etc.)

    // ========== DADOS DO PACIENTE ==========
    "patient": {
      "name": "João Silva",               // Nome do paciente
      "age": 45,                          // Idade em anos
      "gender": "M",                      // Sexo: "M" | "F"
      "chiefComplaint": "Dor no peito",   // Queixa principal
      "isUnconscious": false,             // Se true, mostra aba Investigação ao invés de Anamnese
      "glasgowScore": 15,                 // Escala de Glasgow (3-15), relevante se inconsciente
      "vitalSigns": {
        "fc": 88,                         // Frequência cardíaca (bpm)
        "pa": "140/90",                   // Pressão arterial (mmHg)
        "fr": 18,                         // Frequência respiratória (irpm)
        "temp": 36.8,                     // Temperatura (°C)
        "spo2": 96                        // Saturação de O2 (%)
      }
    },

    // ========== ANAMNESE (perguntas para paciente consciente) ==========
    "anamnesis": [
      {
        "id": "ana-1",                    // ID único
        "category": "HDA",                // Categoria: HDA, Antecedentes, Medicações, etc.
        "question": "Quando começou?",    // Pergunta que o jogador pode fazer
        "answer": "Há 3 horas",           // Resposta do paciente
        "critical": true                  // Se true, é pista importante (destacada)
      }
    ],

    // ========== EXAME FÍSICO ==========
    "physicalExam": [
      {
        "id": "pe-1",                     // ID único
        "system": "Cardiovascular",       // Sistema: Cardiovascular, Respiratório, Neurológico, etc.
        "finding": "Sopro sistólico em foco aórtico",  // Achado do exame
        "critical": true,                 // Se true, é achado importante
        "hidden": false                   // Se true, só aparece após conduta específica
      }
    ],

    // ========== EXAMES COMPLEMENTARES ==========
    "exams": [
      {
        "id": "ex-1",                     // ID único
        "name": "ECG",                    // Nome do exame
        "category": "funcional",          // Categoria: "laboratorial" | "imagem" | "funcional"
        "cost": 50,                       // Custo em R$ (afeta pontuação)
        "timeToResult": 15,               // Tempo em SEGUNDOS para resultado
        "result": "Supradesnivelamento de ST em V1-V4",  // Resultado do exame
        "critical": true                  // Se true, resultado crítico
      }
    ],

    // ========== CONDUTAS MÉDICAS (ações ABCD) ==========
    "actions": [
      {
        "id": "act-1",                    // ID único
        "name": "AAS 300mg VO",           // Nome da conduta
        "category": "drugs",              // Categoria: "airway" | "breathing" | "circulation" | "drugs" | "monitoring"
        "description": "Antiagregante plaquetário",  // Descrição curta
        "isCorrect": true,                // Se true, é conduta correta
        "contraindicated": false,         // Se true, é PERIGOSA para o paciente
        "effect": {                       // Efeitos da conduta (opcional)
          "vitalChange": {                // Mudanças nos sinais vitais
            "fc": 75,                     // Novo valor de FC (sobrescreve)
            "spo2": 98                    // Novo valor de SpO2
          },
          "message": "AAS administrado com sucesso"  // Mensagem de feedback
        },
        "contraMessage": ""               // Mensagem se contraindicado
      },
      {
        "id": "act-2",
        "name": "Morfina 5mg IV",
        "category": "drugs",
        "description": "Analgésico opioide",
        "isCorrect": false,
        "contraindicated": true,          // PERIGOSO!
        "effect": {
          "vitalChange": { "fc": 50, "pa": "80/50", "fr": 6, "spo2": 82 },
          "message": "⚠️ Depressão respiratória grave!"
        },
        "contraMessage": "Morfina contraindicada neste contexto!"
      }
    ],

    // ========== INVESTIGAÇÃO (para pacientes inconscientes) ==========
    // Use esta seção quando patient.isUnconscious = true
    "investigation": [
      {
        "id": "inv-1",                    // ID único
        "source": "paramedic",            // Fonte: "paramedic" | "family" | "witness" | "belongings" | "environment"
        "sourceName": "Paramédico Carlos", // Nome da fonte (quem fornece a informação)
        "category": "Circunstâncias",     // Categoria da informação
        "question": "Como encontraram?",  // Pergunta que o jogador faz
        "answer": "Caído na rua, inconsciente, com frasco de medicamento ao lado",
        "critical": true                  // Se true, informação crítica (destacada)
      },
      {
        "id": "inv-2",
        "source": "family",
        "sourceName": "Esposa Maria",
        "category": "Antecedentes",
        "question": "Ele tem alguma doença?",
        "answer": "Ele é diabético e hipertenso",
        "critical": true
      }
    ],

    // ========== PERTENCES DO PACIENTE ==========
    "belongings": [
      {
        "name": "Frasco de medicamento",  // Nome do item
        "description": "Metformina 850mg", // Descrição
        "clue": "Paciente é diabético"    // Pista que fornece
      }
    ],

    // ========== ALTERNATIVAS DE MÚLTIPLA ESCOLHA ==========
    // A primeira alternativa (índice 0) é SEMPRE a correta!
    "diagnosisOptions": [
      "Infarto Agudo do Miocárdio com Supra de ST",  // ✅ CORRETA (índice 0)
      "Angina Instável",                              // ❌ errada
      "Pericardite Aguda",                           // ❌ errada
      "Dissecção de Aorta",                          // ❌ errada
      "Tromboembolismo Pulmonar"                     // ❌ errada
    ],
    "conductOptions": [
      "AAS + Clopidogrel + Heparina + Encaminhar para CATE",  // ✅ CORRETA (índice 0)
      "Observação clínica e retorno se piora",                 // ❌ errada
      "Alta com analgésicos",                                  // ❌ errada
      "Internação para investigação eletiva",                  // ❌ errada
      "Antibioticoterapia e observação"                        // ❌ errada
    ],

    // ========== PONTOS DE ENSINO ==========
    "criticalClues": [
      "Supra de ST em derivações contíguas",
      "Dor típica + fatores de risco"
    ],
    "teachingPoints": [
      "ECG deve ser feito em até 10 minutos",
      "Tempo porta-balão < 90 minutos"
    ],

    // ========== PARES DE DEDUÇÃO (conectar pistas) ==========
    "deductionPairs": [
      {
        "clue1": "Dor precordial típica",
        "clue2": "Supra de ST em V1-V4",
        "conclusion": "IAM de parede anterior",
        "isCorrect": true
      }
    ],

    // ========== EVENTOS TEMPORAIS (opcional) ==========
    "events": [
      {
        "id": "ev-1",
        "triggerTime": 120,               // Dispara após X segundos de jogo
        "type": "worsening",              // Tipo: "worsening" | "pressure" | "clue"
        "title": "⚠️ Piora Clínica",
        "description": "Paciente evoluiu com sudorese e palidez",
        "effect": {
          "vitalChange": { "fc": 110, "pa": "100/70" }
        }
      }
    ],

    // ========== NARRATIVA VISUAL (cenas cinematográficas antes do caso) ==========
    "narrativeScenes": [
      {
        "id": "scene-1",                  // ID único da cena
        "order": 1,                       // Ordem de exibição
        "imageUrl": "https://xxx.supabase.co/storage/v1/object/public/detective-images/samu-chegando.jpg",
        "audioUrl": "https://xxx.supabase.co/storage/v1/object/public/detective-audio/sirene.mp3",
        "text": "21:30 - Uma ambulância do SAMU chega em alta velocidade ao Pronto-Socorro...",
        "textPosition": "bottom",         // Posição: "top" | "center" | "bottom"
        "textStyle": "normal",            // Estilo: "normal" | "dramatic" | "whisper"
        "transition": "fade",             // Transição: "fade" | "slide" | "zoom"
        "duration": 5000                  // Auto-avança após Xms (opcional, 0 = manual)
      },
      {
        "id": "scene-2",
        "order": 2,
        "imageUrl": "https://xxx.supabase.co/storage/v1/object/public/detective-images/paciente-maca.jpg",
        "text": "Os paramédicos descem correndo com a maca. Um homem de 45 anos está inconsciente...",
        "textPosition": "bottom",
        "textStyle": "dramatic"
      }
    ]
  }
]`;

export const AdminDetectiveCasesList: React.FC = () => {
    const navigate = useNavigate();
    const { customDetectiveCases, deleteDetectiveCase, addDetectiveCase } = useAdminStore();
    const { addToast } = useToastStore();
    const [search, setSearch] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchJson, setBatchJson] = useState('');
    const [batchError, setBatchError] = useState<string | null>(null);
    const [copiedTemplate, setCopiedTemplate] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);

    // Check if base cases are already migrated
    const baseCasesAlreadyMigrated = DETECTIVE_CASES.every(baseCase =>
        customDetectiveCases.some(c => c.title === baseCase.title)
    );

    const handleMigrateBaseCases = async () => {
        if (baseCasesAlreadyMigrated) {
            addToast('Casos base já foram migrados!', 'info');
            return;
        }

        setIsMigrating(true);
        let migratedCount = 0;

        for (const baseCase of DETECTIVE_CASES) {
            // Check if already exists
            if (customDetectiveCases.some(c => c.title === baseCase.title)) {
                continue;
            }

            // Create new case with new ID and createdAt
            const migratedCase: DetectiveCase = {
                ...baseCase,
                id: `detective-migrated-${Date.now()}-${migratedCount}`,
                createdAt: Date.now(),
                order: migratedCount + 1
            };

            addDetectiveCase(migratedCase);
            migratedCount++;
        }

        setIsMigrating(false);
        addToast(`${migratedCount} caso(s) base migrado(s) para o banco!`, 'success');
    };

    // All cases now come from Supabase (DETECTIVE_CASES is empty after migration)
    const allCases = customDetectiveCases;
    const filteredCases = allCases.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.patient.name.toLowerCase().includes(search.toLowerCase()) ||
        c.correctDiagnosis.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id: string) => {
        deleteDetectiveCase(id);
        setShowDeleteModal(null);
        addToast('Caso excluído com sucesso!', 'success');
    };

    const isCustom = (id: string) => customDetectiveCases.some(c => c.id === id);

    const copyTemplate = () => {
        // Remove comentários para copiar JSON válido
        const cleanJson = jsonTemplate.replace(/\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1');
        navigator.clipboard.writeText(cleanJson);
        setCopiedTemplate(true);
        setTimeout(() => setCopiedTemplate(false), 2000);
    };

    const handleBatchImport = () => {
        try {
            setBatchError(null);
            const cases = JSON.parse(batchJson) as Partial<DetectiveCase>[];

            if (!Array.isArray(cases)) {
                throw new Error('O JSON deve ser um array de casos');
            }

            let importedCount = 0;
            for (const c of cases) {
                // Validate: needs title, patient, and at least one diagnosis option
                const diagOptions = c.diagnosisOptions || [];
                const condOptions = c.conductOptions || [];

                if (!c.title || !c.patient) {
                    throw new Error(`Caso inválido: falta title ou patient`);
                }

                if (diagOptions.length === 0 && !c.correctDiagnosis) {
                    throw new Error(`Caso "${c.title}": falta diagnosisOptions ou correctDiagnosis`);
                }

                const newCase: DetectiveCase = {
                    id: `detective-import-${Date.now()}-${importedCount}`,
                    title: c.title,
                    subtitle: c.subtitle || '',
                    environment: c.environment || 'PS',
                    urgency: c.urgency || 'alta',
                    difficulty: c.difficulty || 'medio',
                    timeLimit: c.timeLimit || 300,
                    order: c.order,
                    createdAt: Date.now(),
                    patient: {
                        name: c.patient.name || 'Paciente',
                        age: c.patient.age || 50,
                        gender: c.patient.gender || 'M',
                        chiefComplaint: c.patient.chiefComplaint || '',
                        isUnconscious: c.patient.isUnconscious || false,
                        glasgowScore: c.patient.glasgowScore || 15,
                        vitalSigns: c.patient.vitalSigns || { fc: 80, pa: '120/80', fr: 16, temp: 36.5, spo2: 98 }
                    },
                    anamnesis: c.anamnesis || [],
                    physicalExam: c.physicalExam || [],
                    exams: c.exams || [],
                    events: c.events || [],
                    // Use first option as correct answer, or fallback to legacy field
                    correctDiagnosis: diagOptions[0] || c.correctDiagnosis || '',
                    acceptableDifferentials: c.acceptableDifferentials || [],
                    correctConduct: condOptions[0] || c.correctConduct || '',
                    // Store all options
                    diagnosisOptions: diagOptions,
                    conductOptions: condOptions,
                    criticalClues: c.criticalClues || [],
                    commonMistakes: c.commonMistakes || [],
                    teachingPoints: c.teachingPoints || [],
                    investigation: c.investigation || [],
                    actions: c.actions || [],
                    belongings: c.belongings || [],
                    deductionPairs: c.deductionPairs || [],
                    narrativeScenes: c.narrativeScenes || []
                };

                addDetectiveCase(newCase);
                importedCount++;
            }

            addToast(`${importedCount} caso(s) importado(s) com sucesso!`, 'success');
            setShowBatchModal(false);
            setBatchJson('');
        } catch (err: any) {
            setBatchError(err.message || 'Erro ao processar JSON');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Medical Detective - Casos</h1>
                    <p className="text-slate-400">Gerencie os casos investigativos estilo House MD</p>
                </div>
                <div className="flex gap-2">
                    {/* Migrate base cases button - only show if not all migrated */}
                    {!baseCasesAlreadyMigrated && (
                        <button
                            onClick={handleMigrateBaseCases}
                            disabled={isMigrating}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isMigrating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Database className="w-5 h-5" />
                            )}
                            {isMigrating ? 'Migrando...' : `Migrar ${DETECTIVE_CASES.length} Casos Base`}
                        </button>
                    )}
                    <button
                        onClick={() => setShowBatchModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        <Upload className="w-5 h-5" />
                        Importar em Lote
                    </button>
                    <Link
                        to="/admin/detective/new"
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
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
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por título, paciente ou diagnóstico..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-2xl font-bold text-white">{allCases.length}</div>
                    <div className="text-sm text-slate-400">Total de Casos</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-2xl font-bold text-cyan-400">{DETECTIVE_CASES.length}</div>
                    <div className="text-sm text-slate-400">Casos Base</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-2xl font-bold text-emerald-400">{customDetectiveCases.length}</div>
                    <div className="text-sm text-slate-400">Casos Personalizados</div>
                </div>
            </div>

            {/* Cases List */}
            <div className="space-y-3">
                {filteredCases.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        Nenhum caso encontrado
                    </div>
                ) : (
                    filteredCases.map((caseItem) => (
                        <div
                            key={caseItem.id}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-white text-lg">{caseItem.title}</h3>
                                        <span className={clsx(
                                            'text-xs px-2 py-1 rounded-full border',
                                            difficultyColors[caseItem.difficulty]
                                        )}>
                                            {difficultyLabels[caseItem.difficulty]}
                                        </span>
                                        <span className={clsx(
                                            'text-xs px-2 py-1 rounded-full',
                                            urgencyColors[caseItem.urgency]
                                        )}>
                                            {urgencyLabels[caseItem.urgency]}
                                        </span>
                                        {!isCustom(caseItem.id) && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                                                Base
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-sm mb-3">{caseItem.subtitle}</p>

                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <Users className="w-4 h-4" />
                                            <span>{caseItem.patient.name} ({caseItem.patient.age}a, {caseItem.patient.gender})</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{Math.floor(caseItem.timeLimit / 60)}min</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span>{caseItem.environment}</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 p-2 bg-slate-900/50 rounded text-sm">
                                        <span className="text-slate-500">Diagnóstico: </span>
                                        <span className="text-emerald-400">{caseItem.correctDiagnosis}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-4 mt-3 text-xs text-slate-500">
                                        <span>📋 {caseItem.anamnesis?.length || 0} anamnese</span>
                                        <span>🩺 {caseItem.physicalExam?.length || 0} exame físico</span>
                                        <span>🧪 {caseItem.exams?.length || 0} exames</span>
                                        <span>💉 {caseItem.actions?.length || 0} condutas</span>
                                        <span>🔍 {caseItem.investigation?.length || 0} investigação</span>
                                        {(caseItem.narrativeScenes?.length || 0) > 0 && (
                                            <span className="text-purple-400">📽️ {caseItem.narrativeScenes?.length} cenas</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => navigate(`/admin/detective/${caseItem.id}`)}
                                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    {isCustom(caseItem.id) && (
                                        <button
                                            onClick={() => setShowDeleteModal(caseItem.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-2">Excluir Caso</h3>
                        <p className="text-slate-400 mb-6">
                            Tem certeza que deseja excluir este caso? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteModal)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Import Modal */}
            {showBatchModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-700 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <FileJson className="w-6 h-6 text-purple-400" />
                                <h3 className="text-xl font-bold text-white">Importar Casos em Lote</h3>
                            </div>
                            <button onClick={() => setShowBatchModal(false)} className="p-2 hover:bg-slate-700 rounded">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4">
                            {/* Template Side */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-white">📋 Template com Documentação</h4>
                                    <button
                                        onClick={copyTemplate}
                                        className="flex items-center gap-1 text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                                    >
                                        {copiedTemplate ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copiedTemplate ? 'Copiado!' : 'Copiar'}
                                    </button>
                                </div>
                                <pre className="bg-slate-900 p-4 rounded-lg text-xs text-slate-300 overflow-auto max-h-[60vh] font-mono whitespace-pre">
                                    {jsonTemplate}
                                </pre>
                            </div>

                            {/* Input Side */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-white">📥 Cole seu JSON aqui</h4>
                                <textarea
                                    value={batchJson}
                                    onChange={(e) => setBatchJson(e.target.value)}
                                    placeholder="Cole o JSON dos casos aqui..."
                                    className="w-full h-[60vh] p-4 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                                {batchError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                                        {batchError}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-4 border-t border-slate-700">
                            <button
                                onClick={() => setShowBatchModal(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBatchImport}
                                disabled={!batchJson.trim()}
                                className="flex items-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                <Upload className="w-5 h-5" />
                                Importar Casos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
