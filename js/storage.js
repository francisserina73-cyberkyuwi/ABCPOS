/**
 * Storage Module
 * Handles file uploads to Supabase Storage
 */

import { supabase } from './supabase-client.js';
import { STORAGE_BUCKET, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './config.js';

/**
 * Upload image to Supabase Storage
 * @param {File} file 
 * @param {string} folder - Optional folder path
 * @returns {Promise<{success: boolean, url: string, path: string, error: string}>}
 */
export async function uploadImage(file, folder = '') {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      error: null
    };
  } catch (error) {
    console.error('Upload image error:', error);
    return { success: false, error: 'Failed to upload image' };
  }
}

/**
 * Delete image from Supabase Storage
 * @param {string} filePath 
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function deleteImage(filePath) {
  try {
    if (!filePath) {
      return { success: false, error: 'File path is required' };
    }

    // Extract path from URL if full URL is provided
    if (filePath.startsWith('http')) {
      const url = new URL(filePath);
      filePath = url.pathname.split(`/${STORAGE_BUCKET}/`)[1];
    }

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete image error:', error);
    return { success: false, error: 'Failed to delete image' };
  }
}

/**
 * Get public URL for a file
 * @param {string} filePath 
 * @returns {string}
 */
export function getPublicUrl(filePath) {
  if (!filePath) return '';
  
  // If already a full URL, return as is
  if (filePath.startsWith('http')) {
    return filePath;
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Validate file before upload
 * @param {File} file 
 * @returns {object} {valid: boolean, error: string}
 */
function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` 
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only images are allowed' 
    };
  }

  return { valid: true, error: null };
}

/**
 * Upload multiple images
 * @param {FileList|Array} files 
 * @param {string} folder 
 * @returns {Promise<{success: boolean, results: array, error: string}>}
 */
export async function uploadMultipleImages(files, folder = '') {
  try {
    const results = [];
    
    for (const file of files) {
      const result = await uploadImage(file, folder);
      results.push(result);
    }

    const failed = results.filter(r => !r.success);
    
    if (failed.length > 0) {
      return { 
        success: false, 
        results, 
        error: `${failed.length} file(s) failed to upload` 
      };
    }

    return { success: true, results, error: null };
  } catch (error) {
    console.error('Upload multiple images error:', error);
    return { success: false, results: [], error: 'Failed to upload images' };
  }
}

/**
 * Resize image before upload (client-side)
 * @param {File} file 
 * @param {number} maxWidth 
 * @param {number} maxHeight 
 * @returns {Promise<Blob>}
 */
export async function resizeImage(file, maxWidth = 800, maxHeight = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          0.9 // quality
        );
      };
      
      img.onerror = reject;
    };
    
    reader.onerror = reject;
  });
}

