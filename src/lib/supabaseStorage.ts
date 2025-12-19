import { supabase } from './supabase';

// Bucket names for detective assets
const DETECTIVE_IMAGES_BUCKET = 'detective-images';
const DETECTIVE_AUDIO_BUCKET = 'detective-audio';

/**
 * Upload a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The bucket name
 * @param folder Optional folder path within the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadToSupabase(
    file: File,
    bucket: string,
    folder: string = ''
): Promise<{ url: string | null; error: string | null }> {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${folder ? folder + '/' : ''}${timestamp}_${sanitizedName}`;

        // Upload file
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            return { url: null, error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return { url: urlData.publicUrl, error: null };
    } catch (err: any) {
        console.error('Upload exception:', err);
        return { url: null, error: err.message || 'Erro desconhecido no upload' };
    }
}

/**
 * Upload an image for detective narrative scenes
 */
export async function uploadDetectiveImage(file: File, caseId: string): Promise<{ url: string | null; error: string | null }> {
    return uploadToSupabase(file, DETECTIVE_IMAGES_BUCKET, caseId);
}

/**
 * Upload an audio file for detective narrative scenes
 */
export async function uploadDetectiveAudio(file: File, caseId: string): Promise<{ url: string | null; error: string | null }> {
    return uploadToSupabase(file, DETECTIVE_AUDIO_BUCKET, caseId);
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromSupabase(
    fileUrl: string,
    bucket: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Extract file path from URL
        const url = new URL(fileUrl);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);

        if (!pathMatch) {
            return { success: false, error: 'Invalid file URL' };
        }

        const filePath = decodeURIComponent(pathMatch[1]);

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err: any) {
        return { success: false, error: err.message || 'Erro ao deletar arquivo' };
    }
}
