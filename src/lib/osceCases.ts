import type {
    OsceCase,
    OsceSecretData,
    EssentialQuestion,
    ExpectedAnamnesis
} from './osceTypes';

// ==============================
// CASO 1: DOR TORÁCICA (CARDIOLOGIA)
// ==============================

const dorToracicaSecret: OsceSecretData = {
    hda: {
        inicio: 'Hoje de manhã, por volta das 8h, quando estava subindo as escadas',
        localizacao: 'No meio do peito, aqui na frente',
        caracteristica: 'Uma dor que aperta, como se tivesse um peso no peito',
        intensidade: 'Bem forte, uns 8 de 10',
        irradiacao: 'Sim, vai pro braço esquerdo e às vezes pro pescoço',
        fatoresAgravantes: ['esforço físico', 'quando subo escada', 'quando caminho rápido'],
        fatoresAtenuantes: ['quando paro e descanso melhora um pouco', 'não tomei nada pra dor ainda'],
        sintomasAssociados: ['suando frio', 'enjoo', 'um pouco de falta de ar']
    },
    antecedentes: {
        doencasCronicas: ['pressão alta há 10 anos', 'diabetes tipo 2 há 8 anos', 'colesterol alto'],
        cirurgias: ['retirei a vesícula há 5 anos'],
        internacoes: ['fiquei internado uma vez por pneumonia há 3 anos'],
        alergias: ['não tenho alergia a remédios'],
        historicoFamiliar: ['meu pai morreu do coração com 55 anos', 'minha mãe tem pressão alta']
    },
    medicacoes: [
        'losartana 50mg de manhã',
        'metformina 850mg depois do almoço e jantar',
        'sinvastatina 20mg à noite',
        'AAS 100mg de manhã'
    ],
    habitos: {
        tabagismo: 'Fumei por 25 anos, parei há 2 anos. Antes era 1 maço por dia',
        etilismo: 'Tomo cerveja nos fins de semana, umas 3-4 latinhas',
        drogas: 'Nunca usei drogas',
        alimentacao: 'Como de tudo, gosto de churrasco, refrigerante, nem sempre como verdura',
        atividadeFisica: 'Não faço exercício, só caminho até o trabalho às vezes',
        sono: 'Durmo bem, umas 6-7 horas por noite'
    },
    revisaoSistemas: {
        cardiovascular: 'Às vezes sinto o coração bater mais forte quando subo escada',
        respiratorio: 'Tenho um pouco de falta de ar quando faço esforço',
        gastrointestinal: 'Tenho um pouco de azia às vezes',
        urinario: 'Tá tudo normal',
        neurologico: 'Sem dor de cabeça ou tontura'
    },
    personalidade: 'ansioso',
    detalhesExtras: 'O paciente está visivelmente preocupado e suando. Fala rápido quando descreve a dor. Pergunta várias vezes se é algo grave.'
};

