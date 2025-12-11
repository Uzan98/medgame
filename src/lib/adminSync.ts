import { supabase } from './supabase';
import { ClinicalCase } from './cases';
import { QuizCase } from './quizCases';
import { useAdminStore } from '../store/adminStore';

// Load all admin content from Supabase
export const loadAdminContent = async (): Promise<void> => {
    try {
        // Load clinical cases
        const { data: casesData, error: casesError } = await supabase
            .from('clinical_cases')
            .select('id, case_data');

        if (casesError) {
            console.error('Error loading clinical cases:', casesError);
        } else if (casesData) {
            const cases: ClinicalCase[] = casesData.map(row => ({
                ...row.case_data as ClinicalCase,
                id: row.id
            }));
            useAdminStore.setState({ customCases: cases });
        }

        // Load quiz cases
        const { data: quizzesData, error: quizzesError } = await supabase
            .from('quiz_cases')
            .select('id, quiz_data');

        if (quizzesError) {
            console.error('Error loading quiz cases:', quizzesError);
        } else if (quizzesData) {
            const quizzes: QuizCase[] = quizzesData.map(row => ({
                ...row.quiz_data as QuizCase,
                id: row.id
            }));
            useAdminStore.setState({ customQuizzes: quizzes });
        }
    } catch (err) {
        console.error('Failed to load admin content:', err);
    }
};

// Save a clinical case to Supabase
export const saveClinicalCase = async (case_: ClinicalCase): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('clinical_cases')
            .upsert({
                id: case_.id,
                case_data: case_,
            }, { onConflict: 'id' });

        if (error) {
            console.error('Error saving clinical case:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Failed to save clinical case:', err);
        return false;
    }
};

// Delete a clinical case from Supabase
export const deleteClinicalCase = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('clinical_cases')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting clinical case:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Failed to delete clinical case:', err);
        return false;
    }
};

// Save a quiz case to Supabase
export const saveQuizCase = async (quiz: QuizCase): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('quiz_cases')
            .upsert({
                id: quiz.id,
                quiz_data: quiz,
            }, { onConflict: 'id' });

        if (error) {
            console.error('Error saving quiz case:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Failed to save quiz case:', err);
        return false;
    }
};

// Delete a quiz case from Supabase
export const deleteQuizCase = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('quiz_cases')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting quiz case:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Failed to delete quiz case:', err);
        return false;
    }
};
