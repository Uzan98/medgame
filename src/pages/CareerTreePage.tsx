import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { professionTree, ProfessionNode } from '../lib/professionTree';
import { ChevronRight, ChevronDown, Lock, Unlock, GraduationCap, TreePine, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { SkillTreeView } from '../components/SkillTreeView';

// Recursive Wrapper to handle Parent ID passing (Mobile/Accordion View)
const ProfessionNodeRenderer = ({
    node,
    depth = 0,
    unlockedIds,
    userLevel,
    onUnlock,
    parentId
}: {
    node: ProfessionNode,
    depth?: number,
    unlockedIds: string[],
    userLevel: number,
    onUnlock: (id: string, level: number, parentId?: string) => void,
    parentId?: string
}) => {
    const [isOpen, setIsOpen] = useState(depth < 1);
    const isUnlocked = unlockedIds.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const parentUnlocked = !parentId || unlockedIds.includes(parentId);
    const levelMet = userLevel >= node.levelRequired;
    const canUnlock = !isUnlocked && parentUnlocked && levelMet;

    const handleUnlock = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canUnlock) {
            onUnlock(node.id, node.levelRequired, parentId);
        }
    };

    return (
        <div className="mb-2">
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                    "relative flex items-center p-3 rounded-xl border transition-all duration-300",
                    isUnlocked
                        ? "bg-slate-800/80 border-cyan-500/30 text-white shadow-[0_0_15px_rgba(8,145,178,0.2)]"
                        : canUnlock
                            ? "bg-slate-800/50 border-yellow-500/50 text-slate-300 cursor-pointer hover:bg-slate-800 hover:border-yellow-400 group"
                            : "bg-slate-900/50 border-slate-700/50 text-slate-600 grayscale"
                )}
                style={{ marginLeft: `${depth * 16}px` }}
                onClick={() => hasChildren && setIsOpen(!isOpen)}
            >
                {depth > 0 && (
                    <div className="absolute -left-[16px] top-1/2 w-4 h-[1px] bg-slate-700"></div>
                )}

                <div className="mr-2 cursor-pointer p-1 hover:bg-white/5 rounded-full" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
                    {hasChildren ? (
                        isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    ) : (
                        <div className="w-4 h-4" />
                    )}
                </div>

                <div className="mr-3 shrink-0">
                    {isUnlocked ? (
                        <div className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400 border border-cyan-500/30">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                    ) : canUnlock ? (
                        <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500 border border-yellow-500/30 animate-pulse" onClick={handleUnlock}>
                            <Unlock className="w-5 h-5" />
                        </div>
                    ) : (
                        <div className="bg-slate-800 p-2 rounded-lg text-slate-500 border border-slate-700">
                            <Lock className="w-5 h-5" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="font-bold text-sm sm:text-base truncate pr-2">{node.label}</div>
                        <div className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded bg-slate-950/50 border border-white/5 whitespace-nowrap">
                            Nível {node.levelRequired}
                        </div>
                    </div>
                    {node.description && isUnlocked && (
                        <div className="text-xs text-slate-400 mt-1 truncate">{node.description}</div>
                    )}

                    {!isUnlocked && canUnlock && (
                        <div className="text-xs text-yellow-400 mt-1 font-medium">
                            Disponível para desbloqueio!
                        </div>
                    )}

                    {!isUnlocked && !canUnlock && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            {!parentUnlocked && <span>Requer especialidade anterior</span>}
                            {!parentUnlocked && !levelMet && <span> • </span>}
                            {!levelMet && <span>Requer Nível {node.levelRequired}</span>}
                        </div>
                    )}
                </div>

                {canUnlock && (
                    <button
                        onClick={handleUnlock}
                        className="ml-3 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded shadow-lg transition-transform active:scale-95 hidden sm:block"
                    >
                        Desbloquear
                    </button>
                )}
            </motion.div>

            <AnimatePresence>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        {node.children!.map(child => (
                            <ProfessionNodeRenderer
                                key={child.id}
                                node={child}
                                depth={depth + 1}
                                unlockedIds={unlockedIds}
                                userLevel={userLevel}
                                onUnlock={onUnlock}
                                parentId={node.id}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const CareerTreePage = () => {
    const { unlockedProfessions, level, unlockProfession } = useGameStore();
    const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

    return (
        <div className="w-full max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                            Árvore de Habilidades
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Desbloqueie especializações médicas conforme evolui sua carreira.
                        </p>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setViewMode('tree')}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all",
                                viewMode === 'tree'
                                    ? "bg-cyan-500 text-black"
                                    : "text-slate-400 hover:text-white"
                            )}
                        >
                            <TreePine size={16} />
                            Árvore
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all",
                                viewMode === 'list'
                                    ? "bg-cyan-500 text-black"
                                    : "text-slate-400 hover:text-white"
                            )}
                        >
                            <List size={16} />
                            Lista
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex gap-4 text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-white/5 w-fit">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-cyan-400" />
                        <span>{unlockedProfessions.length} Especializações</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-400">Nível {level}</span>
                    </div>
                </div>
            </div>

            {/* Skill Tree View */}
            {viewMode === 'tree' && (
                <SkillTreeView />
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="space-y-4">
                    {professionTree.map(node => (
                        <ProfessionNodeRenderer
                            key={node.id}
                            node={node}
                            unlockedIds={unlockedProfessions}
                            userLevel={level}
                            onUnlock={unlockProfession}
                            parentId={undefined}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
