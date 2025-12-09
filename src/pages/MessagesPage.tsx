import React, { useState } from 'react';
import { Mail, Trash2, ChevronLeft, Gift, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useMessageStore, Message } from '../store/messageStore';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const MessagesPage: React.FC = () => {
    const { messages, markAsRead, deleteMessage, claimReward } = useMessageStore();
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

    const selectedMessage = messages.find(m => m.id === selectedMessageId);

    const handleSelectMessage = (msg: Message) => {
        setSelectedMessageId(msg.id);
        if (!msg.read) {
            markAsRead(msg.id);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        deleteMessage(id);
        if (selectedMessageId === id) {
            setSelectedMessageId(null);
        }
    };

    const handleClaim = (msg: Message) => {
        claimReward(msg.id);
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-4 overflow-hidden">
            {/* List View (Inbox) */}
            <div className={clsx(
                "flex-1 flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden",
                selectedMessageId ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Mail className="w-5 h-5 text-cyan-400" />
                        Caixa de Entrada
                    </h2>
                    <span className="text-xs font-medium text-slate-400 px-2 py-1 bg-slate-800 rounded-full">
                        {messages.length} msgs
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                            <Mail className="w-12 h-12 mb-2 opacity-50" />
                            <p>Sua caixa de entrada está vazia.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    onClick={() => handleSelectMessage(msg)}
                                    className={clsx(
                                        "p-4 cursor-pointer hover:bg-slate-700/30 transition-colors flex gap-3 group relative",
                                        msg.read ? "opacity-80" : "bg-cyan-500/5 border-l-2 border-cyan-500",
                                        selectedMessageId === msg.id && "bg-cyan-500/10"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                        msg.type === 'reward' ? "bg-yellow-500/20 text-yellow-400" :
                                            msg.type === 'urgent' ? "bg-red-500/20 text-red-400" :
                                                "bg-slate-700 text-slate-400"
                                    )}>
                                        {msg.type === 'reward' ? <Gift className="w-5 h-5" /> :
                                            msg.type === 'urgent' ? <AlertCircle className="w-5 h-5" /> :
                                                <User className="w-5 h-5" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={clsx("font-medium truncate pr-2", !msg.read && "text-white")}>
                                                {msg.senderRole}
                                            </span>
                                            <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                                {format(new Date(msg.date), "dd/MM HH:mm", { locale: ptBR })}
                                            </span>
                                        </div>
                                        <div className={clsx("text-sm truncate mb-1", !msg.read ? "text-slate-200 font-medium" : "text-slate-400")}>
                                            {msg.subject}
                                        </div>
                                        <div className="text-xs text-slate-500 truncate">
                                            {msg.content.substring(0, 50)}...
                                        </div>
                                    </div>

                                    {/* Delete Button (visible on hover) */}
                                    <button
                                        onClick={(e) => handleDelete(e, msg.id)}
                                        className="absolute right-4 bottom-4 p-1.5 rounded-lg text-slate-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail View */}
            <div className={clsx(
                "flex-1 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center",
                !selectedMessageId && "hidden md:flex"
            )}>
                {!selectedMessage ? (
                    <div className="text-slate-500">
                        <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Selecione uma mensagem para ler</p>
                    </div>
                ) : (
                    // This part renders if selectedMessage exists but we need to handle the mobile view switch
                    // In mobile: this div takes full screen. In desktop: it's side-by-side.
                    // But if selectedMessageId is set, the LIST is hidden on mobile (line 35).
                    // So we must ensure this div IS shown on mobile when selectedMessageId is set.
                    // The class logic at line 125 only hides it if NO message is selected.
                    // If message selected: "flex". Correct.

                    <div className="w-full h-full flex flex-col text-left">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-700 bg-slate-900/30 flex items-start gap-4">
                            <button
                                onClick={() => setSelectedMessageId(null)}
                                className="md:hidden p-2 -ml-2 hover:bg-slate-700 rounded-lg"
                            >
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </button>

                            <div className="flex-1">
                                <h1 className="text-lg lg:text-xl font-bold text-white mb-1">{selectedMessage.subject}</h1>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-cyan-400">
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">{selectedMessage.sender}</span>
                                    </div>
                                    <span className="text-slate-500">•</span>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{format(new Date(selectedMessage.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => handleDelete(e, selectedMessage.id)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Excluir"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line">
                                {selectedMessage.content}
                            </div>

                            {/* Rewards Section */}
                            {selectedMessage.rewards && !selectedMessage.claimed && (
                                <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30 rounded-xl p-4 mt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center shrink-0">
                                            <Gift className="w-6 h-6 text-yellow-400 animate-bounce" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-yellow-100 mb-1">Recompensa Anexada</h3>
                                            <p className="text-sm text-yellow-200/70 mb-3">
                                                Esta mensagem contém itens para você resgatar.
                                            </p>
                                            <div className="flex gap-3 mb-4">
                                                {selectedMessage.rewards.coins && (
                                                    <span className="inline-flex items-center gap-1.5 bg-slate-900/50 px-3 py-1 rounded-lg border border-yellow-500/30 text-yellow-400 text-xs font-bold">
                                                        <span>💰</span> {selectedMessage.rewards.coins} Moedas
                                                    </span>
                                                )}
                                                {selectedMessage.rewards.xp && (
                                                    <span className="inline-flex items-center gap-1.5 bg-slate-900/50 px-3 py-1 rounded-lg border border-purple-500/30 text-purple-400 text-xs font-bold">
                                                        <span>🏆</span> {selectedMessage.rewards.xp} XP
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleClaim(selectedMessage)}
                                                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg text-sm transition-colors shadow-lg shadow-yellow-500/20"
                                            >
                                                Resgatar Agora
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedMessage.claimed && (
                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Recompensa resgatada com sucesso!</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
