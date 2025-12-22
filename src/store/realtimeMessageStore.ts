import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useToastStore } from './toastStore';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeMessage {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    read: boolean;
    createdAt: string;
    // Joined data
    senderName?: string;
    senderAvatar?: string;
}

interface RealtimeMessageState {
    messages: RealtimeMessage[];
    isLoading: boolean;
    channel: RealtimeChannel | null;

    // Actions
    fetchMessages: (userId: string) => Promise<void>;
    sendMessage: (senderId: string, receiverId: string, content: string) => Promise<{ success: boolean }>;
    markAsRead: (messageId: string) => Promise<void>;
    subscribeToMessages: (userId: string) => void;
    unsubscribe: () => void;
    getUnreadCount: (userId: string) => number;
    getConversations: (userId: string) => Array<{
        friendId: string;
        friendName: string;
        friendAvatar?: string;
        lastMessage: RealtimeMessage;
        unreadCount: number
    }>;
    getMessagesWithFriend: (userId: string, friendId: string) => RealtimeMessage[];
    markConversationAsRead: (userId: string, friendId: string) => Promise<void>;
}


export const useRealtimeMessageStore = create<RealtimeMessageState>((set, get) => ({
    messages: [],
    isLoading: false,
    channel: null,

    // Fetch all messages for user
    fetchMessages: async (userId: string) => {
        set({ isLoading: true });
        try {
            // Fetch messages without join (no FK constraint)
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get unique sender IDs to fetch profiles
            const senderIds = [...new Set((data || []).map(m => m.sender_id))];

            // Fetch sender profiles
            let profilesMap: Record<string, { display_name: string; avatar_url: string | null }> = {};
            if (senderIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('user_profiles')
                    .select('id, display_name, avatar_url')
                    .in('id', senderIds);

                if (profiles) {
                    profiles.forEach(p => {
                        profilesMap[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url };
                    });
                }
            }

            const messages: RealtimeMessage[] = (data || []).map((row: any) => ({
                id: row.id,
                senderId: row.sender_id,
                receiverId: row.receiver_id,
                content: row.content,
                read: row.read,
                createdAt: row.created_at,
                senderName: profilesMap[row.sender_id]?.display_name || 'Jogador',
                senderAvatar: profilesMap[row.sender_id]?.avatar_url || undefined,
            }));

            set({ messages, isLoading: false });
        } catch (err) {
            console.error('Failed to fetch messages:', err);
            set({ isLoading: false });
        }
    },

    // Send a message
    sendMessage: async (senderId: string, receiverId: string, content: string) => {
        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: senderId,
                    receiver_id: receiverId,
                    content: content,
                });

            if (error) throw error;

            useToastStore.getState().addToast('Mensagem enviada! 📨', 'success');

            // Refresh messages
            await get().fetchMessages(senderId);

            return { success: true };
        } catch (err) {
            console.error('Failed to send message:', err);
            useToastStore.getState().addToast('Erro ao enviar mensagem', 'error');
            return { success: false };
        }
    },

    // Mark message as read
    markAsRead: async (messageId: string) => {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ read: true })
                .eq('id', messageId);

            if (error) throw error;

            set((state) => ({
                messages: state.messages.map((m) =>
                    m.id === messageId ? { ...m, read: true } : m
                ),
            }));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    },

    // Subscribe to realtime messages
    subscribeToMessages: (userId: string) => {
        // Unsubscribe from existing channel
        get().unsubscribe();

        const channel = supabase
            .channel(`messages-realtime`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    // NO filter - we check in callback (filters require REPLICA IDENTITY FULL)
                },
                async (payload) => {
                    console.log('📨 New message event:', payload);

                    // Check if this message is for me
                    if (payload.new.receiver_id !== userId) {
                        console.log('Message not for me, ignoring');
                        return;
                    }

                    console.log('📨 Message is for me!');

                    // Get sender info
                    const { data: senderData } = await supabase
                        .from('user_profiles')
                        .select('display_name, avatar_url')
                        .eq('id', payload.new.sender_id)
                        .single();

                    const newMessage: RealtimeMessage = {
                        id: payload.new.id,
                        senderId: payload.new.sender_id,
                        receiverId: payload.new.receiver_id,
                        content: payload.new.content,
                        read: payload.new.read,
                        createdAt: payload.new.created_at,
                        senderName: senderData?.display_name || 'Jogador',
                        senderAvatar: senderData?.avatar_url,
                    };

                    set((state) => ({
                        messages: [newMessage, ...state.messages],
                    }));

                    // Show notification
                    useToastStore.getState().addToast(
                        `Nova mensagem de ${newMessage.senderName}! 📨`,
                        'info'
                    );
                }
            )
            .subscribe((status) => {
                console.log('🔔 Realtime subscription status:', status);
            });

        set({ channel });
        console.log('🔔 Subscribed to realtime messages for user:', userId);
    },

    // Unsubscribe from realtime
    unsubscribe: () => {
        const { channel } = get();
        if (channel) {
            supabase.removeChannel(channel);
            set({ channel: null });
            console.log('🔕 Unsubscribed from realtime messages');
        }
    },

    // Get unread count
    getUnreadCount: (userId: string) => {
        return get().messages.filter((m) => !m.read && m.receiverId === userId).length;
    },

    // Get conversations grouped by friend
    getConversations: (userId: string) => {
        const { messages } = get();
        const conversationMap = new Map<string, {
            friendId: string;
            friendName: string;
            friendAvatar?: string;
            lastMessage: RealtimeMessage;
            unreadCount: number
        }>();

        messages.forEach((msg) => {
            // Determine the friend ID (the other person in the conversation)
            const friendId = msg.senderId === userId ? msg.receiverId : msg.senderId;

            const existing = conversationMap.get(friendId);

            if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessage.createdAt)) {
                conversationMap.set(friendId, {
                    friendId,
                    friendName: msg.senderId !== userId ? (msg.senderName || 'Jogador') : (existing?.friendName || 'Jogador'),
                    friendAvatar: msg.senderId !== userId ? msg.senderAvatar : existing?.friendAvatar,
                    lastMessage: msg,
                    unreadCount: existing?.unreadCount || 0,
                });
            }

            // Count unread from this friend (messages where I'm the receiver and not read)
            if (!msg.read && msg.receiverId === userId && msg.senderId === friendId) {
                const conv = conversationMap.get(friendId)!;
                conv.unreadCount++;
            }
        });

        // Sort by last message date (newest first)
        return Array.from(conversationMap.values()).sort(
            (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
        );
    },

    // Get messages for a specific conversation with a friend
    getMessagesWithFriend: (userId: string, friendId: string) => {
        const { messages } = get();
        return messages
            .filter(m =>
                (m.senderId === userId && m.receiverId === friendId) ||
                (m.senderId === friendId && m.receiverId === userId)
            )
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // oldest first for chat view
    },

    // Mark all messages from a friend as read
    markConversationAsRead: async (userId: string, friendId: string) => {
        const { messages } = get();
        const unreadMessages = messages.filter(
            m => m.senderId === friendId && m.receiverId === userId && !m.read
        );

        // Update in database
        for (const msg of unreadMessages) {
            await supabase
                .from('messages')
                .update({ read: true })
                .eq('id', msg.id);
        }

        // Update local state
        set((state) => ({
            messages: state.messages.map((m) =>
                m.senderId === friendId && m.receiverId === userId ? { ...m, read: true } : m
            ),
        }));
    },
}));

