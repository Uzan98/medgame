// Clinical Case Type Definitions

export interface VitalSigns {
    heartRate: number;        // bpm
    bloodPressure: string;    // e.g., "120/80"
    respiratoryRate: number;  // rpm
    temperature: number;      // °C
    oxygenSaturation: number; // %
}

export interface LabResult {
    name: string;
    value: string;
    unit: string;
    reference: string;
    isAbnormal: boolean;
}

export interface ExamResult {
    type: 'ecg' | 'xray' | 'ct' | 'mri' | 'ultrasound' | 'lab';
    title: string;
    description: string;
    imageUrl?: string;
    findings?: string[];
    labResults?: LabResult[];
}

export interface ClinicalQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    points: number;
}

export interface ClinicalCase {
    id: string;
    title: string;
    patientName: string;
    patientAge: number;
    patientGender: 'M' | 'F';
    chiefComplaint: string;
    history: string;
    physicalExam: string;
    vitalSigns: VitalSigns;
    exams: ExamResult[];
    questions: ClinicalQuestion[];
    difficulty: 'facil' | 'medio' | 'dificil';
    category: string;
    estimatedTime: number; // minutes
    totalPoints: number;
    requiredLevel?: number; // Level needed to unlock this case
    imageUrl?: string;
}

// Sample Clinical Cases Data
export const sampleCases: ClinicalCase[] = [
    {
        id: 'case-001',
        title: 'Dor Torácica Aguda',
        patientName: 'João Silva',
        patientAge: 58,
        patientGender: 'M',
        chiefComplaint: 'Dor no peito há 2 horas',
        history: 'Paciente masculino, 58 anos, hipertenso e diabético, refere dor precordial em aperto, de forte intensidade, com irradiação para membro superior esquerdo, associada a sudorese e náuseas. Início há 2 horas, sem melhora com repouso.',
        physicalExam: 'REG, sudoreico, pálido, PA: 160/100 mmHg, FC: 110 bpm, FR: 22 irpm. ACV: RCR em 2T, bulhas hipofonéticas, sem sopros. AR: MV+ bilateralmente, sem RA.',
        vitalSigns: {
            heartRate: 110,
            bloodPressure: '160/100',
            respiratoryRate: 22,
            temperature: 36.5,
            oxygenSaturation: 94
        },
        exams: [
            {
                type: 'ecg',
                title: 'ECG de 12 derivações',
                description: 'Supradesnivelamento do segmento ST em V1-V4, DI e aVL',
                findings: [
                    'Ritmo sinusal',
                    'FC: 110 bpm',
                    'Supra de ST em V1-V4 (parede anterior)',
                    'Supra de ST em DI e aVL (parede lateral alta)',
                    'Infra de ST em DII, DIII e aVF (imagem em espelho)'
                ]
            },
            {
                type: 'lab',
                title: 'Marcadores Cardíacos',
                description: 'Enzimas cardíacas',
                labResults: [
                    { name: 'Troponina I', value: '2.5', unit: 'ng/mL', reference: '< 0.04', isAbnormal: true },
                    { name: 'CK-MB', value: '45', unit: 'U/L', reference: '< 25', isAbnormal: true },
                    { name: 'Mioglobina', value: '180', unit: 'ng/mL', reference: '< 90', isAbnormal: true }
                ]
            }
        ],
        questions: [
            {
                id: 'q1',
                question: 'Qual é o diagnóstico mais provável?',
                options: [
                    'Angina estável',
                    'Infarto Agudo do Miocárdio com Supra de ST (IAMCSST)',
                    'Pericardite aguda',
                    'Dissecção de aorta'
                ],
                correctAnswer: 1,
                explanation: 'O quadro clínico de dor precordial típica, associado ao supradesnivelamento de ST em derivações contíguas e elevação de marcadores cardíacos, é característico de IAMCSST.',
                points: 100
            },
            {
                id: 'q2',
                question: 'Qual parede do coração está afetada?',
                options: [
                    'Parede inferior',
                    'Parede anterior e lateral alta',
                    'Parede posterior',
                    'Ventrículo direito'
                ],
                correctAnswer: 1,
                explanation: 'O supra de ST em V1-V4 indica acometimento da parede anterior. O supra em DI e aVL indica parede lateral alta. O infra em parede inferior é imagem em espelho.',
                points: 100
            },
            {
                id: 'q3',
                question: 'Qual a conduta imediata mais importante?',
                options: [
                    'Solicitar ecocardiograma',
                    'Aguardar resultado de troponina seriada',
                    'Encaminhar para angioplastia primária',
                    'Iniciar anticoagulação plena com heparina'
                ],
                correctAnswer: 2,
                explanation: 'No IAMCSST, a reperfusão precoce é fundamental. A angioplastia primária é o tratamento de escolha quando disponível em até 120 minutos do diagnóstico.',
                points: 150
            }
        ],
        difficulty: 'medio',
        category: 'Cardiologia',
        estimatedTime: 15,
        totalPoints: 350,
        requiredLevel: 3
    },
    {
        id: 'case-002',
        title: 'Dispneia Progressiva',
        patientName: 'Maria Santos',
        patientAge: 72,
        patientGender: 'F',
        chiefComplaint: 'Falta de ar há 3 dias',
        history: 'Paciente feminina, 72 anos, portadora de ICC classe funcional II, em uso de furosemida, enalapril e carvedilol. Refere piora progressiva da dispneia nos últimos 3 dias, ortopneia e edema de MMII. Nega febre ou tosse produtiva.',
        physicalExam: 'REG, dispneica, PA: 140/90 mmHg, FC: 98 bpm, FR: 28 irpm. Turgência jugular a 45°. ACV: RCR em 2T, B3 presente, sopro sistólico em foco mitral 2+/6+. AR: Estertores crepitantes em bases bilaterais. Edema de MMII 3+/4+.',
        vitalSigns: {
            heartRate: 98,
            bloodPressure: '140/90',
            respiratoryRate: 28,
            temperature: 36.2,
            oxygenSaturation: 91
        },
        exams: [
            {
                type: 'xray',
                title: 'Radiografia de Tórax PA',
                description: 'Cardiomegalia e congestão pulmonar',
                findings: [
                    'Índice cardiotorácico > 0.5',
                    'Redistribuição vascular para ápices',
                    'Linhas B de Kerley',
                    'Derrame pleural bilateral pequeno',
                    'Velamento de seios costofrênicos'
                ]
            },
            {
                type: 'lab',
                title: 'Exames Laboratoriais',
                description: 'Perfil renal e BNP',
                labResults: [
                    { name: 'BNP', value: '1250', unit: 'pg/mL', reference: '< 100', isAbnormal: true },
                    { name: 'Creatinina', value: '1.8', unit: 'mg/dL', reference: '0.6-1.2', isAbnormal: true },
                    { name: 'Ureia', value: '65', unit: 'mg/dL', reference: '15-40', isAbnormal: true },
                    { name: 'Sódio', value: '134', unit: 'mEq/L', reference: '135-145', isAbnormal: true },
                    { name: 'Potássio', value: '4.8', unit: 'mEq/L', reference: '3.5-5.0', isAbnormal: false }
                ]
            }
        ],
        questions: [
            {
                id: 'q1',
                question: 'Qual é o diagnóstico sindrômico?',
                options: [
                    'Pneumonia comunitária',
                    'Insuficiência cardíaca descompensada',
                    'Tromboembolismo pulmonar',
                    'Exacerbação de DPOC'
                ],
                correctAnswer: 1,
                explanation: 'O quadro de dispneia progressiva, ortopneia, edema de MMII, estertores pulmonares, B3, turgência jugular e BNP elevado caracterizam IC descompensada.',
                points: 100
            },
            {
                id: 'q2',
                question: 'Qual o perfil hemodinâmico desta paciente?',
                options: [
                    'Quente e seco (A)',
                    'Quente e úmido (B)',
                    'Frio e seco (L)',
                    'Frio e úmido (C)'
                ],
                correctAnswer: 1,
                explanation: 'Paciente com congestão (úmido) evidenciada por estertores, edema e turgência jugular, mas com boa perfusão (quente) - extremidades aquecidas, PA adequada.',
                points: 100
            }
        ],
        difficulty: 'facil',
        category: 'Cardiologia',
        estimatedTime: 10,
        totalPoints: 200,
        requiredLevel: 1
    },
    {
        id: 'case-003',
        title: 'Cefaleia Intensa',
        patientName: 'Carlos Oliveira',
        patientAge: 45,
        patientGender: 'M',
        chiefComplaint: 'Dor de cabeça muito forte há 1 hora',
        history: 'Paciente masculino, 45 anos, sem comorbidades conhecidas, refere cefaleia de início súbito há 1 hora, de forte intensidade (10/10), holocraniana, "a pior dor de cabeça da vida", associada a náuseas e vômitos. Nega febre, trauma ou uso de medicações.',
        physicalExam: 'REG, agitado, fotofobia, PA: 180/110 mmHg, FC: 92 bpm, FR: 18 irpm. Glasgow 15. Pupilas isocóricas e fotorreagentes. Rigidez de nuca presente. Kernig e Brudzinski positivos. Força muscular preservada nos 4 membros.',
        vitalSigns: {
            heartRate: 92,
            bloodPressure: '180/110',
            respiratoryRate: 18,
            temperature: 36.8,
            oxygenSaturation: 98
        },
        exams: [
            {
                type: 'ct',
                title: 'TC de Crânio sem Contraste',
                description: 'Hemorragia subaracnóidea',
                findings: [
                    'Hiperdensidade em cisternas basais',
                    'Sangue na fissura inter-hemisférica',
                    'Sangue na fissura sylviana bilateral',
                    'Sem desvio de linha média',
                    'Ventrículos de tamanho normal'
                ]
            }
        ],
        questions: [
            {
                id: 'q1',
                question: 'Qual é o diagnóstico mais provável?',
                options: [
                    'Meningite bacteriana',
                    'Hemorragia subaracnóidea',
                    'Enxaqueca com aura',
                    'Cefaleia tensional'
                ],
                correctAnswer: 1,
                explanation: 'Cefaleia súbita de forte intensidade ("pior da vida"), sinais meníngeos e TC com hiperdensidade em cisternas são característicos de hemorragia subaracnóidea.',
                points: 100
            },
            {
                id: 'q2',
                question: 'Qual a etiologia mais comum desta condição?',
                options: [
                    'Malformação arteriovenosa',
                    'Trauma cranioencefálico',
                    'Ruptura de aneurisma cerebral',
                    'Dissecção de artéria vertebral'
                ],
                correctAnswer: 2,
                explanation: 'A ruptura de aneurisma cerebral (principalmente em polígono de Willis) é responsável por 85% dos casos de hemorragia subaracnóidea espontânea.',
                points: 100
            },
            {
                id: 'q3',
                question: 'Qual exame deve ser solicitado para investigar a etiologia?',
                options: [
                    'Ressonância magnética de crânio',
                    'Eletroencefalograma',
                    'Angiotomografia cerebral',
                    'Punção lombar'
                ],
                correctAnswer: 2,
                explanation: 'A angiotomografia ou arteriografia cerebral é indicada para identificar aneurismas que possam ter causado o sangramento e planejar tratamento.',
                points: 150
            }
        ],
        difficulty: 'dificil',
        category: 'Neurologia',
        estimatedTime: 12,
        totalPoints: 350,
        requiredLevel: 5
    }
];

export const getCaseById = (id: string): ClinicalCase | undefined => {
    return sampleCases.find(c => c.id === id);
};

export const getCasesByCategory = (category: string): ClinicalCase[] => {
    return sampleCases.filter(c => c.category === category);
};

export const getCasesByDifficulty = (difficulty: ClinicalCase['difficulty']): ClinicalCase[] => {
    return sampleCases.filter(c => c.difficulty === difficulty);
};
