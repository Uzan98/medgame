import { supabase } from './supabase';
import type { DetectiveCase } from './detectiveTypes';
import { useAdminStore } from '../store/adminStore';

// Load all Detective cases from Supabase
export const loadDetectiveCases = async (): Promise<void> => {
    try {
        const { data, error } = await supabase
            .from('detective_cases')
            .select('id, case_data');

        if (error) {
            console.error('Error loading Detective cases:', error);
        } else if (data) {
            const cases: DetectiveCase[] = data.map(row => ({
                ...row.case_data as DetectiveCase,
                id: row.id
            }));
            useAdminStore.setState({ customDetectiveCases: cases });
        }
    } catch (err) {
        console.error('Failed to load Detective cases:', err);
    }
};

// Save a Detective case to Supabase
export const saveDetectiveCase = async (detectiveCase: DetectiveCase): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('detective_cases')
            .upsert({
                id: detectiveCase.id,
                case_data: detectiveCase,
            }, { onConflict: 'id' });

        if (error) {
            console.error('Error saving Detective case:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Failed to save Detective case:', err);
        return false;
    }
};

// Delete a Detective case from Supabase
export const deleteDetectiveCase = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('detective_cases')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting Detective case:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Failed to delete Detective case:', err);
        return false;
    }
};
