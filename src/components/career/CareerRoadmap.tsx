import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { professionTree, ProfessionNode } from '../../lib/professionTree';
import { SpecialtyCard } from './SpecialtyCard';
import { GraduationCap, Trophy, Zap, Star, ChevronDown, BookOpen } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import clsx from 'clsx';

interface CategoryGroup {
    id: string;
    name: string;
    icon: string;
    color: string;
    nodes: ProfessionNode[];
}

// Group specialties by area
const groupByArea = (children: ProfessionNode[]): CategoryGroup[] => {
    const groups: CategoryGroup[] = [
        { id: 'clinica', name: 'Clínica Médica', icon: 'Stethoscope', color: 'red', nodes: [] },
        { id: 'cirurgia', name: 'Cirurgia', icon: 'Scissors', color: 'blue', nodes: [] },
        { id: 'pediatria', name: 'Pediatria', icon: 'Baby', color: 'emerald', nodes: [] },
        { id: 'mulher', name: 'Saúde da Mulher', icon: 'Heart', color: 'pink', nodes: [] },
        { id: 'neuro', name: 'Neurociências', icon: 'Brain', color: 'purple', nodes: [] },
        { id: 'ortopedia', name: 'Ortopedia', icon: 'Bone', color: 'gray', nodes: [] },
        { id: 'diagnostico', name: 'Diagnóstico', icon: 'Microscope', color: 'amber', nodes: [] },
        { id: 'intensiva', name: 'Intensiva/Emergência', icon: 'Siren', color: 'orange', nodes: [] },
        { id: 'outras', name: 'Outras', icon: 'ClipboardList', color: 'teal', nodes: [] },
    ];

    children.forEach(node => {
        if (node.id === 'clinica-medica') {
            groups.find(g => g.id === 'clinica')!.nodes.push(node);
        } else if (node.id === 'cirurgia-geral') {
            groups.find(g => g.id === 'cirurgia')!.nodes.push(node);
        } else if (node.id === 'pediatria') {
            groups.find(g => g.id === 'pediatria')!.nodes.push(node);
        } else if (node.id === 'go') {
            groups.find(g => g.id === 'mulher')!.nodes.push(node);
        } else if (['neurologia', 'neurocirurgia', 'psiquiatria'].includes(node.id)) {
            groups.find(g => g.id === 'neuro')!.nodes.push(node);
        } else if (node.id === 'ortopedia') {
            groups.find(g => g.id === 'ortopedia')!.nodes.push(node);
        } else if (['radio', 'patologia', 'med-nuclear'].includes(node.id)) {
            groups.find(g => g.id === 'diagnostico')!.nodes.push(node);
        } else if (['emergencia', 'uti', 'anestesia'].includes(node.id)) {
            groups.find(g => g.id === 'intensiva')!.nodes.push(node);
        } else {
            groups.find(g => g.id === 'outras')!.nodes.push(node);
        }
    });

    return groups.filter(g => g.nodes.length > 0);
};

const colorBgMap: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    pink: 'bg-pink-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500',
    gray: 'bg-gray-500',
};

// Get Lucide icon component by name
const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.CircleDot;
};

