import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, GraduationCap, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ProfessionNode } from '../../lib/professionTree';
import clsx from 'clsx';

interface SpecialtyCardProps {
    node: ProfessionNode;
    isUnlocked: boolean;
    canUnlock: boolean;
    onUnlock: () => void;
    onClick?: () => void;
    hasChildren?: boolean;
    isExpanded?: boolean;
    progress?: number;
}

// Color mapping
const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    red: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', glow: 'shadow-red-500/30' },
    blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
    emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
    pink: { bg: 'bg-pink-500/20', border: 'border-pink-500/50', text: 'text-pink-400', glow: 'shadow-pink-500/30' },
    purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
    amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
    orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', glow: 'shadow-orange-500/30' },
    teal: { bg: 'bg-teal-500/20', border: 'border-teal-500/50', text: 'text-teal-400', glow: 'shadow-teal-500/30' },
    rose: { bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-400', glow: 'shadow-rose-500/30' },
    gray: { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400', glow: 'shadow-gray-500/30' },
    slate: { bg: 'bg-slate-500/20', border: 'border-slate-500/50', text: 'text-slate-400', glow: 'shadow-slate-500/30' },
    cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400', glow: 'shadow-cyan-500/30' },
};

// Get Lucide icon component by name
const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.CircleDot;
};

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({
    node,
    isUnlocked,
    canUnlock,
    onUnlock,
    onClick,
    hasChildren,
    isExpanded,
}) => {
    const colors = colorMap[node.color || 'slate'];
    const NodeIcon = getIconComponent(node.icon || 'CircleDot');

    const getStatusIcon = () => {
        if (isUnlocked) {
            return (
                <div className={clsx('p-2.5 rounded-xl', colors.bg, colors.border, 'border')}>
                    <GraduationCap className={clsx('w-5 h-5', colors.text)} />
                </div>
            );
        }
        if (canUnlock) {
            return (
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="p-2.5 rounded-xl bg-yellow-500/20 border border-yellow-500/50"
                >
                    <Unlock className="w-5 h-5 text-yellow-400" />
                </motion.div>
            );
        }
        return (
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <Lock className="w-5 h-5 text-slate-500" />
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={isUnlocked || canUnlock ? { scale: 1.02, y: -2 } : {}}
            whileTap={isUnlocked || canUnlock ? { scale: 0.98 } : {}}
            className={clsx(
                'relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer',
                isUnlocked && [
                    colors.bg,
                    colors.border,
                    'shadow-lg',
                    colors.glow
                ],
                canUnlock && [
                    'bg-slate-800/80',
                    'border-yellow-500/50',
                    'hover:border-yellow-400',
                    'shadow-lg shadow-yellow-500/10'
                ],
                !isUnlocked && !canUnlock && [
                    'bg-slate-900/50',
                    'border-slate-700/50',
                    'opacity-50',
                    'grayscale'
                ]
            )}
            onClick={onClick}
        >
            {/* Icon */}
            <div className={clsx(
                'p-2 rounded-lg shrink-0',
                isUnlocked ? colors.bg : 'bg-slate-800/50'
            )}>
                <NodeIcon className={clsx(
                    'w-5 h-5',
                    isUnlocked ? colors.text : canUnlock ? 'text-slate-300' : 'text-slate-500'
                )} />
            </div>

            {/* Status Indicator */}
            {getStatusIcon()}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={clsx(
                        'font-bold text-sm truncate',
                        isUnlocked ? 'text-white' : canUnlock ? 'text-slate-200' : 'text-slate-500'
                    )}>
                        {node.label}
                    </span>
                </div>

                <div className={clsx(
                    'text-xs mt-0.5',
                    isUnlocked ? colors.text : 'text-slate-500'
                )}>
                    {isUnlocked ? (
                        <span>✓ Desbloqueado</span>
                    ) : canUnlock ? (
                        <span className="text-yellow-400">Disponível para desbloquear!</span>
                    ) : (
                        <span>Requer Nível {node.levelRequired}</span>
                    )}
                </div>
            </div>

            {/* Level Badge */}
            <div className={clsx(
                'text-[10px] font-mono px-2 py-0.5 rounded-md shrink-0',
                isUnlocked ? [colors.bg, colors.text] : 'bg-slate-800 text-slate-500'
            )}>
                Nv.{node.levelRequired}
            </div>

            {/* Expand Arrow */}
            {hasChildren && (
                <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    className="text-slate-400"
                >
                    <ChevronRight className="w-4 h-4" />
                </motion.div>
            )}

            {/* Unlock Button */}
            {canUnlock && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onUnlock();
                    }}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-lg shadow-lg transition-colors"
                >
                    Desbloquear
                </motion.button>
            )}
        </motion.div>
    );
};
