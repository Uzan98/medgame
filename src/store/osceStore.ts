import { create } from 'zustand';
import type {
    OsceGameState,
    ChatMessage,
    ProntuarioData,
    DiagnosticHypothesis,
    PrescriptionItem,
    OsceCaseExtended
} from '../lib/osceTypes';
import { OSCE_CARDS, PRONTUARIO_TEMPLATE } from '../lib/osceTypes';
import { getOsceCaseById } from '../lib/osceCases';
import { askPatient, evaluateAnamnesis, getSuggestedQuestion, getHighlightedMissing } from '../lib/groqService';
import { evaluateExtendedPhases } from '../lib/osceEvaluation';
import { useGameStore } from './gameStore';
import { useToastStore } from './toastStore';
import { useAdminStore } from './adminStore';

// Re-export constants
export { OSCE_CARDS, PRONTUARIO_TEMPLATE, PRONTUARIO_LABELS, PRONTUARIO_PLACEHOLDERS } from '../lib/osceTypes';

interface OsceStore extends OsceGameState {
    // Actions
    startCase: (caseId: string) => void;
    sendMessage: (message: string) => Promise<void>;
    updateTrust: (delta: number) => void;
    advanceToPhase2: () => void;
    setProntuarioField: (field: keyof ProntuarioData, value: string) => void;
    submitProntuario: () => void;
    useCard: (cardId: string) => Promise<void>;
    reset: () => void;
    setTimeRemaining: (time: number) => void;

    // Extended phase actions
    addHypothesis: (hypothesis: Omit<DiagnosticHypothesis, 'id'>) => void;
    removeHypothesis: (id: string) => void;
    advanceToHipoteses: () => void;
    requestExam: (examId: string) => void;
    advanceToExames: () => void;
    advanceToResultados: () => void;
    addPrescriptionItem: (item: Omit<PrescriptionItem, 'id'>) => void;
    removePrescriptionItem: (id: string) => void;
    advanceToPrescricao: () => void;
    submitFinal: () => Promise<void>;
}

const initialState: OsceGameState = {
    phase: 'intro',
    currentCase: null,
    chatHistory: [],
    trustLevel: 60,
    timeRemaining: 180,
    questionsAsked: [],
    isLoading: false,
    prontuario: { ...PRONTUARIO_TEMPLATE },
    hypotheses: [],
    requestedExams: [],
    revealedResults: [],
    prescription: [],
    evaluation: null,
    availableCards: [...OSCE_CARDS],
    usedCards: [],
    error: null
};

