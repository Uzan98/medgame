// Level badge definitions
export interface Badge {
    id: string;
    name: string;
    level: number;
    image: string;
    description: string;
}

export const badges: Badge[] = [
    {
        id: 'lvl1',
        name: 'Calouro',
        level: 1,
        image: '/badges/lvl1.png',
        description: 'Você começou sua jornada médica!'
    },
    {
        id: 'lvl5',
        name: 'Estudante',
        level: 5,
        image: '/badges/lvl5.png',
        description: 'Dedicação aos estudos começa a aparecer'
    },
    {
        id: 'lvl10',
        name: 'Acadêmico',
        level: 10,
        image: '/badges/lvl10.png',
        description: 'Conhecimento básico consolidado'
    },
    {
        id: 'lvl20',
        name: 'Interno',
        level: 20,
        image: '/badges/lvl20.png',
        description: 'Experiência prática em desenvolvimento'
    },
    {
        id: 'lvl30',
        name: 'Residente',
        level: 30,
        image: '/badges/lvl30.png',
        description: 'Especialização em andamento'
    },
    {
        id: 'lvl50',
        name: 'Especialista',
        level: 50,
        image: '/badges/lvl50.png',
        description: 'Domínio comprovado na área'
    },
    {
        id: 'lvl80',
        name: 'Mestre',
        level: 80,
        image: '/badges/lvl80.png',
        description: 'Referência na especialidade'
    },
    {
        id: 'lvl100',
        name: 'Lenda',
        level: 100,
        image: '/badges/lvl100.png',
        description: 'O ápice da medicina!'
    }
];

// Get the current badge for a level
export const getCurrentBadge = (level: number): Badge => {
    // Find the highest badge the user has unlocked
    const unlockedBadges = badges.filter(b => level >= b.level);
    return unlockedBadges[unlockedBadges.length - 1] || badges[0];
};

// Get next badge to unlock
export const getNextBadge = (level: number): Badge | null => {
    const nextBadge = badges.find(b => b.level > level);
    return nextBadge || null;
};

// Check if a badge is unlocked
export const isBadgeUnlocked = (badge: Badge, level: number): boolean => {
    return level >= badge.level;
};
