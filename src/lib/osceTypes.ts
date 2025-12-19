// OSCE Mode Types and Interfaces

// ==============================
// CASE STRUCTURE
// ==============================

export interface OsceCase {
    id: string;
    title: string;
    patientName: string;
    patientAge: number;
    patientGender: 'M' | 'F';
    patientAvatar: string;
    chiefComplaint: string;
    difficulty: 'facil' | 'medio' | 'dificil';
    category: string;
    timeLimit: number; // seconds for Phase 1
    xpReward: number;
    coinsReward: number;

    // Secret data only AI knows
    secretHistory: OsceSecretData;

    // For evaluation
    essentialQuestions: EssentialQuestion[];
    expectedAnamnesis: ExpectedAnamnesis;
}

export interface OsceSecretData {
    // História da Doença Atual (HDA)
    hda: {
        inicio: string;                    // "Hoje de manhã às 8h"
        localizacao: string;               // "No meio do peito"
        caracteristica: string;            // "Dor em aperto"
        intensidade: string;               // "8 de 10"
        irradiacao: string;                // "Vai pro braço esquerdo"
        fatoresAgravantes: string[];       // ["esforço", "subir escada"]
        fatoresAtenuantes: string[];       // ["repouso", "ficar quieto"]
        sintomasAssociados: string[];      // ["suor frio", "náusea"]

        // NOVOS CAMPOS - Evolução temporal (opcionais)
        evolucao?: string;                  // "Está piorando progressivamente"
        frequencia?: string;                // "Constante desde que começou" ou "Vai e volta"
        duracao?: string;                   // "Já tem umas 6 horas"
        episodiosAnteriores?: string;       // "Nunca tive isso antes" ou "Já tive parecido há 1 ano"
        oQueEstavaFazendo?: string;         // "Estava subindo a escada do prédio"
        tratamentosTentados?: string;       // "Tomei um Buscopan mas não melhorou"
    };

    // Antecedentes Pessoais e Familiares
    antecedentes: {
        doencasCronicas: string[];
        cirurgias: string[];
        internacoes: string[];
        alergias: string[];
        historicoFamiliar: string[];

        // NOVOS CAMPOS (opcionais)
        vacinacao?: string;                 // "Vacinas em dia" ou "Não lembro da última"
        transfusoes?: string;               // "Nunca recebi sangue"
        doencasInfancia?: string;           // "Tive catapora quando criança"
    };

    // Medicações em uso
    medicacoes: string[];

    // Hábitos de vida
    habitos: {
        tabagismo: string;
        etilismo: string;
        drogas: string;
        alimentacao: string;
        atividadeFisica: string;
        sono: string;

        // NOVOS CAMPOS (opcionais)
        cafeina?: string;                   // "Tomo 3 cafés por dia"
        agua?: string;                      // "Bebo pouca água"
        estresse?: string;                  // "Trabalho muito estressante"
    };

    // Revisão de sistemas
    revisaoSistemas: Record<string, string>;

    // NOVOS: Contexto Social e Ocupacional (opcional)
    contextoSocial?: {
        profissao: string;                 // "Pedreiro"
        condicoesTrabalho: string;         // "Trabalho pesado, carrego peso"
        moradia: string;                   // "Moro em casa própria com esposa e 2 filhos"
        estadoCivil: string;               // "Casado há 15 anos"
        filhos: string;                    // "2 filhos, 10 e 8 anos"
        religiao: string;                  // "Católico" (para questões de transfusão, etc)
        escolaridade: string;              // "Ensino médio completo"
        renda: string;                     // "2 salários mínimos"
        planoSaude: string;                // "Não tenho plano, uso o SUS"
    };

    // NOVOS: Dados "Físicos" que o paciente pode relatar (opcional)
    dadosFisicos?: {
        peso: string;                      // "Uns 85 kg"
        altura: string;                    // "1,75m mais ou menos"
        mudancaPeso: string;               // "Emagreci 5kg no último mês"
        febre: string;                     // "Tive febre ontem, 38 graus"
        pressaoArterial: string;           // "Minha pressão geralmente é 14 por 9"
        glicemia: string;                  // "Minha glicose fica em torno de 150"
    };

