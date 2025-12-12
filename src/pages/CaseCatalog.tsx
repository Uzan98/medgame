import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trophy, ChevronRight, Heart, Brain, Bone, Activity, Lock, Stethoscope, Pill, Baby, Eye, Ear, Droplets, Flame, Zap, Shield } from 'lucide-react';
import { sampleCases, ClinicalCase } from '../lib/cases';
import { useAdminStore } from '../store/adminStore';
import { useGameStore } from '../store/gameStore';
import clsx from 'clsx';

const difficultyColors = {
    facil: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medio: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    dificil: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const difficultyLabels = {
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Difícil',
};

const categoryIcons: Record<string, React.ElementType> = {
    'Cardiologia': Heart,
    'Neurologia': Brain,
    'Ortopedia': Bone,
    'Pneumologia': Activity,
    'Gastroenterologia': Pill,
    'Pediatria': Baby,
    'Oftalmologia': Eye,
    'Otorrinolaringologia': Ear,
    'Nefrologia': Droplets,
    'Emergência': Flame,
    'Infectologia': Zap,
    'Clínica Médica': Stethoscope,
    'Imunologia': Shield,
    'default': Activity,
};

// Category colors for visual distinction
const categoryColors: Record<string, string> = {
    'Cardiologia': 'from-red-500/20 to-pink-500/10 border-red-500/30',
    'Neurologia': 'from-purple-500/20 to-indigo-500/10 border-purple-500/30',
    'Ortopedia': 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    'Pneumologia': 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
    'Gastroenterologia': 'from-green-500/20 to-emerald-500/10 border-green-500/30',
    'Pediatria': 'from-pink-500/20 to-rose-500/10 border-pink-500/30',
    'Emergência': 'from-red-600/20 to-orange-500/10 border-red-600/30',
    'default': 'from-slate-500/20 to-slate-500/10 border-slate-500/30',
};

interface CaseCardProps {
    case_: ClinicalCase;
    isCustom?: boolean;
    isLocked: boolean;
}

const CaseCard: React.FC<CaseCardProps> = ({ case_, isCustom, isLocked }) => {
    const Icon = categoryIcons[case_.category] || categoryIcons.default;
    const requiredLevel = case_.requiredLevel || 1;

    if (isLocked) {
        return (
            <div className="block bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 lg:p-5 opacity-60 cursor-not-allowed relative overflow-hidden">
                {/* Lock Overlay */}
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-10">
                    <div className="bg-slate-800/90 rounded-xl px-4 py-2 flex items-center gap-2 border border-slate-600">
                        <Lock className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-slate-300">Nível {requiredLevel}</span>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-slate-700/30 border border-slate-600/30 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-slate-500" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={clsx('text-[10px] lg:text-xs px-2 py-0.5 rounded-full border opacity-50', difficultyColors[case_.difficulty])}>
                                {difficultyLabels[case_.difficulty]}
                            </span>
                            <span className="text-[10px] lg:text-xs text-slate-600">{case_.category}</span>
                        </div>

                        <h3 className="font-bold text-slate-400 text-sm lg:text-base mb-1 truncate">{case_.title}</h3>
                        <p className="text-[10px] lg:text-xs text-slate-600 line-clamp-2">{case_.chiefComplaint}</p>

                        <div className="flex items-center gap-4 mt-2 text-[10px] lg:text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {case_.estimatedTime} min
                            </span>
                            <span className="flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                {case_.totalPoints} pts
                            </span>
                        </div>
                    </div>

                    {/* Lock Icon */}
                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4 text-slate-500" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            to={`/game/${case_.id}`}
            className="block bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-4 lg:p-5 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:border-cyan-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] group"
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                    <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-cyan-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={clsx('text-[10px] lg:text-xs px-2 py-0.5 rounded-full border', difficultyColors[case_.difficulty])}>
                            {difficultyLabels[case_.difficulty]}
                        </span>
                        <span className="text-[10px] lg:text-xs text-slate-500">{case_.category}</span>
                        {isCustom && (
                            <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">Novo</span>
                        )}
                    </div>

                    <h3 className="font-bold text-white text-sm lg:text-base mb-1 truncate">{case_.title}</h3>
                    <p className="text-[10px] lg:text-xs text-slate-400 line-clamp-2">{case_.chiefComplaint}</p>

                    <div className="flex items-center gap-4 mt-2 text-[10px] lg:text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {case_.estimatedTime} min
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400">
                            <Trophy className="w-3 h-3" />
                            {case_.totalPoints} pts
                        </span>
                    </div>
                </div>

                {/* Arrow */}
                <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </Link>
    );
};

export const CaseCatalog: React.FC = () => {
    const { customCases } = useAdminStore();
    const { level } = useGameStore();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Merge sample cases with custom cases from admin
    const allCases = [...sampleCases, ...customCases];
    const customCaseIds = new Set(customCases.map(c => c.id));

    // Get unique categories with case counts
    const categoryStats = useMemo(() => {
        const stats: Record<string, { total: number; unlocked: number }> = {};
        allCases.forEach(c => {
            if (!stats[c.category]) {
                stats[c.category] = { total: 0, unlocked: 0 };
            }
            stats[c.category].total++;
            if ((c.requiredLevel || 1) <= level) {
                stats[c.category].unlocked++;
            }
        });
        return stats;
    }, [allCases, level]);

    const categories = Object.keys(categoryStats).sort();

    // Filter cases by selected category
    const filteredCases = selectedCategory
        ? allCases.filter(c => c.category === selectedCategory)
        : allCases;

    // Count unlocked cases
    const unlockedCount = allCases.filter(c => (c.requiredLevel || 1) <= level).length;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-4 lg:mb-6">
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-1">Casos Clínicos</h1>
                <p className="text-sm text-slate-400">Selecione um caso para praticar</p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-3 mb-4 lg:mb-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                    <div className="text-lg lg:text-2xl font-bold text-cyan-400">{unlockedCount}/{allCases.length}</div>
                    <div className="text-[10px] lg:text-xs text-slate-400">Desbloqueados</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                    <div className="text-lg lg:text-2xl font-bold text-emerald-400">{categories.length}</div>
                    <div className="text-[10px] lg:text-xs text-slate-400">Categorias</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                    <div className="text-lg lg:text-2xl font-bold text-yellow-400">Nv. {level}</div>
                    <div className="text-[10px] lg:text-xs text-slate-400">Seu Nível</div>
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={clsx(
                        'px-4 py-2 rounded-full text-xs lg:text-sm whitespace-nowrap transition-all',
                        selectedCategory === null
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-cyan-500/30 hover:text-cyan-300'
                    )}
                >
                    Todos ({allCases.length})
                </button>
                {categories.map(cat => {
                    const Icon = categoryIcons[cat] || categoryIcons.default;
                    const stats = categoryStats[cat];
                    return (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={clsx(
                                'px-4 py-2 rounded-full text-xs lg:text-sm whitespace-nowrap transition-all flex items-center gap-2',
                                selectedCategory === cat
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-cyan-500/30 hover:text-cyan-300'
                            )}
                        >
                            <Icon className="w-3 h-3" />
                            {cat} ({stats.unlocked}/{stats.total})
                        </button>
                    );
                })}
            </div>

            {/* Selected Category Header */}
            {selectedCategory && (
                <div className={clsx(
                    'mb-4 p-4 rounded-xl bg-gradient-to-r border',
                    categoryColors[selectedCategory] || categoryColors.default
                )}>
                    <div className="flex items-center gap-3">
                        {(() => {
                            const Icon = categoryIcons[selectedCategory] || categoryIcons.default;
                            return <Icon className="w-6 h-6 text-white" />;
                        })()}
                        <div>
                            <h2 className="text-lg font-bold text-white">{selectedCategory}</h2>
                            <p className="text-xs text-slate-300">
                                {categoryStats[selectedCategory].unlocked} de {categoryStats[selectedCategory].total} casos disponíveis
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Cases Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 lg:space-y-4 scrollbar-hide">
                {filteredCases.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhum caso nesta categoria</p>
                    </div>
                ) : (
                    filteredCases.map(case_ => {
                        const isLocked = (case_.requiredLevel || 1) > level;
                        return (
                            <CaseCard
                                key={case_.id}
                                case_={case_}
                                isCustom={customCaseIds.has(case_.id)}
                                isLocked={isLocked}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};
