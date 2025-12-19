import { create } from 'zustand';
import type {
    DetectiveCase,
    DetectiveGameState,
    GamePhase,
    TimeEvent,
    CaseOutcome,
    Clue
} from '../lib/detectiveTypes';

interface DetectiveStore extends DetectiveGameState {
    // Actions
    loadCase: (caseData: DetectiveCase) => void;
    startCase: () => void;
    setPhase: (phase: GamePhase) => void;

    // Time
    tick: () => void;
    pause: () => void;
    resume: () => void;

    // Investigation
    revealAnamnesis: (id: string) => void;
    revealPhysicalExam: (id: string) => void;
    orderExam: (id: string) => void;

    // Hypotheses
    addHypothesis: (name: string) => void;
    removeHypothesis: (id: string) => void;
    setPrimaryHypothesis: (id: string) => void;

    // Evidence Board (new!)
    addClue: (text: string, source: string, type: Clue['type']) => void;
    removeClue: (id: string) => void;
    togglePinClue: (id: string) => void;
    makeDeduction: (clueIds: string[], conclusion: string) => void;
    removeDeduction: (id: string) => void;
    dismissInsight: () => void;

    // Monitoring
    toggleMonitoring: () => void;
    updateVitals: (vitals: Partial<{ fc: number; pa: string; fr: number; temp: number; spo2: number }>) => void;

    // Actions
    performAction: (actionId: string) => void;
    dismissActionFeedback: () => void;

    // Events
    dismissNotification: () => void;

    // Decision
    submitDecision: (diagnosis: string, differentials: string[], conduct: string) => void;

    // Outcome
    calculateOutcome: () => void;

    // Narrative
    nextNarrativeScene: () => void;
    prevNarrativeScene: () => void;
    skipNarrative: () => void;

    // Reset
    reset: () => void;
}

const CLUE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const initialState: DetectiveGameState = {
    currentCase: null,
    phase: 'intro',
    elapsedTime: 0,
    isPaused: true,
    currentNarrativeIndex: 0,
    isNarrativeComplete: false,
    revealedAnamnesis: [],
    revealedExams: [],
    orderedExams: [],
    completedExams: [],
    hypotheses: [],
    clues: [],
    deductions: [],
    isMonitoring: false,
    currentVitals: null,
    performedActions: [],
    actionFeedback: null,
    triggeredEvents: [],
    activeNotification: null,
    insightNotification: null,
    finalDiagnosis: '',
    finalDifferentials: [],
    finalConduct: '',
    outcome: null,
    totalCost: 0,
    actionsCount: 0,
    correctDeductions: 0,
    correctActions: 0
};