    // NOVOS: Vida Sexual e Reprodutiva (opcional)
    vidaSexual?: {
        ativo: string;                     // "Sim, com parceira fixa"
        metodoContraceptivo: string;       // "Minha esposa usa anticoncepcional"
        dst: string;                       // "Nunca tive nenhuma doença"
        gestacoes: string;                 // Para mulheres: "2 gestações, 2 partos normais"
        menstruacao: string;               // Para mulheres: "Regular, a cada 28 dias"
        ultimaMenstruacao: string;         // Para mulheres: "Há 2 semanas"
    };

    // NOVOS: Exposições e Contatos (opcional)
    exposicoes?: {
        viagensRecentes: string;           // "Fui pro interior há 2 semanas"
        contatoDoentes: string;            // "Meu colega de trabalho tá com tuberculose"
        animais: string;                   // "Tenho 2 cachorros e 1 gato"
        ambienteTrabalho: string;          // "Trabalho com poeira e produtos químicos"
        agua: string;                      // "Bebo água de poço"
        alimentosRecentes: string;         // "Comi churrasco ontem que tava um pouco cru"
    };

    // NOVOS: Estado Emocional e Expectativas (opcional)
    estadoEmocional?: {
        comoSeSente: string;               // "Tô muito preocupado"
        medos: string;                     // "Tenho medo de ser algo grave"
        expectativas: string;              // "Espero que o senhor descubra o que eu tenho"
        impactoVida: string;               // "Não tô conseguindo trabalhar"
        apoioFamiliar: string;             // "Minha esposa tá me apoiando"
    };

    // Personalidade do paciente
    personalidade: 'ansioso' | 'colaborativo' | 'reservado' | 'irritado';

    // Detalhes extras para respostas autênticas
    detalhesExtras: string;
}

export interface EssentialQuestion {
    id: string;
    category: 'hda' | 'antecedentes' | 'medicacoes' | 'habitos' | 'revisao';
    keywords: string[];  // Palavras que indicam que a pergunta foi feita
    weight: number;      // Peso na avaliação (1-10)
    description: string; // Descrição do que deveria ser perguntado
}

export interface ExpectedAnamnesis {
    queixaPrincipal: string;
    hda: string[];
    antecedentes: string[];
    medicacoes: string[];
    habitos: string[];
    revisaoSistemas: string[];
}

// ==============================
// CHAT & MESSAGES
// ==============================

export interface ChatMessage {
    id: string;
    role: 'user' | 'patient';
    content: string;
    timestamp: number;
    emotion?: PatientEmotion;
}

export type PatientEmotion =
    | 'neutro'
    | 'preocupado'
    | 'ansioso'
    | 'irritado'
    | 'confiante'
    | 'aliviado'
    | 'triste';

export interface PatientResponse {
    resposta: string;
    emocao: PatientEmotion;
    confiancaDelta: number; // Change in trust level
    // Chain of Thought (CoT) fields
    analise_pergunta?: string; // What the AI understood
    busca_dados?: string; // Where it looked in the script
    evidencia_encontrada?: string; // What it found specifically
    veredicto?: string; // Final decision before answering
}

// ==============================
// PRONTUÁRIO (MEDICAL RECORD)
// ==============================

export interface ProntuarioData {
    queixaPrincipal: string;
    hda: string;
    antecedentes: string;
    medicacoes: string;
    habitos: string;
    revisaoSistemas: string;
}

export const PRONTUARIO_TEMPLATE: ProntuarioData = {
    queixaPrincipal: '',
    hda: '',
    antecedentes: '',
    medicacoes: '',
    habitos: '',
    revisaoSistemas: ''
};

export const PRONTUARIO_LABELS: Record<keyof ProntuarioData, string> = {
    queixaPrincipal: 'Queixa Principal (QP)',
    hda: 'História da Doença Atual (HDA)',
    antecedentes: 'Antecedentes Pessoais (AP)',
    medicacoes: 'Medicações em Uso',
    habitos: 'Hábitos de Vida',
    revisaoSistemas: 'Revisão de Sistemas (RS)'
};

