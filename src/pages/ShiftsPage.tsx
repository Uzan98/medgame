import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    MapPin,
    Coins,
    ChevronRight,
    Lock,
    Stethoscope,
    Filter,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { sampleShifts, shiftDifficultyColors, shiftDifficultyLabels, Shift } from '../lib/shifts';
import { loadShifts } from '../lib/shiftsSync';
import clsx from 'clsx';

type SpecialtyFilter = 'all' | 'Emergência' | 'Cardiologia' | 'Pediatria' | 'Neurologia';

export const ShiftsPage: React.FC = () => {
    const navigate = useNavigate();
    const { level, activeShift } = useGameStore();
    const [specialtyFilter, setSpecialtyFilter] = useState<SpecialtyFilter>('all');
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);

    // Load shifts from database
    useEffect(() => {
        const fetchShifts = async () => {
            setLoading(true);
            const dbShifts = await loadShifts();
            // Use database shifts if available, otherwise fallback to sample
            setShifts(dbShifts.length > 0 ? dbShifts : sampleShifts);
            setLoading(false);
        };
        fetchShifts();
    }, []);

    // Filter shifts by specialty
    const filteredShifts = shifts.filter(shift => {
        const matchesSpecialty = specialtyFilter === 'all' || shift.specialty === specialtyFilter;
        return matchesSpecialty;
    });

    const canAcceptShift = (shift: Shift): boolean => {
        return level >= shift.requiredLevel && !activeShift;
    };

    const handleAcceptShift = (shift: Shift) => {
        if (canAcceptShift(shift)) {
            navigate(`/shift/${shift.id}`);
        }
    };

    const specialties: SpecialtyFilter[] = ['all', 'Emergência', 'Cardiologia', 'Pediatria', 'Neurologia'];

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="mb-4 shrink-0">
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    <Stethoscope className="w-6 h-6 text-cyan-400" />
                    Plantões Disponíveis
                </h1>
                <p className="text-sm text-slate-400">Aceite plantões e ganhe MediCoins resolvendo casos!</p>
            </div>

            {/* Active Shift Banner */}
            {activeShift && (
                <div className="mb-4 shrink-0 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{activeShift.icon}</span>
                            <div>
                                <h3 className="font-bold text-cyan-400">Plantão em Andamento</h3>
                                <p className="text-sm text-slate-300">{activeShift.title}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/shift/${activeShift.id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-400 transition-colors"
                        >
                            Continuar
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Specialty Filter */}
            <div className="flex gap-2 mb-4 shrink-0 overflow-x-auto pb-2">
                {specialties.map((specialty) => (
                    <button
                        key={specialty}
                        onClick={() => setSpecialtyFilter(specialty)}
                        className={clsx(
                            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                            specialtyFilter === specialty
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <Filter className="w-3 h-3" />
                            {specialty === 'all' ? 'Todas' : specialty}
                        </span>
                    </button>
                ))}
            </div>

            {/* Shifts List */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    </div>
                ) : filteredShifts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
                        <p>Nenhum plantão disponível para este filtro.</p>
                    </div>
                ) : (
                    filteredShifts.map((shift) => {
                        const isLocked = level < shift.requiredLevel;
                        const hasActiveShift = !!activeShift && activeShift.id !== shift.id;

                        return (
                            <div
                                key={shift.id}
                                className={clsx(
                                    'relative bg-slate-800/50 border rounded-xl p-4 transition-all',
                                    isLocked
                                        ? 'border-slate-700/50 opacity-60'
                                        : hasActiveShift
                                            ? 'border-slate-700/50 opacity-50'
                                            : 'border-slate-700 hover:border-cyan-500/30 hover:bg-slate-800/70 cursor-pointer'
                                )}
                                onClick={() => !isLocked && !hasActiveShift && handleAcceptShift(shift)}
                            >
                                {/* Lock overlay */}
                                {isLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl z-10">
                                        <div className="text-center">
                                            <Lock className="w-8 h-8 text-slate-500 mx-auto mb-1" />
                                            <p className="text-xs text-slate-400">Nível {shift.requiredLevel} necessário</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center text-3xl shrink-0">
                                        {shift.icon}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white truncate">{shift.title}</h3>
                                            <span className={clsx(
                                                'px-2 py-0.5 rounded text-[10px] font-bold border',
                                                shiftDifficultyColors[shift.difficulty]
                                            )}>
                                                {shiftDifficultyLabels[shift.difficulty]}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm text-slate-400 mb-2">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {shift.location}
                                            </span>
                                            <span className="text-slate-600">•</span>
                                            <span>{shift.specialty}</span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1 text-sm text-slate-300">
                                                <Clock className="w-4 h-4 text-slate-500" />
                                                {shift.duration}h
                                            </span>
                                            <span className="flex items-center gap-1 text-sm text-slate-300">
                                                <span className="text-xs text-slate-500">Casos:</span>
                                                {shift.cases.length}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment */}
                                    <div className="text-right shrink-0">
                                        <div className="flex items-center gap-1 text-lg font-bold text-yellow-400">
                                            <Coins className="w-5 h-5" />
                                            {shift.payment}
                                        </div>
                                        <p className="text-[10px] text-slate-500">MediCoins</p>

                                        {!isLocked && !hasActiveShift && (
                                            <button className="mt-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                                                Aceitar
                                                <ChevronRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-xs text-slate-500 mt-3 line-clamp-2">{shift.description}</p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
