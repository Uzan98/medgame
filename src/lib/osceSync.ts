import { supabase } from './supabase';
import type { OsceCase } from './osceTypes';
import { useAdminStore } from '../store/adminStore';

// Load all OSCE cases from Supabase
export const loadOsceCases = async (): Promise<void> => {
    try {
        const { data, error } = await supabase
            .from('osce_cases')
            .select('id, case_data');

        if (error) {
            console.error('Error loading OSCE cases:', error);
        } else if (data) {
            const cases: OsceCase[] = data.map(row => ({
                ...row.case_data as OsceCase,
                id: row.id
            }));
            useAdminStore.setState({ customOsceCases: cases });
        }
    } catch (err) {
        console.error('Failed to load OSCE cases:', err);
    }
};

// Save an OSCE case to Supabase
export const saveOsceCase = async (osceCase: OsceCase): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('osce_cases')
            .upsert({
                id: osceCase.id,
                case_data: osceCase,
            }, { onConflict: 'id' });

        if (error) {
            console.error('Error saving OSCE case:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Failed to save OSCE case:', err);
        return false;
    }
};

// Delete an OSCE case from Supabase
export const deleteOsceCase = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('osce_cases')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting OSCE case:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Failed to delete OSCE case:', err);
        return false;
    }
};
