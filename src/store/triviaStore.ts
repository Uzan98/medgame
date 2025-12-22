import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { TriviaQuestion, SAMPLE_TRIVIA_QUESTIONS } from '../lib/triviaTypes';

interface TriviaStoreState {
    questions: TriviaQuestion[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchQuestions: () => Promise<void>;
    addQuestion: (question: Omit<TriviaQuestion, 'id'>) => Promise<{ success: boolean; error?: string }>;
    addBatchQuestions: (questions: Omit<TriviaQuestion, 'id'>[]) => Promise<{ success: boolean; added: number; error?: string }>;
    updateQuestion: (id: string, question: Partial<TriviaQuestion>) => Promise<{ success: boolean; error?: string }>;
    deleteQuestion: (id: string) => Promise<{ success: boolean; error?: string }>;
}

// Map from Supabase row to TriviaQuestion
interface SupabaseTriviaRow {
    id: string;
    category_id: string;
    question: string;
    options: string[];
    correct_index: number;
    difficulty: 'easy' | 'medium' | 'hard';
    explanation: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const mapRowToQuestion = (row: SupabaseTriviaRow): TriviaQuestion => ({
    id: row.id,
    categoryId: row.category_id,
    question: row.question,
    options: row.options,
    correctIndex: row.correct_index,
    difficulty: row.difficulty,
    explanation: row.explanation || undefined
});

const mapQuestionToRow = (q: Omit<TriviaQuestion, 'id'>) => ({
    category_id: q.categoryId,
    question: q.question,
    options: q.options,
    correct_index: q.correctIndex,
    difficulty: q.difficulty,
    explanation: q.explanation || null
});

export const useTriviaStore = create<TriviaStoreState>((set) => ({
    questions: SAMPLE_TRIVIA_QUESTIONS, // Fallback
    isLoading: false,
    error: null,

    fetchQuestions: async () => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('trivia_questions')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching trivia questions:', error);
                // Keep sample questions as fallback
                set({ isLoading: false, error: error.message });
                return;
            }

            if (data && data.length > 0) {
                const questions = data.map(mapRowToQuestion);
                set({ questions, isLoading: false });
            } else {
                // No questions in DB, use samples
                set({ questions: SAMPLE_TRIVIA_QUESTIONS, isLoading: false });
            }
        } catch (err: any) {
            console.error('Exception fetching trivia:', err);
            set({ isLoading: false, error: err.message });
        }
    },

    addQuestion: async (question) => {
        try {
            const { data, error } = await supabase
                .from('trivia_questions')
                .insert(mapQuestionToRow(question))
                .select()
                .single();

            if (error) {
                return { success: false, error: error.message };
            }

            // Add to local state
            const newQuestion = mapRowToQuestion(data);
            set(state => ({
                questions: [newQuestion, ...state.questions.filter(q => !q.id.startsWith('c') && !q.id.startsWith('s') && !q.id.startsWith('p') && !q.id.startsWith('g') && !q.id.startsWith('n') && !q.id.startsWith('sc'))]
            }));

            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    },

    addBatchQuestions: async (questions) => {
        try {
            const rows = questions.map(mapQuestionToRow);

            const { data, error } = await supabase
                .from('trivia_questions')
                .insert(rows)
                .select();

            if (error) {
                return { success: false, added: 0, error: error.message };
            }

            // Add to local state
            const newQuestions = (data || []).map(mapRowToQuestion);
            set(state => ({
                questions: [...newQuestions, ...state.questions.filter(q =>
                    !q.id.startsWith('c') && !q.id.startsWith('s') && !q.id.startsWith('p') &&
                    !q.id.startsWith('g') && !q.id.startsWith('n') && !q.id.startsWith('sc')
                )]
            }));

            return { success: true, added: newQuestions.length };
        } catch (err: any) {
            return { success: false, added: 0, error: err.message };
        }
    },

    updateQuestion: async (id, updates) => {
        try {
            const updateData: Record<string, any> = {};
            if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
            if (updates.question !== undefined) updateData.question = updates.question;
            if (updates.options !== undefined) updateData.options = updates.options;
            if (updates.correctIndex !== undefined) updateData.correct_index = updates.correctIndex;
            if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
            if (updates.explanation !== undefined) updateData.explanation = updates.explanation;
            updateData.updated_at = new Date().toISOString();

            const { error } = await supabase
                .from('trivia_questions')
                .update(updateData)
                .eq('id', id);

            if (error) {
                return { success: false, error: error.message };
            }

            // Update local state
            set(state => ({
                questions: state.questions.map(q =>
                    q.id === id ? { ...q, ...updates } : q
                )
            }));

            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    },

    deleteQuestion: async (id) => {
        try {
            // Soft delete
            const { error } = await supabase
                .from('trivia_questions')
                .update({ is_active: false })
                .eq('id', id);

            if (error) {
                return { success: false, error: error.message };
            }

            // Remove from local state
            set(state => ({
                questions: state.questions.filter(q => q.id !== id)
            }));

            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}));
