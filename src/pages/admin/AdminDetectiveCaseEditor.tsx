import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp, Loader2, Image, Music } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { DETECTIVE_CASES } from '../../data/detectiveCases';
import { useToastStore } from '../../store/toastStore';
import { uploadDetectiveImage, uploadDetectiveAudio } from '../../lib/supabaseStorage';
import type { DetectiveCase, AnamnesisItem, PhysicalExamItem, ExamItem, MedicalAction, NarrativeScene, InvestigationItem } from '../../lib/detectiveTypes';
import clsx from 'clsx';

const emptyCase: DetectiveCase = {
    id: '',
    title: '',
    subtitle: '',
    environment: 'PS',
    urgency: 'alta',
    timeLimit: 300,
    difficulty: 'medio',
    order: undefined,  // Ordem na trilha (opcional)
    createdAt: Date.now(),  // Timestamp de criação
    patient: {
        name: '',
        age: 50,
        gender: 'M',
        chiefComplaint: '',
        isUnconscious: false,
        glasgowScore: 15,
        vitalSigns: { fc: 80, pa: '120/80', fr: 16, temp: 36.5, spo2: 98 }
    },
    anamnesis: [],
    physicalExam: [],
    exams: [],
    events: [],
    correctDiagnosis: '',
    acceptableDifferentials: [],
    correctConduct: '',
    diagnosisOptions: [],  // 5 alternativas para múltipla escolha
    conductOptions: [],    // 5 alternativas para múltipla escolha
    criticalClues: [],
    commonMistakes: [],
    teachingPoints: [],
    investigation: [],
    actions: [],
    deductionPairs: [],
    narrativeScenes: []
};