export const useOsceStore = create<OsceStore>((set, get) => ({
    ...initialState,

    startCase: (caseId: string) => {
        // Search in default cases
        let osceCase = getOsceCaseById(caseId);

        // If not found, search in custom cases
        if (!osceCase) {
            const customCases = useAdminStore.getState().customOsceCases;
            osceCase = customCases.find(c => c.id === caseId);
        }

        if (!osceCase) {
            useToastStore.getState().addToast('Caso não encontrado!', 'error');
            return;
        }
        // Start with empty chat - user will click starter button
        set({
            phase: 'consultation',
            currentCase: osceCase,
            chatHistory: [],
            trustLevel: 60,
            timeRemaining: osceCase.timeLimit,
            questionsAsked: [],
            isLoading: false,
            prontuario: { ...PRONTUARIO_TEMPLATE },
            hypotheses: [],
            requestedExams: [],
            revealedResults: [],
            prescription: [],
            evaluation: null,
            usedCards: [],
            error: null
        });
    },

    sendMessage: async (message: string) => {
        const state = get();
        if (!state.currentCase || state.isLoading) return;

        // Add user message to chat
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: Date.now()
        };

        set({
            chatHistory: [...state.chatHistory, userMessage],
            questionsAsked: [...state.questionsAsked, message],
            isLoading: true,
            error: null
        });

        try {
            // Call AI for patient response
            const response = await askPatient({
                caseId: state.currentCase.id,
                question: message,
                chatHistory: state.chatHistory,
                trustLevel: state.trustLevel,
                osceCase: state.currentCase // Pass full case data for prompt generation
            });

            const patientMessage: ChatMessage = {
                id: `patient-${Date.now()}`,
                role: 'patient',
                content: response.resposta,
                timestamp: Date.now(),
                emotion: response.emocao
            };

            // Update trust level
            const newTrust = Math.max(0, Math.min(100, state.trustLevel + response.confiancaDelta));

            set({
                chatHistory: [...get().chatHistory, patientMessage],
                trustLevel: newTrust,
                isLoading: false
            });

            // Toast for significant trust changes
            if (response.confiancaDelta <= -5) {
                useToastStore.getState().addToast('O paciente ficou desconfiado...', 'warning');
            } else if (response.confiancaDelta >= 5) {
                useToastStore.getState().addToast('Boa comunicação! +Confiança', 'success');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            set({
                isLoading: false,
                error: 'Erro ao comunicar com o paciente. Tente novamente.'
            });
            useToastStore.getState().addToast('Erro de comunicação. Tente novamente.', 'error');
        }
    },

    updateTrust: (delta: number) => {
        set(state => ({
            trustLevel: Math.max(0, Math.min(100, state.trustLevel + delta))
        }));
    },

    // Advances from consultation (with prontuario) directly to hipoteses
    advanceToPhase2: () => {
        const state = get();
        if (state.phase !== 'consultation') return;

        set({ phase: 'hipoteses' });
        useToastStore.getState().addToast('Agora formule suas hipóteses diagnósticas!', 'info');
    },

    setProntuarioField: (field: keyof ProntuarioData, value: string) => {
        set(state => ({
            prontuario: {
                ...state.prontuario,
                [field]: value
            }
        }));
    },

    // Legacy: Still works if prontuario phase is used
    submitProntuario: () => {
        const state = get();
        if (state.phase !== 'prontuario' && state.phase !== 'consultation') return;
        set({ phase: 'hipoteses' });
        useToastStore.getState().addToast('Agora formule suas hipóteses diagnósticas!', 'info');
    },

    // Hypothesis management
    addHypothesis: (hypothesis) => {
        const newHypothesis: DiagnosticHypothesis = {
            ...hypothesis,
            id: `hyp-${Date.now()}`
        };
        set(state => ({
            hypotheses: [...state.hypotheses, newHypothesis]
        }));
    },

    removeHypothesis: (id) => {
        set(state => ({
            hypotheses: state.hypotheses.filter(h => h.id !== id)
        }));
    },

    advanceToHipoteses: () => {
        set({ phase: 'hipoteses' });
    },

    // Exam management
    requestExam: (examId) => {
        set(state => {
            if (state.requestedExams.includes(examId)) return state;
            return { requestedExams: [...state.requestedExams, examId] };
        });
    },

    advanceToExames: () => {
        const state = get();
        if (state.hypotheses.length === 0) {
            useToastStore.getState().addToast('Adicione pelo menos uma hipótese diagnóstica!', 'warning');
            return;
        }
        set({ phase: 'exames' });
        useToastStore.getState().addToast('Solicite os exames necessários para confirmar sua hipótese!', 'info');
    },

    advanceToResultados: () => {
        const state = get();
        if (state.requestedExams.length === 0) {
            useToastStore.getState().addToast('Solicite pelo menos um exame!', 'warning');
            return;
        }
        // Reveal all requested exams results
        set({
            phase: 'resultados',
            revealedResults: [...state.requestedExams]
        });
        useToastStore.getState().addToast('Analise os resultados dos exames!', 'info');
    },

    // Prescription management
    addPrescriptionItem: (item) => {
        const newItem: PrescriptionItem = {
            ...item,
            id: `rx-${Date.now()}`
        };
        set(state => ({
            prescription: [...state.prescription, newItem]
        }));
    },

    removePrescriptionItem: (id) => {
        set(state => ({
            prescription: state.prescription.filter(p => p.id !== id)
        }));
    },

    advanceToPrescricao: () => {
        set({ phase: 'prescricao' });
        useToastStore.getState().addToast('Elabore o plano terapêutico!', 'info');
    },

    // Final submission with full evaluation
    submitFinal: async () => {
        const state = get();
        if (!state.currentCase || state.isLoading) return;

        set({ isLoading: true, error: null });

        try {
            const timeUsed = state.currentCase.timeLimit - state.timeRemaining;

            // Get base anamnesis evaluation
            const anamnesisEval = await evaluateAnamnesis({
                caseId: state.currentCase.id,
                questionsAsked: state.questionsAsked,
                prontuario: state.prontuario,
                trustLevel: state.trustLevel,
                timeUsed
            });

            // Extended evaluation for hypotheses, exams, prescription
            const extendedEval = evaluateExtendedPhases({
                osceCase: state.currentCase as OsceCaseExtended,
                hypotheses: state.hypotheses,
                requestedExams: state.requestedExams,
                prescription: state.prescription
            });

            // Combine scores: 40% anamnesis + 20% diagnosis + 20% exams + 20% prescription
            const combinedScore = Math.round(
                anamnesisEval.scoreTotal * 0.4 +
                extendedEval.scoreDiagnostico * 0.2 +
                extendedEval.scoreExames * 0.2 +
                extendedEval.scorePrescricao * 0.2
            );

            // Merge evaluations
            const evaluation = {
                ...anamnesisEval,
                scoreTotal: combinedScore,
                scoreDiagnostico: extendedEval.scoreDiagnostico,
                scoreExames: extendedEval.scoreExames,
                scorePrescricao: extendedEval.scorePrescricao,
                diagnosticoFeedback: extendedEval.diagnosticoFeedback,
                examesFeedback: extendedEval.examesFeedback,
                prescricaoFeedback: extendedEval.prescricaoFeedback
            };

            // Calculate rewards based on combined score
            const baseXP = state.currentCase.xpReward;
            const baseCoins = state.currentCase.coinsReward;
            const scoreMultiplier = combinedScore / 100;

            const xpGanho = Math.floor(baseXP * scoreMultiplier);
            const coinsGanho = Math.floor(baseCoins * scoreMultiplier);

            evaluation.xpGanho = xpGanho;
            evaluation.coinsGanho = coinsGanho;

            useGameStore.getState().addXP(xpGanho);
            useGameStore.getState().addCoins(coinsGanho);

            set({
                phase: 'results',
                evaluation,
                isLoading: false
            });

            if (combinedScore >= 80) {
                useToastStore.getState().addToast(`Excelente! Score: ${combinedScore}% 🏆`, 'success');
            } else if (combinedScore >= 60) {
                useToastStore.getState().addToast(`Bom trabalho! Score: ${combinedScore}%`, 'success');
            } else {
                useToastStore.getState().addToast(`Score: ${combinedScore}%. Continue praticando!`, 'info');
            }

        } catch (error) {
            console.error('Error submitting final:', error);
            set({
                isLoading: false,
                error: 'Erro ao avaliar. Tente novamente.'
            });
            useToastStore.getState().addToast('Erro ao avaliar. Tente novamente.', 'error');
        }
    },

    useCard: async (cardId: string) => {
        const state = get();
        const card = state.availableCards.find(c => c.id === cardId);

        if (!card) return;
        if (state.usedCards.includes(cardId)) {
            useToastStore.getState().addToast('Você já usou este card!', 'warning');
            return;
        }

        // Check if user has enough coins
        const userCoins = useGameStore.getState().coins;
        if (userCoins < card.cost) {
            useToastStore.getState().addToast('Moedas insuficientes!', 'error');
            return;
        }

        // Spend coins
        useGameStore.getState().spendCoins(card.cost);

        // Apply card effect
        switch (card.effect.type) {
            case 'boost_trust': {
                const amount = card.effect.amount;
                set(s => ({
                    trustLevel: Math.min(100, s.trustLevel + amount),
                    usedCards: [...s.usedCards, cardId]
                }));
                useToastStore.getState().addToast(`${card.name} ativado! +${amount} confiança`, 'success');
                break;
            }

            case 'extend_time': {
                const seconds = card.effect.seconds;
                set(s => ({
                    timeRemaining: s.timeRemaining + seconds,
                    usedCards: [...s.usedCards, cardId]
                }));
                useToastStore.getState().addToast(`${card.name} ativado! +${seconds}s`, 'success');
                break;
            }

            case 'suggest_question':
                try {
                    set({ isLoading: true });
                    const suggestion = await getSuggestedQuestion(
                        state.currentCase?.id || '',
                        state.questionsAsked
                    );
                    set(s => ({ usedCards: [...s.usedCards, cardId], isLoading: false }));
                    useToastStore.getState().addToast(`💡 Sugestão: "${suggestion}"`, 'info');
                } catch {
                    set({ isLoading: false });
                    useToastStore.getState().addToast('Erro ao obter sugestão', 'error');
                }
                break;

            case 'show_categories':
                set(s => ({ usedCards: [...s.usedCards, cardId] }));
                useToastStore.getState().addToast('📋 Lembre-se: QP, HDA, AP, Medicações, Hábitos, RS', 'info');
                break;

            case 'highlight_missing':
                try {
                    set({ isLoading: true });
                    const missing = await getHighlightedMissing(
                        state.currentCase?.id || '',
                        state.prontuario
                    );
                    set(s => ({ usedCards: [...s.usedCards, cardId], isLoading: false }));
                    useToastStore.getState().addToast(`🔍 Faltando: "${missing}"`, 'info');
                } catch {
                    set({ isLoading: false });
                    useToastStore.getState().addToast('Erro ao verificar lacunas', 'error');
                }
                break;
        }
    },

    setTimeRemaining: (time: number) => {
        set({ timeRemaining: Math.max(0, time) });
    },

    reset: () => {
        set(initialState);
    }
}));
