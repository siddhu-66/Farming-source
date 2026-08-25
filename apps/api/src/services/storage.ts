import { logger } from '../config/logger';

import { supabase } from '../config/supabase';

const BUCKET = process.env.SUPABASE_BUCKET || 'agriassist-media';

export const uploadFile = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  try {
    const ext = file.originalname.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    logger.info(`File uploaded: ${fileName}`);
    return data.publicUrl;
  } catch (error) {
    logger.error('Supabase upload error:', error);
    throw error;
  }
};

export const uploadMultipleFiles = async (
  files: Express.Multer.File[],
  folder: string
): Promise<string[]> => {
  const uploadPromises = files.map((f) => uploadFile(f, folder));
  return Promise.all(uploadPromises);
};

export const deleteFile = async (url: string): Promise<void> => {
  try {
    const path = url.split(`${BUCKET}/`)[1];
    if (!path) return;
    await supabase.storage.from(BUCKET).remove([path]);
    logger.info(`File deleted: ${path}`);
  } catch (error) {
    logger.error('Supabase delete error:', error);
  }
};
