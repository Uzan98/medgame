import React from 'react';
import { ProfessionNode, professionTree } from '../lib/professionTree';
import { useGameStore } from '../store/gameStore';
import { Lock, Unlock, GraduationCap, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const TreeNode = ({
    node,
    unlockedIds,
    userLevel,
    onUnlock,
    parentId,
    depth = 0
}: {
    node: ProfessionNode,
    unlockedIds: string[],
    userLevel: number,
    onUnlock: (id: string, level: number, parentId?: string) => void,
    parentId?: string,
    depth?: number
}) => {
    const isUnlocked = unlockedIds.includes(node.id);
    const parentUnlocked = !parentId || unlockedIds.includes(parentId);
    const levelMet = userLevel >= node.levelRequired;
    const canUnlock = !isUnlocked && parentUnlocked && levelMet;
    const hasChildren = node.children && node.children.length > 0;

    // Auto-expand if unlocked or root or can unlock
    const [isOpen, setIsOpen] = React.useState(isUnlocked || canUnlock || depth < 1);

    const handleUnlock = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canUnlock) {
            onUnlock(node.id, node.levelRequired, parentId);
        }
    };

    return (
        <div className="flex items-start">
            {/* Node Content */}
            <div className="flex flex-col items-center mr-4 relative z-10 group">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={clsx(
                        "w-48 p-3 rounded-xl border-2 shadow-lg transition-all duration-300 relative bg-slate-900 z-20",
                        isUnlocked
                            ? "border-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.3)] bg-slate-800"
                            : canUnlock
                                ? "border-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.3)] cursor-pointer hover:bg-slate-800"
                                : "border-slate-700 opacity-70 grayscale"
                    )}
                    onClick={() => hasChildren && setIsOpen(!isOpen)}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className={clsx(
                            "p-1.5 rounded-lg",
                            isUnlocked ? "bg-cyan-500/20 text-cyan-400" : canUnlock ? "bg-yellow-500/20 text-yellow-500" : "bg-slate-700 text-slate-500"
                        )}>
                            {isUnlocked ? <GraduationCap size={16} /> : canUnlock ? <Unlock size={16} /> : <Lock size={16} />}
                        </div>
                        <span className="text-[10px] font-mono bg-black/40 px-1.5 py-0.5 rounded text-slate-400 border border-white/5">
                            Lvl {node.levelRequired}
                        </span>
                    </div>

                    <h3 className={clsx("font-bold text-sm leading-tight", isUnlocked ? "text-white" : "text-slate-300")}>
                        {node.label}
                    </h3>

                    {/* Expand/Collapse Indicator */}
                    {hasChildren && (
                        <div className="mt-2 flex justify-center">
                            <div className={clsx("transition-transform duration-300", isOpen ? "rotate-90" : "rotate-0")}>
                                <ChevronRight size={16} className="text-slate-500" />
                            </div>
                        </div>
                    )}

                    {canUnlock && (
                        <button
                            onClick={handleUnlock}
                            className="mt-2 w-full py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded shadow-lg transition-transform active:scale-95 z-30 relative"
                        >
                            Desbloquear
                        </button>
                    )}
                </motion.div>

                {/* Horizontal Connector Line (from Node to Children) - Only if Open */}
                {hasChildren && isOpen && (
                    <div className="absolute top-1/2 -right-4 w-4 h-[2px] bg-slate-700 hidden"></div>
                )}
            </div>

            {/* Children Container */}
            {hasChildren && isOpen && (
                <div className="flex flex-col justify-center relative pl-8 py-2">
                    {/* Vertical Line connecting children */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-800 my-4 transform translate-x-3 rounded-full"></div>

                    {node.children!.map((child, index) => (
                        <div key={child.id} className="relative py-2 first:pt-0 last:pb-0 flex items-center">
                            {/* Horizontal Line from Vertical Line to Child Node */}
                            <div className="w-8 h-[2px] bg-slate-800 mr-2 -translate-x-3 rounded-full relative">
                                {/* Dot on the vertical line */}
                                <div className="absolute -left-[5px] -top-[3px] w-2 h-2 rounded-full bg-slate-700 border border-slate-900"></div>
                            </div>

                            <TreeNode
                                node={child}
                                unlockedIds={unlockedIds}
                                userLevel={userLevel}
                                onUnlock={onUnlock}
                                parentId={node.id}
                                depth={depth + 1}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const DesktopCareerTree = () => {
    const { unlockedProfessions, level, unlockProfession } = useGameStore();

    return (
        <div className="overflow-x-auto pb-8 pt-4 custom-scrollbar">
            <div className="inline-block min-w-full">
                <div className="flex flex-col gap-12 pl-4">
                    {professionTree.map(rootNode => (
                        <TreeNode
                            key={rootNode.id}
                            node={rootNode}
                            unlockedIds={unlockedProfessions}
                            userLevel={level}
                            onUnlock={unlockProfession}
                            parentId={undefined}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
