import { motion } from 'framer-motion';
import { X, Zap, UtensilsCrossed, Star, Info, Heart } from 'lucide-react';

interface LifeSystemInfoProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LifeSystemInfo = ({ isOpen, onClose }: LifeSystemInfoProps) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm p-4 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-400" />
                        <h2 className="text-lg font-bold text-white">Sistema de Vida</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Energy */}
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-cyan-400" />
                            </div>
                            <h3 className="text-base font-bold text-cyan-400">Energia</h3>
                        </div>
                        <ul className="text-sm text-slate-300 space-y-1.5 ml-2">
                            <li>• Você tem <span className="text-cyan-400 font-bold">100 de energia</span> máxima</li>
                            <li>• Cada quiz consome <span className="text-red-400 font-bold">10 de energia</span></li>
                            <li>• Precisa de pelo menos <span className="text-yellow-400 font-bold">40 de energia</span> para jogar</li>
                            <li>• <span className="text-emerald-400 font-bold">Descansar</span> recupera +50 energia (cooldown: 2h)</li>
                        </ul>
                    </div>

                    {/* Hunger */}
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <UtensilsCrossed className="w-5 h-5 text-orange-400" />
                            </div>
                            <h3 className="text-base font-bold text-orange-400">Fome</h3>
                        </div>
                        <ul className="text-sm text-slate-300 space-y-1.5 ml-2">
                            <li>• A fome aumenta <span className="text-orange-400 font-bold">+5 a cada 30 minutos</span></li>
                            <li>• Quando a fome passa de <span className="text-red-400 font-bold">70%</span>, você gasta <span className="text-red-400 font-bold">2x energia</span>!</li>
                            <li>• Compre <span className="text-emerald-400 font-bold">comida na Loja</span> para reduzir a fome</li>
                            <li>• Fique atento às notificações de fome alta</li>
                        </ul>
                    </div>

                    {/* Reputation */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                <Star className="w-5 h-5 text-yellow-400" />
                            </div>
                            <h3 className="text-base font-bold text-yellow-400">Reputação</h3>
                        </div>
                        <ul className="text-sm text-slate-300 space-y-1.5 ml-2">
                            <li>• Sua reputação varia de <span className="text-yellow-400 font-bold">0 a 5 estrelas</span></li>
                            <li>• <span className="text-emerald-400 font-bold">Acerte diagnósticos</span> para aumentar</li>
                            <li>• <span className="text-red-400 font-bold">Errar muito</span> diminui sua reputação</li>
                            <li>• Reputação alta pode desbloquear benefícios futuros</li>
                        </ul>
                    </div>

                    {/* Tips */}
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <Info className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="text-base font-bold text-purple-400">Dicas</h3>
                        </div>
                        <ul className="text-sm text-slate-300 space-y-1.5 ml-2">
                            <li>• 💡 Descanse regularmente para manter energia alta</li>
                            <li>• 🍔 Não deixe a fome passar de 70% (dobra gasto de energia!)</li>
                            <li>• 📚 O modo Estudo gasta menos energia e dá recompensas</li>
                            <li>• ⭐ Mantenha alta reputação sendo preciso nos diagnósticos</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Info button component to be used in the UI
interface InfoButtonProps {
    onClick: () => void;
}

export const LifeSystemInfoButton = ({ onClick }: InfoButtonProps) => (
    <button
        onClick={onClick}
        className="w-6 h-6 rounded-full bg-slate-700/50 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
        title="Como funciona?"
    >
        <Info size={14} />
    </button>
);
