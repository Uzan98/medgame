import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Swords, Trophy, Clock, XCircle,
    Inbox, Send, History, Loader2
} from 'lucide-react';
import { useGameChallengeStore, GameChallenge } from '../../store/gameChallengeStore';
import { useAuth } from '../../contexts/AuthContext';
import { GameType, getGameChallengeConfig } from '../../lib/gameChallengeConfig';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';

type TabType = 'received' | 'sent' | 'history';

interface GameChallengesPageProps {
    gameType: GameType;
}

export const GameChallengesPage: React.FC<GameChallengesPageProps> = ({ gameType }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const config = getGameChallengeConfig(gameType);
    const {
        isLoading,
        fetchMyChallenges,
        getPendingChallenges,
        getSentChallenges,
        getCompletedChallenges,
        subscribeToNewChallenges,
        unsubscribe
    } = useGameChallengeStore();

    const [activeTab, setActiveTab] = useState<TabType>('received');

    useEffect(() => {
        if (user?.id) {
            fetchMyChallenges(user.id, gameType);
            subscribeToNewChallenges(user.id);
            return () => unsubscribe();
        }
    }, [user?.id, gameType]);

    const pendingChallenges = user?.id ? getPendingChallenges(user.id, gameType) : [];
    const sentChallenges = user?.id ? getSentChallenges(user.id, gameType) : [];
    const completedChallenges = user?.id ? getCompletedChallenges(user.id, gameType) : [];

    const handlePlayChallenge = (challenge: GameChallenge) => {
        navigate(`${config.routePlay}?challenge=${challenge.id}`);
    };

    const renderChallengeCard = (challenge: GameChallenge, cardType: 'received' | 'sent' | 'history') => {
        const isChallenger = challenge.challengerId === user?.id;
        const opponentName = isChallenger ? challenge.challengedName : challenge.challengerName;
        const opponentAvatar = isChallenger ? challenge.challengedAvatar : challenge.challengerAvatar;
        const opponentResult = isChallenger ? challenge.challengedResult : challenge.challengerResult;
        const myResult = isChallenger ? challenge.challengerResult : challenge.challengedResult;
        const isWinner = challenge.winnerId === user?.id;
        const isTie = challenge.status === 'completed' && challenge.winnerId === null;

        return (
            <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                    "p-4 rounded-xl border transition-all",
                    cardType === 'history' && isWinner && "bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/30",
                    cardType === 'history' && !isWinner && !isTie && "bg-gradient-to-r from-red-500/10 to-transparent border-red-500/30",
                    cardType === 'history' && isTie && "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30",
                    cardType !== 'history' && "bg-slate-800/50 border-slate-700 hover:border-purple-500/50"
                )}
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden">
                                <img
                                    src={opponentAvatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${isChallenger ? challenge.challengedId : challenge.challengerId}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        {cardType === 'history' && (
                            <div className={clsx(
                                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center",
                                isWinner ? "bg-emerald-500" : isTie ? "bg-yellow-500" : "bg-red-500"
                            )}>
                                {isWinner ? <Trophy className="w-3 h-3 text-white" /> :
                                    isTie ? <Swords className="w-3 h-3 text-white" /> :
                                        <XCircle className="w-3 h-3 text-white" />}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-white truncate">{opponentName || 'Jogador'}</h3>
                            <span className="text-lg">{config.emoji}</span>
                            {cardType === 'received' && (
                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-full uppercase">
                                    Novo
                                </span>
                            )}
                        </div>

                        {cardType === 'received' && (
                            <p className="text-sm text-slate-400">
                                Resultado: <span className="text-white font-medium">
                                    {config.formatResult(challenge.challengerResult)}
                                </span>
                            </p>
                        )}

                        {cardType === 'sent' && (
                            <p className="text-sm text-slate-400">
                                Seu resultado: <span className="text-white font-medium">
                                    {config.formatResult(challenge.challengerResult)}
                                </span>
                            </p>
                        )}

                        {cardType === 'history' && (
                            <div className="flex items-center gap-4 text-sm">
                                <span className={clsx(
                                    "font-medium",
                                    isWinner ? "text-emerald-400" : !isTie ? "text-red-400" : "text-yellow-400"
                                )}>
                                    {isWinner ? 'Vitória!' : isTie ? 'Empate' : 'Derrota'}
                                </span>
                                <span className="text-slate-500">
                                    {config.formatResult(myResult)} vs {config.formatResult(opponentResult)}
                                </span>
                            </div>
                        )}

                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(challenge.createdAt), { addSuffix: true, locale: ptBR })}
                        </p>
                    </div>

                    {cardType === 'received' && (
                        <button
                            onClick={() => handlePlayChallenge(challenge)}
                            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl text-sm hover:scale-105 transition-transform shadow-lg shadow-purple-500/30 flex items-center gap-2"
                        >
                            <Swords className="w-4 h-4" />
                            Jogar
                        </button>
                    )}

                    {cardType === 'sent' && (
                        <div className="flex items-center gap-2 text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs">Aguardando...</span>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="min-h-full p-4 space-y-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(config.routePlay)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 border border-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white flex items-center gap-2">
                            <span>{config.emoji}</span>
                            Desafios
                        </h1>
                        <p className="text-xs text-slate-400">{config.name}</p>
                    </div>
                </div>

                <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={clsx(
                            "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                            activeTab === 'received'
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Inbox className="w-4 h-4" />
                        Recebidos
                        {pendingChallenges.length > 0 && (
                            <span className="w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                                {pendingChallenges.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={clsx(
                            "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                            activeTab === 'sent'
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Send className="w-4 h-4" />
                        Enviados
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={clsx(
                            "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                            activeTab === 'history'
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                : "text-slate-400 hover:text-white"
                        )}
                    >
                        <History className="w-4 h-4" />
                        Histórico
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3"
                        >
                            {activeTab === 'received' && (
                                pendingChallenges.length === 0 ? (
                                    <div className="text-center py-16 text-slate-500">
                                        <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">Nenhum desafio pendente</p>
                                        <p className="text-xs mt-1">Aguarde seus amigos te desafiarem!</p>
                                    </div>
                                ) : (
                                    pendingChallenges.map(c => renderChallengeCard(c, 'received'))
                                )
                            )}

                            {activeTab === 'sent' && (
                                sentChallenges.length === 0 ? (
                                    <div className="text-center py-16 text-slate-500">
                                        <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">Nenhum desafio enviado</p>
                                        <p className="text-xs mt-1">Desafie seus amigos no {config.name}!</p>
                                    </div>
                                ) : (
                                    sentChallenges.map(c => renderChallengeCard(c, 'sent'))
                                )
                            )}

                            {activeTab === 'history' && (
                                completedChallenges.length === 0 ? (
                                    <div className="text-center py-16 text-slate-500">
                                        <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">Nenhum desafio concluído</p>
                                        <p className="text-xs mt-1">Os resultados aparecerão aqui</p>
                                    </div>
                                ) : (
                                    completedChallenges.map(c => renderChallengeCard(c, 'history'))
                                )
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
