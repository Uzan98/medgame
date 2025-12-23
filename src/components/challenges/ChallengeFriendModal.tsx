import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Loader2, Crown, Zap, Search } from 'lucide-react';
import { useFriendStore } from '../../store/friendStore';
import { useGameChallengeStore } from '../../store/gameChallengeStore';
import { useAuth } from '../../contexts/AuthContext';
import { GameType, getGameChallengeConfig } from '../../lib/gameChallengeConfig';
import clsx from 'clsx';

interface ChallengeFriendModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameType: GameType;
    onChallengeCreated: (challengeId: string) => void;
}

export const ChallengeFriendModal: React.FC<ChallengeFriendModalProps> = ({
    isOpen,
    onClose,
    gameType,
    onChallengeCreated
}) => {
    const { user } = useAuth();
    const { friends, fetchFriends } = useFriendStore();
    const { createChallenge } = useGameChallengeStore();
    const config = getGameChallengeConfig(gameType);

    const [searchQuery, setSearchQuery] = useState('');
    const [sendingTo, setSendingTo] = useState<string | null>(null);

    // Fetch friends on mount
    useEffect(() => {
        if (isOpen && user?.id) {
            fetchFriends(user.id);
        }
    }, [isOpen, user?.id]);

    const filteredFriends = friends.filter(f =>
        (f.profile?.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChallenge = async (friendId: string) => {
        if (!user?.id || sendingTo) return;

        setSendingTo(friendId);

        const result = await createChallenge(gameType, user.id, friendId);

        setSendingTo(null);

        if (result.success && result.challengeId) {
            onChallengeCreated(result.challengeId);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl">
                                    {config.emoji}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Desafiar Amigo</h2>
                                    <p className="text-xs text-purple-300">{config.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="p-3 border-b border-slate-700/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar amigos..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/50"
                            />
                        </div>
                    </div>

                    {/* Friends List */}
                    <div className="max-h-80 overflow-y-auto">
                        {filteredFriends.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Swords className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Nenhum amigo encontrado</p>
                                <p className="text-xs mt-1">Adicione amigos para poder desafiá-los!</p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {filteredFriends.map((friend) => (
                                    <motion.div
                                        key={friend.friendId}
                                        whileHover={{ scale: 1.01 }}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/30 transition-colors group"
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-0.5 shrink-0">
                                            <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden">
                                                <img
                                                    src={friend.profile?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${friend.friendId}`}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white truncate">{friend.profile?.displayName || 'Jogador'}</h3>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Crown className="w-3 h-3 text-yellow-400" />
                                                    Nv. {friend.profile?.level || 1}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Zap className="w-3 h-3 text-purple-400" />
                                                    {friend.profile?.xp || 0} XP
                                                </span>
                                            </div>
                                        </div>

                                        {/* Challenge Button */}
                                        <button
                                            onClick={() => handleChallenge(friend.friendId)}
                                            disabled={!!sendingTo}
                                            className={clsx(
                                                "px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                                                sendingTo === friend.friendId
                                                    ? "bg-purple-500/30 text-purple-300"
                                                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-lg shadow-purple-500/20"
                                            )}
                                        >
                                            {sendingTo === friend.friendId ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <Swords className="w-4 h-4" />
                                                    Desafiar
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500 text-center">
                            Seu amigo terá <span className="text-purple-400 font-medium">7 dias</span> para responder ao desafio
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
