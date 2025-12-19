import React from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { useOsceStore, OSCE_CARDS } from '../../store/osceStore';
import { useGameStore } from '../../store/gameStore';
import type { OsceCard } from '../../lib/osceTypes';
import clsx from 'clsx';

interface OsceCardsProps {
    phase: 'consultation' | 'prontuario';
}

export const OsceCards: React.FC<OsceCardsProps> = ({ phase }) => {
    const { usedCards, isLoading, useCard } = useOsceStore();
    const { coins } = useGameStore();

    // Filter cards relevant to current phase
    const availableCards = OSCE_CARDS.filter(
        card => card.phase === phase || card.phase === 'both'
    );

    const handleUseCard = async (card: OsceCard) => {
        if (usedCards.includes(card.id) || isLoading || coins < card.cost) return;
        await useCard(card.id);
    };

    if (availableCards.length === 0) return null;

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Cards Disponíveis
                </h4>
                <div className="flex items-center gap-1 text-xs text-yellow-400">
                    <Coins className="w-3 h-3" />
                    <span>{coins}</span>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {availableCards.map((card) => {
                    const isUsed = usedCards.includes(card.id);
                    const canAfford = coins >= card.cost;
                    const isDisabled = isUsed || isLoading || !canAfford;

                    return (
                        <button
                            key={card.id}
                            onClick={() => handleUseCard(card)}
                            disabled={isDisabled}
                            className={clsx(
                                'shrink-0 w-20 p-2 rounded-lg border transition-all',
                                'flex flex-col items-center text-center',
                                isUsed
                                    ? 'bg-slate-700/50 border-slate-600 opacity-50 cursor-not-allowed'
                                    : canAfford
                                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-400 hover:scale-105 cursor-pointer'
                                        : 'bg-slate-700/50 border-slate-600 opacity-60 cursor-not-allowed'
                            )}
                            title={card.description}
                        >
                            <span className="text-2xl mb-1">{card.icon}</span>
                            <span className="text-[10px] text-white font-medium leading-tight line-clamp-2">
                                {card.name}
                            </span>
                            <div className={clsx(
                                'mt-1 text-[10px] flex items-center gap-0.5',
                                isUsed ? 'text-slate-500' : 'text-yellow-400'
                            )}>
                                {isUsed ? (
                                    <span>Usado</span>
                                ) : (
                                    <>
                                        <Coins className="w-2.5 h-2.5" />
                                        <span>{card.cost}</span>
                                    </>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
