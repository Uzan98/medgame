import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    UserPlus,
    Bell,
    Search,
    ArrowLeft,
    X,
    Check,
    Crown,
    Flame,
    Copy,
    Share2,
    UserX,
    Loader2,
} from 'lucide-react';
import { useFriendStore } from '../store/friendStore';
import { useAuth } from '../contexts/AuthContext';
import { useToastStore } from '../store/toastStore';
import clsx from 'clsx';

type Tab = 'friends' | 'requests' | 'search';

export const FriendsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        friends,
        pendingRequests,
        searchResults,
        isLoading,
        fetchFriends,
        fetchPendingRequests,
        searchUsers,
        sendFriendRequest,
        acceptRequest,
        rejectRequest,
        removeFriend,
    } = useFriendStore();

    const [activeTab, setActiveTab] = useState<Tab>('friends');
    const [searchQuery, setSearchQuery] = useState('');
    const [myFriendCode] = useState(() => {
        // Generate a simple friend code based on user id
        if (user?.id) {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = '';
            for (let i = 0; i < 8; i++) {
                const index = (user.id.charCodeAt(i % user.id.length) + i) % chars.length;
                code += chars[index];
            }
            return code;
        }
        return 'MEDGAME1';
    });

    // Load data on mount
    useEffect(() => {
        if (user?.id) {
            fetchFriends(user.id);
            fetchPendingRequests(user.id);
        }
    }, [user?.id, fetchFriends, fetchPendingRequests]);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery && user?.id) {
                searchUsers(searchQuery, user.id);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, user?.id, searchUsers]);

    const handleSendRequest = async (toUserId: string) => {
        if (!user?.id) return;
        await sendFriendRequest(user.id, toUserId);
    };

    const handleAccept = async (requestId: string) => {
        if (!user?.id) return;
        await acceptRequest(requestId, user.id);
    };

    const handleReject = async (requestId: string) => {
        await rejectRequest(requestId);
    };

    const handleRemoveFriend = async (friendId: string) => {
        if (!user?.id) return;
        await removeFriend(friendId, user.id);
    };

    const copyFriendCode = () => {
        navigator.clipboard.writeText(myFriendCode);
        useToastStore.getState().addToast('Código copiado! 📋', 'success');
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4 shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">Amigos</h1>
                    <p className="text-sm text-slate-400">{friends.length} amigos</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {pendingRequests.length > 0 && (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {pendingRequests.length}
                        </div>
                    )}
                </div>
            </div>

            {/* My Friend Code */}
            <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-xl p-4 border border-cyan-500/20 mb-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-cyan-400/80 uppercase tracking-wider mb-1">Meu Código de Amigo</div>
                        <div className="text-2xl font-mono font-bold text-white tracking-widest">{myFriendCode}</div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={copyFriendCode}
                            className="p-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'MedGame',
                                        text: `Me adicione no MedGame! Código: ${myFriendCode}`,
                                    });
                                }
                            }}
                            className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-slate-800/50 p-1 rounded-xl shrink-0">
                {[
                    { id: 'friends', label: 'Amigos', icon: Users, count: friends.length },
                    { id: 'requests', label: 'Solicitações', icon: Bell, count: pendingRequests.length },
                    { id: 'search', label: 'Buscar', icon: Search },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={clsx(
                                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all relative',
                                isActive
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && !isActive && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                <AnimatePresence mode="wait">
                    {/* Friends List */}
                    {activeTab === 'friends' && (
                        <motion.div
                            key="friends"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                                </div>
                            ) : friends.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400 mb-2">Você ainda não tem amigos</p>
                                    <button
                                        onClick={() => setActiveTab('search')}
                                        className="text-cyan-400 hover:underline"
                                    >
                                        Buscar amigos →
                                    </button>
                                </div>
                            ) : (
                                friends.map((friend) => (
                                    <motion.div
                                        key={friend.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl p-3"
                                    >
                                        {/* Avatar */}
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-0.5">
                                                <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden">
                                                    <img
                                                        src={friend.profile?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${friend.friendId}`}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                            {/* Level badge */}
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black">
                                                {friend.profile?.level || 1}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-white truncate">
                                                {friend.profile?.displayName || 'Jogador'}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Crown className="w-3 h-3 text-yellow-400" />
                                                    Nv.{friend.profile?.level || 1}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Flame className="w-3 h-3 text-orange-400" />
                                                    {friend.profile?.streak || 0}d
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <button
                                            onClick={() => handleRemoveFriend(friend.friendId)}
                                            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                            title="Remover amigo"
                                        >
                                            <UserX className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Pending Requests */}
                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            {pendingRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400">Nenhuma solicitação pendente</p>
                                </div>
                            ) : (
                                pendingRequests.map((request) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-3 bg-gradient-to-r from-cyan-900/20 to-slate-800/50 border border-cyan-500/20 rounded-xl p-3"
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-0.5">
                                            <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden">
                                                <img
                                                    src={request.senderProfile?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${request.fromUserId}`}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-white truncate">
                                                {request.senderProfile?.displayName || 'Jogador'}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Nível {request.senderProfile?.level || 1}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(request.id)}
                                                className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.id)}
                                                className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Search */}
                    {activeTab === 'search' && (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Search Input */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar por nome ou código..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                                />
                            </div>

                            {/* Results */}
                            <div className="space-y-2">
                                {searchQuery.trim() === '' ? (
                                    <div className="text-center py-12">
                                        <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400">Digite um nome ou código para buscar</p>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-slate-400">Nenhum jogador encontrado</p>
                                    </div>
                                ) : (
                                    searchResults.map((profile) => {
                                        const alreadyFriend = friends.some(f => f.friendId === profile.id);
                                        return (
                                            <motion.div
                                                key={profile.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl p-3"
                                            >
                                                {/* Avatar */}
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-0.5">
                                                    <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden">
                                                        <img
                                                            src={profile.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.id}`}
                                                            alt="Avatar"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-white truncate">{profile.displayName}</div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                                        <span>Nível {profile.level}</span>
                                                        <span className="text-cyan-400 font-mono">{profile.friendCode}</span>
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                {alreadyFriend ? (
                                                    <span className="text-xs text-emerald-400 px-2 py-1 bg-emerald-500/20 rounded-lg">
                                                        Amigo
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSendRequest(profile.id)}
                                                        className="p-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                                                    >
                                                        <UserPlus className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
