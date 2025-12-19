// Medical Detective Game Types

// Environments
export type CaseEnvironment = 'PS' | 'enfermaria' | 'UTI' | 'ambulatorio';
export type Urgency = 'baixa' | 'media' | 'alta' | 'critica';
export type Gender = 'M' | 'F';

// Narrative scene for storytelling
export interface NarrativeScene {
    id: string;
    order: number;                              // Ordem de exibição
    imageUrl: string;                           // URL da imagem (Supabase Storage)
    audioUrl?: string;                          // URL do áudio (Supabase Storage)
    text: string;                               // Texto narrativo
    duration?: number;                          // Duração em ms (auto-avança se definido)
    textPosition?: 'top' | 'center' | 'bottom'; // Posição do texto na tela
    textStyle?: 'normal' | 'dramatic' | 'whisper'; // Estilo do texto
    transition?: 'fade' | 'slide' | 'zoom';     // Transição para próxima cena
}

// Patient info
export interface Patient {
    name: string;
    age: number;
    gender: Gender;
    chiefComplaint: string;
    isUnconscious?: boolean; // Patient can't talk
    glasgowScore?: number;
    vitalSigns: {
        fc: number;
        pa: string;
        fr: number;
        temp: number;
        spo2: number;
    };
}

// Investigation source (who you're talking to)
export type InvestigationSource = 'paramedic' | 'family' | 'witness' | 'belongings' | 'environment';

// Investigation item (can be from different sources)
export interface InvestigationItem {
    id: string;
    source: InvestigationSource;
    sourceName: string; // "Paramédico João", "Esposa Maria", etc.
    category: string;
    question: string;
    answer: string;
    critical?: boolean;
    revealed?: boolean;
    icon?: string;
}

// Anamnesis question (legacy, still used for conscious patients)
export interface AnamnesisItem {
    id: string;
    category: string;
    question: string;
    answer: string;
    critical?: boolean;
    revealed?: boolean;
}

// Physical exam finding
export interface PhysicalExamItem {
    id: string;
    system: string;
    finding: string;
    critical?: boolean;
    revealed?: boolean;
    hidden?: boolean; // Requires specific action to discover
}

// Lab/imaging exam
export interface ExamItem {
    id: string;
    name: string;
    category: 'laboratorial' | 'imagem' | 'funcional';
    cost: number;
    timeToResult: number; // seconds in game
    result: string;
    critical?: boolean;
    ordered?: boolean;
    completed?: boolean;
}

// Medical action/intervention
export interface MedicalAction {
    id: string;
    name: string;
    category: 'airway' | 'breathing' | 'circulation' | 'drugs' | 'monitoring' | 'procedimento' | 'fluidos' | 'logistica' | 'avaliacao';
    description: string;
    isCorrect: boolean; // Is this the right intervention for this case?
    effect?: {
        vitalChange?: Partial<Patient['vitalSigns']>;
        message: string;
    };
    contraindicated?: boolean;
    contraMessage?: string;
    performed?: boolean;
}

// Dynamic event
export interface TimeEvent {
    id: string;
    triggerTime: number; // seconds after case start
    triggerCondition?: string; // optional condition
    type: 'worsening' | 'exam_ready' | 'family' | 'pressure' | 'improvement';
    title: string;
    description: string;
    effect?: {
        vitalChange?: Partial<Patient['vitalSigns']>;
        urgencyChange?: Urgency;
    };
    triggered?: boolean;
}

// Hypothesis in differential diagnosis
export interface Hypothesis {
    id: string;
    name: string;
    priority: 'principal' | 'diferencial' | 'descartado';
    addedAt: number; // timestamp
}

// Case outcome
export interface CaseOutcome {
    diagnosisAccuracy: 'correto' | 'parcial' | 'errado';
    patientOutcome: 'alta' | 'internacao' | 'uti' | 'obito';
    timeEfficiency: 'otimo' | 'adequado' | 'lento' | 'critico';
    xpEarned: number;
    coinsEarned: number;
}

// Full case structure
export interface DetectiveCase {
    id: string;
    title: string;
    subtitle: string;
    environment: CaseEnvironment;
    urgency: Urgency;
    timeLimit: number; // seconds
    difficulty: 'facil' | 'medio' | 'dificil';

    // Progression system
    order?: number;        // Ordem na trilha (opcional, usa createdAt se não definido)
    createdAt?: number;    // Timestamp de criação para ordenação

    patient: Patient;

    // Investigation sources (for unconscious patients)
    investigation?: InvestigationItem[];

    // Legacy anamnesis (for conscious patients)
    anamnesis: AnamnesisItem[];
    physicalExam: PhysicalExamItem[];
    exams: ExamItem[];
    documents?: { title: string; content: string }[];
    belongings?: { name: string; description: string; clue?: string }[];

    // Medical actions/interventions for critical patients
    actions?: MedicalAction[];

    events: TimeEvent[];

    // Correct answers
    correctDiagnosis: string;
    acceptableDifferentials: string[];
    correctConduct: string;

    // Multiple choice options (5 alternatives each)
    diagnosisOptions?: string[];  // First option should be the correct one
    conductOptions?: string[];    // First option should be the correct one

    // Teaching
    criticalClues: string[];
    commonMistakes: string[];
    teachingPoints: string[];
    guidelines?: string[];

    // Deduction pairs - correct connections between findings
    deductionPairs?: {
        clueA: string;
        clueB: string;
        insight: string;
    }[];

    // Narrative scenes for storytelling intro
    narrativeScenes?: NarrativeScene[];
}

// Game phases
export type GamePhase =
    | 'narrative'
    | 'intro'
    | 'investigation'
    | 'decision'
    | 'outcome'
    | 'feedback';

// Clue for the evidence board
export interface Clue {
    id: string;
    type: 'anamnesis' | 'exam' | 'lab' | 'observation';
    text: string;
    source: string;
    timestamp: number;
    isPinned: boolean;
    color: string;
}

// Deduction - logical connection between clues
export interface Deduction {
    id: string;
    clueIds: string[]; // IDs of connected clues
    conclusion: string;
    isCorrect?: boolean; // Revealed after case ends
    timestamp: number;
}

// Game state
export interface DetectiveGameState {
    // Current case
    currentCase: DetectiveCase | null;
    phase: GamePhase;

    // Time
    elapsedTime: number; // seconds
    isPaused: boolean;

    // Narrative state
    currentNarrativeIndex: number;
    isNarrativeComplete: boolean;

    // Investigation progress
    revealedAnamnesis: string[]; // IDs
    revealedExams: string[]; // IDs  
    orderedExams: string[]; // IDs
    completedExams: string[]; // IDs

    // Hypotheses
    hypotheses: Hypothesis[];

    // Evidence Board
    clues: Clue[];
    deductions: Deduction[];

    // Monitoring
    isMonitoring: boolean;
    currentVitals: Patient['vitalSigns'] | null;

    // Actions performed
    performedActions: string[]; // IDs
    actionFeedback: string | null;

    // Events
    triggeredEvents: string[];
    activeNotification: TimeEvent | null;
    insightNotification: string | null;

    // Final decision
    finalDiagnosis: string;
    finalDifferentials: string[];
    finalConduct: string;

    // Outcome
    outcome: CaseOutcome | null;

    // Stats
    totalCost: number;
    actionsCount: number;
    correctDeductions: number;
    correctActions: number;
}
