import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useToastStore } from './toastStore'

export interface Case {
    id: string
    title: string
    difficulty: 'easy' | 'medium' | 'hard'
    isCompleted: boolean
    score?: number
}

export interface ShopItem {
    id: string
    name: string
    description: string
    price: number
    category: 'powerup' | 'cosmetic' | 'content'
    icon: string
    owned: boolean
}

export interface UserStats {
    casesCompleted: number
    quizzesTaken: number
    totalCorrectAnswers: number
    bestStreak: number
    totalPlayTime: number // in minutes
    totalStudyTime: number // in minutes
}

export interface GameState {
    // User data
    coins: number
    xp: number
    level: number
    streak: number
    lastLogin: string | null
    unlockedProfessions: string[]
    unlockedByLevel: Record<number, string[]> // Track unlocks per level tier
    isPremium: boolean
    hasSeenTutorial: boolean

    // Life system
    energy: number
    hunger: number
    reputation: number
    lastRestTime: number
    lastHungerUpdate: number

    // Study system
    isStudying: boolean
    studyStartTime: number | null

    // Shift system
    activeShift: any | null  // Currently active shift
    completedShifts: string[]  // IDs of completed shifts

    // Detective progression
    completedDetectiveCases: string[]  // IDs of completed detective cases

    // Game data
    cases: Case[]
    totalScore: number
    ownedItems: string[]
    stats: UserStats

    // Basic actions
    addCoins: (amount: number) => void
    spendCoins: (amount: number) => boolean
    addXP: (amount: number) => void
    completeCase: (caseId: string, score: number) => void
    unlockCase: (caseId: string) => void
    initCases: (cases: Case[]) => void
    buyItem: (itemId: string, price: number) => boolean
    updateStats: (updates: Partial<UserStats>) => void

    // New Action
    unlockProfession: (id: string, levelReq: number, parentId?: string) => boolean

    // Life system actions
    drainEnergy: (amount: number) => void
    restoreEnergy: (amount: number) => void
    feedCharacter: (hungerRestore: number, energyBonus?: number) => void
    changeReputation: (delta: number) => void
    rest: () => boolean
    canPlay: () => boolean
    updateHunger: () => void

    // Study actions
    startStudying: () => void
    stopStudying: () => { minutes: number; coinsEarned: number; xpEarned: number }

    // Shift actions
    setActiveShift: (shift: any | null) => void
    completeShift: (shiftId: string) => void

    // Detective progression actions
    completeDetectiveCase: (caseId: string) => void
}