export const CareerRoadmap: React.FC = () => {
    const { unlockedProfessions, level, unlockProfession, xp } = useGameStore();
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['clinica', 'cirurgia']);
    const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

    const academicNode = professionTree[0];
    const specialtyChildren = academicNode.children || [];
    const areaGroups = groupByArea(specialtyChildren);

    const isUnlocked = (id: string) => unlockedProfessions.includes(id);

    const canUnlock = (node: ProfessionNode, parentId?: string) => {
        if (isUnlocked(node.id)) return false;
        if (level < node.levelRequired) return false;
        if (parentId && !isUnlocked(parentId)) return false;
        return true;
    };

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
        );
    };

    const toggleNode = (nodeId: string) => {
        setExpandedNodes(prev =>
            prev.includes(nodeId) ? prev.filter(n => n !== nodeId) : [...prev, nodeId]
        );
    };

    const handleUnlock = (id: string, levelReq: number, parentId?: string) => {
        unlockProfession(id, levelReq, parentId);
    };

    // Calculate XP progress
    const XP_PER_LEVEL = 100;
    const currentLevelXp = xp % XP_PER_LEVEL;
    const xpProgress = (currentLevelXp / XP_PER_LEVEL) * 100;

    // Count unlocked specialties
    const unlockedCount = unlockedProfessions.length;

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Level Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 text-cyan-400 text-sm mb-1">
                        <Star className="w-4 h-4" />
                        <span>Nível</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{level}</div>
                    <div className="mt-2">
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${xpProgress}%` }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">{currentLevelXp}/{XP_PER_LEVEL} XP</div>
                    </div>
                </motion.div>

                {/* Specialties Unlocked */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 text-purple-400 text-sm mb-1">
                        <GraduationCap className="w-4 h-4" />
                        <span>Especialidades</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{unlockedCount}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Desbloqueadas</div>
                </motion.div>

                {/* XP Total */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
                        <Zap className="w-4 h-4" />
                        <span>XP Total</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{xp}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Experiência</div>
                </motion.div>

                {/* Next Unlock */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
                        <Trophy className="w-4 h-4" />
                        <span>Próximo</span>
                    </div>
                    <div className="text-xl font-bold text-white">Nv.{level < 3 ? 3 : level < 8 ? 8 : 15}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                        {level < 3 ? 'Especialidades' : level < 8 ? 'Subesp.' : 'Avançado'}
                    </div>
                </motion.div>
            </div>

            {/* Academic Base (Always Unlocked) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-800 via-slate-800 to-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex items-center gap-4"
            >
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                    <BookOpen className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">Acadêmico</h3>
                    <p className="text-slate-400 text-sm">Estudante de Medicina - Base de todas as especialidades</p>
                </div>
                <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    Ativo
                </div>
            </motion.div>

            {/* Area Groups */}
            <div className="space-y-4">
                {areaGroups.map((group, groupIndex) => {
                    const isGroupExpanded = expandedGroups.includes(group.id);
                    const groupUnlockedCount = group.nodes.reduce(
                        (acc, node) => acc + (isUnlocked(node.id) ? 1 : 0) + (node.children?.filter(c => isUnlocked(c.id)).length || 0),
                        0
                    );
                    const groupTotalCount = group.nodes.reduce(
                        (acc, node) => acc + 1 + (node.children?.length || 0),
                        0
                    );

                    return (
                        <motion.div
                            key={group.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: groupIndex * 0.05 }}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
                        >
                            {/* Group Header */}
                            <button
                                onClick={() => toggleGroup(group.id)}
                                className="w-full flex items-center gap-3 p-4 hover:bg-slate-700/30 transition-colors"
                            >
                                {(() => {
                                    const GroupIcon = getIconComponent(group.icon);
                                    return (
                                        <div className={clsx('p-2 rounded-lg', colorBgMap[group.color] + '/20')}>
                                            <GroupIcon className={clsx('w-5 h-5', 'text-' + group.color + '-400')} />
                                        </div>
                                    );
                                })()}
                                <div className={clsx('w-1.5 h-8 rounded-full', colorBgMap[group.color])} />
                                <div className="flex-1 text-left">
                                    <h3 className="text-white font-bold">{group.name}</h3>
                                    <p className="text-xs text-slate-400">
                                        {groupUnlockedCount}/{groupTotalCount} desbloqueadas
                                    </p>
                                </div>
                                <motion.div
                                    animate={{ rotate: isGroupExpanded ? 180 : 0 }}
                                    className="text-slate-400"
                                >
                                    <ChevronDown className="w-5 h-5" />
                                </motion.div>
                            </button>

                            {/* Group Content */}
                            <AnimatePresence>
                                {isGroupExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-slate-700 overflow-hidden"
                                    >
                                        <div className="p-4 space-y-3">
                                            {group.nodes.map((node) => {
                                                const hasChildren = node.children && node.children.length > 0;
                                                const isNodeExpanded = expandedNodes.includes(node.id);

                                                return (
                                                    <div key={node.id} className="space-y-2">
                                                        {/* Specialty */}
                                                        <SpecialtyCard
                                                            node={node}
                                                            isUnlocked={isUnlocked(node.id)}
                                                            canUnlock={canUnlock(node, 'academic')}
                                                            onUnlock={() => handleUnlock(node.id, node.levelRequired, 'academic')}
                                                            onClick={() => hasChildren && toggleNode(node.id)}
                                                            hasChildren={hasChildren}
                                                            isExpanded={isNodeExpanded}
                                                        />

                                                        {/* Subspecialties */}
                                                        <AnimatePresence>
                                                            {isNodeExpanded && hasChildren && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="ml-6 pl-4 border-l-2 border-slate-700 space-y-2"
                                                                >
                                                                    {node.children!.map((child) => (
                                                                        <SpecialtyCard
                                                                            key={child.id}
                                                                            node={child}
                                                                            isUnlocked={isUnlocked(child.id)}
                                                                            canUnlock={canUnlock(child, node.id)}
                                                                            onUnlock={() => handleUnlock(child.id, child.levelRequired, node.id)}
                                                                        />
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
