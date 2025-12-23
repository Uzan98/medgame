// Configuration for each game's challenge system

export type GameType = 'trivia' | 'detective' | 'milhao' | 'ecg' | 'consulta' | 'plantao' | 'quiz';

export interface GameResult {
    score?: number;
    crowns?: number;
    casesWon?: number;
    timeSeconds?: number;
    correctAnswers?: number;
    patientsAttended?: number;
    diagnosisAccuracy?: number;
    [key: string]: number | string | boolean | undefined;
}

export interface GameChallengeConfig {
    name: string;
    icon: string;
    emoji: string;
    routePlay: string;
    routeChallenges: string;
    description: string;
    determineWinner: (challengerResult: GameResult, challengedResult: GameResult) => 'challenger' | 'challenged' | null;
    formatResult: (result: GameResult) => string;
    getNotificationContent: (challengerName: string, result: GameResult) => string;
}

export const GAME_CHALLENGE_CONFIGS: Record<GameType, GameChallengeConfig> = {
    trivia: {
        name: 'MedTrivia',
        icon: 'Brain',
        emoji: '🧠',
        routePlay: '/games/trivia',
        routeChallenges: '/games/trivia/challenges',
        description: 'Teste seus conhecimentos médicos!',
        determineWinner: (a, b) => {
            const aCrowns = a.crowns || 0;
            const bCrowns = b.crowns || 0;
            const aScore = a.score || 0;
            const bScore = b.score || 0;

            if (aCrowns > bCrowns) return 'challenger';
            if (bCrowns > aCrowns) return 'challenged';
            if (aScore > bScore) return 'challenger';
            if (bScore > aScore) return 'challenged';
            return null;
        },
        formatResult: (r) => `${r.score || 0} pts, ${r.crowns || 0} 👑`,
        getNotificationContent: (name, r) =>
            `${name} fez ${r.score || 0} pontos com ${r.crowns || 0} coroas.`,
    },

    detective: {
        name: 'MedDetective',
        icon: 'Search',
        emoji: '🔍',
        routePlay: '/games/detective',
        routeChallenges: '/games/detective/challenges',
        description: 'Resolva casos médicos misteriosos!',
        determineWinner: (a, b) => {
            const aCases = a.casesWon || 0;
            const bCases = b.casesWon || 0;
            const aTime = a.timeSeconds || Infinity;
            const bTime = b.timeSeconds || Infinity;

            if (aCases > bCases) return 'challenger';
            if (bCases > aCases) return 'challenged';
            if (aTime < bTime) return 'challenger';
            if (bTime < aTime) return 'challenged';
            return null;
        },
        formatResult: (r) => `${r.casesWon || 0} casos em ${Math.floor((r.timeSeconds || 0) / 60)}min`,
        getNotificationContent: (name, r) =>
            `${name} resolveu ${r.casesWon || 0} casos.`,
    },

    milhao: {
        name: 'MedMilhão',
        icon: 'DollarSign',
        emoji: '💰',
        routePlay: '/games/medmilhao',
        routeChallenges: '/games/medmilhao/challenges',
        description: 'Chegue ao milhão respondendo perguntas!',
        determineWinner: (a, b) => {
            const aScore = a.score || 0;
            const bScore = b.score || 0;

            if (aScore > bScore) return 'challenger';
            if (bScore > aScore) return 'challenged';
            return null;
        },
        formatResult: (r) => `R$ ${(r.score || 0).toLocaleString('pt-BR')}`,
        getNotificationContent: (name, r) =>
            `${name} chegou em R$ ${(r.score || 0).toLocaleString('pt-BR')}.`,
    },

    ecg: {
        name: 'ECG Master',
        icon: 'Activity',
        emoji: '❤️',
        routePlay: '/games/ecg',
        routeChallenges: '/games/ecg/challenges',
        description: 'Interprete ECGs corretamente!',
        determineWinner: (a, b) => {
            const aCorrect = a.correctAnswers || 0;
            const bCorrect = b.correctAnswers || 0;
            const aTime = a.timeSeconds || Infinity;
            const bTime = b.timeSeconds || Infinity;

            if (aCorrect > bCorrect) return 'challenger';
            if (bCorrect > aCorrect) return 'challenged';
            if (aTime < bTime) return 'challenger';
            if (bTime < aTime) return 'challenged';
            return null;
        },
        formatResult: (r) => `${r.correctAnswers || 0} acertos`,
        getNotificationContent: (name, r) =>
            `${name} acertou ${r.correctAnswers || 0} ECGs.`,
    },

    consulta: {
        name: 'Consulta Express',
        icon: 'Clock',
        emoji: '⚡',
        routePlay: '/games/consulta-express',
        routeChallenges: '/games/consulta-express/challenges',
        description: 'Atenda pacientes rapidamente!',
        determineWinner: (a, b) => {
            const aPatients = a.patientsAttended || 0;
            const bPatients = b.patientsAttended || 0;
            const aAccuracy = a.diagnosisAccuracy || 0;
            const bAccuracy = b.diagnosisAccuracy || 0;

            if (aPatients > bPatients) return 'challenger';
            if (bPatients > aPatients) return 'challenged';
            if (aAccuracy > bAccuracy) return 'challenger';
            if (bAccuracy > aAccuracy) return 'challenged';
            return null;
        },
        formatResult: (r) => `${r.patientsAttended || 0} pacientes (${r.diagnosisAccuracy || 0}% precisão)`,
        getNotificationContent: (name, r) =>
            `${name} atendeu ${r.patientsAttended || 0} pacientes com ${r.diagnosisAccuracy || 0}% de precisão.`,
    },

    plantao: {
        name: 'Plantão Infinito',
        icon: 'Stethoscope',
        emoji: '🏥',
        routePlay: '/games/plantao-infinito',
        routeChallenges: '/games/plantao-infinito/challenges',
        description: 'Sobreviva ao plantão mais longo!',
        determineWinner: (a, b) => {
            const aScore = a.score || 0;
            const bScore = b.score || 0;
            const aPatients = a.patientsAttended || 0;
            const bPatients = b.patientsAttended || 0;

            if (aScore > bScore) return 'challenger';
            if (bScore > aScore) return 'challenged';
            if (aPatients > bPatients) return 'challenger';
            if (bPatients > aPatients) return 'challenged';
            return null;
        },
        formatResult: (r) => `${r.score || 0} pts (${r.patientsAttended || 0} pacientes)`,
        getNotificationContent: (name, r) =>
            `${name} fez ${r.score || 0} pontos atendendo ${r.patientsAttended || 0} pacientes.`,
    },

    quiz: {
        name: 'Quiz Diagnóstico',
        icon: 'Target',
        emoji: '🎯',
        routePlay: '/quiz',
        routeChallenges: '/quiz/challenges',
        description: 'Adivinhe o diagnóstico com pistas!',
        determineWinner: (a, b) => {
            const aScore = a.score || 0;
            const bScore = b.score || 0;
            const aCorrect = a.correctAnswers || 0;
            const bCorrect = b.correctAnswers || 0;

            if (aScore > bScore) return 'challenger';
            if (bScore > aScore) return 'challenged';
            if (aCorrect > bCorrect) return 'challenger';
            if (bCorrect > aCorrect) return 'challenged';
            return null;
        },
        formatResult: (r) => `${r.score || 0} pts (${r.correctAnswers || 0} acertos)`,
        getNotificationContent: (name, r) =>
            `${name} fez ${r.score || 0} pontos acertando ${r.correctAnswers || 0} diagnósticos.`,
    },
};

// Helper to get config
export const getGameChallengeConfig = (gameType: GameType): GameChallengeConfig => {
    return GAME_CHALLENGE_CONFIGS[gameType];
};

// All game types
export const ALL_GAME_TYPES: GameType[] = ['trivia', 'detective', 'milhao', 'ecg', 'consulta', 'plantao', 'quiz'];
