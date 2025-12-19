import React, { useState } from 'react';
import { ShoppingBag, Zap, Sparkles, Package, ChevronRight, Check, X, Coins, UtensilsCrossed } from 'lucide-react';
import { shopItems, ShopItemData, rarityColors, rarityLabels } from '../lib/shopItems';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';
import clsx from 'clsx';

type Category = 'all' | 'powerup' | 'cosmetic' | 'content' | 'food';

const categoryInfo = {
    all: { label: 'Todos', icon: ShoppingBag, color: 'cyan' },
    powerup: { label: 'Power-ups', icon: Zap, color: 'yellow' },
    cosmetic: { label: 'Cosméticos', icon: Sparkles, color: 'purple' },
    content: { label: 'Conteúdo', icon: Package, color: 'emerald' },
    food: { label: 'Comida', icon: UtensilsCrossed, color: 'orange' },
};

export const ShopPage: React.FC = () => {
    const { coins, ownedItems, buyItem, spendCoins, feedCharacter } = useGameStore();
    const [category, setCategory] = useState<Category>('all');
    const [selectedItem, setSelectedItem] = useState<ShopItemData | null>(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [purchaseResult, setPurchaseResult] = useState<'success' | 'failed' | null>(null);

    const filteredItems = category === 'all'
        ? shopItems
        : shopItems.filter(item => item.category === category);

    const handleBuy = (item: ShopItemData) => {
        setSelectedItem(item);
        setShowPurchaseModal(true);
        setPurchaseResult(null);
    };

    const confirmPurchase = () => {
        if (!selectedItem) return;

        // Handle food items as consumables (don't add to inventory)
        if (selectedItem.category === 'food') {
            if (coins >= selectedItem.price) {
                spendCoins(selectedItem.price);
                feedCharacter(selectedItem.hungerRestore || 0, selectedItem.energyBonus || 0);
                useToastStore.getState().addToast(`Você comeu ${selectedItem.name}! 🍽️`, 'success');
                setPurchaseResult('success');
                setTimeout(() => {
                    setShowPurchaseModal(false);
                    setSelectedItem(null);
                    setPurchaseResult(null);
                }, 1500);
            } else {
                useToastStore.getState().addToast('Moedas insuficientes! 💸', 'error');
                setPurchaseResult('failed');
            }
            return;
        }

        // Handle regular items
        const success = buyItem(selectedItem.id, selectedItem.price);
        setPurchaseResult(success ? 'success' : 'failed');

        if (success) {
            setTimeout(() => {
                setShowPurchaseModal(false);
                setSelectedItem(null);
                setPurchaseResult(null);
            }, 1500);
        }
    };

    const isOwned = (itemId: string) => ownedItems.includes(itemId);
    const canAfford = (price: number) => coins >= price;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-white">Loja</h1>
                    <p className="text-sm text-slate-400">Gaste suas MediMoedas!</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-yellow-500/30">
                    <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-slate-900">M</div>
                    <span className="text-lg font-bold text-yellow-400">{coins}</span>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide shrink-0">
                {(Object.keys(categoryInfo) as Category[]).map((cat) => {
                    const info = categoryInfo[cat];
                    const Icon = info.icon;
                    const isActive = category === cat;

                    return (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                                isActive
                                    ? `bg-${info.color}-500/20 text-${info.color}-400 border border-${info.color}-500/50 shadow-[0_0_10px_rgba(0,0,0,0.2)]`
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                            )}
                            style={isActive ? {
                                backgroundColor: `rgb(var(--color-${info.color}-500) / 0.2)`,
                                borderColor: `rgb(var(--color-${info.color}-500) / 0.5)`,
                            } : {}}
                        >
                            <Icon className="w-4 h-4" />
                            {info.label}
                        </button>
                    );
                })}
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 pb-4">
                    {filteredItems.map((item) => {
                        const owned = isOwned(item.id);
                        const affordable = canAfford(item.price);

                        return (
                            <div
                                key={item.id}
                                className={clsx(
                                    'relative bg-slate-800/50 rounded-xl border p-3 lg:p-4 transition-all group',
                                    owned
                                        ? 'border-emerald-500/50 opacity-75'
                                        : rarityColors[item.rarity],
                                    !owned && affordable && 'hover:scale-[1.02] cursor-pointer',
                                    !owned && !affordable && 'opacity-50'
                                )}
                                onClick={() => !owned && affordable && handleBuy(item)}
                            >
                                {/* Rarity Badge */}
                                <div className={clsx(
                                    'absolute top-2 right-2 text-[8px] lg:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold',
                                    item.rarity === 'comum' && 'bg-slate-700 text-slate-300',
                                    item.rarity === 'raro' && 'bg-blue-500/20 text-blue-400',
                                    item.rarity === 'epico' && 'bg-purple-500/20 text-purple-400',
                                    item.rarity === 'lendario' && 'bg-yellow-500/20 text-yellow-400'
                                )}>
                                    {rarityLabels[item.rarity]}
                                </div>

                                {/* Item Icon */}
                                <div className="text-3xl lg:text-4xl mb-2 lg:mb-3">{item.icon}</div>

                                {/* Item Name */}
                                <h3 className="font-bold text-white text-sm lg:text-base mb-1 pr-12">{item.name}</h3>

                                {/* Description */}
                                <p className="text-[10px] lg:text-xs text-slate-400 mb-3 line-clamp-2">{item.description}</p>

                                {/* Price or Owned */}
                                {owned ? (
                                    <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                                        <Check className="w-4 h-4" />
                                        Adquirido
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] font-bold text-slate-900">M</div>
                                            <span className={clsx(
                                                'font-bold text-sm',
                                                affordable ? 'text-yellow-400' : 'text-red-400'
                                            )}>
                                                {item.price}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Purchase Modal */}
            {showPurchaseModal && selectedItem && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className={clsx(
                        'bg-slate-900 rounded-2xl border max-w-sm w-full p-6 relative',
                        rarityColors[selectedItem.rarity]
                    )}>
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowPurchaseModal(false);
                                setSelectedItem(null);
                                setPurchaseResult(null);
                            }}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {purchaseResult === 'success' ? (
                            // Success State
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-bold text-emerald-400 mb-2">Compra Realizada!</h2>
                                <p className="text-slate-400">Item adicionado ao seu inventário</p>
                            </div>
                        ) : purchaseResult === 'failed' ? (
                            // Failed State
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-4">
                                    <X className="w-8 h-8 text-red-400" />
                                </div>
                                <h2 className="text-xl font-bold text-red-400 mb-2">Falha na Compra</h2>
                                <p className="text-slate-400">Moedas insuficientes</p>
                                <button
                                    onClick={() => setShowPurchaseModal(false)}
                                    className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-lg"
                                >
                                    Fechar
                                </button>
                            </div>
                        ) : (
                            // Confirmation State
                            <>
                                <div className="text-center mb-6">
                                    <div className="text-5xl mb-3">{selectedItem.icon}</div>
                                    <h2 className="text-xl font-bold text-white mb-1">{selectedItem.name}</h2>
                                    <p className="text-sm text-slate-400">{selectedItem.description}</p>
                                </div>

                                <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-slate-400">Preço</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] font-bold text-slate-900">M</div>
                                            <span className="font-bold text-yellow-400">{selectedItem.price}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Seu saldo</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] font-bold text-slate-900">M</div>
                                            <span className={clsx('font-bold', canAfford(selectedItem.price) ? 'text-yellow-400' : 'text-red-400')}>
                                                {coins}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-700 mt-3 pt-3 flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Após compra</span>
                                        <span className="font-bold text-white">{Math.max(0, coins - selectedItem.price)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowPurchaseModal(false)}
                                        className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-700 hover:border-slate-600"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmPurchase}
                                        disabled={!canAfford(selectedItem.price)}
                                        className={clsx(
                                            'flex-1 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2',
                                            canAfford(selectedItem.price)
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-[1.02] active:scale-[0.98]'
                                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        )}
                                    >
                                        <Coins className="w-4 h-4" />
                                        Comprar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