export const useDetectiveStore = create<DetectiveStore>((set, get) => ({
    ...initialState,

    loadCase: (caseData) => {
        // Check if case has narrative scenes
        const hasNarrative = caseData.narrativeScenes && caseData.narrativeScenes.length > 0;
        set({
            ...initialState,
            currentCase: caseData,
            phase: hasNarrative ? 'narrative' : 'intro',
            currentNarrativeIndex: 0,
            isNarrativeComplete: false
        });
    },

    startCase: () => set({
        phase: 'investigation',
        isPaused: false,
        elapsedTime: 0
    }),

    setPhase: (phase) => set({ phase }),

    tick: () => {
        const state = get();
        if (state.isPaused || !state.currentCase) return;

        const newTime = state.elapsedTime + 1;

        // Check for events
        const events = state.currentCase.events;
        let newNotification: TimeEvent | null = null;

        for (const event of events) {
            if (
                !state.triggeredEvents.includes(event.id) &&
                newTime >= event.triggerTime
            ) {
                newNotification = event;
                set((s) => ({
                    triggeredEvents: [...s.triggeredEvents, event.id]
                }));
                break;
            }
        }

        // Check for completed exams
        const newCompletedExams: string[] = [];
        for (const examId of state.orderedExams) {
            if (!state.completedExams.includes(examId)) {
                const exam = state.currentCase.exams.find(e => e.id === examId);
                if (exam) {
                    const orderTime = (exam as any).orderedAt || 0;
                    if (newTime - orderTime >= exam.timeToResult) {
                        newCompletedExams.push(examId);
                    }
                }
            }
        }

        set((s) => ({
            elapsedTime: newTime,
            activeNotification: newNotification || s.activeNotification,
            completedExams: [...s.completedExams, ...newCompletedExams]
        }));

        // Time limit check
        if (newTime >= state.currentCase.timeLimit) {
            set({ phase: 'decision', isPaused: true });
        }
    },

    pause: () => set({ isPaused: true }),
    resume: () => set({ isPaused: false }),

    revealAnamnesis: (id) => set((s) => ({
        revealedAnamnesis: s.revealedAnamnesis.includes(id)
            ? s.revealedAnamnesis
            : [...s.revealedAnamnesis, id],
        actionsCount: s.actionsCount + 1,
        elapsedTime: s.elapsedTime + 5 // Each question costs 5 seconds
    })),

    revealPhysicalExam: (id) => set((s) => ({
        revealedExams: s.revealedExams.includes(id)
            ? s.revealedExams
            : [...s.revealedExams, id],
        actionsCount: s.actionsCount + 1,
        elapsedTime: s.elapsedTime + 10 // Each exam takes 10 seconds
    })),

    orderExam: (id) => {
        const state = get();
        if (!state.currentCase) return;

        const exam = state.currentCase.exams.find(e => e.id === id);
        if (!exam || state.orderedExams.includes(id)) return;

        // Store order time for result calculation
        (exam as any).orderedAt = state.elapsedTime;

        set((s) => ({
            orderedExams: [...s.orderedExams, id],
            totalCost: s.totalCost + exam.cost,
            actionsCount: s.actionsCount + 1
        }));
    },

    addHypothesis: (name) => {
        const id = `hyp-${Date.now()}`;
        const isFirst = get().hypotheses.length === 0;

        set((s) => ({
            hypotheses: [
                ...s.hypotheses,
                {
                    id,
                    name,
                    priority: isFirst ? 'principal' : 'diferencial',
                    addedAt: Date.now()
                }
            ]
        }));
    },

    removeHypothesis: (id) => set((s) => ({
        hypotheses: s.hypotheses.filter(h => h.id !== id)
    })),

    setPrimaryHypothesis: (id) => set((s) => ({
        hypotheses: s.hypotheses.map(h => ({
            ...h,
            priority: h.id === id ? 'principal' : (h.priority === 'principal' ? 'diferencial' : h.priority)
        }))
    })),

    dismissNotification: () => set({ activeNotification: null }),

    // Evidence Board Actions
    addClue: (text, source, type) => {
        const id = `clue-${Date.now()}`;
        const state = get();
        const colorIndex = state.clues.length % CLUE_COLORS.length;

        set((s) => ({
            clues: [
                ...s.clues,
                {
                    id,
                    type,
                    text,
                    source,
                    timestamp: Date.now(),
                    isPinned: false,
                    color: CLUE_COLORS[colorIndex]
                }
            ]
        }));
    },

    removeClue: (id) => set((s) => ({
        clues: s.clues.filter(c => c.id !== id),
        // Also remove deductions that reference this clue
        deductions: s.deductions.filter(d => !d.clueIds.includes(id))
    })),

    togglePinClue: (id) => set((s) => ({
        clues: s.clues.map(c =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c
        )
    })),

    makeDeduction: (clueIds, conclusion) => {
        const id = `ded-${Date.now()}`;
        const state = get();

        // Check if this is a correct deduction
        let isCorrect = false;
        let insightMsg: string | null = null;

        if (state.currentCase?.deductionPairs) {
            for (const pair of state.currentCase.deductionPairs) {
                const clueTexts = clueIds.map(cid =>
                    state.clues.find(c => c.id === cid)?.text.toLowerCase() || ''
                );

                if (clueTexts.some(t => t.includes(pair.clueA.toLowerCase())) &&
                    clueTexts.some(t => t.includes(pair.clueB.toLowerCase()))) {
                    isCorrect = true;
                    insightMsg = `💡 Insight: ${pair.insight}`;
                    break;
                }
            }
        }

        set((s) => ({
            deductions: [
                ...s.deductions,
                {
                    id,
                    clueIds,
                    conclusion,
                    isCorrect,
                    timestamp: Date.now()
                }
            ],
            correctDeductions: isCorrect ? s.correctDeductions + 1 : s.correctDeductions,
            insightNotification: insightMsg
        }));
    },

    removeDeduction: (id) => set((s) => ({
        deductions: s.deductions.filter(d => d.id !== id)
    })),

    dismissInsight: () => set({ insightNotification: null }),

    // Monitoring
    toggleMonitoring: () => {
        const state = get();
        if (!state.isMonitoring && state.currentCase) {
            // Start monitoring - initialize with patient vitals
            set({
                isMonitoring: true,
                currentVitals: { ...state.currentCase.patient.vitalSigns }
            });
        } else {
            set({ isMonitoring: false });
        }
    },

    updateVitals: (vitals) => set((s) => ({
        currentVitals: s.currentVitals ? { ...s.currentVitals, ...vitals } : null
    })),

    // Actions
    performAction: (actionId) => {
        const state = get();
        if (!state.currentCase?.actions) return;

        const action = state.currentCase.actions.find(a => a.id === actionId);
        if (!action || state.performedActions.includes(actionId)) return;

        // Check if contraindicated - still apply negative effects!
        if (action.contraindicated) {
            // Apply negative vital effects if any
            let newVitals = state.currentVitals;
            if (action.effect?.vitalChange && state.currentVitals) {
                newVitals = { ...state.currentVitals, ...action.effect.vitalChange };
            }

            set({
                performedActions: [...state.performedActions, actionId],
                currentVitals: newVitals,
                actionFeedback: `⚠️ ERRO: ${action.effect?.message || action.contraMessage || 'Ação contraindicada!'}`,
                actionsCount: state.actionsCount + 1
            });
            return;
        }

        // Apply effect for any action
        if (action.effect && state.currentVitals) {
            const newVitals = action.effect.vitalChange
                ? { ...state.currentVitals, ...action.effect.vitalChange }
                : state.currentVitals;

            set({
                performedActions: [...state.performedActions, actionId],
                currentVitals: newVitals,
                actionFeedback: action.isCorrect
                    ? `✅ ${action.effect.message}`
                    : `ℹ️ ${action.effect.message}`,
                actionsCount: state.actionsCount + 1,
                correctActions: action.isCorrect ? state.correctActions + 1 : state.correctActions
            });
        } else {
            set({
                performedActions: [...state.performedActions, actionId],
                actionFeedback: action.isCorrect
                    ? `✅ Ação correta realizada!`
                    : `ℹ️ Ação realizada.`,
                actionsCount: state.actionsCount + 1,
                correctActions: action.isCorrect ? state.correctActions + 1 : state.correctActions
            });
        }
    },

    dismissActionFeedback: () => set({ actionFeedback: null }),

    submitDecision: (diagnosis, differentials, conduct) => set({
        finalDiagnosis: diagnosis,
        finalDifferentials: differentials,
        finalConduct: conduct,
        isPaused: true
    }),

    calculateOutcome: () => {
        const state = get();
        if (!state.currentCase) return;

        const { currentCase, finalDiagnosis, elapsedTime } = state;

        // Accuracy
        let accuracy: CaseOutcome['diagnosisAccuracy'] = 'errado';
        if (finalDiagnosis.toLowerCase() === currentCase.correctDiagnosis.toLowerCase()) {
            accuracy = 'correto';
        } else if (currentCase.acceptableDifferentials.some(d =>
            finalDiagnosis.toLowerCase().includes(d.toLowerCase())
        )) {
            accuracy = 'parcial';
        }

        // Time efficiency
        const timeRatio = elapsedTime / currentCase.timeLimit;
        let efficiency: CaseOutcome['timeEfficiency'] = 'critico';
        if (timeRatio < 0.3) efficiency = 'otimo';
        else if (timeRatio < 0.6) efficiency = 'adequado';
        else if (timeRatio < 0.9) efficiency = 'lento';

        // Calculate rewards
        let xp = 0;
        let coins = 0;

        if (accuracy === 'correto') {
            xp = 100;
            coins = 50;
        } else if (accuracy === 'parcial') {
            xp = 50;
            coins = 25;
        }

        if (efficiency === 'otimo') {
            xp += 30;
            coins += 15;
        } else if (efficiency === 'adequado') {
            xp += 15;
            coins += 5;
        }

        const outcome: CaseOutcome = {
            diagnosisAccuracy: accuracy,
            patientOutcome: accuracy === 'correto' ? 'alta' : accuracy === 'parcial' ? 'internacao' : 'uti',
            timeEfficiency: efficiency,
            xpEarned: xp,
            coinsEarned: coins
        };

        set({ outcome, phase: 'feedback' });
    },

    // Narrative actions
    nextNarrativeScene: () => {
        const state = get();
        if (!state.currentCase?.narrativeScenes) return;

        const totalScenes = state.currentCase.narrativeScenes.length;
        const nextIndex = state.currentNarrativeIndex + 1;

        if (nextIndex >= totalScenes) {
            // Finished narrative, go to intro
            set({
                isNarrativeComplete: true,
                phase: 'intro'
            });
        } else {
            set({ currentNarrativeIndex: nextIndex });
        }
    },

    prevNarrativeScene: () => {
        const state = get();
        if (state.currentNarrativeIndex > 0) {
            set({ currentNarrativeIndex: state.currentNarrativeIndex - 1 });
        }
    },

    skipNarrative: () => {
        set({
            isNarrativeComplete: true,
            phase: 'intro'
        });
    },

    reset: () => set(initialState)
}));