const dorToracicaEssentials: EssentialQuestion[] = [
    { id: 'e1', category: 'hda', keywords: ['quando', 'começou', 'início', 'hora'], weight: 8, description: 'Quando começou a dor' },
    { id: 'e2', category: 'hda', keywords: ['onde', 'local', 'localização', 'lugar'], weight: 9, description: 'Localização da dor' },
    { id: 'e3', category: 'hda', keywords: ['tipo', 'como', 'característica', 'descreve', 'aperta', 'queima'], weight: 9, description: 'Característica da dor' },
    { id: 'e4', category: 'hda', keywords: ['forte', 'intensidade', 'nota', '1 a 10', 'escala'], weight: 7, description: 'Intensidade da dor' },
    { id: 'e5', category: 'hda', keywords: ['irradia', 'espalha', 'vai para', 'braço', 'pescoço'], weight: 9, description: 'Irradiação da dor' },
    { id: 'e6', category: 'hda', keywords: ['piora', 'aumenta', 'agrava', 'esforço'], weight: 8, description: 'Fatores de piora' },
    { id: 'e7', category: 'hda', keywords: ['melhora', 'alivia', 'diminui', 'repouso'], weight: 8, description: 'Fatores de melhora' },
    { id: 'e8', category: 'hda', keywords: ['outro', 'junto', 'associado', 'suor', 'enjoo', 'náusea', 'falta de ar'], weight: 9, description: 'Sintomas associados' },
    { id: 'e9', category: 'antecedentes', keywords: ['doença', 'problema', 'saúde', 'pressão', 'diabetes', 'crônic'], weight: 8, description: 'Doenças prévias' },
    { id: 'e10', category: 'antecedentes', keywords: ['cirurgia', 'operação', 'operou'], weight: 5, description: 'Cirurgias prévias' },
    { id: 'e11', category: 'antecedentes', keywords: ['alergia', 'alérgico'], weight: 7, description: 'Alergias' },
    { id: 'e12', category: 'antecedentes', keywords: ['família', 'pai', 'mãe', 'irmão', 'parente', 'coração'], weight: 8, description: 'Histórico familiar' },
    { id: 'e13', category: 'medicacoes', keywords: ['remédio', 'medicação', 'medicamento', 'toma', 'usa'], weight: 8, description: 'Medicações em uso' },
    { id: 'e14', category: 'habitos', keywords: ['fuma', 'cigarro', 'tabaco', 'fumo'], weight: 9, description: 'Tabagismo' },
    { id: 'e15', category: 'habitos', keywords: ['bebe', 'álcool', 'cerveja', 'bebida'], weight: 6, description: 'Etilismo' }
];

const dorToracicaExpected: ExpectedAnamnesis = {
    queixaPrincipal: 'Dor no peito há algumas horas',
    hda: [
        'Início súbito pela manhã, ao subir escadas',
        'Dor precordial em aperto',
        'Intensidade 8/10',
        'Irradiação para MSE e pescoço',
        'Piora ao esforço, melhora com repouso',
        'Associada a sudorese, náusea e dispneia'
    ],
    antecedentes: [
        'HAS há 10 anos',
        'DM2 há 8 anos',
        'Dislipidemia',
        'Colecistectomia prévia',
        'Pai falecido por IAM aos 55 anos'
    ],
    medicacoes: [
        'Losartana 50mg',
        'Metformina 850mg',
        'Sinvastatina 20mg',
        'AAS 100mg'
    ],
    habitos: [
        'Ex-tabagista (25 anos-maço, cessou há 2 anos)',
        'Etilismo social',
        'Sedentário'
    ],
    revisaoSistemas: [
        'Palpitações aos esforços',
        'Dispneia aos esforços'
    ]
};

// ==============================
// CASO 2: CEFALEIA AGUDA (NEUROLOGIA)
// ==============================

const cefaleiaSecret: OsceSecretData = {
    hda: {
        inicio: 'De repente, há umas 3 horas. Eu estava no trabalho normal e do nada veio essa dor',
        localizacao: 'Na cabeça toda, principalmente na nuca',
        caracteristica: 'Uma dor muito forte, diferente de qualquer dor de cabeça que já tive. Como uma explosão',
        intensidade: 'A pior dor da minha vida, 10 de 10',
        irradiacao: 'Sim, parece que desce pro pescoço',
        fatoresAgravantes: ['luz', 'barulho', 'quando mexo a cabeça'],
        fatoresAtenuantes: ['nada alivia', 'já tomei dipirona e não fez efeito'],
        sintomasAssociados: ['vômito', 'não aguento a luz', 'pescoço está duro']
    },
    antecedentes: {
        doencasCronicas: ['tenho pressão alta mas não trato direito'],
        cirurgias: ['nunca operei'],
        internacoes: ['nunca fiquei internada'],
        alergias: ['não tenho alergia'],
        historicoFamiliar: ['minha mãe teve derrame com 60 anos', 'meu tio morreu de aneurisma']
    },
    medicacoes: [
        'Era pra tomar remédio de pressão mas parei porque estava me fazendo mal'
    ],
    habitos: {
        tabagismo: 'Fumo meio maço por dia há 15 anos',
        etilismo: 'Não bebo',
        drogas: 'Nunca usei',
        alimentacao: 'Como muita coisa salgada, admito',
        atividadeFisica: 'Não faço nenhum exercício',
        sono: 'Durmo mal, tenho muita preocupação'
    },
    revisaoSistemas: {
        neurologico: 'Estou com a vista embaçada e o pescoço muito duro',
        cardiovascular: 'Normal',
        geral: 'Estou com muito medo, nunca senti nada assim'
    },
    personalidade: 'ansioso',
    detalhesExtras: 'A paciente está com os olhos semi-cerrados por causa da fotofobia. Segura a cabeça com as mãos. Demonstra muito medo.'
};

