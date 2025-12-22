// MedTrivia Types - Perguntados-style Medical Quiz Game

import { type LucideIcon } from 'lucide-react';

// The 6 major medical specialty categories
export interface TriviaCategory {
    id: string;
    name: string;
    color: string;           // Tailwind color class (e.g., 'red', 'blue')
    bgColor: string;         // Background color for segments
    textColor: string;       // Text color class
    icon: string;            // Lucide icon name
    angle: number;           // Starting angle in the wheel (0-360)
}

// A trivia question
export interface TriviaQuestion {
    id: string;
    categoryId: string;
    question: string;
    options: string[];       // 4 options
    correctIndex: number;    // 0-3
    difficulty: 'easy' | 'medium' | 'hard';
    explanation?: string;    // Shown after answering
}

// Player progress for crowns
export interface TriviaCrowns {
    [categoryId: string]: number; // Number of correct answers toward crown (0-2, 3 = crown)
}

// Game state
export type TriviaPhase = 'idle' | 'spinning' | 'question' | 'result' | 'victory' | 'defeat';

export interface TriviaGameState {
    phase: TriviaPhase;
    currentCategory: TriviaCategory | null;
    currentQuestion: TriviaQuestion | null;
    selectedAnswer: number | null;
    isCorrect: boolean | null;
    crowns: Record<string, boolean>;     // categoryId -> has crown
    progress: Record<string, number>;     // categoryId -> correct answers (0-3)
    streak: number;
    totalCorrect: number;
    totalWrong: number;
    timeLeft: number;
}

// The 6 categories
export const TRIVIA_CATEGORIES: TriviaCategory[] = [
    {
        id: 'clinica',
        name: 'Clínica Médica',
        color: 'red',
        bgColor: 'bg-red-500',
        textColor: 'text-red-400',
        icon: 'Stethoscope',
        angle: 0
    },
    {
        id: 'cirurgia',
        name: 'Cirurgia',
        color: 'blue',
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-400',
        icon: 'Scissors',
        angle: 60
    },
    {
        id: 'pediatria',
        name: 'Pediatria',
        color: 'green',
        bgColor: 'bg-emerald-500',
        textColor: 'text-emerald-400',
        icon: 'Baby',
        angle: 120
    },
    {
        id: 'go',
        name: 'GO',
        color: 'yellow',
        bgColor: 'bg-yellow-500',
        textColor: 'text-yellow-400',
        icon: 'Heart',
        angle: 180
    },
    {
        id: 'neuro',
        name: 'Neuro/Psiq',
        color: 'purple',
        bgColor: 'bg-purple-500',
        textColor: 'text-purple-400',
        icon: 'Brain',
        angle: 240
    },
    {
        id: 'coletiva',
        name: 'Saúde Coletiva',
        color: 'orange',
        bgColor: 'bg-orange-500',
        textColor: 'text-orange-400',
        icon: 'Users',
        angle: 300
    }
];