export const AdminDetectiveCaseEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { customDetectiveCases, addDetectiveCase, updateDetectiveCase } = useAdminStore();
    const { addToast } = useToastStore();

    const [caseData, setCaseData] = useState<DetectiveCase>(emptyCase);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'patient']));
    const [uploadingScenes, setUploadingScenes] = useState<Record<number, 'image' | 'audio' | null>>({});

    const isNew = id === 'new';
    const isCustom = customDetectiveCases.some(c => c.id === id);

    useEffect(() => {
        if (!isNew && id) {
            const existingCase = [...DETECTIVE_CASES, ...customDetectiveCases].find(c => c.id === id);
            if (existingCase) {
                setCaseData(existingCase);
            }
        }
    }, [id, isNew, customDetectiveCases]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(section)) {
                newSet.delete(section);
            } else {
                newSet.add(section);
            }
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Sync correctDiagnosis and correctConduct with first option in each list
        const finalCase = {
            ...caseData,
            id: isNew ? `detective-custom-${Date.now()}` : caseData.id,
            // First option is always the correct answer
            correctDiagnosis: (caseData.diagnosisOptions || [])[0] || caseData.correctDiagnosis || '',
            correctConduct: (caseData.conductOptions || [])[0] || caseData.correctConduct || ''
        };

        if (isNew) {
            addDetectiveCase(finalCase);
            addToast('Caso criado com sucesso!', 'success');
        } else {
            updateDetectiveCase(finalCase.id, finalCase);
            addToast('Caso atualizado com sucesso!', 'success');
        }

        navigate('/admin/detective');
    };

    // Upload handlers for narrative scenes
    const handleImageUpload = async (sceneIndex: number, file: File) => {
        setUploadingScenes(prev => ({ ...prev, [sceneIndex]: 'image' }));

        const caseId = caseData.id || `temp-${Date.now()}`;
        const { url, error } = await uploadDetectiveImage(file, caseId);

        if (error) {
            addToast(`Erro no upload: ${error}`, 'error');
        } else if (url) {
            updateArrayItem<NarrativeScene>('narrativeScenes', sceneIndex, { imageUrl: url });
            addToast('Imagem enviada com sucesso!', 'success');
        }

        setUploadingScenes(prev => ({ ...prev, [sceneIndex]: null }));
    };

    const handleAudioUpload = async (sceneIndex: number, file: File) => {
        setUploadingScenes(prev => ({ ...prev, [sceneIndex]: 'audio' }));

        const caseId = caseData.id || `temp-${Date.now()}`;
        const { url, error } = await uploadDetectiveAudio(file, caseId);

        if (error) {
            addToast(`Erro no upload: ${error}`, 'error');
        } else if (url) {
            updateArrayItem<NarrativeScene>('narrativeScenes', sceneIndex, { audioUrl: url });
            addToast('Áudio enviado com sucesso!', 'success');
        }

        setUploadingScenes(prev => ({ ...prev, [sceneIndex]: null }));
    };

    // Section Header Component
    const SectionHeader = ({ title, section, count }: { title: string; section: string; count?: number }) => (
        <button
            type="button"
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
        >
            <div className="flex items-center gap-2">
                <span className="font-bold text-white">{title}</span>
                {count !== undefined && (
                    <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">{count}</span>
                )}
            </div>
            {expandedSections.has(section) ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
        </button>
    );

    // Generic array item add/remove
    const addArrayItem = <T,>(key: keyof DetectiveCase, newItem: T) => {
        setCaseData(prev => ({
            ...prev,
            [key]: [...(prev[key] as T[] || []), newItem]
        }));
    };

    const removeArrayItem = (key: keyof DetectiveCase, index: number) => {
        setCaseData(prev => ({
            ...prev,
            [key]: (prev[key] as any[]).filter((_, i) => i !== index)
        }));
    };

    const updateArrayItem = <T,>(key: keyof DetectiveCase, index: number, updates: Partial<T>) => {
        setCaseData(prev => ({
            ...prev,
            [key]: (prev[key] as T[]).map((item, i) => i === index ? { ...item, ...updates } : item)
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/detective')} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-400" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {isNew ? 'Novo Caso Detective' : `Editar: ${caseData.title}`}
                    </h1>
                    <p className="text-slate-400">
                        {isNew ? 'Crie um novo caso investigativo' : isCustom ? 'Editando caso personalizado' : 'Visualizando caso base (somente leitura)'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <SectionHeader title="📋 Informações Básicas" section="basic" />
                {expandedSections.has('basic') && (
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Título</label>
                                <input type="text" value={caseData.title} onChange={(e) => setCaseData({ ...caseData, title: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Subtítulo</label>
                                <input type="text" value={caseData.subtitle} onChange={(e) => setCaseData({ ...caseData, subtitle: e.target.value })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Ambiente</label>
                                <select value={caseData.environment} onChange={(e) => setCaseData({ ...caseData, environment: e.target.value as any })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white">
                                    <option value="PS">Pronto-Socorro</option>
                                    <option value="UTI">UTI</option>
                                    <option value="enfermaria">Enfermaria</option>
                                    <option value="ambulatorio">Ambulatório</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Urgência</label>
                                <select value={caseData.urgency} onChange={(e) => setCaseData({ ...caseData, urgency: e.target.value as any })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white">
                                    <option value="baixa">Baixa</option>
                                    <option value="media">Média</option>
                                    <option value="alta">Alta</option>
                                    <option value="critica">Crítica</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Dificuldade</label>
                                <select value={caseData.difficulty} onChange={(e) => setCaseData({ ...caseData, difficulty: e.target.value as any })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white">
                                    <option value="facil">Fácil</option>
                                    <option value="medio">Médio</option>
                                    <option value="dificil">Difícil</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Tempo Limite (seg)</label>
                                <input type="number" value={caseData.timeLimit} onChange={(e) => setCaseData({ ...caseData, timeLimit: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Ordem na Trilha</label>
                                <input
                                    type="number"
                                    placeholder="Deixe vazio para usar data de criação"
                                    value={caseData.order || ''}
                                    onChange={(e) => setCaseData({ ...caseData, order: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                />
                                <p className="text-xs text-slate-500 mt-1">Define a posição deste caso na trilha de progressão (1 = primeiro)</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Narrative Scenes */}
                <SectionHeader title="📽️ Narrativa Visual" section="narrative" count={caseData.narrativeScenes?.length || 0} />
                {expandedSections.has('narrative') && (
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 space-y-3">
                        <p className="text-sm text-slate-400 mb-4">
                            Adicione cenas cinematográficas que contam a história do paciente antes do caso começar.
                            As imagens e áudios devem ser hospedados no Supabase Storage.
                        </p>
                        {(caseData.narrativeScenes || []).map((scene, idx) => (
                            <div key={idx} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-cyan-400">Cena {idx + 1}</span>
                                    <button type="button" onClick={() => removeArrayItem('narrativeScenes', idx)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Image Upload/URL */}
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Imagem da Cena</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="URL da imagem ou faça upload →"
                                            value={scene.imageUrl}
                                            onChange={(e) => updateArrayItem<NarrativeScene>('narrativeScenes', idx, { imageUrl: e.target.value })}
                                            className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                                        />
                                        <label className={clsx(
                                            'flex items-center gap-1 px-3 py-1.5 rounded cursor-pointer transition-colors',
                                            uploadingScenes[idx] === 'image'
                                                ? 'bg-purple-500/30 text-purple-300 cursor-wait'
                                                : 'bg-purple-500 hover:bg-purple-600 text-white'
                                        )}>
                                            {uploadingScenes[idx] === 'image' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Image className="w-4 h-4" />
                                            )}
                                            <span className="text-xs">{uploadingScenes[idx] === 'image' ? 'Enviando...' : 'Upload'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={uploadingScenes[idx] === 'image'}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(idx, file);
                                                    e.target.value = '';
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Image Preview */}
                                {scene.imageUrl && (
                                    <div className="relative h-32 rounded-lg overflow-hidden bg-slate-800">
                                        <img src={scene.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <button
                                            type="button"
                                            onClick={() => updateArrayItem<NarrativeScene>('narrativeScenes', idx, { imageUrl: '' })}
                                            className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded text-white"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}

                                {/* Audio Upload/URL */}
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Áudio da Cena (opcional)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="URL do áudio ou faça upload →"
                                            value={scene.audioUrl || ''}
                                            onChange={(e) => updateArrayItem<NarrativeScene>('narrativeScenes', idx, { audioUrl: e.target.value })}
                                            className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                                        />
                                        <label className={clsx(
                                            'flex items-center gap-1 px-3 py-1.5 rounded cursor-pointer transition-colors',
                                            uploadingScenes[idx] === 'audio'
                                                ? 'bg-emerald-500/30 text-emerald-300 cursor-wait'
                                                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                        )}>
                                            {uploadingScenes[idx] === 'audio' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Music className="w-4 h-4" />
                                            )}
                                            <span className="text-xs">{uploadingScenes[idx] === 'audio' ? 'Enviando...' : 'Upload'}</span>
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                className="hidden"
                                                disabled={uploadingScenes[idx] === 'audio'}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleAudioUpload(idx, file);
                                                    e.target.value = '';
                                                }}
                                            />
                                        </label>
                                    </div>
                                    {scene.audioUrl && (
                                        <div className="flex items-center gap-2 mt-2 p-2 bg-slate-800 rounded">
                                            <Music className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs text-slate-300 truncate flex-1">{scene.audioUrl.split('/').pop()}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateArrayItem<NarrativeScene>('narrativeScenes', idx, { audioUrl: '' })}
                                                className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Narrative Text */}
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Texto Narrativo</label>
                                    <textarea
                                        placeholder="21:30 - Uma ambulância do SAMU chega em alta velocidade ao Pronto-Socorro..."
                                        value={scene.text}
                                        onChange={(e) => updateArrayItem<NarrativeScene>('narrativeScenes', idx, { text: e.target.value })}
                                        rows={2}
                                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm resize-none"
                                    />
                                </div>

                                {/* Options Row */}
                                <div className="grid grid-cols-4 gap-2">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Posição texto</label>
                                        <select
                                            value={scene.textPosition || 'bottom'}
                                            onChange={(e) => updateArrayItem<NarrativeScene>('narrativeScenes', idx, { textPosition: e.target.value as any })}
                                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                                        >
                                            <option value="top">Topo</option>
                                            <option value="center">Centro</option>
                                            <option value="bottom">Baixo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Estilo</label>
                                        <select
                                            value={scene.textStyle || 'normal'}
                                            onChange={(e) => updateArrayItem<NarrativeScene>('narrativeScenes', idx, { textStyle: e.target.value as any })}
                                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="dramatic">Dramático</option>
                                            <option value="whisper">Sussurro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Transição</label>
                                        <select
                                            value={scene.transition || 'fade'}
                                            onChange={(e) => updateArrayItem<NarrativeScene>('narrativeScenes', idx, { transition: e.target.value as any })}
                                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                                        >
                                            <option value="fade">Fade</option>
                                            <option value="slide">Slide</option>
                                            <option value="zoom">Zoom</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Auto (ms)</label>
                                        <input
                                            type="number"
                                            placeholder="0 = manual"
                                            value={scene.duration || ''}
                                            onChange={(e) => updateArrayItem<NarrativeScene>('narrativeScenes', idx, { duration: e.target.value ? Number(e.target.value) : undefined })}
                                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayItem<NarrativeScene>('narrativeScenes', {
                                id: `scene-${Date.now()}`,
                                order: (caseData.narrativeScenes?.length || 0) + 1,
                                imageUrl: '',
                                text: '',
                                textPosition: 'bottom',
                                textStyle: 'normal',
                                transition: 'fade'
                            })}
                            className="flex items-center gap-2 px-3 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Adicionar Cena
                        </button>
                    </div>
                )}

                {/* Multiple Choice Options */}
                <SectionHeader title="🎯 Alternativas de Múltipla Escolha" section="choices" />
                {expandedSections.has('choices') && (
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 space-y-6">
                        <p className="text-sm text-slate-400">
                            Configure as 5 alternativas para diagnóstico e conduta. A primeira alternativa de cada seção é considerada a correta.
                            Se deixar vazio, o sistema gerará alternativas automaticamente.
                        </p>

                        {/* Diagnosis Options */}
                        <div>
                            <h3 className="text-sm font-bold text-cyan-400 mb-3">Alternativas de Diagnóstico</h3>
                            <div className="space-y-2">
                                {[0, 1, 2, 3, 4].map((idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className={clsx(
                                            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
                                            idx === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                                        )}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <input
                                            type="text"
                                            placeholder={idx === 0 ? 'Diagnóstico correto (obrigatório)' : `Alternativa ${idx + 1} (errada)`}
                                            value={(caseData.diagnosisOptions || [])[idx] || ''}
                                            onChange={(e) => {
                                                const newOptions = [...(caseData.diagnosisOptions || [])];
                                                newOptions[idx] = e.target.value;
                                                setCaseData({ ...caseData, diagnosisOptions: newOptions });
                                            }}
                                            className={clsx(
                                                'flex-1 px-3 py-2 border rounded-lg text-white',
                                                idx === 0 ? 'bg-emerald-900/30 border-emerald-600' : 'bg-slate-900 border-slate-700'
                                            )}
                                        />
                                        {idx === 0 && <span className="text-xs text-emerald-400">✓ Correta</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Conduct Options */}
                        <div>
                            <h3 className="text-sm font-bold text-emerald-400 mb-3">Alternativas de Conduta</h3>
                            <div className="space-y-2">
                                {[0, 1, 2, 3, 4].map((idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className={clsx(
                                            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
                                            idx === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                                        )}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <input
                                            type="text"
                                            placeholder={idx === 0 ? 'Conduta correta (obrigatório)' : `Alternativa ${idx + 1} (errada)`}
                                            value={(caseData.conductOptions || [])[idx] || ''}
                                            onChange={(e) => {
                                                const newOptions = [...(caseData.conductOptions || [])];
                                                newOptions[idx] = e.target.value;
                                                setCaseData({ ...caseData, conductOptions: newOptions });
                                            }}
                                            className={clsx(
                                                'flex-1 px-3 py-2 border rounded-lg text-white',
                                                idx === 0 ? 'bg-emerald-900/30 border-emerald-600' : 'bg-slate-900 border-slate-700'
                                            )}
                                        />
                                        {idx === 0 && <span className="text-xs text-emerald-400">✓ Correta</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Patient Info */}
                <SectionHeader title="👤 Dados do Paciente" section="patient" />
                {expandedSections.has('patient') && (
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Nome</label>
                                <input type="text" value={caseData.patient.name} onChange={(e) => setCaseData({ ...caseData, patient: { ...caseData.patient, name: e.target.value } })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Idade</label>
                                <input type="number" value={caseData.patient.age} onChange={(e) => setCaseData({ ...caseData, patient: { ...caseData.patient, age: Number(e.target.value) } })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Sexo</label>
                                <select value={caseData.patient.gender} onChange={(e) => setCaseData({ ...caseData, patient: { ...caseData.patient, gender: e.target.value as any } })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white">
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Queixa Principal</label>
                            <input type="text" value={caseData.patient.chiefComplaint} onChange={(e) => setCaseData({ ...caseData, patient: { ...caseData.patient, chiefComplaint: e.target.value } })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" />
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-white">
                                <input type="checkbox" checked={caseData.patient.isUnconscious || false} onChange={(e) => setCaseData({ ...caseData, patient: { ...caseData.patient, isUnconscious: e.target.checked } })} className="rounded" />
                                Paciente Inconsciente
                            </label>
                            {caseData.patient.isUnconscious && (
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-slate-400">Glasgow:</label>
                                    <input type="number" min="3" max="15" value={caseData.patient.glasgowScore || 15} onChange={(e) => setCaseData({ ...caseData, patient: { ...caseData.patient, glasgowScore: Number(e.target.value) } })} className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white" />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">FC (bpm)</label>
                                <input type="number" value={caseData.patient.vitalSigns.fc} onChange={(e) => setCaseData({ ...caseData, patient: { ...caseData.patient, vitalSigns: { ...caseData.patient.vitalSigns, fc: Number(e.target.value) } } })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">PA</label>
                                <input type="text" value={caseData.patient.vitalSigns.pa} onChange={(e) => setCaseData({ ...caseData, patient: { ...caseData.patient, vitalSigns: { ...caseData.patient.vitalSigns, pa: e.target.value } } })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">FR (irpm)</label>
                                <input type="number" value={caseData.patient.vitalSigns.fr} onChange={(e) => setCaseData({ ...caseData, patient: { ...caseData.patient, vitalSigns: { ...caseData.patient.vitalSigns, fr: Number(e.target.value) } } })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Temp (°C)</label>
                                <input type="number" step="0.1" value={caseData.patient.vitalSigns.temp} onChange={(e) => setCaseData({ ...caseData, patient: { ...caseData.patient, vitalSigns: { ...caseData.patient.vitalSigns, temp: Number(e.target.value) } } })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">SpO2 (%)</label>
                                <input type="number" value={caseData.patient.vitalSigns.spo2} onChange={(e) => setCaseData({ ...caseData, patient: { ...caseData.patient, vitalSigns: { ...caseData.patient.vitalSigns, spo2: Number(e.target.value) } } })} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Anamnesis */}
                <SectionHeader title="📝 Anamnese" section="anamnesis" count={caseData.anamnesis?.length || 0} />
                {expandedSections.has('anamnesis') && (
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 space-y-3">
                        {(caseData.anamnesis || []).map((item, idx) => (
                            <div key={idx} className="flex gap-2 p-3 bg-slate-900/50 rounded-lg">
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                    <input type="text" placeholder="Categoria" value={item.category} onChange={(e) => updateArrayItem<AnamnesisItem>('anamnesis', idx, { category: e.target.value })} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                    <input type="text" placeholder="Pergunta" value={item.question} onChange={(e) => updateArrayItem<AnamnesisItem>('anamnesis', idx, { question: e.target.value })} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                    <input type="text" placeholder="Resposta" value={item.answer} onChange={(e) => updateArrayItem<AnamnesisItem>('anamnesis', idx, { answer: e.target.value })} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                </div>
                                <label className="flex items-center gap-1 text-xs text-yellow-400">
                                    <input type="checkbox" checked={item.critical || false} onChange={(e) => updateArrayItem<AnamnesisItem>('anamnesis', idx, { critical: e.target.checked })} />
                                    Crítico
                                </label>
                                <button type="button" onClick={() => removeArrayItem('anamnesis', idx)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addArrayItem<AnamnesisItem>('anamnesis', { id: `ana-${Date.now()}`, category: '', question: '', answer: '', critical: false })} className="flex items-center gap-2 px-3 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" /> Adicionar Pergunta
                        </button>
                    </div>
                )}

                {/* Investigation - for unconscious patients */}
                <SectionHeader title="🔍 Investigação (Paciente Inconsciente)" section="investigation" count={caseData.investigation?.length || 0} />
                {expandedSections.has('investigation') && (
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 space-y-3">
                        <p className="text-sm text-slate-400 mb-3">
                            Use esta seção para pacientes inconscientes. Adicione informações obtidas de paramédicos, familiares, testemunhas ou pertences.
                        </p>
                        {(caseData.investigation || []).map((item, idx) => (
                            <div key={idx} className="p-3 bg-slate-900/50 rounded-lg space-y-2">
                                <div className="flex gap-2">
                                    <select
                                        value={item.source}
                                        onChange={(e) => updateArrayItem<InvestigationItem>('investigation', idx, { source: e.target.value as any })}
                                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                                    >
                                        <option value="paramedic">🚑 Paramédico</option>
                                        <option value="family">👨‍👩‍👧 Familiar</option>
                                        <option value="witness">👁️ Testemunha</option>
                                        <option value="belongings">🎒 Pertences</option>
                                        <option value="environment">🏠 Ambiente</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Nome da Fonte (ex: Paramédico João)"
                                        value={item.sourceName}
                                        onChange={(e) => updateArrayItem<InvestigationItem>('investigation', idx, { sourceName: e.target.value })}
                                        className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                                    />
                                    <button type="button" onClick={() => removeArrayItem('investigation', idx)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Categoria"
                                        value={item.category}
                                        onChange={(e) => updateArrayItem<InvestigationItem>('investigation', idx, { category: e.target.value })}
                                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Pergunta"
                                        value={item.question}
                                        onChange={(e) => updateArrayItem<InvestigationItem>('investigation', idx, { question: e.target.value })}
                                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Resposta"
                                        value={item.answer}
                                        onChange={(e) => updateArrayItem<InvestigationItem>('investigation', idx, { answer: e.target.value })}
                                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                                    />
                                </div>
                                <label className="flex items-center gap-1 text-xs text-yellow-400">
                                    <input
                                        type="checkbox"
                                        checked={item.critical || false}
                                        onChange={(e) => updateArrayItem<InvestigationItem>('investigation', idx, { critical: e.target.checked })}
                                    />
                                    Informação Crítica
                                </label>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayItem<InvestigationItem>('investigation', {
                                id: `inv-${Date.now()}`,
                                source: 'paramedic',
                                sourceName: '',
                                category: '',
                                question: '',
                                answer: '',
                                critical: false
                            })}
                            className="flex items-center gap-2 px-3 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Adicionar Fonte de Investigação
                        </button>
                    </div>
                )}

                {/* Physical Exam */}
                <SectionHeader title="🩺 Exame Físico" section="physicalExam" count={caseData.physicalExam?.length || 0} />
                {expandedSections.has('physicalExam') && (
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 space-y-3">
                        {(caseData.physicalExam || []).map((item, idx) => (
                            <div key={idx} className="flex gap-2 p-3 bg-slate-900/50 rounded-lg">
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Sistema" value={item.system} onChange={(e) => updateArrayItem<PhysicalExamItem>('physicalExam', idx, { system: e.target.value })} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                    <input type="text" placeholder="Achado" value={item.finding} onChange={(e) => updateArrayItem<PhysicalExamItem>('physicalExam', idx, { finding: e.target.value })} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                </div>
                                <label className="flex items-center gap-1 text-xs text-yellow-400">
                                    <input type="checkbox" checked={item.critical || false} onChange={(e) => updateArrayItem<PhysicalExamItem>('physicalExam', idx, { critical: e.target.checked })} />
                                    Crítico
                                </label>
                                <button type="button" onClick={() => removeArrayItem('physicalExam', idx)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addArrayItem<PhysicalExamItem>('physicalExam', { id: `pe-${Date.now()}`, system: '', finding: '', critical: false })} className="flex items-center gap-2 px-3 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" /> Adicionar Achado
                        </button>
                    </div>
                )}

                {/* Exams */}
                <SectionHeader title="🧪 Exames Complementares" section="exams" count={caseData.exams?.length || 0} />
                {expandedSections.has('exams') && (
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 space-y-3">
                        {(caseData.exams || []).map((item, idx) => (
                            <div key={idx} className="p-3 bg-slate-900/50 rounded-lg space-y-2">
                                <div className="grid grid-cols-4 gap-2">
                                    <input type="text" placeholder="Nome do exame" value={item.name} onChange={(e) => updateArrayItem<ExamItem>('exams', idx, { name: e.target.value })} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                    <select value={item.category} onChange={(e) => updateArrayItem<ExamItem>('exams', idx, { category: e.target.value as any })} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm">
                                        <option value="laboratorial">Laboratorial</option>
                                        <option value="imagem">Imagem</option>
                                        <option value="funcional">Funcional</option>
                                    </select>
                                    <input type="number" placeholder="Custo" value={item.cost} onChange={(e) => updateArrayItem<ExamItem>('exams', idx, { cost: Number(e.target.value) })} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                    <input type="number" placeholder="Tempo (seg)" value={item.timeToResult} onChange={(e) => updateArrayItem<ExamItem>('exams', idx, { timeToResult: Number(e.target.value) })} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Resultado" value={item.result} onChange={(e) => updateArrayItem<ExamItem>('exams', idx, { result: e.target.value })} className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                    <label className="flex items-center gap-1 text-xs text-yellow-400">
                                        <input type="checkbox" checked={item.critical || false} onChange={(e) => updateArrayItem<ExamItem>('exams', idx, { critical: e.target.checked })} />
                                        Crítico
                                    </label>
                                    <button type="button" onClick={() => removeArrayItem('exams', idx)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addArrayItem<ExamItem>('exams', { id: `ex-${Date.now()}`, name: '', category: 'laboratorial', cost: 50, timeToResult: 30, result: '', critical: false })} className="flex items-center gap-2 px-3 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" /> Adicionar Exame
                        </button>
                    </div>
                )}

                {/* Actions */}
                <SectionHeader title="💉 Condutas Médicas" section="actions" count={caseData.actions?.length || 0} />
                {expandedSections.has('actions') && (
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 space-y-3">
                        {(caseData.actions || []).map((item, idx) => (
                            <div key={idx} className="p-3 bg-slate-900/50 rounded-lg space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                    <input type="text" placeholder="Nome da ação" value={item.name} onChange={(e) => updateArrayItem<MedicalAction>('actions', idx, { name: e.target.value })} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                    <select value={item.category} onChange={(e) => updateArrayItem<MedicalAction>('actions', idx, { category: e.target.value as any })} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm">
                                        <option value="airway">Via Aérea (A)</option>
                                        <option value="breathing">Respiração (B)</option>
                                        <option value="circulation">Circulação (C)</option>
                                        <option value="drugs">Medicações (D)</option>
                                        <option value="monitoring">Monitorização</option>
                                        <option value="procedimento">Procedimentos</option>
                                        <option value="fluidos">Fluidos</option>
                                        <option value="logistica">Logística</option>
                                        <option value="avaliacao">Avaliação</option>
                                    </select>
                                    <input type="text" placeholder="Descrição" value={item.description} onChange={(e) => updateArrayItem<MedicalAction>('actions', idx, { description: e.target.value })} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                </div>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-1 text-xs text-emerald-400">
                                        <input type="checkbox" checked={item.isCorrect} onChange={(e) => updateArrayItem<MedicalAction>('actions', idx, { isCorrect: e.target.checked })} />
                                        Correto
                                    </label>
                                    <label className="flex items-center gap-1 text-xs text-red-400">
                                        <input type="checkbox" checked={item.contraindicated || false} onChange={(e) => updateArrayItem<MedicalAction>('actions', idx, { contraindicated: e.target.checked })} />
                                        Contraindicado
                                    </label>
                                    <button type="button" onClick={() => removeArrayItem('actions', idx)} className="p-1 text-red-400 hover:bg-red-500/20 rounded ml-auto"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addArrayItem<MedicalAction>('actions', { id: `act-${Date.now()}`, name: '', category: 'drugs', description: '', isCorrect: false })} className="flex items-center gap-2 px-3 py-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" /> Adicionar Conduta
                        </button>
                    </div>
                )}

                {/* Teaching Points */}
                <SectionHeader title="📚 Pontos de Ensino" section="teaching" />
                {expandedSections.has('teaching') && (
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 space-y-4">
                        <p className="text-sm text-slate-400 mb-2">
                            Informações que serão exibidas na tela de feedback para ensinar o jogador.
                        </p>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Pistas Críticas (uma por linha)</label>
                            <textarea
                                value={(caseData.criticalClues || []).join('\n')}
                                onChange={(e) => setCaseData({ ...caseData, criticalClues: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                                placeholder="Ex: Supradesnivelamento de ST em V1-V4&#10;Dor precordial irradiando para MSE&#10;Sudorese fria"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white h-24"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Pontos de Ensino (um por linha)</label>
                            <textarea
                                value={(caseData.teachingPoints || []).join('\n')}
                                onChange={(e) => setCaseData({ ...caseData, teachingPoints: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                                placeholder="Ex: IAM com supra de ST é uma emergência médica&#10;O tempo porta-balão ideal é de 90 minutos&#10;Clopidogrel + AAS é o duplo antiagregante padrão"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white h-24"
                            />
                        </div>
                    </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => navigate('/admin/detective')} className="px-6 py-3 text-slate-400 hover:text-white transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={!isNew && !isCustom} className={clsx("flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors", !isNew && !isCustom && "opacity-50 cursor-not-allowed")}>
                        <Save className="w-5 h-5" />
                        {isNew ? 'Criar Caso' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};
