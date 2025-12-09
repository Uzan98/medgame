// Quiz Cases for Timed Diagnosis Game

export interface QuizCase {
    id: string;
    initialInfo: string;           // Age, sex, chief complaint
    hints: string[];               // 5 progressive hints
    correctDiagnosis: string;      // The answer
    wrongOptions: string[];        // 3 wrong options
    explanation: string;           // Why this is the answer
    category: string;
}

export const quizCases: QuizCase[] = [
    {
        id: 'quiz-001',
        initialInfo: 'Homem, 68 anos, com palpitações há 2 horas',
        hints: [
            'FC 160 bpm, PA 110x70 mmHg',
            'ECG: Complexos QRS estreitos',
            'ECG: Ritmo irregular',
            'Ondas P não identificáveis',
            'Linha de base com ondulações irregulares (ondas f)'
        ],
        correctDiagnosis: 'Fibrilação Atrial',
        wrongOptions: ['Flutter Atrial', 'Taquicardia Supraventricular', 'Taquicardia Sinusal'],
        explanation: 'Ritmo irregular + QRS estreito + ausência de ondas P + ondas f = Fibrilação Atrial. A FC alta indica FA com alta resposta ventricular.',
        category: 'Arritmias'
    },
    {
        id: 'quiz-002',
        initialInfo: 'Mulher, 45 anos, com dor torácica intensa e súbita',
        hints: [
            'PA 90x60 mmHg no braço direito, 140x90 mmHg no esquerdo',
            'Sopro diastólico em foco aórtico',
            'Dor irradiando para as costas',
            'RX de tórax: alargamento de mediastino',
            'Pulsos assimétricos entre membros'
        ],
        correctDiagnosis: 'Dissecção de Aorta',
        wrongOptions: ['Infarto Agudo do Miocárdio', 'Pericardite', 'Pneumotórax'],
        explanation: 'Dor torácica súbita + diferença de PA entre braços + sopro aórtico + alargamento mediastinal = Dissecção de Aorta tipo A.',
        category: 'Emergências'
    },
    {
        id: 'quiz-003',
        initialInfo: 'Homem, 55 anos, com confusão mental há 1 dia',
        hints: [
            'Glicemia capilar: 45 mg/dL',
            'Sudorese profusa',
            'Uso de insulina NPH',
            'Última refeição há 12 horas',
            'Glasgow 13 (melhora após glicose IV)'
        ],
        correctDiagnosis: 'Hipoglicemia',
        wrongOptions: ['AVC Isquêmico', 'Cetoacidose Diabética', 'Estado Hiperosmolar'],
        explanation: 'Tríade de Whipple: glicemia baixa + sintomas neuroglicopênicos + melhora após glicose = Hipoglicemia. Jejum prolongado em uso de insulina é causa clássica.',
        category: 'Endocrinologia'
    },
    {
        id: 'quiz-004',
        initialInfo: 'Mulher, 28 anos, com dispneia súbita',
        hints: [
            'Uso de anticoncepcional oral',
            'Viagem de avião há 3 dias (12h)',
            'SpO2 88% em ar ambiente',
            'D-dímero > 5000 ng/mL',
            'Sinal de Westermark no RX de tórax'
        ],
        correctDiagnosis: 'Tromboembolismo Pulmonar',
        wrongOptions: ['Pneumonia', 'Asma', 'Pneumotórax'],
        explanation: 'Fatores de risco (ACO + imobilização) + dispneia súbita + hipoxemia + D-dímero elevado + Westermark = TEP até que se prove o contrário.',
        category: 'Pneumologia'
    },
    {
        id: 'quiz-005',
        initialInfo: 'Homem, 72 anos, com febre e confusão mental',
        hints: [
            'Disúria e polaciúria há 5 dias',
            'PA 85x50 mmHg',
            'FC 120 bpm, FR 24 irpm',
            'Leucócitos 22.000/mm³ com desvio',
            'EAS: leucocitúria intensa + nitrito positivo'
        ],
        correctDiagnosis: 'Sepse de Foco Urinário',
        wrongOptions: ['Meningite Bacteriana', 'Pneumonia', 'Endocardite'],
        explanation: 'Foco urinário evidente (ITU) + critérios de sepse (hipotensão, taquicardia, leucocitose) = Sepse de foco urinário. Iniciar ATB empírico urgente.',
        category: 'Infectologia'
    },
    {
        id: 'quiz-006',
        initialInfo: 'Criança, 8 anos, com dor abdominal e vômitos',
        hints: [
            'Dor iniciou periumbilical, agora em FID',
            'Temperatura 38.2°C',
            'Sinal de Blumberg positivo',
            'Leucócitos 15.000 com neutrofilia',
            'US: estrutura tubular aperistáltica > 6mm em FID'
        ],
        correctDiagnosis: 'Apendicite Aguda',
        wrongOptions: ['Gastroenterite', 'Adenite Mesentérica', 'Obstrução Intestinal'],
        explanation: 'Migração da dor para FID + febre + Blumberg + leucocitose + US compatível = Apendicite aguda. Indicação cirúrgica!',
        category: 'Cirurgia'
    },
    {
        id: 'quiz-007',
        initialInfo: 'Mulher, 35 anos, com cefaleia intensa há 1 hora',
        hints: [
            '"A pior dor de cabeça da minha vida"',
            'Início súbito durante exercício físico',
            'Náuseas e vômitos',
            'Rigidez de nuca presente',
            'TC crânio: hiperdensidade em cisternas basais'
        ],
        correctDiagnosis: 'Hemorragia Subaracnóidea',
        wrongOptions: ['Enxaqueca', 'Meningite', 'AVC Isquêmico'],
        explanation: 'Cefaleia "thunderclap" + súbita + sinais meníngeos + TC com sangue em cisternas = HSA. Provável ruptura de aneurisma.',
        category: 'Neurologia'
    },
    {
        id: 'quiz-008',
        initialInfo: 'Homem, 60 anos, com dor precordial há 3 horas',
        hints: [
            'Dor em aperto, irradia para MSE e mandíbula',
            'Sudorese e náuseas',
            'ECG: Supra de ST V1-V4',
            'Troponina I elevada',
            'Histórico de HAS e tabagismo'
        ],
        correctDiagnosis: 'Infarto Agudo com Supra ST (IAMCSST)',
        wrongOptions: ['Angina Estável', 'Pericardite', 'Espasmo Coronariano'],
        explanation: 'Dor típica + fatores de risco + supra de ST em parede anterior + troponina elevada = IAMCSST. Indicação de reperfusão imediata.',
        category: 'Cardiologia'
    }
];

export const getRandomQuizCases = (count: number): QuizCase[] => {
    const shuffled = [...quizCases].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
};

export const shuffleOptions = (correct: string, wrong: string[]): string[] => {
    const all = [correct, ...wrong];
    return all.sort(() => Math.random() - 0.5);
};
