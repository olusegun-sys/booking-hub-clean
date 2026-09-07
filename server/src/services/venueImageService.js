// ============================================================
// FILE: server/src/services/venueImageService.js
// Venue image upload and management
// ============================================================

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[venueImageService] Supabase credentials missing');
  throw new Error('Supabase credentials missing');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload a venue image
 * @param {string} businessId - Business UUID
 * @param {string} venueId - Venue UUID
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} mimeType - Image MIME type
 * @param {string} fileName - Original file name
 * @returns {Promise<string>} Public URL of uploaded image
 */
async function uploadVenueImage(businessId, venueId, fileBuffer, mimeType, fileName) {
  if (!businessId || !venueId || !fileBuffer) {
    throw new Error('Business ID, Venue ID, and file buffer are required');
  }

  // Validate file size (max 5MB)
  if (fileBuffer.length > 5 * 1024 * 1024) {
    throw new Error('File size must be under 5MB');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(mimeType)) {
    throw new Error('Only JPEG, PNG, and WEBP images are allowed');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `venue-images/${businessId}/${venueId}/${timestamp}-${randomStr}-${safeName}`;

  console.log('[venueImageService] Uploading to:', filePath);

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('business-images')
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('[venueImageService] Upload error:', error);
    throw new Error('Failed to upload image: ' + error.message);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('business-images')
    .getPublicUrl(filePath);

  console.log('[venueImageService] Upload successful:', urlData.publicUrl);
  return urlData.publicUrl;
}

/**
 * Delete a venue image from storage
 * @param {string} imageUrl - Full URL of the image
 * @returns {Promise<boolean>} Success status
 */
async function deleteVenueImage(imageUrl) {
  try {
    // Extract file path from URL
    const parts = imageUrl.split('/business-images/');
    if (parts.length !== 2) {
      console.warn('[venueImageService] Could not extract path from URL:', imageUrl);
      return false;
    }

    const filePath = decodeURIComponent(parts[1]);
    
    const { error } = await supabase.storage
      .from('business-images')
      .remove([filePath]);

    if (error) {
      console.error('[venueImageService] Delete error:', error);
      return false;
    }

    console.log('[venueImageService] Deleted:', filePath);
    return true;
  } catch (error) {
    console.error('[venueImageService] Delete error:', error);
    return false;
  }
}

module.exports = {
  uploadVenueImage,
  deleteVenueImage
};