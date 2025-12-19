import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ClinicalCase } from '../lib/cases'
import { QuizCase } from '../lib/quizCases'
import type { OsceCase } from '../lib/osceTypes'
import type { DetectiveCase } from '../lib/detectiveTypes'
import { saveClinicalCase, deleteClinicalCase, saveQuizCase, deleteQuizCase } from '../lib/adminSync'
import { saveOsceCase as saveOsceCaseToDb, deleteOsceCase as deleteOsceCaseFromDb } from '../lib/osceSync'
import { saveDetectiveCase as saveDetectiveCaseToDb, deleteDetectiveCase as deleteDetectiveCaseFromDb } from '../lib/detectiveSync'


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

    // OSCE Cases (Consulta Express)
    customOsceCases: OsceCase[]
    addOsceCase: (osceCase: OsceCase) => void
    updateOsceCase: (id: string, osceCase: Partial<OsceCase>) => void
    deleteOsceCase: (id: string) => void

    // Detective Cases (Medical Detective)
    customDetectiveCases: DetectiveCase[]
    addDetectiveCase: (detectiveCase: DetectiveCase) => void
    updateDetectiveCase: (id: string, detectiveCase: Partial<DetectiveCase>) => void
    deleteDetectiveCase: (id: string) => void

    // Admin auth (simple)
    isAdmin: boolean
    setAdmin: (value: boolean) => void
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            customCases: [],
            customQuizzes: [],
            customOsceCases: [],
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

            // OSCE Cases (Consulta Express)
            addOsceCase: (osceCase) => {
                set((state) => ({
                    customOsceCases: [...state.customOsceCases, osceCase]
                }));
                // Sync to Supabase
                saveOsceCaseToDb(osceCase);
            },

            updateOsceCase: (id, updates) => {
                set((state) => ({
                    customOsceCases: state.customOsceCases.map(c =>
                        c.id === id ? { ...c, ...updates } as OsceCase : c
                    )
                }));
                // Sync to Supabase
                const updatedCase = get().customOsceCases.find(c => c.id === id);
                if (updatedCase) {
                    saveOsceCaseToDb(updatedCase);
                }
            },

            deleteOsceCase: (id) => {
                set((state) => ({
                    customOsceCases: state.customOsceCases.filter(c => c.id !== id)
                }));
                // Sync to Supabase
                deleteOsceCaseFromDb(id);
            },

            // Detective Cases (Medical Detective)
            customDetectiveCases: [],

            addDetectiveCase: (detectiveCase) => {
                set((state) => ({
                    customDetectiveCases: [...state.customDetectiveCases, detectiveCase]
                }));
                // Sync to Supabase
                saveDetectiveCaseToDb(detectiveCase);
            },

            updateDetectiveCase: (id, updates) => {
                set((state) => ({
                    customDetectiveCases: state.customDetectiveCases.map(c =>
                        c.id === id ? { ...c, ...updates } as DetectiveCase : c
                    )
                }));
                // Sync to Supabase
                const updatedCase = get().customDetectiveCases.find(c => c.id === id);
                if (updatedCase) {
                    saveDetectiveCaseToDb(updatedCase);
                }
            },

            deleteDetectiveCase: (id) => {
                set((state) => ({
                    customDetectiveCases: state.customDetectiveCases.filter(c => c.id !== id)
                }));
                // Sync to Supabase
                deleteDetectiveCaseFromDb(id);
            },

            setAdmin: (value) => set({ isAdmin: value }),
        }),
        {
            name: 'medgame-admin-storage',
        }
    )
)

