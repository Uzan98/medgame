// Plantão Infinito Sync Functions - Supabase Integration
import { supabase } from './supabase';

// Types
export interface PlantaoCase {
    id: string;
    specialty: string;
    question: string;
    options: string[];
    correct_index: number;
    is_active?: boolean;
}

export interface PlantaoEvent {
    id: string;
    icon: string;
    title: string;
    description: string;
    effect: 'add_patients' | 'remove_patients' | 'add_chaos' | 'reduce_chaos' | 'blackout' | 'double_points' | 'time_pressure';
    value: number;
    is_active?: boolean;
}

// ========== CASES ==========

export const loadPlantaoCases = async (): Promise<PlantaoCase[]> => {
    try {
        const { data, error } = await supabase
            .from('plantao_cases')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Failed to load plantao cases:', err);
        return [];
    }
};

export const loadAllPlantaoCases = async (): Promise<PlantaoCase[]> => {
    try {
        const { data, error } = await supabase
            .from('plantao_cases')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Failed to load all plantao cases:', err);
        return [];
    }
};

export const savePlantaoCase = async (caseData: Partial<PlantaoCase> & { id?: string }): Promise<string | null> => {
    try {
        const dbData = {
            specialty: caseData.specialty,
            question: caseData.question,
            options: caseData.options,
            correct_index: caseData.correct_index,
            is_active: caseData.is_active ?? true,
            updated_at: new Date().toISOString()
        };

        if (caseData.id && !caseData.id.startsWith('new-')) {
            const { error } = await supabase
                .from('plantao_cases')
                .update(dbData)
                .eq('id', caseData.id);

            if (error) throw error;
            return caseData.id;
        } else {
            const { data, error } = await supabase
                .from('plantao_cases')
                .insert(dbData)
                .select('id')
                .single();

            if (error) throw error;
            return data?.id || null;
        }
    } catch (err) {
        console.error('Failed to save plantao case:', err);
        return null;
    }
};

export const deletePlantaoCase = async (caseId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('plantao_cases')
            .delete()
            .eq('id', caseId);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Failed to delete plantao case:', err);
        return false;
    }
};

export const bulkInsertPlantaoCases = async (cases: Omit<PlantaoCase, 'id'>[]): Promise<number> => {
    try {
        const dbData = cases.map(c => ({
            specialty: c.specialty,
            question: c.question,
            options: c.options,
            correct_index: c.correct_index,
            is_active: c.is_active ?? true
        }));

        const { data, error } = await supabase
            .from('plantao_cases')
            .insert(dbData)
            .select('id');

        if (error) throw error;
        return data?.length || 0;
    } catch (err) {
        console.error('Failed to bulk insert plantao cases:', err);
        return 0;
    }
};

// ========== EVENTS ==========

export const loadPlantaoEvents = async (): Promise<PlantaoEvent[]> => {
    try {
        const { data, error } = await supabase
            .from('plantao_events')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Failed to load plantao events:', err);
        return [];
    }
};

export const loadAllPlantaoEvents = async (): Promise<PlantaoEvent[]> => {
    try {
        const { data, error } = await supabase
            .from('plantao_events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Failed to load all plantao events:', err);
        return [];
    }
};

export const savePlantaoEvent = async (eventData: Partial<PlantaoEvent> & { id?: string }): Promise<string | null> => {
    try {
        const dbData = {
            icon: eventData.icon,
            title: eventData.title,
            description: eventData.description,
            effect: eventData.effect,
            value: eventData.value,
            is_active: eventData.is_active ?? true,
            updated_at: new Date().toISOString()
        };

        if (eventData.id && !eventData.id.startsWith('new-')) {
            const { error } = await supabase
                .from('plantao_events')
                .update(dbData)
                .eq('id', eventData.id);

            if (error) throw error;
            return eventData.id;
        } else {
            const { data, error } = await supabase
                .from('plantao_events')
                .insert(dbData)
                .select('id')
                .single();

            if (error) throw error;
            return data?.id || null;
        }
    } catch (err) {
        console.error('Failed to save plantao event:', err);
        return null;
    }
};

export const deletePlantaoEvent = async (eventId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('plantao_events')
            .delete()
            .eq('id', eventId);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Failed to delete plantao event:', err);
        return false;
    }
};
