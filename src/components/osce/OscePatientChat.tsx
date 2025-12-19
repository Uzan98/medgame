import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertTriangle } from 'lucide-react';
import { useOsceStore } from '../../store/osceStore';
import clsx from 'clsx';
import type { PatientEmotion } from '../../lib/osceTypes';

// Emotion to emoji/style mapping
const emotionStyles: Record<PatientEmotion, { emoji: string; color: string; bg: string }> = {
    neutro: { emoji: '😐', color: 'text-slate-400', bg: 'bg-slate-500/20' },
    preocupado: { emoji: '😟', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    ansioso: { emoji: '😰', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    irritado: { emoji: '😠', color: 'text-red-400', bg: 'bg-red-500/20' },
    confiante: { emoji: '😊', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    aliviado: { emoji: '😌', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    triste: { emoji: '😢', color: 'text-blue-400', bg: 'bg-blue-500/20' }
};

export const OscePatientChat: React.FC = () => {
    const {
        currentCase,
        chatHistory,
        timeRemaining,
        isLoading,
        sendMessage,
        advanceToPhase2,
        setTimeRemaining
    } = useOsceStore();

    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Timer effect
    useEffect(() => {
        if (timeRemaining <= 0) {
            advanceToPhase2();
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(timeRemaining - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, advanceToPhase2, setTimeRemaining]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const message = input.trim();
        setInput('');
        await sendMessage(message);
        inputRef.current?.focus();
    };

    // Start conversation with initial greeting
    const handleStartConversation = async () => {
        if (isLoading) return;
        await sendMessage('Como eu posso te ajudar hoje?');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    if (!currentCase) return null;

    return (
        <div className="flex flex-col h-full">
            {/* Header with Patient Info, Trust, and Timer */}
            <div className="bg-slate-800/50 border-b border-slate-700 p-4 shrink-0">
                <div className="flex items-center justify-between mb-3">
                    {/* Patient Info */}
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">{currentCase.patientAvatar}</div>
                        <div>
                            <h3 className="font-bold text-white">{currentCase.patientName}</h3>
                            <p className="text-sm text-slate-400">
                                {currentCase.patientAge} anos • {currentCase.patientGender === 'M' ? 'Masculino' : 'Feminino'}
                            </p>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className={clsx(
                        'px-4 py-2 rounded-xl font-mono text-lg font-bold',
                        timeRemaining <= 30 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-700 text-white'
                    )}>
                        ⏱️ {formatTime(timeRemaining)}
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Welcome section when chat is empty */}
                {chatHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="text-6xl mb-4">{currentCase.patientAvatar}</div>
                        <h3 className="text-lg font-medium text-white mb-2">
                            {currentCase.patientName} está aguardando
                        </h3>
                        <p className="text-sm text-slate-400 mb-6 max-w-xs">
                            Clique no botão abaixo para iniciar a consulta e descobrir o motivo da visita.
                        </p>
                        <button
                            onClick={handleStartConversation}
                            disabled={isLoading}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl text-white font-bold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
                        >
                            💬 "Como eu posso te ajudar hoje?"
                        </button>
                    </div>
                )}

                {chatHistory.map((msg) => {
                    const isPatient = msg.role === 'patient';
                    const emotionStyle = msg.emotion ? emotionStyles[msg.emotion] : emotionStyles.neutro;

                    return (
                        <div
                            key={msg.id}
                            className={clsx(
                                'flex gap-3',
                                isPatient ? 'justify-start' : 'justify-end'
                            )}
                        >
                            {isPatient && (
                                <div className="shrink-0 text-2xl">{currentCase.patientAvatar}</div>
                            )}

                            <div className={clsx(
                                'max-w-[75%] rounded-2xl px-4 py-3',
                                isPatient
                                    ? `${emotionStyle.bg} border border-slate-700`
                                    : 'bg-cyan-500/20 border border-cyan-500/30'
                            )}>
                                <p className={clsx(
                                    'text-sm',
                                    isPatient ? 'text-slate-200' : 'text-cyan-100'
                                )}>
                                    {msg.content}
                                </p>

                                {isPatient && msg.emotion && (
                                    <div className={clsx('mt-2 text-xs flex items-center gap-1', emotionStyle.color)}>
                                        <span>{emotionStyle.emoji}</span>
                                        <span className="capitalize">{msg.emotion}</span>
                                    </div>
                                )}
                            </div>

                            {!isPatient && (
                                <div className="shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                                    🩺
                                </div>
                            )}
                        </div>
                    );
                })}

                {isLoading && (
                    <div className="flex justify-start gap-3">
                        <div className="text-2xl">{currentCase.patientAvatar}</div>
                        <div className="bg-slate-700/50 border border-slate-600 rounded-2xl px-4 py-3">
                            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Time Warning */}
            {timeRemaining <= 60 && timeRemaining > 0 && (
                <div className="mx-4 mb-2 bg-orange-500/20 border border-orange-500/30 rounded-lg p-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-orange-300">
                        {timeRemaining <= 30 ? 'Restam poucos segundos!' : 'Menos de 1 minuto restante!'}
                    </span>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-slate-800/50 border-t border-slate-700 shrink-0">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Faça uma pergunta ao paciente..."
                        disabled={isLoading}
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Finish Button */}
                <button
                    onClick={advanceToPhase2}
                    className="w-full mt-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-slate-300 font-medium transition-colors"
                >
                    Finalizar Consulta e Ir para Prontuário →
                </button>
            </div>
        </div>
    );
};
