// Shifts Sync Functions - Supabase Integration
import { supabase } from './supabase';
import { Shift, ShiftCase, ShiftQuestion } from './shifts';

// Types for database rows
interface ShiftRow {
    id: string;
    title: string;
    location: string;
    specialty: string;
    icon: string;
    duration: number;
    payment: number;
    difficulty: 'facil' | 'medio' | 'dificil';
    required_level: number;
    description: string;
    is_active: boolean;
}

interface ShiftCaseRow {
    id: string;
    shift_id: string;
    title: string;
    patient_info: string;
    description: string;
    media_type: 'none' | 'image' | 'video' | 'audio' | 'mixed';
    media_images: string[];
    media_video: string | null;
    media_audio: string | null;
    total_points: number;
    order_index: number;
}

interface ShiftQuestionRow {
    id: string;
    case_id: string;
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
    points: number;
    order_index: number;
}

// Load all shifts with their cases and questions
export const loadShifts = async (): Promise<Shift[]> => {
    try {
        // Get all active shifts
        const { data: shiftsData, error: shiftsError } = await supabase
            .from('shifts')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (shiftsError) {
            console.error('Error loading shifts:', shiftsError);
            return [];
        }

        if (!shiftsData || shiftsData.length === 0) {
            return [];
        }

        // Get all cases for these shifts
        const shiftIds = shiftsData.map(s => s.id);
        const { data: casesData, error: casesError } = await supabase
            .from('shift_cases')
            .select('*')
            .in('shift_id', shiftIds)
            .order('order_index', { ascending: true });

        if (casesError) {
            console.error('Error loading shift cases:', casesError);
        }

        // Get all questions for these cases
        const caseIds = (casesData || []).map(c => c.id);
        const { data: questionsData, error: questionsError } = await supabase
            .from('shift_questions')
            .select('*')
            .in('case_id', caseIds)
            .order('order_index', { ascending: true });

        if (questionsError) {
            console.error('Error loading shift questions:', questionsError);
        }

        // Build the shift objects
        const shifts: Shift[] = shiftsData.map((row: ShiftRow) => {
            const cases = (casesData || [])
                .filter((c: ShiftCaseRow) => c.shift_id === row.id)
                .map((caseRow: ShiftCaseRow) => {
                    const questions = (questionsData || [])
                        .filter((q: ShiftQuestionRow) => q.case_id === caseRow.id)
                        .map((qRow: ShiftQuestionRow): ShiftQuestion => ({
                            id: qRow.id,
                            question: qRow.question,
                            options: qRow.options,
                            correctIndex: qRow.correct_index,
                            explanation: qRow.explanation || '',
                            points: qRow.points
                        }));

                    const shiftCase: ShiftCase = {
                        id: caseRow.id,
                        title: caseRow.title,
                        patientInfo: caseRow.patient_info,
                        description: caseRow.description,
                        mediaType: caseRow.media_type,
                        media: {
                            images: caseRow.media_images || [],
                            video: caseRow.media_video || undefined,
                            audio: caseRow.media_audio || undefined
                        },
                        questions,
                        totalPoints: caseRow.total_points
                    };

                    return shiftCase;
                });

            return {
                id: row.id,
                title: row.title,
                location: row.location,
                specialty: row.specialty,
                icon: row.icon,
                duration: row.duration,
                payment: row.payment,
                difficulty: row.difficulty,
                requiredLevel: row.required_level,
                description: row.description || '',
                cases
            };
        });

        return shifts;
    } catch (err) {
        console.error('Failed to load shifts:', err);
        return [];
    }
};

