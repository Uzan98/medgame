// Shop Items Data

export interface ShopItemData {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'powerup' | 'cosmetic' | 'content' | 'food';
    icon: string;
    color: string;
    rarity: 'comum' | 'raro' | 'epico' | 'lendario';
    // Food-specific properties
    hungerRestore?: number;
    energyBonus?: number;
}

export const shopItems: ShopItemData[] = [
    // Power-ups
    {
        id: 'powerup-hint',
        name: 'Dica Extra',
        description: 'Receba uma dica adicional em qualquer caso clínico',
        price: 50,
        category: 'powerup',
        icon: '💡',
        color: 'yellow',
        rarity: 'comum'
    },
    {
        id: 'powerup-time',
        name: '+30 Segundos',
        description: 'Adiciona 30 segundos ao timer do quiz',
        price: 100,
        category: 'powerup',
        icon: '⏱️',
        color: 'cyan',
        rarity: 'comum'
    },
    {
        id: 'powerup-skip',
        name: 'Pular Questão',
        description: 'Pule uma questão difícil sem penalidade',
        price: 75,
        category: 'powerup',
        icon: '⏭️',
        color: 'blue',
        rarity: 'comum'
    },
    {
        id: 'powerup-double',
        name: 'Dobrar Pontos',
        description: 'Dobra os pontos do próximo caso correto',
        price: 150,
        category: 'powerup',
        icon: '✨',
        color: 'purple',
        rarity: 'raro'
    },
    {
        id: 'powerup-shield',
        name: 'Escudo de Erro',
        description: 'Protege contra uma resposta errada',
        price: 200,
        category: 'powerup',
        icon: '🛡️',
        color: 'emerald',
        rarity: 'raro'
    },

    // Cosmetics
    {
        id: 'cosmetic-badge-cardio',
        name: 'Badge Cardiologista',
        description: 'Mostre sua especialidade em Cardiologia',
        price: 300,
        category: 'cosmetic',
        icon: '❤️',
        color: 'red',
        rarity: 'raro'
    },
    {
        id: 'cosmetic-badge-neuro',
        name: 'Badge Neurologista',
        description: 'Mostre sua especialidade em Neurologia',
        price: 300,
        category: 'cosmetic',
        icon: '🧠',
        color: 'pink',
        rarity: 'raro'
    },
    {
        id: 'cosmetic-frame-gold',
        name: 'Moldura Dourada',
        description: 'Uma moldura dourada para seu avatar',
        price: 500,
        category: 'cosmetic',
        icon: '🖼️',
        color: 'yellow',
        rarity: 'epico'
    },
    {
        id: 'cosmetic-title-expert',
        name: 'Título: Expert',
        description: 'Exiba o título "Expert" no seu perfil',
        price: 750,
        category: 'cosmetic',
        icon: '🏆',
        color: 'amber',
        rarity: 'epico'
    },
    {
        id: 'cosmetic-aura-legendary',
        name: 'Aura Lendária',
        description: 'Efeito visual especial no seu avatar',
        price: 1500,
        category: 'cosmetic',
        icon: '✨',
        color: 'purple',
        rarity: 'lendario'
    },

    // Content
    {
        id: 'content-pack-cardio',
        name: 'Pack Cardiologia',
        description: '5 casos clínicos avançados de cardiologia',
        price: 400,
        category: 'content',
        icon: '📦',
        color: 'red',
        rarity: 'raro'
    },
    {
        id: 'content-pack-emergency',
        name: 'Pack Emergências',
        description: '5 casos de emergência de alta complexidade',
        price: 400,
        category: 'content',
        icon: '🚨',
        color: 'orange',
        rarity: 'raro'
    },
    {
        id: 'content-ecg-master',
        name: 'ECG Master Class',
        description: '10 ECGs desafiadores para interpretar',
        price: 600,
        category: 'content',
        icon: '📈',
        color: 'cyan',
        rarity: 'epico'
    },
    {
        id: 'content-mystery',
        name: 'Caixa Mistério',
        description: 'Contém um item aleatório!',
        price: 250,
        category: 'content',
        icon: '🎁',
        color: 'purple',
        rarity: 'raro'
    },

    // Food items
    {
        id: 'food-snack',
        name: 'Lanche Rápido',
        description: 'Um lanche leve para matar a fome',
        price: 50,
        category: 'food',
        icon: '🍎',
        color: 'green',
        rarity: 'comum',
        hungerRestore: 20,
        energyBonus: 0
    },
    {
        id: 'food-coffee',
        name: 'Café Forte',
        description: 'Dá um boost de energia imediato',
        price: 30,
        category: 'food',
        icon: '☕',
        color: 'amber',
        rarity: 'comum',
        hungerRestore: 5,
        energyBonus: 15
    },
    {
        id: 'food-meal',
        name: 'Refeição Completa',
        description: 'Almoço nutritivo que restaura bastante fome',
        price: 150,
        category: 'food',
        icon: '🍔',
        color: 'orange',
        rarity: 'raro',
        hungerRestore: 50,
        energyBonus: 10
    },
    {
        id: 'food-plantao-kit',
        name: 'Kit Plantão',
        description: 'Tudo que você precisa para aguentar um plantão longo',
        price: 300,
        category: 'food',
        icon: '🍱',
        color: 'purple',
        rarity: 'epico',
        hungerRestore: 100,
        energyBonus: 30
    },
    {
        id: 'food-energy-drink',
        name: 'Energético',
        description: 'Bebida energética para despertar!',
        price: 40,
        category: 'food',
        icon: '🥤',
        color: 'cyan',
        rarity: 'comum',
        hungerRestore: 0,
        energyBonus: 25
    },
    {
        id: 'food-sandwich',
        name: 'Sanduíche Natural',
        description: 'Lanche saudável e equilibrado',
        price: 80,
        category: 'food',
        icon: '🥪',
        color: 'green',
        rarity: 'comum',
        hungerRestore: 35,
        energyBonus: 5
    },
    {
        id: 'food-pizza',
        name: 'Pizza do Refeitório',
        description: 'Uma fatia generosa que sustenta',
        price: 100,
        category: 'food',
        icon: '🍕',
        color: 'red',
        rarity: 'comum',
        hungerRestore: 40,
        energyBonus: 0
    },
    {
        id: 'food-salad',
        name: 'Salada Fitness',
        description: 'Leve e nutritiva, ideal para manter o foco',
        price: 70,
        category: 'food',
        icon: '🥗',
        color: 'emerald',
        rarity: 'comum',
        hungerRestore: 25,
        energyBonus: 10
    },
    {
        id: 'food-chocolate',
        name: 'Barra de Chocolate',
        description: 'Prazer rápido e energia instantânea',
        price: 25,
        category: 'food',
        icon: '🍫',
        color: 'amber',
        rarity: 'comum',
        hungerRestore: 10,
        energyBonus: 10
    },
    {
        id: 'food-sushi',
        name: 'Combo Sushi Premium',
        description: 'Refeição japonesa sofisticada do hospital',
        price: 250,
        category: 'food',
        icon: '🍣',
        color: 'pink',
        rarity: 'raro',
        hungerRestore: 70,
        energyBonus: 20
    }
];

export const getItemsByCategory = (category: ShopItemData['category']): ShopItemData[] => {
    return shopItems.filter(item => item.category === category);
};

export const getItemById = (id: string): ShopItemData | undefined => {
    return shopItems.find(item => item.id === id);
};

export const rarityColors = {
    comum: 'border-slate-500 bg-slate-500/10',
    raro: 'border-blue-500 bg-blue-500/10',
    epico: 'border-purple-500 bg-purple-500/10',
    lendario: 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
};

export const rarityLabels = {
    comum: 'Comum',
    raro: 'Raro',
    epico: 'Épico',
    lendario: 'Lendário'
};
