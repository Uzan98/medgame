import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { professionTree, ProfessionNode } from '../lib/professionTree';
import { Lock, Unlock, GraduationCap, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// Skill Card Component
const SkillCard = ({
    node,
    isUnlocked,
    canUnlock,
    onUnlock,
    size = 'normal'
}: {
    node: ProfessionNode,
    isUnlocked: boolean,
    canUnlock: boolean,
    onUnlock: () => void,
    size?: 'normal' | 'small'
}) => {
    const isSmall = size === 'small';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={canUnlock ? { scale: 1.05, y: -2 } : {}}
            whileTap={canUnlock ? { scale: 0.98 } : {}}
            onClick={canUnlock ? onUnlock : undefined}
            className={clsx(
                "relative rounded-xl border-2 transition-all duration-300",
                isSmall ? "p-2" : "p-3",
                isUnlocked
                    ? "bg-gradient-to-br from-cyan-900/60 to-blue-900/60 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    : canUnlock
                        ? "bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-yellow-500/60 hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] cursor-pointer"
                        : "bg-slate-900/60 border-slate-700/50 opacity-60"
            )}
        >
            {/* Icon + Title Row */}
            <div className="flex items-center gap-2">
                <div className={clsx(
                    "shrink-0 rounded-lg flex items-center justify-center",
                    isSmall ? "w-7 h-7" : "w-9 h-9",
                    isUnlocked
                        ? "bg-cyan-500/20 text-cyan-400"
                        : canUnlock
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-slate-800 text-slate-500"
                )}>
                    {isUnlocked ? <GraduationCap size={isSmall ? 14 : 18} /> : canUnlock ? <Unlock size={isSmall ? 14 : 18} /> : <Lock size={isSmall ? 14 : 18} />}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className={clsx(
                        "font-bold truncate",
                        isSmall ? "text-[10px]" : "text-xs",
                        isUnlocked ? "text-white" : canUnlock ? "text-yellow-100" : "text-slate-400"
                    )}>
                        {node.label}
                    </h3>
                </div>
            </div>

            {/* Level Badge */}
            <div className={clsx(
                "absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                isUnlocked
                    ? "bg-cyan-500 text-black"
                    : canUnlock
                        ? "bg-yellow-500 text-black"
                        : "bg-slate-700 text-slate-400"
            )}>
                {node.levelRequired}
            </div>

            {/* Unlock Hint */}
            {canUnlock && (
                <div className="mt-1.5 text-[9px] text-yellow-400 font-medium text-center animate-pulse">
                    Toque para desbloquear
                </div>
            )}
        </motion.div>
    );
};

