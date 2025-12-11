import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ClinicalCase } from '../lib/cases'
import { QuizCase } from '../lib/quizCases'
import { saveClinicalCase, deleteClinicalCase, saveQuizCase, deleteQuizCase } from '../lib/adminSync'

interface AdminState {
    // Clinical Cases
    customCases: ClinicalCase[]
    addCase: (case_: ClinicalCase) => void
    updateCase: (id: string, case_: Partial<ClinicalCase>) => void
    deleteCase: (id: string) => void

    // Quiz Cases
    customQuizzes: QuizCase[]
    addQuiz: (quiz: QuizCase) => void
    updateQuiz: (id: string, quiz: Partial<QuizCase>) => void
    deleteQuiz: (id: string) => void

    // Admin auth (simple)
    isAdmin: boolean
    setAdmin: (value: boolean) => void
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            customCases: [],
            customQuizzes: [],
            isAdmin: false,

            addCase: (case_) => {
                set((state) => ({
                    customCases: [...state.customCases, case_]
                }));
                // Sync to Supabase
                saveClinicalCase(case_);
            },

            updateCase: (id, updates) => {
                set((state) => ({
                    customCases: state.customCases.map(c =>
                        c.id === id ? { ...c, ...updates } : c
                    )
                }));
                // Sync to Supabase
                const updatedCase = get().customCases.find(c => c.id === id);
                if (updatedCase) {
                    saveClinicalCase(updatedCase);
                }
            },

            deleteCase: (id) => {
                set((state) => ({
                    customCases: state.customCases.filter(c => c.id !== id)
                }));
                // Sync to Supabase
                deleteClinicalCase(id);
            },

            addQuiz: (quiz) => {
                set((state) => ({
                    customQuizzes: [...state.customQuizzes, quiz]
                }));
                // Sync to Supabase
                saveQuizCase(quiz);
            },

            updateQuiz: (id, updates) => {
                set((state) => ({
                    customQuizzes: state.customQuizzes.map(q =>
                        q.id === id ? { ...q, ...updates } : q
                    )
                }));
                // Sync to Supabase
                const updatedQuiz = get().customQuizzes.find(q => q.id === id);
                if (updatedQuiz) {
                    saveQuizCase(updatedQuiz);
                }
            },

            deleteQuiz: (id) => {
                set((state) => ({
                    customQuizzes: state.customQuizzes.filter(q => q.id !== id)
                }));
                // Sync to Supabase
                deleteQuizCase(id);
            },

            setAdmin: (value) => set({ isAdmin: value }),
        }),
        {
            name: 'medgame-admin-storage',
        }
    )
)