const cefaleiaEssentials: EssentialQuestion[] = [
    { id: 'e1', category: 'hda', keywords: ['quando', 'começou', 'início', 'hora'], weight: 9, description: 'Quando começou' },
    { id: 'e2', category: 'hda', keywords: ['como', 'começou', 'súbito', 'repente', 'devagar'], weight: 10, description: 'Modo de início (súbito?)' },
    { id: 'e3', category: 'hda', keywords: ['onde', 'local', 'parte', 'cabeça'], weight: 8, description: 'Localização' },
    { id: 'e4', category: 'hda', keywords: ['tipo', 'como', 'características', 'pior', 'diferente'], weight: 9, description: 'Característica (pior da vida?)' },
    { id: 'e5', category: 'hda', keywords: ['forte', 'intensidade', 'nota'], weight: 7, description: 'Intensidade' },
    { id: 'e6', category: 'hda', keywords: ['vômito', 'enjoo', 'náusea'], weight: 8, description: 'Náuseas/Vômitos' },
    { id: 'e7', category: 'hda', keywords: ['luz', 'claridade', 'fotofobia'], weight: 8, description: 'Fotofobia' },
    { id: 'e8', category: 'hda', keywords: ['pescoço', 'nuca', 'duro', 'rígido', 'rigidez'], weight: 10, description: 'Rigidez de nuca' },
    { id: 'e9', category: 'hda', keywords: ['visão', 'vista', 'enxergar', 'borrado'], weight: 7, description: 'Alterações visuais' },
    { id: 'e10', category: 'antecedentes', keywords: ['doença', 'pressão', 'problema'], weight: 8, description: 'Doenças prévias (HAS)' },
    { id: 'e11', category: 'antecedentes', keywords: ['família', 'pai', 'mãe', 'aneurisma', 'derrame', 'AVC'], weight: 9, description: 'Histórico familiar' },
    { id: 'e12', category: 'medicacoes', keywords: ['remédio', 'medicação', 'toma'], weight: 7, description: 'Medicações' },
    { id: 'e13', category: 'habitos', keywords: ['fuma', 'cigarro'], weight: 7, description: 'Tabagismo' }
];

const cefaleiaExpected: ExpectedAnamnesis = {
    queixaPrincipal: 'Cefaleia intensa de início súbito há 3 horas',
    hda: [
        'Início súbito há 3 horas, no trabalho',
        'Cefaleia holocraniana com predomínio occipital',
        'Intensidade 10/10, "pior dor de cabeça da vida"',
        'Irradiação para região cervical',
        'Piora com movimento, luz e barulho',
        'Sem melhora com analgésicos',
        'Associada a vômitos, fotofobia e rigidez de nuca'
    ],
    antecedentes: [
        'HAS não controlada (abandono de tratamento)',
        'Histórico familiar: mãe com AVC, tio falecido por aneurisma'
    ],
    medicacoes: [
        'Anti-hipertensivo (abandonou uso)'
    ],
    habitos: [
        'Tabagista (15 anos-maço)',
        'Dieta hipersódica',
        'Sedentária'
    ],
    revisaoSistemas: [
        'Alteração visual (visão borrada)',
        'Rigidez cervical'
    ]
};

// ==============================
// CASO 3: DISPNEIA (PNEUMOLOGIA)
// ==============================

