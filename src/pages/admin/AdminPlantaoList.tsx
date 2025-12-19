import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Trash2,
    Edit,
    Loader2,
    Stethoscope,
    Zap,
    AlertTriangle,
    Upload,
    X,
    FileText
} from 'lucide-react';
import {
    loadAllPlantaoCases,
    loadAllPlantaoEvents,
    deletePlantaoCase,
    deletePlantaoEvent,
    bulkInsertPlantaoCases,
    PlantaoCase,
    PlantaoEvent
} from '../../lib/plantaoSync';
import { useToastStore } from '../../store/toastStore';
import clsx from 'clsx';

const BULK_FORMAT_EXAMPLE = `Clínica|Paciente com febre há 3 dias. Conduta?|Antibiótico empírico;Apenas sintomáticos;TC de tórax;Internação|0
Cardio|ECG com supra ST V1-V4. Diagnóstico?|IAM inferior;IAM anterior;Pericardite;BRE|1
Neuro|Hemiparesia súbita há 2h. Prioridade?|TC crânio urgente;RM crânio;Punção lombar;Observar|0`;

export const AdminPlantaoList: React.FC = () => {
    const navigate = useNavigate();
    const [cases, setCases] = useState<PlantaoCase[]>([]);
    const [events, setEvents] = useState<PlantaoEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'cases' | 'events'>('cases');
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkInput, setBulkInput] = useState('');
    const [importing, setImporting] = useState(false);
    const [parsedCases, setParsedCases] = useState<Omit<PlantaoCase, 'id'>[]>([]);
    const [parseError, setParseError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [casesData, eventsData] = await Promise.all([
            loadAllPlantaoCases(),
            loadAllPlantaoEvents()
        ]);
        setCases(casesData);
        setEvents(eventsData);
        setLoading(false);
    };

    const handleDeleteCase = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este caso?')) return;
        const success = await deletePlantaoCase(id);
        if (success) {
            setCases(cases.filter(c => c.id !== id));
            useToastStore.getState().addToast('Caso excluído!', 'success');
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este evento?')) return;
        const success = await deletePlantaoEvent(id);
        if (success) {
            setEvents(events.filter(e => e.id !== id));
            useToastStore.getState().addToast('Evento excluído!', 'success');
        }
    };

    const parseBulkInput = (input: string) => {
        setParseError('');
        const lines = input.trim().split('\n').filter(l => l.trim());
        const parsed: Omit<PlantaoCase, 'id'>[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split('|');
            if (parts.length !== 4) {
                setParseError(`Linha ${i + 1}: Formato inválido. Esperado: especialidade|pergunta|opções|resposta`);
                setParsedCases([]);
                return;
            }

            const [specialty, question, optionsStr, correctStr] = parts;
            const options = optionsStr.split(';').map(o => o.trim());

            if (options.length !== 4) {
                setParseError(`Linha ${i + 1}: Esperado 4 opções separadas por ;`);
                setParsedCases([]);
                return;
            }

            const correctIndex = parseInt(correctStr.trim());
            if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
                setParseError(`Linha ${i + 1}: Índice da resposta correta deve ser 0, 1, 2 ou 3`);
                setParsedCases([]);
                return;
            }

            parsed.push({
                specialty: specialty.trim(),
                question: question.trim(),
                options,
                correct_index: correctIndex,
                is_active: true
            });
        }

        setParsedCases(parsed);
    };

    const handleBulkImport = async () => {
        if (parsedCases.length === 0) return;

        setImporting(true);
        const count = await bulkInsertPlantaoCases(parsedCases);
        setImporting(false);

        if (count > 0) {
            useToastStore.getState().addToast(`${count} casos importados!`, 'success');
            setShowBulkModal(false);
            setBulkInput('');
            setParsedCases([]);
            loadData();
        } else {
            useToastStore.getState().addToast('Erro ao importar casos', 'error');
        }
    };

    const specialtyColors: Record<string, string> = {
        'Clínica': 'bg-cyan-500/20 text-cyan-400',
        'Cardio': 'bg-red-500/20 text-red-400',
        'Neuro': 'bg-purple-500/20 text-purple-400',
        'Pediatria': 'bg-pink-500/20 text-pink-400',
        'Trauma': 'bg-orange-500/20 text-orange-400'
    };

    const effectLabels: Record<string, string> = {
        'add_patients': '+Pacientes',
        'remove_patients': '-Pacientes',
        'add_chaos': '+Caos',
        'reduce_chaos': '-Caos',
        'blackout': 'Blackout',
        'double_points': '2x Pontos',
        'time_pressure': '-Tempo'
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
            {/* Bulk Import Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Upload className="w-5 h-5 text-cyan-400" />
                                <h2 className="text-lg font-bold text-white">Importar Casos em Lote</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowBulkModal(false);
                                    setBulkInput('');
                                    setParsedCases([]);
                                    setParseError('');
                                }}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Format Instructions */}
                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4 text-cyan-400" />
                                    <h3 className="font-bold text-white">Formato do Parser</h3>
                                </div>
                                <p className="text-sm text-slate-400 mb-3">
                                    Cole os casos no formato abaixo, <strong>uma linha por caso</strong>:
                                </p>
                                <code className="block bg-slate-950 rounded-lg p-3 text-xs text-cyan-300 font-mono">
                                    especialidade|pergunta|opção1;opção2;opção3;opção4|índice_correto
                                </code>
                                <p className="text-xs text-slate-500 mt-2">
                                    • Separe campos com <code className="text-yellow-400">|</code> (pipe)<br />
                                    • Separe opções com <code className="text-yellow-400">;</code> (ponto-vírgula)<br />
                                    • Índice correto: 0=primeira, 1=segunda, 2=terceira, 3=quarta
                                </p>
                            </div>

                            {/* Example */}
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                                <h4 className="text-sm font-bold text-emerald-400 mb-2">Exemplo:</h4>
                                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
                                    {BULK_FORMAT_EXAMPLE}
                                </pre>
                            </div>

                            {/* Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Cole seus casos aqui:
                                </label>
                                <textarea
                                    value={bulkInput}
                                    onChange={(e) => {
                                        setBulkInput(e.target.value);
                                        parseBulkInput(e.target.value);
                                    }}
                                    placeholder="Clínica|Pergunta aqui...|Opção A;Opção B;Opção C;Opção D|0"
                                    className="w-full h-40 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-sm resize-none"
                                />
                            </div>

                            {/* Parse Error */}
                            {parseError && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                                    ⚠️ {parseError}
                                </div>
                            )}

                            {/* Preview */}
                            {parsedCases.length > 0 && (
                                <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                                        ✅ Pré-visualização: {parsedCases.length} casos prontos para importar
                                    </h4>
                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {parsedCases.map((c, i) => (
                                            <div key={i} className="bg-slate-800/70 rounded-lg p-3 border border-slate-700">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs text-slate-500">#{i + 1}</span>
                                                    <span className={clsx(
                                                        'px-2 py-0.5 rounded text-xs font-bold',
                                                        specialtyColors[c.specialty] || 'bg-slate-700 text-slate-400'
                                                    )}>
                                                        {c.specialty}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white mb-2">{c.question}</p>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {c.options.map((opt, optIdx) => (
                                                        <div
                                                            key={optIdx}
                                                            className={clsx(
                                                                'text-xs px-2 py-1 rounded flex items-center gap-1',
                                                                optIdx === c.correct_index
                                                                    ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                                                                    : 'bg-slate-700/50 text-slate-400'
                                                            )}
                                                        >
                                                            <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                                                            <span className="truncate">{opt}</span>
                                                            {optIdx === c.correct_index && <span className="ml-auto">✓</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowBulkModal(false);
                                        setBulkInput('');
                                        setParsedCases([]);
                                        setParseError('');
                                    }}
                                    className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleBulkImport}
                                    disabled={parsedCases.length === 0 || importing}
                                    className={clsx(
                                        'flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2',
                                        parsedCases.length > 0
                                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
                                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                    )}
                                >
                                    {importing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Upload className="w-5 h-5" />
                                    )}
                                    Importar {parsedCases.length} Casos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-orange-400" />
                        Plantão Infinito
                    </h1>
                    <p className="text-sm text-slate-400">Gerenciar casos e eventos do jogo</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('cases')}
                    className={clsx(
                        'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
                        activeTab === 'cases'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                    )}
                >
                    <Stethoscope className="w-4 h-4" />
                    Casos ({cases.length})
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={clsx(
                        'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
                        activeTab === 'events'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                    )}
                >
                    <Zap className="w-4 h-4" />
                    Eventos ({events.length})
                </button>
            </div>

            {/* Cases Tab */}
            {activeTab === 'cases' && (
                <div className="space-y-4">
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowBulkModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30"
                        >
                            <Upload className="w-4 h-4" />
                            Importar em Lote
                        </button>
                        <button
                            onClick={() => navigate('/admin/plantao/case/new')}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Caso
                        </button>
                    </div>

                    {cases.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            Nenhum caso cadastrado. Clique em "Novo Caso" para começar.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {cases.map(caseItem => (
                                <div
                                    key={caseItem.id}
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={clsx(
                                                    'px-2 py-0.5 rounded text-xs font-bold',
                                                    specialtyColors[caseItem.specialty] || 'bg-slate-700 text-slate-400'
                                                )}>
                                                    {caseItem.specialty}
                                                </span>
                                                {!caseItem.is_active && (
                                                    <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                                                        Inativo
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-white text-sm line-clamp-2">{caseItem.question}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Resposta correta: {caseItem.options[caseItem.correct_index]}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => navigate(`/admin/plantao/case/${caseItem.id}`)}
                                                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCase(caseItem.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => navigate('/admin/plantao/event/new')}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Evento
                        </button>
                    </div>

                    {events.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            Nenhum evento cadastrado. Clique em "Novo Evento" para começar.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {events.map(event => (
                                <div
                                    key={event.id}
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-3xl">{event.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-white">{event.title}</h3>
                                                {!event.is_active && (
                                                    <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                                                        Inativo
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400 mb-2">{event.description}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
                                                    {effectLabels[event.effect] || event.effect}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    Valor: {event.value}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 shrink-0">
                                            <button
                                                onClick={() => navigate(`/admin/plantao/event/${event.id}`)}
                                                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

