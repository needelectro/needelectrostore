// NEED ELECTRO ERP — Supabase Storage & Cloud Services Client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client for client-side storage queries and public asset URLs
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Privileged admin client for server-side direct bucket management and uploads
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabasePublic;

export const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'needelectro-storage';

/**
 * Upload a binary buffer or base64 file to Supabase Storage
 */
export async function uploadToStorage(
  filePath: string,
  fileBuffer: Buffer | Blob,
  contentType: string = 'image/jpeg'
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Fallback for local development if Supabase credentials are not yet supplied
      return {
        success: true,
        publicUrl: `/uploads/${filePath}`,
      };
    }

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    const { data: publicData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      success: true,
      publicUrl: publicData.publicUrl,
    };
  } catch (err: any) {
    console.error('Supabase storage upload error:', err);
    return {
      success: false,
      error: err.message || 'Failed to upload file to storage',
    };
  }
}
