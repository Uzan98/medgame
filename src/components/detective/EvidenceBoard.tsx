import React, { useState } from 'react';
import {
    Pin,
    PinOff,
    Link2,
    X,
    Lightbulb,
    Trash2,
    ZoomIn
} from 'lucide-react';
import { useDetectiveStore } from '../../store/detectiveStore';
import clsx from 'clsx';

export const EvidenceBoard: React.FC = () => {
    const store = useDetectiveStore();
    const [selectedClues, setSelectedClues] = useState<string[]>([]);
    const [deductionInput, setDeductionInput] = useState('');
    const [showDeductionModal, setShowDeductionModal] = useState(false);

    const handleClueSelect = (id: string) => {
        if (selectedClues.includes(id)) {
            setSelectedClues(selectedClues.filter(c => c !== id));
        } else if (selectedClues.length < 3) {
            setSelectedClues([...selectedClues, id]);
        }
    };

    const handleMakeDeduction = () => {
        if (selectedClues.length >= 2 && deductionInput.trim()) {
            store.makeDeduction(selectedClues, deductionInput.trim());
            setSelectedClues([]);
            setDeductionInput('');
            setShowDeductionModal(false);
        }
    };

    const pinnedClues = store.clues.filter(c => c.isPinned);
    const unpinnedClues = store.clues.filter(c => !c.isPinned);

    return (
        <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ZoomIn className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-bold text-white">Quadro de Evidências</h3>
                    <span className="text-xs text-slate-400">({store.clues.length} pistas)</span>
                </div>
                {selectedClues.length >= 2 && (
                    <button
                        onClick={() => setShowDeductionModal(true)}
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors"
                    >
                        <Link2 className="w-4 h-4" />
                        Conectar ({selectedClues.length})
                    </button>
                )}
            </div>

            {/* Clues */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {store.clues.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Nenhuma pista ainda</p>
                        <p className="text-xs mt-1">Clique em "📌 Salvar" nas descobertas para adicionar pistas</p>
                    </div>
                ) : (
                    <>
                        {/* Pinned Section */}
                        {pinnedClues.length > 0 && (
                            <div>
                                <div className="text-xs text-yellow-400 uppercase mb-2 flex items-center gap-1">
                                    <Pin className="w-3 h-3" /> Fixadas
                                </div>
                                <div className="space-y-2">
                                    {pinnedClues.map((clue) => (
                                        <ClueCard
                                            key={clue.id}
                                            clue={clue}
                                            isSelected={selectedClues.includes(clue.id)}
                                            onSelect={() => handleClueSelect(clue.id)}
                                            onPin={() => store.togglePinClue(clue.id)}
                                            onRemove={() => store.removeClue(clue.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Other Clues */}
                        {unpinnedClues.length > 0 && (
                            <div>
                                {pinnedClues.length > 0 && (
                                    <div className="text-xs text-slate-500 uppercase mb-2">Outras Pistas</div>
                                )}
                                <div className="space-y-2">
                                    {unpinnedClues.map((clue) => (
                                        <ClueCard
                                            key={clue.id}
                                            clue={clue}
                                            isSelected={selectedClues.includes(clue.id)}
                                            onSelect={() => handleClueSelect(clue.id)}
                                            onPin={() => store.togglePinClue(clue.id)}
                                            onRemove={() => store.removeClue(clue.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Deductions Section */}
                {store.deductions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="text-xs text-cyan-400 uppercase mb-2 flex items-center gap-1">
                            <Link2 className="w-3 h-3" /> Deduções ({store.deductions.length})
                        </div>
                        <div className="space-y-2">
                            {store.deductions.map((ded) => (
                                <div
                                    key={ded.id}
                                    className={clsx(
                                        'p-3 rounded-lg border',
                                        ded.isCorrect
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : 'bg-slate-800/50 border-slate-600'
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {ded.isCorrect && (
                                                    <span className="text-emerald-400 text-xs">✓ Correto</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-white">{ded.conclusion}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {ded.clueIds.map((cid) => {
                                                    const clue = store.clues.find(c => c.id === cid);
                                                    return clue ? (
                                                        <span
                                                            key={cid}
                                                            className="text-xs px-2 py-0.5 rounded"
                                                            style={{ backgroundColor: clue.color + '30', color: clue.color }}
                                                        >
                                                            {clue.text.substring(0, 20)}...
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => store.removeDeduction(ded.id)}
                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Deduction Modal */}
            {showDeductionModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-400" />
                            Fazer Dedução
                        </h3>

                        <div className="mb-4">
                            <p className="text-sm text-slate-400 mb-2">Pistas conectadas:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedClues.map((id) => {
                                    const clue = store.clues.find(c => c.id === id);
                                    return clue ? (
                                        <span
                                            key={id}
                                            className="text-sm px-3 py-1 rounded-lg"
                                            style={{ backgroundColor: clue.color + '30', color: clue.color }}
                                        >
                                            {clue.text.substring(0, 30)}...
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-sm text-slate-400 block mb-2">
                                Qual a sua conclusão?
                            </label>
                            <textarea
                                value={deductionInput}
                                onChange={(e) => setDeductionInput(e.target.value)}
                                placeholder="Ex: Essas pistas juntas sugerem que..."
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeductionModal(false);
                                    setDeductionInput('');
                                }}
                                className="flex-1 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleMakeDeduction}
                                disabled={!deductionInput.trim()}
                                className="flex-1 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg text-white font-bold hover:scale-[1.02] transition-transform disabled:opacity-50"
                            >
                                Deduzir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Insight Notification */}
            {store.insightNotification && (
                <div className="absolute bottom-4 left-4 right-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 animate-bounce">
                    <div className="flex items-start gap-3">
                        <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0" />
                        <div className="flex-1">
                            <p className="text-yellow-400 font-bold">Insight Desbloqueado!</p>
                            <p className="text-sm text-yellow-200">{store.insightNotification}</p>
                        </div>
                        <button
                            onClick={() => store.dismissInsight()}
                            className="text-yellow-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Clue Card Component
interface ClueCardProps {
    clue: {
        id: string;
        text: string;
        source: string;
        color: string;
        isPinned: boolean;
    };
    isSelected: boolean;
    onSelect: () => void;
    onPin: () => void;
    onRemove: () => void;
}

const ClueCard: React.FC<ClueCardProps> = ({ clue, isSelected, onSelect, onPin, onRemove }) => {
    return (
        <div
            onClick={onSelect}
            className={clsx(
                'p-3 rounded-lg border cursor-pointer transition-all',
                isSelected
                    ? 'bg-cyan-500/20 border-cyan-500/50 ring-2 ring-cyan-500/30'
                    : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
            )}
            style={{ borderLeftColor: clue.color, borderLeftWidth: '3px' }}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <p className="text-sm text-white">{clue.text}</p>
                    <p className="text-xs text-slate-500 mt-1">{clue.source}</p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPin();
                        }}
                        className={clsx(
                            'p-1 rounded transition-colors',
                            clue.isPinned ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-400'
                        )}
                    >
                        {clue.isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {isSelected && (
                <div className="mt-2 text-xs text-cyan-400">
                    ✓ Selecionada para conexão
                </div>
            )}
        </div>
    );
};
