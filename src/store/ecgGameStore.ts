import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { EcgGameState } from '../lib/ecgTypes';
import { useGameStore } from './gameStore';
import { useToastStore } from './toastStore';

const TIMER_SECONDS = 60;

interface EcgGameStore extends EcgGameState {
    // Actions
    startGame: () => Promise<void>;
    answerQuestion: (answer: string) => void;
    nextCase: () => void;
    endGame: () => void;
    tick: () => void;
    reset: () => void;
}

const initialState: EcgGameState = {
    isPlaying: false,
    currentCase: null,
    casesAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0,
    xpEarned: 0,
    coinsEarned: 0,
    timeRemaining: TIMER_SECONDS,
    selectedAnswer: null,
    showResult: false,
    isLoading: false,
    error: null,
    availableCases: [],
    usedCaseIds: []
};

export const useEcgGameStore = create<EcgGameStore>((set, get) => ({
    ...initialState,

    startGame: async () => {
        set({ isLoading: true, error: null });

        try {
            // Fetch all active ECG cases
            const { data: cases, error } = await supabase
                .from('ecg_cases')
                .select('*')
                .eq('is_active', true);

            if (error) throw error;

            if (!cases || cases.length === 0) {
                set({ error: 'Nenhum caso de ECG disponível!', isLoading: false });
                return;
            }

            // Shuffle cases
            const shuffled = [...cases].sort(() => Math.random() - 0.5);
            const firstCase = shuffled[0];

            set({
                isPlaying: true,
                currentCase: firstCase,
                availableCases: shuffled,
                usedCaseIds: [firstCase.id],
                casesAnswered: 0,
                correctAnswers: 0,
                streak: 0,
                bestStreak: 0,
                xpEarned: 0,
                coinsEarned: 0,
                timeRemaining: TIMER_SECONDS,
                selectedAnswer: null,
                showResult: false,
                isLoading: false,
                error: null
            });

            useToastStore.getState().addToast('🫀 Diagnostique o ECG!', 'success');
        } catch (err) {
            console.error('Error starting ECG game:', err);
            set({ error: 'Erro ao carregar casos', isLoading: false });
        }
    },

    answerQuestion: (answer: string) => {
        const state = get();
        if (state.showResult || !state.currentCase) return;

        const isCorrect = answer === state.currentCase.correct_answer;
        const xpGain = isCorrect ? state.currentCase.xp_reward : 0;
        const coinsGain = isCorrect ? state.currentCase.coins_reward : 0;
        const newStreak = isCorrect ? state.streak + 1 : 0;
        const newBestStreak = Math.max(state.bestStreak, newStreak);

        set({
            selectedAnswer: answer,
            showResult: true,
            casesAnswered: state.casesAnswered + 1,
            correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
            streak: newStreak,
            bestStreak: newBestStreak,
            xpEarned: state.xpEarned + xpGain,
            coinsEarned: state.coinsEarned + coinsGain
        });

        if (isCorrect) {
            useToastStore.getState().addToast(`✅ Correto! +${xpGain} XP`, 'success');
        } else {
            // Game over on wrong answer
            useToastStore.getState().addToast('❌ Incorreto! Fim de jogo', 'error');
        }
    },

    nextCase: () => {
        const state = get();

        // If last answer was wrong, end game
        if (state.selectedAnswer !== state.currentCase?.correct_answer) {
            get().endGame();
            return;
        }

        // Find next unused case
        const unusedCases = state.availableCases.filter(
            c => !state.usedCaseIds.includes(c.id)
        );

        if (unusedCases.length === 0) {
            // All cases used, reshuffle
            const reshuffled = [...state.availableCases].sort(() => Math.random() - 0.5);
            unusedCases.push(...reshuffled);
            set({ usedCaseIds: [] });
        }

        const nextCase = unusedCases[0];

        set({
            currentCase: nextCase,
            usedCaseIds: [...state.usedCaseIds, nextCase.id],
            timeRemaining: TIMER_SECONDS,
            selectedAnswer: null,
            showResult: false
        });
    },

    endGame: () => {
        const state = get();

        // Award XP and coins
        if (state.xpEarned > 0 || state.coinsEarned > 0) {
            useGameStore.getState().addXP(state.xpEarned);
            useGameStore.getState().addCoins(state.coinsEarned);
        }

        set({ isPlaying: false });
    },

    tick: () => {
        const state = get();
        if (!state.isPlaying || state.showResult) return;

        const newTime = state.timeRemaining - 1;

        if (newTime <= 0) {
            // Time's up - count as wrong
            set({
                timeRemaining: 0,
                showResult: true,
                selectedAnswer: 'TIMEOUT',
                casesAnswered: state.casesAnswered + 1
            });
            useToastStore.getState().addToast('⏰ Tempo esgotado!', 'warning');
        } else {
            set({ timeRemaining: newTime });
        }
    },

    reset: () => {
        set(initialState);
    }
}));