const dispneiaSecret: OsceSecretData = {
    hda: {
        inicio: 'Já faz uns 5 dias que estou assim, mas piorou muito hoje de manhã',
        localizacao: 'É no peito, uma sensação de não conseguir respirar direito',
        caracteristica: 'Parece que o ar não entra, tenho que fazer força pra respirar',
        intensidade: 'Está bem ruim, 7 de 10',
        irradiacao: 'Não',
        fatoresAgravantes: ['quando deito piora muito', 'quando subo escada fico pior', 'à noite é pior'],
        fatoresAtenuantes: ['quando fico sentado com travesseiro melhora um pouco'],
        sintomasAssociados: ['inchaço nas pernas', 'tosse seca', 'acordo à noite sem ar', 'me sinto fraco']
    },
    antecedentes: {
        doencasCronicas: ['tenho problema no coração, já falaram que meu coração é grande', 'pressão alta', 'já tive infarto há 3 anos'],
        cirurgias: ['coloquei stent no coração há 3 anos'],
        internacoes: ['fiquei internado umas 4 vezes por causa do coração'],
        alergias: ['tenho alergia a dipirona'],
        historicoFamiliar: ['meu pai morreu do coração']
    },
    medicacoes: [
        'carvedilol 25mg de manhã e à noite',
        'furosemida 40mg de manhã',
        'enalapril 10mg de manhã',
        'AAS 100mg',
        'mas às vezes esqueço de tomar'
    ],
    habitos: {
        tabagismo: 'Fumei 30 anos, parei depois do infarto',
        etilismo: 'Parei de beber também',
        drogas: 'Nunca usei',
        alimentacao: 'Tento comer sem sal mas é difícil',
        atividadeFisica: 'Não consigo fazer nada, fico cansado',
        sono: 'Durmo mal, acordo várias vezes à noite sem ar'
    },
    revisaoSistemas: {
        cardiovascular: 'Às vezes sinto palpitação',
        respiratorio: 'Tosse seca, principalmente à noite',
        membrosInferiores: 'Pernas muito inchadas',
        gastrointestinal: 'Barriga também está um pouco inchada',
        urinario: 'Faço pouco xixi'
    },
    personalidade: 'colaborativo',
    detalhesExtras: 'O paciente fala devagar, parece cansado. Está sentado com as pernas penduradas para fora da maca. Respira com dificuldade entre as frases.'
};

const dispneiaEssentials: EssentialQuestion[] = [
    { id: 'e1', category: 'hda', keywords: ['quando', 'começou', 'início', 'dias'], weight: 8, description: 'Quando começou' },
    { id: 'e2', category: 'hda', keywords: ['piora', 'deita', 'ortopneia', 'deitado'], weight: 10, description: 'Ortopneia' },
    { id: 'e3', category: 'hda', keywords: ['noite', 'acorda', 'paroxística', 'DPN'], weight: 10, description: 'DPN (dispneia paroxística noturna)' },
    { id: 'e4', category: 'hda', keywords: ['esforço', 'andar', 'escada', 'atividade'], weight: 9, description: 'Dispneia aos esforços' },
    { id: 'e5', category: 'hda', keywords: ['inchaço', 'edema', 'pernas', 'pés'], weight: 10, description: 'Edema de MMII' },
    { id: 'e6', category: 'hda', keywords: ['tosse', 'expectoração', 'catarro'], weight: 7, description: 'Tosse' },
    { id: 'e7', category: 'hda', keywords: ['peito', 'dor', 'aperto'], weight: 6, description: 'Dor torácica' },
    { id: 'e8', category: 'antecedentes', keywords: ['coração', 'cardíaco', 'infarto', 'ICC'], weight: 10, description: 'Doença cardíaca prévia' },
    { id: 'e9', category: 'antecedentes', keywords: ['internação', 'internado', 'hospital'], weight: 7, description: 'Internações prévias' },
    { id: 'e10', category: 'antecedentes', keywords: ['alergia', 'alérgico'], weight: 8, description: 'Alergias' },
    { id: 'e11', category: 'medicacoes', keywords: ['remédio', 'medicação', 'toma'], weight: 9, description: 'Medicações em uso' },
    { id: 'e12', category: 'medicacoes', keywords: ['regular', 'toma certinho', 'esquece', 'adesão'], weight: 8, description: 'Adesão ao tratamento' },
    { id: 'e13', category: 'habitos', keywords: ['fuma', 'cigarro'], weight: 7, description: 'Tabagismo' },
    { id: 'e14', category: 'habitos', keywords: ['salão', 'dieta'], weight: 6, description: 'Dieta' }
];

