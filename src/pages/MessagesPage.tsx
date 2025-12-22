import React, { useState, useEffect, useRef } from 'react';
import {
    Mail, Trash2, Gift, User, Clock, AlertCircle, CheckCircle,
    MessageCircle, Send, ArrowLeft, Loader2
} from 'lucide-react';
import { useMessageStore, Message } from '../store/messageStore';
import { useRealtimeMessageStore } from '../store/realtimeMessageStore';
import { useAuth } from '../contexts/AuthContext';
import { useFriendStore } from '../store/friendStore';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type TabType = 'direct' | 'system';

export const MessagesPage: React.FC = () => {
    const { user } = useAuth();
    const { messages: systemMessages, markAsRead: markSystemAsRead, deleteMessage: deleteSystemMessage, claimReward } = useMessageStore();
    const {
        messages: allFriendMessages,
        fetchMessages,
        sendMessage,
        getConversations,
        getMessagesWithFriend,
        markConversationAsRead
    } = useRealtimeMessageStore();
    const { getUserProfile } = useFriendStore();

    const [activeTab, setActiveTab] = useState<TabType>('direct');
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
    const [selectedSystemMessage, setSelectedSystemMessage] = useState<Message | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [friendProfiles, setFriendProfiles] = useState<Record<string, { displayName: string; avatarUrl?: string }>>({});

    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch messages on mount
    useEffect(() => {
        if (user?.id) {
            fetchMessages(user.id);
        }
    }, [user?.id, fetchMessages]);

    // Get conversations for current user
    const conversations = user?.id ? getConversations(user.id) : [];

    // Get messages for selected conversation
    const chatMessages = user?.id && selectedFriendId
        ? getMessagesWithFriend(user.id, selectedFriendId)
        : [];

    // Fetch friend profiles for conversations
    useEffect(() => {
        const loadProfiles = async () => {
            const profiles: Record<string, { displayName: string; avatarUrl?: string }> = {};
            for (const conv of conversations) {
                if (!friendProfiles[conv.friendId]) {
                    const profile = await getUserProfile(conv.friendId);
                    if (profile) {
                        profiles[conv.friendId] = {
                            displayName: profile.displayName,
                            avatarUrl: profile.avatarUrl ?? undefined
                        };
                    }
                }
            }
            if (Object.keys(profiles).length > 0) {
                setFriendProfiles(prev => ({ ...prev, ...profiles }));
            }
        };
        if (conversations.length > 0) {
            loadProfiles();
        }
    }, [conversations.length]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Mark conversation as read when selected
    useEffect(() => {
        if (user?.id && selectedFriendId) {
            markConversationAsRead(user.id, selectedFriendId);
        }
    }, [selectedFriendId, user?.id]);

    // Focus input when conversation selected
    useEffect(() => {
        if (selectedFriendId) {
            inputRef.current?.focus();
        }
    }, [selectedFriendId]);

    const handleSelectConversation = (friendId: string) => {
        setSelectedFriendId(friendId);
        setSelectedSystemMessage(null);
        setActiveTab('direct');
    };

    const handleSelectSystemMessage = (msg: Message) => {
        setSelectedSystemMessage(msg);
        setSelectedFriendId(null);
        if (!msg.read) {
            markSystemAsRead(msg.id);
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !user?.id || !selectedFriendId || isSending) return;

        setIsSending(true);
        const result = await sendMessage(user.id, selectedFriendId, messageInput.trim());
        setIsSending(false);

        if (result.success) {
            setMessageInput('');
            await fetchMessages(user.id);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleDeleteSystemMessage = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        deleteSystemMessage(id);
        if (selectedSystemMessage?.id === id) {
            setSelectedSystemMessage(null);
        }
    };

    const handleClaim = (msg: Message) => {
        claimReward(msg.id);
    };

    const unreadDirectCount = user?.id
        ? allFriendMessages.filter(m => !m.read && m.receiverId === user.id).length
        : 0;
    const unreadSystemCount = systemMessages.filter(m => !m.read).length;

    const selectedFriendProfile = selectedFriendId ? friendProfiles[selectedFriendId] : null;
    const selectedFriendConv = conversations.find(c => c.friendId === selectedFriendId);

    return (
        <div className="h-full flex flex-col md:flex-row gap-0 overflow-hidden bg-slate-900/50 rounded-xl border border-slate-700">
            {/* Left Panel - Conversation List */}
            <div className={clsx(
                "w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-700 bg-slate-800/30",
                (selectedFriendId || selectedSystemMessage) ? "hidden md:flex" : "flex"
            )}>
                {/* Tabs */}
                <div className="p-2 border-b border-slate-700 bg-slate-900/50 flex gap-1">
                    <button
                        onClick={() => setActiveTab('direct')}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'direct'
                                ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                        )}
                    >
                        <MessageCircle className="w-4 h-4" />
                        Direct
                        {unreadDirectCount > 0 && (
                            <span className="w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                {unreadDirectCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('system')}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'system'
                                ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                        )}
                    >
                        <Mail className="w-4 h-4" />
                        Sistema
                        {unreadSystemCount > 0 && (
                            <span className="w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                {unreadSystemCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Conversations or System Messages List */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'direct' ? (
                        conversations.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                                <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
                                <p className="font-medium">Nenhuma conversa ainda</p>
                                <p className="text-xs mt-2 text-slate-600">Envie mensagens pelo perfil de amigos!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700/30">
                                {conversations.map((conv) => {
                                    const profile = friendProfiles[conv.friendId];
                                    const isSelected = selectedFriendId === conv.friendId;
                                    const lastMsgPreview = conv.lastMessage.senderId === user?.id
                                        ? `Você: ${conv.lastMessage.content}`
                                        : conv.lastMessage.content;

                                    return (
                                        <div
                                            key={conv.friendId}
                                            onClick={() => handleSelectConversation(conv.friendId)}
                                            className={clsx(
                                                "p-3 cursor-pointer transition-all flex gap-3 group",
                                                isSelected
                                                    ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-l-2 border-cyan-500"
                                                    : "hover:bg-slate-700/30",
                                                conv.unreadCount > 0 && !isSelected && "bg-cyan-500/5"
                                            )}
                                        >
                                            {/* Avatar */}
                                            <div className="relative">
                                                <div className={clsx(
                                                    "w-12 h-12 rounded-full p-0.5 shrink-0",
                                                    conv.unreadCount > 0
                                                        ? "bg-gradient-to-br from-cyan-500 to-purple-500"
                                                        : "bg-slate-700"
                                                )}>
                                                    <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden">
                                                        <img
                                                            src={profile?.avatarUrl || conv.friendAvatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${conv.friendId}`}
                                                            alt="Avatar"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-800" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <span className={clsx(
                                                        "font-semibold truncate text-sm",
                                                        conv.unreadCount > 0 ? "text-white" : "text-slate-300"
                                                    )}>
                                                        {profile?.displayName || conv.friendName || 'Jogador'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                                                        {format(new Date(conv.lastMessage.createdAt), "HH:mm", { locale: ptBR })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className={clsx(
                                                        "text-xs truncate flex-1",
                                                        conv.unreadCount > 0 ? "text-slate-200 font-medium" : "text-slate-500"
                                                    )}>
                                                        {lastMsgPreview.length > 35 ? lastMsgPreview.substring(0, 35) + '...' : lastMsgPreview}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold shrink-0">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        // System Messages
                        systemMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                                <Mail className="w-12 h-12 mb-3 opacity-30" />
                                <p className="font-medium">Caixa de entrada vazia</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700/30">
                                {systemMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        onClick={() => handleSelectSystemMessage(msg)}
                                        className={clsx(
                                            "p-3 cursor-pointer hover:bg-slate-700/30 transition-colors flex gap-3 group relative",
                                            !msg.read && "bg-cyan-500/5 border-l-2 border-cyan-500",
                                            selectedSystemMessage?.id === msg.id && "bg-cyan-500/10"
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
                                            <div className="flex justify-between items-start mb-0.5">
                                                <span className={clsx("font-medium truncate text-sm", !msg.read && "text-white")}>
                                                    {msg.senderRole}
                                                </span>
                                                <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                                                    {format(new Date(msg.date), "dd/MM", { locale: ptBR })}
                                                </span>
                                            </div>
                                            <p className={clsx("text-xs truncate", !msg.read ? "text-slate-200" : "text-slate-500")}>
                                                {msg.subject}
                                            </p>
                                        </div>

                                        <button
                                            onClick={(e) => handleDeleteSystemMessage(e, msg.id)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Right Panel - Chat or System Message Detail */}
            <div className={clsx(
                "flex-1 flex flex-col",
                !(selectedFriendId || selectedSystemMessage) && "hidden md:flex"
            )}>
                {!selectedFriendId && !selectedSystemMessage ? (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-12 h-12 opacity-30" />
                        </div>
                        <p className="font-medium text-lg">Suas mensagens</p>
                        <p className="text-sm text-slate-600 mt-1">Selecione uma conversa para começar</p>
                    </div>
                ) : selectedFriendId ? (
                    // Chat View
                    <>
                        {/* Chat Header */}
                        <div className="p-3 border-b border-slate-700 bg-slate-800/50 flex items-center gap-3">
                            <button
                                onClick={() => setSelectedFriendId(null)}
                                className="md:hidden p-2 -ml-2 hover:bg-slate-700 rounded-lg text-slate-400"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-0.5">
                                <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden">
                                    <img
                                        src={selectedFriendProfile?.avatarUrl || selectedFriendConv?.friendAvatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedFriendId}`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-white text-sm">
                                    {selectedFriendProfile?.displayName || selectedFriendConv?.friendName || 'Jogador'}
                                </h3>
                                <p className="text-[10px] text-slate-500">Online agora</p>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {chatMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                                    <p className="text-sm">Nenhuma mensagem ainda</p>
                                    <p className="text-xs text-slate-600 mt-1">Envie a primeira mensagem!</p>
                                </div>
                            ) : (
                                chatMessages.map((msg) => {
                                    const isSent = msg.senderId === user?.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={clsx(
                                                "flex gap-2",
                                                isSent ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            {!isSent && (
                                                <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0">
                                                    <img
                                                        src={msg.senderAvatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${msg.senderId}`}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className={clsx(
                                                "max-w-[70%] rounded-2xl px-4 py-2.5",
                                                isSent
                                                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-br-md"
                                                    : "bg-slate-700 text-slate-100 rounded-bl-md"
                                            )}>
                                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                                <p className={clsx(
                                                    "text-[10px] mt-1",
                                                    isSent ? "text-white/60" : "text-slate-500"
                                                )}>
                                                    {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                                                </p>
                                            </div>

                                            {isSent && (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 overflow-hidden shrink-0 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-3 border-t border-slate-700 bg-slate-800/50">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Envie uma mensagem..."
                                    disabled={isSending}
                                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!messageInput.trim() || isSending}
                                    className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shrink-0"
                                >
                                    {isSending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : selectedSystemMessage ? (
                    // System Message Detail
                    <>
                        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-start gap-4">
                            <button
                                onClick={() => setSelectedSystemMessage(null)}
                                className="md:hidden p-2 -ml-2 hover:bg-slate-700 rounded-lg text-slate-400"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="flex-1">
                                <h1 className="text-lg font-bold text-white mb-1">{selectedSystemMessage.subject}</h1>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-cyan-400">
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">{selectedSystemMessage.sender}</span>
                                    </div>
                                    <span className="text-slate-500">•</span>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{format(new Date(selectedSystemMessage.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => handleDeleteSystemMessage(e, selectedSystemMessage.id)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line">
                                {selectedSystemMessage.content}
                            </div>

                            {selectedSystemMessage.rewards && !selectedSystemMessage.claimed && (
                                <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30 rounded-xl p-4">
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
                                                {selectedSystemMessage.rewards.coins && (
                                                    <span className="inline-flex items-center gap-1.5 bg-slate-900/50 px-3 py-1 rounded-lg border border-yellow-500/30 text-yellow-400 text-xs font-bold">
                                                        💰 {selectedSystemMessage.rewards.coins} Moedas
                                                    </span>
                                                )}
                                                {selectedSystemMessage.rewards.xp && (
                                                    <span className="inline-flex items-center gap-1.5 bg-slate-900/50 px-3 py-1 rounded-lg border border-purple-500/30 text-purple-400 text-xs font-bold">
                                                        🏆 {selectedSystemMessage.rewards.xp} XP
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleClaim(selectedSystemMessage)}
                                                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg text-sm transition-colors shadow-lg shadow-yellow-500/20"
                                            >
                                                Resgatar Agora
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedSystemMessage.claimed && (
                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Recompensa resgatada com sucesso!</span>
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};