export const PRONTUARIO_PLACEHOLDERS: Record<keyof ProntuarioData, string> = {
    queixaPrincipal: 'Ex: Dor no peito há 2 horas',
    hda: 'Descreva a evolução do quadro: início, características, fatores de piora/melhora...',
    antecedentes: 'Doenças prévias, cirurgias, internações, alergias...',
    medicacoes: 'Medicamentos em uso regular...',
    habitos: 'Tabagismo, etilismo, atividade física, alimentação...',
    revisaoSistemas: 'Outros sintomas em outros sistemas...'
};

// ==============================
// EVALUATION
// ==============================

export interface CategoryEvaluation {
    completude: number;      // 0-100
    faltou: string[];        // Items that were expected but missing
    inventou: string[];      // Items written but not collected
    pontuacao: number;       // Points for this category
}

// Writing Quality Feedback
export interface WritingQuality {
    scoreEscrita: number;    // 0-100 overall writing score

    // Technical terminology
    terminologia: {
        score: number;       // 0-100
        termosCorretos: string[];     // Good usage examples
        termosIncorretos: string[];   // Wrong/informal terms found
        sugestoes: string[];          // Suggestions for improvement
    };

    // Cohesion (how ideas connect)
    coesao: {
        score: number;       // 0-100
        pontosBons: string[];         // What was done well
        problemas: string[];          // Issues found
        sugestoes: string[];          // How to improve
    };

    // Coherence (logical flow)
    coerencia: {
        score: number;       // 0-100
        pontosBons: string[];
        problemas: string[];
        sugestoes: string[];
    };

    // Structure & Organization
    estrutura: {
        score: number;       // 0-100
        pontosBons: string[];
        problemas: string[];
        sugestoes: string[];
    };

    // Overall writing tips
    dicasGerais: string[];
    exemploReescrita?: string;  // Optional: example of how to rewrite a section
}

export interface OsceEvaluation {
    scoreTotal: number;
    scoreColeta: number;
    scoreComunicacao: number;
    scoreProntuario: number;
    scoreSeguranca: number;
    scoreEscrita: number;     // NEW: Writing quality score

    avaliacao: {
        queixaPrincipal: CategoryEvaluation;
        hda: CategoryEvaluation;
        antecedentes: CategoryEvaluation;
        medicacoes: CategoryEvaluation;
        habitos: CategoryEvaluation;
        revisaoSistemas: CategoryEvaluation;
    };

    perguntasEssenciaisFeitas: string[];
    perguntasEssenciaisFaltantes: string[];

    errosGraves: string[];
    feedbackEducacional: string[];

    // NEW: Writing quality detailed feedback
    qualidadeEscrita: WritingQuality;

    xpGanho: number;
    coinsGanho: number;
}

// ==============================
// CARDS / POWER-UPS
// ==============================

export interface OsceCard {
    id: string;
    name: string;
    icon: string;
    description: string;
    phase: 'consultation' | 'prontuario' | 'both';
    effect: CardEffect;
    cost: number; // coins
}

export type CardEffect =
    | { type: 'suggest_question'; category: string }
    | { type: 'boost_trust'; amount: number }
    | { type: 'show_categories' }
    | { type: 'extend_time'; seconds: number }
    | { type: 'highlight_missing' };

export const OSCE_CARDS: OsceCard[] = [
    {
        id: 'pergunta-direta',
        name: 'Pergunta Direta',
        icon: '💡',
        description: 'Sugere uma pergunta importante que você ainda não fez',
        phase: 'both',
        effect: { type: 'suggest_question', category: 'any' },
        cost: 50
    },
    {
        id: 'empatia-plus',
        name: 'Empatia+',
        icon: '💚',
        description: 'Aumenta a confiança do paciente em +15',
        phase: 'consultation',
        effect: { type: 'boost_trust', amount: 15 },
        cost: 30
    },
    {
        id: 'checklist-mental',
        name: 'Checklist Mental',
        icon: '📋',
        description: 'Mostra as categorias da anamnese (sem conteúdo)',
        phase: 'prontuario',
        effect: { type: 'show_categories' },
        cost: 20
    },
    {
        id: 'tempo-extra',
        name: 'Tempo Extra',
        icon: '⏰',
        description: 'Adiciona 30 segundos ao timer',
        phase: 'consultation',
        effect: { type: 'extend_time', seconds: 30 },
        cost: 40
    },
    {
        id: 'revisar-lacunas',
        name: 'Revisar Lacunas',
        icon: '🔍',
        description: 'Destaca 1 item essencial que você esqueceu',
        phase: 'prontuario',
        effect: { type: 'highlight_missing' },
        cost: 60
    }
];

