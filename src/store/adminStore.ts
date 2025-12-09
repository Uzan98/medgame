import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ClinicalCase } from '../lib/cases'
import { QuizCase } from '../lib/quizCases'

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
        (set) => ({
            customCases: [],
            customQuizzes: [],
            isAdmin: false,

            addCase: (case_) => set((state) => ({
                customCases: [...state.customCases, case_]
            })),

            updateCase: (id, updates) => set((state) => ({
                customCases: state.customCases.map(c =>
                    c.id === id ? { ...c, ...updates } : c
                )
            })),

            deleteCase: (id) => set((state) => ({
                customCases: state.customCases.filter(c => c.id !== id)
            })),

            addQuiz: (quiz) => set((state) => ({
                customQuizzes: [...state.customQuizzes, quiz]
            })),

            updateQuiz: (id, updates) => set((state) => ({
                customQuizzes: state.customQuizzes.map(q =>
                    q.id === id ? { ...q, ...updates } : q
                )
            })),

            deleteQuiz: (id) => set((state) => ({
                customQuizzes: state.customQuizzes.filter(q => q.id !== id)
            })),

            setAdmin: (value) => set({ isAdmin: value }),
        }),
        {
            name: 'medgame-admin-storage',
        }
    )
)