// Sample questions (fallback)
export const SAMPLE_TRIVIA_QUESTIONS: TriviaQuestion[] = [
    // Clínica Médica
    {
        id: 'c1',
        categoryId: 'clinica',
        question: 'Qual é o padrão-ouro para diagnóstico de infarto agudo do miocárdio?',
        options: ['ECG', 'Troponina', 'Cateterismo', 'Ecocardiograma'],
        correctIndex: 1,
        difficulty: 'medium',
        explanation: 'A troponina é o biomarcador mais sensível e específico para necrose miocárdica.'
    },
    {
        id: 'c2',
        categoryId: 'clinica',
        question: 'Qual antibiótico é primeira escolha para pneumonia adquirida na comunidade?',
        options: ['Ciprofloxacino', 'Amoxicilina', 'Vancomicina', 'Metronidazol'],
        correctIndex: 1,
        difficulty: 'easy'
    },
    {
        id: 'c3',
        categoryId: 'clinica',
        question: 'A tríade de Cushing indica qual condição?',
        options: ['Choque séptico', 'Hipertensão intracraniana', 'Insuficiência cardíaca', 'Embolia pulmonar'],
        correctIndex: 1,
        difficulty: 'medium'
    },
    // Cirurgia
    {
        id: 's1',
        categoryId: 'cirurgia',
        question: 'Qual é o sinal clássico de apendicite aguda?',
        options: ['Sinal de Murphy', 'Sinal de Blumberg', 'Sinal de Rovsing', 'Todos os acima'],
        correctIndex: 1,
        difficulty: 'easy'
    },
    {
        id: 's2',
        categoryId: 'cirurgia',
        question: 'A classificação de Hinchey é utilizada para qual patologia?',
        options: ['Apendicite', 'Diverticulite', 'Colecistite', 'Pancreatite'],
        correctIndex: 1,
        difficulty: 'medium'
    },
    {
        id: 's3',
        categoryId: 'cirurgia',
        question: 'No trauma, qual é a primeira prioridade do ATLS?',
        options: ['Circulação', 'Via aérea', 'Exposição', 'Neurológico'],
        correctIndex: 1,
        difficulty: 'easy'
    },
    // Pediatria
    {
        id: 'p1',
        categoryId: 'pediatria',
        question: 'Qual é o peso duplica ao nascimento do bebê?',
        options: ['3 meses', '5 meses', '9 meses', '12 meses'],
        correctIndex: 1,
        difficulty: 'easy'
    },
    {
        id: 'p2',
        categoryId: 'pediatria',
        question: 'A bronquiolite viral aguda é mais comum em qual faixa etária?',
        options: ['0-6 meses', '6-24 meses', '2-5 anos', '5-10 anos'],
        correctIndex: 1,
        difficulty: 'medium'
    },
    {
        id: 'p3',
        categoryId: 'pediatria',
        question: 'O teste do pezinho deve ser realizado em qual período?',
        options: ['Primeiras 24h', '3º ao 5º dia', '7º ao 10º dia', 'Após 30 dias'],
        correctIndex: 1,
        difficulty: 'easy'
    },
    // GO
    {
        id: 'g1',
        categoryId: 'go',
        question: 'Qual é a idade gestacional limite para considerar aborto?',
        options: ['18 semanas', '20 semanas', '22 semanas', '24 semanas'],
        correctIndex: 1,
        difficulty: 'medium'
    },
    {
        id: 'g2',
        categoryId: 'go',
        question: 'O índice de Bishop avalia qual parâmetro?',
        options: ['Bem-estar fetal', 'Maturidade pulmonar', 'Favorabilidade cervical', 'Contratilidade uterina'],
        correctIndex: 2,
        difficulty: 'medium'
    },
    {
        id: 'g3',
        categoryId: 'go',
        question: 'Qual exame é padrão-ouro para diagnóstico de gravidez ectópica?',
        options: ['Beta-hCG', 'USG transvaginal', 'Laparoscopia', 'TC de abdome'],
        correctIndex: 1,
        difficulty: 'easy'
    },
    // Neuro/Psiq
    {
        id: 'n1',
        categoryId: 'neuro',
        question: 'A escala de Glasgow varia de qual intervalo?',
        options: ['0-10', '1-12', '3-15', '0-15'],
        correctIndex: 2,
        difficulty: 'easy'
    },
    {
        id: 'n2',
        categoryId: 'neuro',
        question: 'Qual é a janela de trombólise para AVC isquêmico?',
        options: ['3 horas', '4,5 horas', '6 horas', '12 horas'],
        correctIndex: 1,
        difficulty: 'medium'
    },
    {
        id: 'n3',
        categoryId: 'neuro',
        question: 'A síndrome serotoninérgica pode ser causada por qual classe de medicamentos?',
        options: ['Benzodiazepínicos', 'ISRS', 'Anticonvulsivantes', 'Antipsicóticos típicos'],
        correctIndex: 1,
        difficulty: 'medium'
    },
    // Saúde Coletiva
    {
        id: 'sc1',
        categoryId: 'coletiva',
        question: 'Qual princípio do SUS garante que todos têm direito à saúde?',
        options: ['Integralidade', 'Universalidade', 'Equidade', 'Descentralização'],
        correctIndex: 1,
        difficulty: 'easy'
    },
    {
        id: 'sc2',
        categoryId: 'coletiva',
        question: 'A vigilância epidemiológica utiliza qual tipo de estudo para investigar surtos?',
        options: ['Coorte', 'Caso-controle', 'Transversal', 'Ecológico'],
        correctIndex: 1,
        difficulty: 'medium'
    },
    {
        id: 'sc3',
        categoryId: 'coletiva',
        question: 'O que significa a sigla ESF no contexto do SUS?',
        options: ['Estratégia Sanitária Federal', 'Estratégia Saúde da Família', 'Equipe de Serviço Familiar', 'Estrutura do Sistema Federativo'],
        correctIndex: 1,
        difficulty: 'easy'
    }
];
