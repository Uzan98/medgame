// Shift/Plantão System Types and Data

export interface ShiftMedia {
    images?: string[];      // URLs from Supabase Storage (x-rays, ECGs, skin lesions)
    video?: string;         // URL for video content
    audio?: string;         // URL for audio (cardiac/pulmonary auscultation)
}

export interface ShiftQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    points: number;
}

export interface ShiftCase {
    id: string;
    title: string;
    patientInfo: string;        // Age, gender, presentation
    description: string;        // Clinical history
    mediaType: 'image' | 'video' | 'audio' | 'mixed' | 'none';
    media: ShiftMedia;
    questions: ShiftQuestion[];
    totalPoints: number;
}

export interface Shift {
    id: string;
    title: string;              // "Plantão Noturno - PS"
    location: string;           // "Hospital Central"
    specialty: string;          // "Cardiologia", "Emergência", etc.
    icon: string;               // Emoji for the shift
    duration: number;           // Hours (6, 12, 24)
    payment: number;            // MediCoins earned on completion
    difficulty: 'facil' | 'medio' | 'dificil';
    requiredLevel: number;
    description: string;
    cases: ShiftCase[];
    isCompleted?: boolean;
}

// Difficulty colors for display
export const shiftDifficultyColors = {
    facil: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    medio: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    dificil: 'text-red-400 bg-red-500/20 border-red-500/30',
};

export const shiftDifficultyLabels = {
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Difícil',
};

