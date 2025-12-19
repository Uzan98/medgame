import React, { useEffect, useState } from 'react';
import { Activity, Heart, Wind, Thermometer, Droplets, Power, AlertTriangle } from 'lucide-react';
import { useDetectiveStore } from '../../store/detectiveStore';
import clsx from 'clsx';

export const VitalMonitor: React.FC = () => {
    const store = useDetectiveStore();
    const [blink, setBlink] = useState(false);

    // Heartbeat animation
    useEffect(() => {
        if (store.isMonitoring && store.currentVitals) {
            const interval = setInterval(() => {
                setBlink(b => !b);
            }, 60000 / (store.currentVitals.fc || 80)); // Based on heart rate
            return () => clearInterval(interval);
        }
    }, [store.isMonitoring, store.currentVitals?.fc]);

    const vitals = store.currentVitals;
    const isAlarming = vitals && (
        vitals.fc < 50 || vitals.fc > 120 ||
        vitals.spo2 < 90 ||
        vitals.fr < 8 || vitals.fr > 30
    );

    return (
        <div className={clsx(
            'bg-slate-900 border rounded-xl overflow-hidden transition-all',
            store.isMonitoring
                ? isAlarming
                    ? 'border-red-500/50 shadow-lg shadow-red-500/20'
                    : 'border-emerald-500/30'
                : 'border-slate-700'
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-2 bg-slate-800/50 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <Activity className={clsx(
                        'w-4 h-4',
                        store.isMonitoring
                            ? isAlarming ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                            : 'text-slate-500'
                    )} />
                    <span className="text-xs font-bold text-white">MONITOR</span>
                </div>
                <button
                    onClick={() => store.toggleMonitoring()}
                    className={clsx(
                        'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
                        store.isMonitoring
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-700 text-slate-400 hover:text-white'
                    )}
                >
                    <Power className="w-3 h-3" />
                    {store.isMonitoring ? 'ON' : 'OFF'}
                </button>
            </div>

            {/* Monitor Display */}
            {store.isMonitoring && vitals ? (
                <div className="p-3 space-y-2 font-mono">
                    {/* Heart Rate */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Heart className={clsx(
                                'w-4 h-4 transition-transform',
                                blink ? 'text-red-500 scale-125' : 'text-red-400 scale-100'
                            )} />
                            <span className="text-xs text-red-400">FC</span>
                        </div>
                        <span className={clsx(
                            'text-2xl font-bold',
                            vitals.fc < 50 || vitals.fc > 120 ? 'text-red-400 animate-pulse' : 'text-red-400'
                        )}>
                            {vitals.fc}
                        </span>
                        <span className="text-xs text-slate-500">bpm</span>
                    </div>

                    {/* SpO2 */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs text-cyan-400">SpO₂</span>
                        </div>
                        <span className={clsx(
                            'text-2xl font-bold',
                            vitals.spo2 < 90 ? 'text-red-400 animate-pulse' : 'text-cyan-400'
                        )}>
                            {vitals.spo2}
                        </span>
                        <span className="text-xs text-slate-500">%</span>
                    </div>

                    {/* Blood Pressure */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-yellow-400">PA</span>
                        </div>
                        <span className="text-xl font-bold text-yellow-400">
                            {vitals.pa}
                        </span>
                        <span className="text-xs text-slate-500">mmHg</span>
                    </div>

                    {/* Respiratory Rate */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wind className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-blue-400">FR</span>
                        </div>
                        <span className={clsx(
                            'text-xl font-bold',
                            vitals.fr < 8 || vitals.fr > 30 ? 'text-red-400 animate-pulse' : 'text-blue-400'
                        )}>
                            {vitals.fr}
                        </span>
                        <span className="text-xs text-slate-500">irpm</span>
                    </div>

                    {/* Temperature */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-orange-400" />
                            <span className="text-xs text-orange-400">Temp</span>
                        </div>
                        <span className="text-xl font-bold text-orange-400">
                            {vitals.temp.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500">°C</span>
                    </div>

                    {/* Alarm indicator */}
                    {isAlarming && (
                        <div className="flex items-center gap-2 pt-2 border-t border-red-500/30">
                            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                            <span className="text-xs text-red-400 font-bold">ALARME - Sinais alterados!</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-6 text-center">
                    <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Monitor desligado</p>
                    <p className="text-xs text-slate-600">Clique ON para monitorizar</p>
                </div>
            )}
        </div>
    );
};