// Category Section Component
const CategorySection = ({
    category,
    unlockedIds,
    userLevel,
    onUnlock
}: {
    category: ProfessionNode,
    unlockedIds: string[],
    userLevel: number,
    onUnlock: (id: string, level: number, parentId?: string) => void
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isUnlocked = unlockedIds.includes(category.id);
    const levelMet = userLevel >= category.levelRequired;
    const canUnlock = !isUnlocked && levelMet;

    return (
        <div className="mb-4">
            {/* Category Header */}
            <motion.button
                onClick={() => {
                    if (canUnlock) {
                        onUnlock(category.id, category.levelRequired, 'academic');
                    }
                    // Always toggle expansion to preview sub-specialties
                    setIsExpanded(!isExpanded);
                }}
                className={clsx(
                    "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                    isUnlocked
                        ? "bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-cyan-500/40"
                        : canUnlock
                            ? "bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border-yellow-500/50 hover:border-yellow-400"
                            : "bg-slate-900/50 border-slate-700/50"
                )}
                whileHover={{ scale: 1.01 }}
            >
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isUnlocked ? "bg-cyan-500/20 text-cyan-400" : canUnlock ? "bg-yellow-500/20 text-yellow-500" : "bg-slate-800 text-slate-500"
                    )}>
                        {isUnlocked ? <GraduationCap size={20} /> : canUnlock ? <Unlock size={20} /> : <Lock size={20} />}
                    </div>
                    <div className="text-left">
                        <h2 className={clsx("font-bold text-sm", isUnlocked ? "text-white" : canUnlock ? "text-yellow-100" : "text-slate-400")}>
                            {category.label}
                        </h2>
                        <p className="text-[10px] text-slate-500">
                            {category.children?.length || 0} sub-especialidades • Nível {category.levelRequired}
                        </p>
                    </div>
                </div>

                {category.children && (
                    <ChevronDown
                        size={20}
                        className={clsx("text-slate-400 transition-transform", isExpanded && "rotate-180")}
                    />
                )}
            </motion.button>

            {/* Sub-specialties Grid - Always expandable to preview */}
            <AnimatePresence>
                {isExpanded && category.children && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 pl-6 border-l-2 border-slate-700/50 ml-5 mt-2">
                            {/* Show locked message if category not unlocked */}
                            {!isUnlocked && (
                                <div className="mb-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
                                    <p className="text-[10px] text-slate-400">
                                        🔒 Desbloqueie <span className="text-cyan-400">{category.label}</span> para acessar estas especialidades
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {category.children.map(subSpec => {
                                    const subIsUnlocked = unlockedIds.includes(subSpec.id);
                                    const subLevelMet = userLevel >= subSpec.levelRequired;
                                    // Can only unlock if parent category is unlocked
                                    const subCanUnlock = !subIsUnlocked && isUnlocked && subLevelMet;

                                    return (
                                        <SkillCard
                                            key={subSpec.id}
                                            node={subSpec}
                                            isUnlocked={subIsUnlocked}
                                            canUnlock={subCanUnlock}
                                            onUnlock={() => onUnlock(subSpec.id, subSpec.levelRequired, category.id)}
                                            size="small"
                                        />
                                    );
                                })}
                            </div>

                            {/* Show super-specialties if any sub has children */}
                            {category.children.filter(s => s.children && s.children.length > 0).map(subWithChildren => {
                                const parentUnlocked = unlockedIds.includes(subWithChildren.id);

                                return (
                                    <div key={subWithChildren.id} className="mt-3 pt-2 border-t border-slate-700/30">
                                        <p className="text-[10px] text-slate-500 mb-2 flex items-center gap-1">
                                            {subWithChildren.label}
                                            {parentUnlocked ? <span className="text-cyan-400">→</span> : <Lock size={10} className="text-slate-600" />}
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {subWithChildren.children!.map(superSpec => {
                                                const superIsUnlocked = unlockedIds.includes(superSpec.id);
                                                const superLevelMet = userLevel >= superSpec.levelRequired;
                                                const superCanUnlock = !superIsUnlocked && parentUnlocked && superLevelMet;

                                                return (
                                                    <SkillCard
                                                        key={superSpec.id}
                                                        node={superSpec}
                                                        isUnlocked={superIsUnlocked}
                                                        canUnlock={superCanUnlock}
                                                        onUnlock={() => onUnlock(superSpec.id, superSpec.levelRequired, subWithChildren.id)}
                                                        size="small"
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const SkillTreeView = () => {
    const { unlockedProfessions, level, unlockProfession } = useGameStore();

    // Get the academic root and its children (main specialties)
    const academicRoot = professionTree[0];
    const mainSpecialties = academicRoot?.children || [];

    return (
        <div className="space-y-2">
            {/* Root Node (Acadêmico) */}
            <div className="mb-6 text-center">
                <div className={clsx(
                    "inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2",
                    "bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                )}>
                    <GraduationCap className="text-cyan-400" size={24} />
                    <div>
                        <h2 className="font-bold text-white">{academicRoot?.label}</h2>
                        <p className="text-[10px] text-cyan-300">{academicRoot?.description}</p>
                    </div>
                </div>
                <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500/50 to-transparent mx-auto"></div>
            </div>

            {/* Main Specialties */}
            {mainSpecialties.map(specialty => (
                <CategorySection
                    key={specialty.id}
                    category={specialty}
                    unlockedIds={unlockedProfessions}
                    userLevel={level}
                    onUnlock={unlockProfession}
                />
            ))}
        </div>
    );
};