const XP_PER_LEVEL = 1000
const MIN_ENERGY_TO_PLAY = 40
const REST_COOLDOWN_MS = 2 * 60 * 60 * 1000 // 2 hours
const HUNGER_INCREASE_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes
const COINS_PER_STUDY_HOUR = 100
const XP_PER_STUDY_MINUTE = 1

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            // Initial state
            coins: 1300,
            xp: 650,
            level: 2,
            streak: 5,
            lastLogin: null,

            // Life system initial state
            energy: 100,
            hunger: 0,
            reputation: 3,
            lastRestTime: 0,
            lastHungerUpdate: Date.now(),

            // Study system
            isStudying: false,
            studyStartTime: null,

            // Shift system
            activeShift: null,
            completedShifts: [],

            // Detective progression
            completedDetectiveCases: [] as string[],

            // Game data
            cases: [],
            totalScore: 0,
            ownedItems: [],
            unlockedProfessions: ['academic'],
            unlockedByLevel: { 1: ['academic'] }, // Track by level
            isPremium: false, // Free tier by default
            hasSeenTutorial: false, // Show tutorial on first visit
            stats: {
                casesCompleted: 0,
                quizzesTaken: 0,
                totalCorrectAnswers: 0,
                bestStreak: 0,
                totalPlayTime: 0,
                totalStudyTime: 0,
            },

            addCoins: (amount) => set((state) => ({
                coins: state.coins + amount
            })),

            spendCoins: (amount) => {
                const state = get()
                if (state.coins >= amount) {
                    set({ coins: state.coins - amount })
                    return true
                }
                return false
            },

            addXP: (amount) => set((state) => {
                const newXP = state.xp + amount
                const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1

                if (newLevel > state.level) {
                    useToastStore.getState().addToast(`Parabéns! Você alcançou o nível ${newLevel}! 🌟`, 'success')
                }

                return {
                    xp: newXP,
                    level: newLevel
                }
            }),

            completeCase: (caseId, score) => set((state) => {
                const newCases = state.cases.map((c) =>
                    c.id === caseId ? { ...c, isCompleted: true, score } : c
                )
                const xpGained = score
                const newXP = state.xp + xpGained
                const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1
                const coinsGained = Math.floor(score / 10)

                // Drain energy when completing case
                const hungerMultiplier = state.hunger > 70 ? 2 : 1
                const energyDrain = 15 * hungerMultiplier
                const newEnergy = Math.max(0, state.energy - energyDrain)

                useToastStore.getState().addToast(`Caso concluído! +${coinsGained} Moedas 🏆`, 'success')

                return {
                    cases: newCases,
                    totalScore: state.totalScore + score,
                    coins: state.coins + coinsGained,
                    xp: newXP,
                    level: newLevel,
                    streak: state.streak + 1,
                    energy: newEnergy,
                    stats: {
                        ...state.stats,
                        casesCompleted: state.stats.casesCompleted + 1,
                        bestStreak: Math.max(state.stats.bestStreak, state.streak + 1)
                    }
                }
            }),

            unlockCase: (_caseId) => set((state) => ({
                cases: state.cases
            })),

            initCases: (cases) => set({ cases }),

            buyItem: (itemId, price) => {
                const state = get()
                if (state.coins >= price && !state.ownedItems.includes(itemId)) {
                    set({
                        coins: state.coins - price,
                        ownedItems: [...state.ownedItems, itemId]
                    })
                    useToastStore.getState().addToast('Item comprado com sucesso! 🛍️', 'success')
                    return true
                }
                if (state.coins < price) {
                    useToastStore.getState().addToast('Moedas insuficientes! 💸', 'error')
                }
                return false
            },

            updateStats: (updates) => set((state) => ({
                stats: {
                    casesCompleted: state.stats.casesCompleted + (updates.casesCompleted || 0),
                    quizzesTaken: state.stats.quizzesTaken + (updates.quizzesTaken || 0),
                    totalCorrectAnswers: state.stats.totalCorrectAnswers + (updates.totalCorrectAnswers || 0),
                    bestStreak: Math.max(state.stats.bestStreak, updates.bestStreak || 0),
                    totalPlayTime: state.stats.totalPlayTime + (updates.totalPlayTime || 0),
                    totalStudyTime: state.stats.totalStudyTime + (updates.totalStudyTime || 0),
                }
            })),

            unlockProfession: (id, levelReq, parentId) => {
                const state = get()

                // Check if already unlocked
                if (state.unlockedProfessions.includes(id)) return true

                // Check level requirements
                if (state.level < levelReq) {
                    useToastStore.getState().addToast(`Nível insuficiente! Requer nível ${levelReq}`, 'error')
                    return false
                }

                // Check parent requirement
                if (parentId && !state.unlockedProfessions.includes(parentId)) {
                    useToastStore.getState().addToast('Especialidade anterior bloqueada!', 'error')
                    return false
                }

                // Track unlocks by level - 'academic' doesn't count as it's pre-unlocked
                const currentUnlockedByLevel = state.unlockedByLevel || { 1: ['academic'] }
                const unlocksAtThisLevel = (currentUnlockedByLevel[levelReq] || []).filter((s: string) => s !== 'academic')

                // Limit: only 1 specialty per level tier (excluding academic)
                if (unlocksAtThisLevel.length >= 1) {
                    useToastStore.getState().addToast('Você já escolheu uma especialidade neste nível! Avance para desbloquear mais.', 'warning')
                    return false
                }

                // Perform unlock
                const newUnlockedByLevel = {
                    ...currentUnlockedByLevel,
                    [levelReq]: [...unlocksAtThisLevel, id]
                }

                set({
                    unlockedProfessions: [...state.unlockedProfessions, id],
                    unlockedByLevel: newUnlockedByLevel
                })
                useToastStore.getState().addToast('Nova especialidade desbloqueada! 🎉', 'success')
                return true
            },

            // Life system actions
            drainEnergy: (amount) => set((state) => {
                const hungerMultiplier = state.hunger > 70 ? 2 : 1
                const actualDrain = amount * hungerMultiplier
                const newEnergy = Math.max(0, state.energy - actualDrain)

                if (newEnergy < 20 && state.energy >= 20) {
                    useToastStore.getState().addToast('Cuidado! Sua energia está muito baixa ⚠️', 'warning')
                }

                return {
                    energy: newEnergy
                }
            }),

            restoreEnergy: (amount) => set((state) => ({
                energy: Math.min(100, state.energy + amount)
            })),

            feedCharacter: (hungerRestore, energyBonus = 0) => set((state) => ({
                hunger: Math.max(0, state.hunger - hungerRestore),
                energy: Math.min(100, state.energy + energyBonus)
            })),

            changeReputation: (delta) => set((state) => ({
                reputation: Math.max(0, Math.min(5, state.reputation + delta))
            })),

            rest: () => {
                const state = get()
                const now = Date.now()
                const timeSinceRest = now - state.lastRestTime

                if (timeSinceRest >= REST_COOLDOWN_MS) {
                    set({
                        energy: Math.min(100, state.energy + 50),
                        lastRestTime: now
                    })
                    return true
                }
                return false
            },

            canPlay: () => {
                const state = get()
                return state.energy >= MIN_ENERGY_TO_PLAY
            },

            updateHunger: () => {
                const state = get()
                const now = Date.now()
                const timeSinceUpdate = now - state.lastHungerUpdate
                const intervals = Math.floor(timeSinceUpdate / HUNGER_INCREASE_INTERVAL_MS)

                if (intervals > 0) {
                    const hungerIncrease = intervals * 5
                    const newHunger = Math.min(100, state.hunger + hungerIncrease)

                    if (newHunger > 80 && state.hunger <= 80) {
                        useToastStore.getState().addToast('Você está com muita fome! Coma algo 🍔', 'warning')
                    }

                    set({
                        hunger: newHunger,
                        lastHungerUpdate: now
                    })
                }
            },

            // Study actions
            startStudying: () => set({
                isStudying: true,
                studyStartTime: Date.now()
            }),

            stopStudying: () => {
                const state = get()
                if (!state.isStudying || !state.studyStartTime) {
                    return { minutes: 0, coinsEarned: 0, xpEarned: 0 }
                }

                const now = Date.now()
                const studyDurationMs = now - state.studyStartTime
                const minutes = Math.floor(studyDurationMs / 60000)
                const hours = minutes / 60
                const coinsEarned = Math.floor(hours * COINS_PER_STUDY_HOUR)
                const xpEarned = minutes * XP_PER_STUDY_MINUTE

                const newXP = state.xp + xpEarned
                const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1

                set({
                    isStudying: false,
                    studyStartTime: null,
                    coins: state.coins + coinsEarned,
                    xp: newXP,
                    level: newLevel,
                    stats: {
                        ...state.stats,
                        totalStudyTime: state.stats.totalStudyTime + minutes
                    }
                })

                return { minutes, coinsEarned, xpEarned }
            },

            // Shift actions
            setActiveShift: (shift) => set({ activeShift: shift }),

            completeShift: (shiftId) => set((state) => ({
                activeShift: null,
                completedShifts: [...state.completedShifts, shiftId]
            })),

            // Detective progression
            completeDetectiveCase: (caseId) => set((state) => ({
                completedDetectiveCases: state.completedDetectiveCases.includes(caseId)
                    ? state.completedDetectiveCases
                    : [...state.completedDetectiveCases, caseId]
            })),
        }),
        {
            name: 'medgame-storage',
        }
    )
)
