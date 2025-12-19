import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Loader2
} from 'lucide-react';
import { savePlantaoEvent, loadAllPlantaoEvents, PlantaoEvent } from '../../lib/plantaoSync';
import { useToastStore } from '../../store/toastStore';
import clsx from 'clsx';

const effects = [
    { value: 'add_patients', label: '+Pacientes', description: 'Adiciona pacientes na fila', color: 'text-red-400' },
    { value: 'remove_patients', label: '-Pacientes', description: 'Remove pacientes da fila', color: 'text-emerald-400' },
    { value: 'add_chaos', label: '+Caos', description: 'Aumenta o caos', color: 'text-orange-400' },
    { value: 'reduce_chaos', label: '-Caos', description: 'Reduz o caos', color: 'text-cyan-400' },
    { value: 'blackout', label: 'Blackout', description: 'Escurece a tela por X segundos', color: 'text-purple-400' },
    { value: 'double_points', label: '2x Pontos', description: 'Próximo caso vale dobro', color: 'text-yellow-400' },
    { value: 'time_pressure', label: '-Tempo', description: 'Reduz tempo disponível', color: 'text-pink-400' }
];

const commonIcons = ['🚑', '🔦', '😭', '☕', '👨‍⚕️', '👔', '📹', '🩺', '💉', '🏥', '🚨', '📞', '👵', '👶', '🤕'];

export const AdminPlantaoEventEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = id && id !== 'new';

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [icon, setIcon] = useState('🚑');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [effect, setEffect] = useState<PlantaoEvent['effect']>('add_patients');
    const [value, setValue] = useState(1);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (isEditing) {
            loadEvent();
        }
    }, [id]);

    const loadEvent = async () => {
        const events = await loadAllPlantaoEvents();
        const eventData = events.find(e => e.id === id);
        if (eventData) {
            setIcon(eventData.icon);
            setTitle(eventData.title);
            setDescription(eventData.description);
            setEffect(eventData.effect);
            setValue(eventData.value);
            setIsActive(eventData.is_active ?? true);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            useToastStore.getState().addToast('Preencha o título', 'error');
            return;
        }
        if (!description.trim()) {
            useToastStore.getState().addToast('Preencha a descrição', 'error');
            return;
        }

        setSaving(true);
        const result = await savePlantaoEvent({
            id: isEditing ? id : undefined,
            icon,
            title,
            description,
            effect,
            value,
            is_active: isActive
        });

        setSaving(false);

        if (result) {
            useToastStore.getState().addToast('Evento salvo com sucesso!', 'success');
            navigate('/admin/plantao');
        } else {
            useToastStore.getState().addToast('Erro ao salvar evento', 'error');
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
                        {isEditing ? 'Editar Evento' : 'Novo Evento'}
                    </h1>
                    <p className="text-sm text-slate-400">Evento de caos do Plantão Infinito</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-6">
                {/* Icon Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Ícone
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {commonIcons.map(i => (
                            <button
                                key={i}
                                onClick={() => setIcon(i)}
                                className={clsx(
                                    'w-12 h-12 rounded-lg text-2xl flex items-center justify-center transition-all',
                                    icon === i
                                        ? 'bg-cyan-500/30 border-2 border-cyan-500 scale-110'
                                        : 'bg-slate-700/50 border border-slate-600 hover:border-slate-500'
                                )}
                            >
                                {i}
                            </button>
                        ))}
                    </div>
                    <div className="mt-2">
                        <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="Ou digite um emoji"
                            className="px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-center w-24"
                            maxLength={4}
                        />
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Título
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: SAMU Chegando!"
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Descrição
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: +3 pacientes na fila!"
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                </div>

                {/* Effect */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Efeito
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {effects.map(e => (
                            <button
                                key={e.value}
                                onClick={() => setEffect(e.value as PlantaoEvent['effect'])}
                                className={clsx(
                                    'p-3 rounded-lg text-left transition-all',
                                    effect === e.value
                                        ? 'bg-slate-700 border-2 border-cyan-500'
                                        : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                                )}
                            >
                                <p className={clsx('font-bold', e.color)}>{e.label}</p>
                                <p className="text-xs text-slate-500">{e.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Value */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Valor do Efeito
                    </label>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                        min={1}
                        className="w-32 px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        {effect === 'add_patients' && 'Número de pacientes adicionados'}
                        {effect === 'remove_patients' && 'Número de pacientes removidos'}
                        {effect === 'add_chaos' && 'Porcentagem de caos adicionado'}
                        {effect === 'reduce_chaos' && 'Porcentagem de caos reduzido'}
                        {effect === 'blackout' && 'Duração em segundos'}
                        {effect === 'double_points' && 'Sempre use 1'}
                        {effect === 'time_pressure' && 'Segundos removidos'}
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

            {/* Preview */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-2">Pré-visualização:</p>
                <div className="bg-slate-800 border border-yellow-500/50 rounded-xl px-6 py-3 flex items-center gap-3 max-w-md">
                    <span className="text-3xl">{icon}</span>
                    <div>
                        <p className="font-bold text-yellow-400">{title || 'Título do Evento'}</p>
                        <p className="text-sm text-slate-300">{description || 'Descrição do evento'}</p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:scale-[1.01] transition-transform disabled:opacity-50"
            >
                {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Save className="w-5 h-5" />
                )}
                {saving ? 'Salvando...' : 'Salvar Evento'}
            </button>
        </div>
    );
};