const dispneiaExpected: ExpectedAnamnesis = {
    queixaPrincipal: 'Falta de ar progressiva há 5 dias com piora hoje',
    hda: [
        'Dispneia progressiva há 5 dias com piora importante hoje',
        'Ortopneia (piora ao deitar)',
        'Dispneia paroxística noturna',
        'Piora aos esforços',
        'Edema de membros inferiores',
        'Tosse seca noturna',
        'Melhora em posição sentada'
    ],
    antecedentes: [
        'ICC (cardiomegalia conhecida)',
        'IAM prévio há 3 anos (com stent)',
        'HAS',
        'Múltiplas internações por descompensação cardíaca',
        'Alergia: dipirona'
    ],
    medicacoes: [
        'Carvedilol 25mg 2x/dia',
        'Furosemida 40mg/dia',
        'Enalapril 10mg/dia',
        'AAS 100mg/dia',
        'Baixa adesão (esquece doses)'
    ],
    habitos: [
        'Ex-tabagista (30 anos-maço)',
        'Ex-etilista',
        'Dificuldade com dieta hipossódica'
    ],
    revisaoSistemas: [
        'Palpitações',
        'Oligúria',
        'Distensão abdominal'
    ]
};

// ==============================
// EXPORT ALL CASES
// ==============================

export const osceCases: OsceCase[] = [
    {
        id: 'osce-dor-toracica',
        title: 'Dor Torácica Aguda',
        patientName: 'Roberto Mendes',
        patientAge: 54,
        patientGender: 'M',
        patientAvatar: '👨‍🦳',
        chiefComplaint: 'Dor no peito',
        difficulty: 'medio',
        category: 'Cardiologia',
        timeLimit: 600, // 10 minutos
        xpReward: 300,
        coinsReward: 150,
        secretHistory: dorToracicaSecret,
        essentialQuestions: dorToracicaEssentials,
        expectedAnamnesis: dorToracicaExpected
    },
    {
        id: 'osce-cefaleia',
        title: 'Cefaleia Intensa',
        patientName: 'Miriam Costa',
        patientAge: 48,
        patientGender: 'F',
        patientAvatar: '👩',
        chiefComplaint: 'Dor de cabeça muito forte',
        difficulty: 'dificil',
        category: 'Neurologia',
        timeLimit: 600,
        xpReward: 400,
        coinsReward: 200,
        secretHistory: cefaleiaSecret,
        essentialQuestions: cefaleiaEssentials,
        expectedAnamnesis: cefaleiaExpected
    },
    {
        id: 'osce-dispneia',
        title: 'Dispneia Progressiva',
        patientName: 'José Almeida',
        patientAge: 68,
        patientGender: 'M',
        patientAvatar: '👴',
        chiefComplaint: 'Falta de ar',
        difficulty: 'facil',
        category: 'Cardiologia/Pneumologia',
        timeLimit: 180,
        xpReward: 250,
        coinsReward: 100,
        secretHistory: dispneiaSecret,
        essentialQuestions: dispneiaEssentials,
        expectedAnamnesis: dispneiaExpected
    }
];

export const getOsceCaseById = (id: string): OsceCase | undefined => {
    return osceCases.find(c => c.id === id);
};

export const getOsceCasesByDifficulty = (difficulty: OsceCase['difficulty']): OsceCase[] => {
    return osceCases.filter(c => c.difficulty === difficulty);
};
