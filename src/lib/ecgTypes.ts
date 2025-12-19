// ECG Game Types and Utilities

export interface EcgCase {
    id: string;
    clinical_context: string;
    ecg_image_url: string;
    correct_answer: string;
    alternatives: string[];
    explanation: string | null;
    difficulty: 'easy' | 'medium' | 'hard';
    xp_reward: number;
    coins_reward: number;
    tags: string[];
    is_active: boolean;
    created_at: string;
}

export interface EcgGameSession {
    id: string;
    user_id: string;
    cases_answered: number;
    correct_answers: number;
    streak: number;
    best_streak: number;
    xp_earned: number;
    coins_earned: number;
    ended_at: string | null;
    created_at: string;
}

export interface EcgGameState {
    // Game state
    isPlaying: boolean;
    currentCase: EcgCase | null;
    casesAnswered: number;
    correctAnswers: number;
    streak: number;
    bestStreak: number;
    xpEarned: number;
    coinsEarned: number;

    // Timer
    timeRemaining: number;

    // UI state
    selectedAnswer: string | null;
    showResult: boolean;
    isLoading: boolean;
    error: string | null;

    // All available cases
    availableCases: EcgCase[];
    usedCaseIds: string[];
}