// Sample shifts data
export const sampleShifts: Shift[] = [
    {
        id: 'shift-ps-noturno',
        title: 'Plantão Noturno - PS',
        location: 'Hospital Central',
        specialty: 'Emergência',
        icon: '🌙',
        duration: 12,
        payment: 500,
        difficulty: 'medio',
        requiredLevel: 1,
        description: 'Plantão noturno movimentado no pronto-socorro. Prepare-se para casos variados!',
        cases: [
            {
                id: 'case-ps-1',
                title: 'Dor Torácica Aguda',
                patientInfo: 'Homem, 55 anos',
                description: 'Paciente chega com dor torácica intensa há 2 horas, irradiando para braço esquerdo. Sudorese e náuseas. Histórico de HAS e DM.',
                mediaType: 'image',
                media: {
                    images: ['/placeholder-ecg.png'] // Placeholder - will use Supabase Storage
                },
                questions: [
                    {
                        id: 'q1',
                        question: 'Qual exame deve ser solicitado IMEDIATAMENTE?',
                        options: [
                            'Raio-X de tórax',
                            'ECG de 12 derivações',
                            'Tomografia de tórax',
                            'Ecocardiograma'
                        ],
                        correctIndex: 1,
                        explanation: 'O ECG deve ser realizado em até 10 minutos em pacientes com suspeita de SCA.',
                        points: 50
                    },
                    {
                        id: 'q2',
                        question: 'O ECG mostra supradesnivelamento de ST em V1-V4. Qual é o diagnóstico?',
                        options: [
                            'Angina instável',
                            'IAM sem supra de ST',
                            'IAM com supra de ST (anterior)',
                            'Pericardite aguda'
                        ],
                        correctIndex: 2,
                        explanation: 'Supradesnivelamento de ST em V1-V4 indica IAM com supra de ST de parede anterior.',
                        points: 75
                    }
                ],
                totalPoints: 125
            },
            {
                id: 'case-ps-2',
                title: 'Dispneia Súbita',
                patientInfo: 'Mulher, 68 anos',
                description: 'Paciente com dispneia súbita há 1 hora. Histórico de TVP há 2 meses. Taquipneia e taquicardia.',
                mediaType: 'mixed',
                media: {
                    images: ['/placeholder-rx-torax.png'],
                    audio: '/placeholder-ausculta.mp3'
                },
                questions: [
                    {
                        id: 'q1',
                        question: 'Qual é a principal hipótese diagnóstica?',
                        options: [
                            'Pneumonia',
                            'Tromboembolismo Pulmonar',
                            'Asma aguda',
                            'ICC descompensada'
                        ],
                        correctIndex: 1,
                        explanation: 'Histórico de TVP + dispneia súbita sugere fortemente TEP.',
                        points: 75
                    }
                ],
                totalPoints: 75
            }
        ]
    },
    {
        id: 'shift-uti-cardio',
        title: 'Plantão UTI Cardiológica',
        location: 'Hospital São Lucas',
        specialty: 'Cardiologia',
        icon: '❤️',
        duration: 6,
        payment: 400,
        difficulty: 'dificil',
        requiredLevel: 3,
        description: 'Casos complexos de cardiologia intensiva. Requer conhecimento avançado.',
        cases: [
            {
                id: 'case-uti-1',
                title: 'Arritmia Grave',
                patientInfo: 'Homem, 72 anos',
                description: 'Paciente pós-IAM evoluindo com palpitações e instabilidade hemodinâmica.',
                mediaType: 'audio',
                media: {
                    audio: '/placeholder-heart.mp3'
                },
                questions: [
                    {
                        id: 'q1',
                        question: 'Ao auscultar, você identifica ritmo irregular com frequência alta. O ECG mostra complexos QRS estreitos irregulares. Qual é o ritmo?',
                        options: [
                            'Fibrilação Atrial',
                            'Taquicardia Ventricular',
                            'Flutter Atrial',
                            'Taquicardia Supraventricular'
                        ],
                        correctIndex: 0,
                        explanation: 'FA é caracterizada por ritmo irregularmente irregular com QRS estreitos.',
                        points: 100
                    }
                ],
                totalPoints: 100
            }
        ]
    },
    {
        id: 'shift-amb-pediatria',
        title: 'Plantão Ambulatório Pediátrico',
        location: 'UBS Centro',
        specialty: 'Pediatria',
        icon: '👶',
        duration: 6,
        payment: 250,
        difficulty: 'facil',
        requiredLevel: 1,
        description: 'Atendimentos ambulatoriais pediátricos. Casos mais leves e rotineiros.',
        cases: [
            {
                id: 'case-ped-1',
                title: 'Febre e Exantema',
                patientInfo: 'Criança, 4 anos',
                description: 'Mãe refere febre há 3 dias seguida de manchas vermelhas pelo corpo. A criança está ativa e se alimentando bem.',
                mediaType: 'image',
                media: {
                    images: ['/placeholder-exantema.png']
                },
                questions: [
                    {
                        id: 'q1',
                        question: 'O exantema é maculopapular, iniciou no tronco e se espalhou para membros. Qual doença exantemática é mais provável?',
                        options: [
                            'Sarampo',
                            'Rubéola',
                            'Roséola (Exantema Súbito)',
                            'Escarlatina'
                        ],
                        correctIndex: 2,
                        explanation: 'Roséola: febre alta por 3 dias que cede quando surge o exantema. Criança fica bem.',
                        points: 50
                    }
                ],
                totalPoints: 50
            }
        ]
    },
    {
        id: 'shift-neuro-emergencia',
        title: 'Plantão Neurologia Emergência',
        location: 'Hospital Neurológico',
        specialty: 'Neurologia',
        icon: '🧠',
        duration: 12,
        payment: 600,
        difficulty: 'dificil',
        requiredLevel: 5,
        description: 'Emergências neurológicas graves. AVC, trauma e convulsões.',
        cases: [
            {
                id: 'case-neuro-1',
                title: 'Déficit Motor Súbito',
                patientInfo: 'Mulher, 58 anos',
                description: 'Paciente trazida por familiares há 45 minutos com hemiparesia direita e afasia. HAS, diabética.',
                mediaType: 'video',
                media: {
                    video: '/placeholder-neuro-exam.mp4'
                },
                questions: [
                    {
                        id: 'q1',
                        question: 'Qual é a janela de tempo para trombólise no AVC isquêmico?',
                        options: [
                            'Até 1 hora',
                            'Até 3 horas',
                            'Até 4,5 horas',
                            'Até 6 horas'
                        ],
                        correctIndex: 2,
                        explanation: 'A janela para rtPA é de até 4,5 horas do início dos sintomas.',
                        points: 100
                    }
                ],
                totalPoints: 100
            }
        ]
    }
];

// Get shifts filtered by specialty
export const getShiftsBySpecialty = (specialty: string): Shift[] => {
    if (specialty === 'all') return sampleShifts;
    return sampleShifts.filter(s => s.specialty.toLowerCase() === specialty.toLowerCase());
};

// Get shifts available for user level
export const getAvailableShifts = (userLevel: number): Shift[] => {
    return sampleShifts.filter(s => s.requiredLevel <= userLevel);
};
