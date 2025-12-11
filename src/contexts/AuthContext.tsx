import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { loadGameState, saveGameState, debouncedSave } from '../lib/gameStateSync';
import { useGameStore } from '../store/gameStore';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    syncing: boolean;
    signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    syncNow: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    // Sync state now
    const syncNow = useCallback(async () => {
        if (!user) return;
        setSyncing(true);
        await saveGameState(user.id);
        setSyncing(false);
    }, [user]);

    // Load state when user logs in
    useEffect(() => {
        if (user) {
            setSyncing(true);
            loadGameState(user.id).finally(() => setSyncing(false));
        }
    }, [user]);

    // Auto-save on game state changes
    useEffect(() => {
        if (!user) return;

        const unsubscribe = useGameStore.subscribe(() => {
            debouncedSave(user.id);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, displayName?: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName || email.split('@')[0]
                    }
                }
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        // Save state before logout
        if (user) {
            await saveGameState(user.id);
        }
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, syncing, signUp, signIn, signOut, syncNow }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