// Save a shift (create or update)
export const saveShift = async (shift: Partial<Shift> & { id?: string }): Promise<string | null> => {
    try {
        const shiftData = {
            title: shift.title,
            location: shift.location,
            specialty: shift.specialty,
            icon: shift.icon || '🏥',
            duration: shift.duration,
            payment: shift.payment,
            difficulty: shift.difficulty,
            required_level: shift.requiredLevel || 1,
            description: shift.description,
            is_active: true
        };

        if (shift.id) {
            // Update existing
            const { error } = await supabase
                .from('shifts')
                .update(shiftData)
                .eq('id', shift.id);

            if (error) throw error;
            return shift.id;
        } else {
            // Create new
            const { data, error } = await supabase
                .from('shifts')
                .insert(shiftData)
                .select('id')
                .single();

            if (error) throw error;
            return data?.id || null;
        }
    } catch (err) {
        console.error('Failed to save shift:', err);
        return null;
    }
};

// Delete a shift
export const deleteShift = async (shiftId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('shifts')
            .delete()
            .eq('id', shiftId);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Failed to delete shift:', err);
        return false;
    }
};

// Save a shift case
export const saveShiftCase = async (
    shiftId: string,
    caseData: Partial<ShiftCase> & { id?: string },
    orderIndex: number = 0
): Promise<string | null> => {
    try {
        const dbData = {
            shift_id: shiftId,
            title: caseData.title,
            patient_info: caseData.patientInfo,
            description: caseData.description,
            media_type: caseData.mediaType || 'none',
            media_images: caseData.media?.images || [],
            media_video: caseData.media?.video || null,
            media_audio: caseData.media?.audio || null,
            total_points: caseData.totalPoints || 0,
            order_index: orderIndex
        };

        // Check if it's a new case (id starts with 'new-') or update
        const isNewCase = !caseData.id || caseData.id.startsWith('new-');

        if (!isNewCase && caseData.id) {
            const { error } = await supabase
                .from('shift_cases')
                .update(dbData)
                .eq('id', caseData.id);

            if (error) throw error;
            return caseData.id;
        } else {
            const { data, error } = await supabase
                .from('shift_cases')
                .insert(dbData)
                .select('id')
                .single();

            if (error) throw error;
            return data?.id || null;
        }
    } catch (err) {
        console.error('Failed to save shift case:', err);
        return null;
    }
};

// Delete a shift case
export const deleteShiftCase = async (caseId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('shift_cases')
            .delete()
            .eq('id', caseId);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Failed to delete shift case:', err);
        return false;
    }
};

// Save a question
export const saveShiftQuestion = async (
    caseId: string,
    questionData: Partial<ShiftQuestion> & { id?: string },
    orderIndex: number = 0
): Promise<string | null> => {
    try {
        const dbData = {
            case_id: caseId,
            question: questionData.question,
            options: questionData.options,
            correct_index: questionData.correctIndex,
            explanation: questionData.explanation,
            points: questionData.points || 50,
            order_index: orderIndex
        };

        // Check if it's a new question (id starts with 'new-') or update
        const isNewQuestion = !questionData.id || questionData.id.startsWith('new-');

        if (!isNewQuestion && questionData.id) {
            const { error } = await supabase
                .from('shift_questions')
                .update(dbData)
                .eq('id', questionData.id);

            if (error) throw error;
            return questionData.id;
        } else {
            const { data, error } = await supabase
                .from('shift_questions')
                .insert(dbData)
                .select('id')
                .single();

            if (error) throw error;
            return data?.id || null;
        }
    } catch (err) {
        console.error('Failed to save shift question:', err);
        return null;
    }
};

// Delete a question
export const deleteShiftQuestion = async (questionId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('shift_questions')
            .delete()
            .eq('id', questionId);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Failed to delete shift question:', err);
        return false;
    }
};

// Upload media to Supabase Storage
export const uploadShiftMedia = async (
    file: File,
    type: 'image' | 'video' | 'audio'
): Promise<string | null> => {
    try {
        const ext = file.name.split('.').pop();
        const fileName = `${type}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const { error } = await supabase.storage
            .from('shift-media')
            .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from('shift-media')
            .getPublicUrl(fileName);

        return urlData?.publicUrl || null;
    } catch (err) {
        console.error('Failed to upload media:', err);
        return null;
    }
};
