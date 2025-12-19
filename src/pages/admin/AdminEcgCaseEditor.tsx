import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToastStore } from '../../store/toastStore';
import clsx from 'clsx';

interface EcgFormData {
    clinical_context: string;
    ecg_image_url: string;
    correct_answer: string;
    alternatives: string[];
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    xp_reward: number;
    coins_reward: number;
    tags: string[];
    is_active: boolean;
}

const initialFormData: EcgFormData = {
    clinical_context: '',
    ecg_image_url: '',
    correct_answer: '',
    alternatives: ['', '', '', ''],
    explanation: '',
    difficulty: 'medium',
    xp_reward: 20,
    coins_reward: 10,
    tags: [],
    is_active: true
};

export const AdminEcgCaseEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToastStore();
    // isNew when id is undefined (from /ecg/new route) or explicitly 'new'
    const isNew = !id || id === 'new';

    const [formData, setFormData] = useState<EcgFormData>(initialFormData);
    const [loading, setLoading] = useState(false); // Start with false, only set true when loading existing
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [tagInput, setTagInput] = useState('');

    // Load existing case
    useEffect(() => {
        if (!isNew && id) {
            setLoading(true);
            loadCase(id);
        }
    }, [id, isNew]);

    const loadCase = async (caseId: string) => {
        try {
            const { data, error } = await supabase
                .from('ecg_cases')
                .select('*')
                .eq('id', caseId)
                .single();

            if (error) throw error;

            setFormData({
                clinical_context: data.clinical_context || '',
                ecg_image_url: data.ecg_image_url || '',
                correct_answer: data.correct_answer || '',
                alternatives: data.alternatives || ['', '', '', ''],
                explanation: data.explanation || '',
                difficulty: data.difficulty || 'medium',
                xp_reward: data.xp_reward || 20,
                coins_reward: data.coins_reward || 10,
                tags: data.tags || [],
                is_active: data.is_active ?? true
            });
        } catch (err) {
            console.error('Error loading case:', err);
            addToast('Erro ao carregar caso', 'error');
            navigate('/admin/ecg');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileName = `ecg-${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
                .from('ecg-images')
                .upload(fileName, file);

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('ecg-images')
                .getPublicUrl(data.path);

            setFormData(prev => ({ ...prev, ecg_image_url: urlData.publicUrl }));
            addToast('Imagem enviada!', 'success');
        } catch (err) {
            console.error('Error uploading image:', err);
            addToast('Erro ao enviar imagem. Verifique se o bucket "ecg-images" existe.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const handleAlternativeChange = (index: number, value: string) => {
        const newAlternatives = [...formData.alternatives];
        newAlternatives[index] = value;
        setFormData(prev => ({ ...prev, alternatives: newAlternatives }));
    };

    const handleAddAlternative = () => {
        setFormData(prev => ({
            ...prev,
            alternatives: [...prev.alternatives, '']
        }));
    };

    const handleRemoveAlternative = (index: number) => {
        if (formData.alternatives.length <= 2) return;
        setFormData(prev => ({
            ...prev,
            alternatives: prev.alternatives.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.clinical_context.trim()) {
            addToast('Preencha o caso clínico', 'error');
            return;
        }
        if (!formData.ecg_image_url.trim()) {
            addToast('Adicione uma imagem de ECG', 'error');
            return;
        }
        if (!formData.correct_answer.trim()) {
            addToast('Preencha a resposta correta', 'error');
            return;
        }
        const filledAlternatives = formData.alternatives.filter(a => a.trim());
        if (filledAlternatives.length < 2) {
            addToast('Adicione pelo menos 2 alternativas', 'error');
            return;
        }
        if (!filledAlternatives.includes(formData.correct_answer)) {
            addToast('A resposta correta deve estar entre as alternativas', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                clinical_context: formData.clinical_context,
                ecg_image_url: formData.ecg_image_url,
                correct_answer: formData.correct_answer,
                alternatives: filledAlternatives,
                explanation: formData.explanation || null,
                difficulty: formData.difficulty,
                xp_reward: formData.xp_reward,
                coins_reward: formData.coins_reward,
                tags: formData.tags,
                is_active: formData.is_active
            };

            if (isNew) {
                const { error } = await supabase
                    .from('ecg_cases')
                    .insert(payload);
                if (error) throw error;
                addToast('Caso criado!', 'success');
            } else {
                const { error } = await supabase
                    .from('ecg_cases')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
                addToast('Caso atualizado!', 'success');
            }

            navigate('/admin/ecg');
        } catch (err) {
            console.error('Error saving case:', err);
            addToast('Erro ao salvar caso', 'error');
        } finally {
            setSaving(false);
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
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link to="/admin/ecg" className="text-slate-400 hover:text-white flex items-center gap-2 mb-2">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para lista
                    </Link>
                    <h1 className="text-2xl font-bold text-white">
                        {isNew ? '🫀 Novo Caso de ECG' : '🫀 Editar Caso de ECG'}
                    </h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* ECG Image */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">📷 Imagem do ECG</h2>

                    {formData.ecg_image_url ? (
                        <div className="space-y-4">
                            <img
                                src={formData.ecg_image_url}
                                alt="ECG Preview"
                                className="w-full max-h-64 object-contain rounded-lg border border-slate-600"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.ecg_image_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ecg_image_url: e.target.value }))}
                                    className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                                    placeholder="URL da imagem"
                                />
                                <label className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white cursor-pointer flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Trocar
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            </div>
                        </div>
                    ) : (
                        <label className="block border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500/50 transition-colors">
                            {uploading ? (
                                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                    <p className="text-slate-400">Clique para fazer upload ou arraste uma imagem</p>
                                    <p className="text-xs text-slate-500 mt-2">PNG, JPG até 5MB</p>
                                </>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Clinical Context */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">📋 Caso Clínico</h2>
                    <textarea
                        value={formData.clinical_context}
                        onChange={(e) => setFormData(prev => ({ ...prev, clinical_context: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white resize-none"
                        placeholder="Ex: Homem, 58 anos, dor torácica opressiva há 2 horas..."
                    />
                </div>

                {/* Answer & Alternatives */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">✅ Resposta e Alternativas</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Resposta Correta *</label>
                            <input
                                type="text"
                                value={formData.correct_answer}
                                onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                                className="w-full px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-white"
                                placeholder="Ex: Infarto Agudo do Miocárdio com Supra de ST"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Alternativas (inclua a correta)</label>
                            <div className="space-y-2">
                                {formData.alternatives.map((alt, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={alt}
                                            onChange={(e) => handleAlternativeChange(idx, e.target.value)}
                                            className={clsx(
                                                "flex-1 px-4 py-2 border rounded-lg text-white",
                                                alt === formData.correct_answer
                                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                                    : "bg-slate-900/50 border-slate-600"
                                            )}
                                            placeholder={`Alternativa ${idx + 1}`}
                                        />
                                        <button
                                            onClick={() => handleRemoveAlternative(idx)}
                                            disabled={formData.alternatives.length <= 2}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg disabled:opacity-30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleAddAlternative}
                                className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Adicionar alternativa
                            </button>
                        </div>
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">💡 Explicação (opcional)</h2>
                    <textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white resize-none"
                        placeholder="Explicação mostrada após a resposta..."
                    />
                </div>

                {/* Settings */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">⚙️ Configurações</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Dificuldade</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                            >
                                <option value="easy">Fácil</option>
                                <option value="medium">Médio</option>
                                <option value="hard">Difícil</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">XP Reward</label>
                            <input
                                type="number"
                                value={formData.xp_reward}
                                onChange={(e) => setFormData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Coins Reward</label>
                            <input
                                type="number"
                                value={formData.coins_reward}
                                onChange={(e) => setFormData(prev => ({ ...prev, coins_reward: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-4">
                        <label className="block text-sm text-slate-400 mb-2">Tags</label>
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {formData.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm flex items-center gap-1">
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-400">×</button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                                placeholder="Digite uma tag e pressione Enter"
                            />
                            <button
                                onClick={handleAddTag}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="mt-4 flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                        <span className="text-slate-300">Caso ativo</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
