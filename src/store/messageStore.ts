import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGameStore } from './gameStore';
import { useToastStore } from './toastStore';

export interface Message {
    id: string;
    sender: string;
    senderRole: string;
    subject: string;
    content: string;
    date: string;
    read: boolean;
    type: 'info' | 'reward' | 'urgent';
    rewards?: {
        coins?: number;
        xp?: number;
    };
    claimed?: boolean;
}

interface MessageState {
    messages: Message[];
    addMessage: (message: Omit<Message, 'id' | 'read' | 'date' | 'claimed'>) => void;
    markAsRead: (id: string) => void;
    deleteMessage: (id: string) => void;
    claimReward: (id: string) => void;
    unreadCount: () => number;
}

// Mock initial messages
const initialMessages: Message[] = [
    {
        id: 'welcome-msg',
        sender: 'Dr. House',
        senderRole: 'Chefe de Medicina',
        subject: 'Bem-vindo ao Hospital Central',
        content: `Caro colega,

Bem-vindo à equipe. Aqui no Hospital Central, valorizamos precisão e dedicação.
Seus primeiros casos serão simples, mas não se acomode. A complexidade aumentará conforme você prova seu valor.

Fique de olho na sua Energia e não esqueça de comer. Médicos desmaiados não salvam vidas.

Atenciosamente,
Dr. House`,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: false,
        type: 'info'
    },
    {
        id: 'salary-msg',
        sender: 'Departamento Financeiro',
        senderRole: 'RH',
        subject: 'Bônus de Contratação',
        content: `Prezado(a) Doutor(a),

Consta em, nossos registros que seu bônus inicial ainda não foi resgatado.
Aproveite este valor para comprar mantimentos ou equipamentos na loja.

Bom trabalho!`,
        date: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        read: false,
        type: 'reward',
        rewards: {
            coins: 200,
            xp: 50
        }
    },
    {
        id: 'tip-energy',
        sender: 'Enfermeira Joy',
        senderRole: 'Enfermaria',
        subject: 'Dica: Cansaço',
        content: `Oi Doutor!

Percebi que você tem trabalhado muito. Lembre-se que se sua energia cair muito, você não conseguirá iniciar novos atendimentos.
Você pode descansar em casa ou tomar um café na loja para recuperar o fôlego!

Se cuida!`,
        date: new Date().toISOString(),
        read: false,
        type: 'info'
    }
];

export const useMessageStore = create<MessageState>()(
    persist(
        (set, get) => ({
            messages: initialMessages,

            addMessage: (msg) => set((state) => ({
                messages: [
                    {
                        ...msg,
                        id: Math.random().toString(36).substring(2, 9),
                        date: new Date().toISOString(),
                        read: false,
                        claimed: false
                    },
                    ...state.messages
                ]
            })),

            markAsRead: (id) => set((state) => ({
                messages: state.messages.map(msg =>
                    msg.id === id ? { ...msg, read: true } : msg
                )
            })),

            deleteMessage: (id) => set((state) => ({
                messages: state.messages.filter(msg => msg.id !== id)
            })),

            claimReward: (id) => {
                const state = get();
                const msg = state.messages.find(m => m.id === id);

                if (msg && msg.rewards && !msg.claimed) {
                    // Update message state
                    set((state) => ({
                        messages: state.messages.map(m =>
                            m.id === id ? { ...m, claimed: true, read: true } : m
                        )
                    }));

                    // Award rewards
                    const { addCoins, addXP } = useGameStore.getState();
                    if (msg.rewards.coins) addCoins(msg.rewards.coins);
                    if (msg.rewards.xp) addXP(msg.rewards.xp);

                    // Notify
                    useToastStore.getState().addToast(
                        `Recompensa resgatada! +${msg.rewards.coins || 0} Moedas, +${msg.rewards.xp || 0} XP 🎁`,
                        'success'
                    );
                }
            },

            unreadCount: () => get().messages.filter(m => !m.read).length
        }),
        {
            name: 'medgame-messages',
        }
    )
);