// ==============================
// API TYPES
// ==============================

export interface AskPatientRequest {
    caseId: string;
    question: string;
    chatHistory: ChatMessage[];
    trustLevel: number;
    osceCase?: OsceCase; // Full case data for generating prompt
}

export interface EvaluateAnamnesisRequest {
    caseId: string;
    questionsAsked: string[];
    prontuario: ProntuarioData;
    trustLevel: number;
    timeUsed: number;
}

// ==============================
// GAME STATE
// ==============================

export type OscePhase = 'intro' | 'consultation' | 'prontuario' | 'hipoteses' | 'exames' | 'resultados' | 'prescricao' | 'results';

export interface OsceGameState {
    phase: OscePhase;
    currentCase: OsceCase | null;

    // Phase 1: Consultation
    chatHistory: ChatMessage[];
    trustLevel: number;
    timeRemaining: number;
    questionsAsked: string[];
    isLoading: boolean;

    // Phase 2: Prontuario
    prontuario: ProntuarioData;

    // Phase 3: Hipóteses Diagnósticas
    hypotheses: DiagnosticHypothesis[];

    // Phase 4: Exames Solicitados
    requestedExams: string[];

    // Phase 5: Resultados (revealed after request)
    revealedResults: string[];

    // Phase 6: Prescrição
    prescription: PrescriptionItem[];

    // Results
    evaluation: OsceEvaluation | null;

    // Cards
    availableCards: OsceCard[];
    usedCards: string[];

    // Errors
    error: string | null;
}

// ==============================
// DIAGNOSTIC HYPOTHESES (Phase 3)
// ==============================

export interface DiagnosticHypothesis {
    id: string;
    diagnosis: string;
    probability: 'alta' | 'media' | 'baixa';
    justification: string;
}

// ==============================
// EXAM REQUEST & RESULTS (Phase 4 & 5)
// ==============================

export interface AvailableExam {
    id: string;
    name: string;
    category: 'laboratorio' | 'imagem' | 'funcional' | 'outros';
    description?: string;
}

export interface ExamResult {
    examId: string;
    examName: string;
    result: string;
    interpretation?: string;
    isAbnormal: boolean;
    criticalFindings?: string[];
    imageUrl?: string; // Supabase storage URL
}

// ==============================
// PRESCRIPTION (Phase 6)
// ==============================

export type PrescriptionType = 'medicamento' | 'dieta' | 'repouso' | 'encaminhamento' | 'orientacao';

export interface PrescriptionItem {
    id: string;
    type: PrescriptionType;
    description: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    notes?: string;
}

// ==============================
// EXTENDED OSCE CASE (with new fields)
// ==============================

export interface OsceCaseExtended extends OsceCase {
    // Available exams that can be requested
    availableExams: AvailableExam[];

    // Pre-configured exam results (admin sets these)
    examResults: ExamResult[];

    // Expected correct diagnoses
    expectedDiagnoses: {
        primary: string;        // Main diagnosis
        differentials: string[]; // Differential diagnoses
    };

    // Expected prescription elements
    expectedPrescription: {
        medicamentos: string[];
        dieta?: string;
        repouso?: string;
        encaminhamentos?: string[];
        orientacoes?: string[];
    };
}

// ==============================
// EXTENDED EVALUATION
// ==============================

export interface OsceEvaluationExtended extends OsceEvaluation {
    // New scores for extended phases
    scoreDiagnostico: number;    // Hypothesis accuracy
    scoreExames: number;         // Appropriate exam selection
    scorePrescricao: number;     // Treatment appropriateness

    // Detailed feedback for new phases
    diagnosticoFeedback: {
        acertos: string[];
        erros: string[];
        faltou: string[];
    };

    examesFeedback: {
        adequados: string[];
        desnecessarios: string[];
        faltantes: string[];
    };

    prescricaoFeedback: {
        corretos: string[];
        incorretos: string[];
        faltantes: string[];
    };
}

