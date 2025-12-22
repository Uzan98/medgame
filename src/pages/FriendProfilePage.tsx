import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Crown,
    Flame,
    Target,
    Zap,
    MessageCircle,
    UserMinus,
    Send,
    X,
} from 'lucide-react';
import { useFriendStore } from '../store/friendStore';
import { useRealtimeMessageStore } from '../store/realtimeMessageStore';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../lib/friendTypes';
import { getCurrentBadge } from '../lib/badges';
import clsx from 'clsx';

export const FriendProfilePage: React.FC = () => {
    const { friendId } = useParams<{ friendId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getUserProfile, removeFriend, friends } = useFriendStore();
    const { sendMessage } = useRealtimeMessageStore();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageText, setMessageText] = useState('');

    const isFriend = friends.some(f => f.friendId === friendId);

    useEffect(() => {
        const loadProfile = async () => {
            if (friendId) {
                setIsLoading(true);
                const data = await getUserProfile(friendId);
                setProfile(data);
                setIsLoading(false);
            }
        };
        loadProfile();
    }, [friendId, getUserProfile]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !profile || !user?.id || !friendId) return;

        setIsSending(true);
        const result = await sendMessage(user.id, friendId, messageText);
        setIsSending(false);

        if (result.success) {
            setMessageText('');
            setShowMessageModal(false);
        }
    };

    const handleRemoveFriend = async () => {
        if (!user?.id || !friendId) return;
        await removeFriend(friendId, user.id);
        navigate('/friends');
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>Perfil não encontrado</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-cyan-400 hover:underline">
                    Voltar
                </button>
            </div>
        );
    }

    const currentBadge = getCurrentBadge(profile.level);

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-white">Perfil do Amigo</h1>
            </div>

            {/* Hero Banner */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-cyan-600/20 to-pink-600/30 rounded-2xl" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h20v20H0z%22 fill=%22none%22/%3E%3Ccircle cx=%2210%22 cy=%2210%22 r=%221%22 fill=%22rgba(255,255,255,0.03)%22/%3E%3C/svg%3E')] opacity-50 rounded-2xl" />

                <div className="relative p-6 pb-20 text-center">
                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative inline-block mb-4"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-xl opacity-50 animate-pulse" />
                        <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                                <img
                                    src={profile.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.id}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        {/* Level */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full flex items-center gap-1 text-white font-bold text-sm shadow-lg">
                            <Crown className="w-4 h-4" />
                            Nível {profile.level}
                        </div>
                    </motion.div>

                    {/* Name */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-2xl font-black text-white mb-2">{profile.displayName}</h2>
                        <p className="text-cyan-300/80 text-sm font-mono">{profile.friendCode}</p>
                    </motion.div>
                </div>

                {/* Stats Cards */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-3 w-full max-w-md justify-center px-4">
                    {[
                        { icon: Flame, value: `${profile.streak}d`, label: 'Streak', color: 'from-orange-500 to-red-600' },
                        { icon: Target, value: profile.casesCompleted, label: 'Casos', color: 'from-cyan-500 to-blue-600' },
                        { icon: Zap, value: profile.xp, label: 'XP', color: 'from-purple-500 to-pink-600' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-center shadow-xl"
                        >
                            <div className={clsx("w-8 h-8 mx-auto mb-1 rounded-lg flex items-center justify-center bg-gradient-to-br", stat.color)}>
                                <stat.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-lg font-black text-white">{stat.value}</div>
                            <div className="text-[10px] text-slate-400">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Spacer */}
            <div className="h-12" />

            {/* Badge */}
            <div className="bg-gradient-to-r from-amber-900/20 to-slate-800/50 rounded-xl p-4 border border-amber-500/20 mb-4">
                <div className="flex items-center gap-4">
                    <img src={currentBadge.image} alt={currentBadge.name} className="w-14 h-14 object-contain" />
                    <div>
                        <div className="text-[10px] text-amber-400/80 uppercase tracking-wider">Insígnia</div>
                        <div className="font-bold text-amber-400">{currentBadge.name}</div>
                        <div className="text-xs text-slate-400">{currentBadge.description}</div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMessageModal(true)}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-bold shadow-lg"
                >
                    <MessageCircle className="w-5 h-5" />
                    Enviar Mensagem
                </motion.button>

                {isFriend && (
                    <button
                        onClick={handleRemoveFriend}
                        className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-medium hover:bg-red-500/20"
                    >
                        <UserMinus className="w-5 h-5" />
                        Remover Amigo
                    </button>
                )}
            </div>

            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Enviar para {profile.displayName}</h3>
                            <button
                                onClick={() => setShowMessageModal(false)}
                                className="p-2 text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Escreva sua mensagem..."
                            className="w-full h-32 p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 mb-4"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowMessageModal(false)}
                                className="flex-1 p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-300 font-medium hover:bg-slate-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!messageText.trim() || isSending}
                                className="flex-1 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                                {isSending ? 'Enviando...' : 'Enviar'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
