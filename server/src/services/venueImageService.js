// FILE: server/src/services/venueImageService.js
// COMPLETE FIX - With bucket creation fallback

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const BUCKET_NAME = 'venue-images';

/**
 * Ensure the bucket exists - creates it if it doesn't
 */
async function ensureBucketExists() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('[venueImageService] Error listing buckets:', listError);
      throw listError;
    }

    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`[venueImageService] Bucket "${BUCKET_NAME}" not found. Creating...`);
      
      // Create the bucket
      const { data, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880 // 5MB limit
      });
      
      if (createError) {
        console.error(`[venueImageService] Failed to create bucket:`, createError);
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }
      
      console.log(`[venueImageService] Bucket "${BUCKET_NAME}" created successfully`);
      
      // Create RLS policies (using raw SQL via Supabase)
      await createBucketPolicies();
      
      return true;
    }
    
    console.log(`[venueImageService] Bucket "${BUCKET_NAME}" exists`);
    return true;
  } catch (error) {
    console.error('[venueImageService] ensureBucketExists error:', error);
    throw error;
  }
}

/**
 * Create RLS policies for the bucket
 * Using supabase.rpc to execute SQL - only works with service role key
 */
async function createBucketPolicies() {
  try {
    // Create policies using SQL via supabase.rpc
    const policies = [
      // Public read
      `CREATE POLICY IF NOT EXISTS "Public read access for venue-images"
       ON storage.objects FOR SELECT
       USING ( bucket_id = '${BUCKET_NAME}' );`,
       
      // Authenticated upload
      `CREATE POLICY IF NOT EXISTS "Authenticated users can upload to venue-images"
       ON storage.objects FOR INSERT
       WITH CHECK ( 
         bucket_id = '${BUCKET_NAME}' 
         AND auth.role() = 'authenticated'
       );`,
       
      // Delete own images
      `CREATE POLICY IF NOT EXISTS "Users can delete their own venue images"
       ON storage.objects FOR DELETE
       USING ( 
         bucket_id = '${BUCKET_NAME}' 
         AND auth.role() = 'authenticated'
       );`
    ];
    
    // Execute each policy
    for (const policy of policies) {
      try {
        await supabase.rpc('exec_sql', { query: policy });
        console.log('[venueImageService] Policy created successfully');
      } catch (e) {
        // If RPC doesn't work, log but continue (policies can be created manually)
        console.warn('[venueImageService] Could not create policy via RPC:', e.message);
        console.warn('[venueImageService] Please create policies manually in Supabase dashboard');
      }
    }
  } catch (error) {
    console.warn('[venueImageService] Policy creation warning:', error.message);
  }
}

/**
 * Upload a venue image
 */
async function uploadVenueImage(fileData, businessId, roomId) {
  try {
    // Ensure bucket exists
    await ensureBucketExists();
    
    if (!fileData) {
      throw new Error('No file data provided');
    }
    
    if (!businessId || !roomId) {
      throw new Error('Business ID and Room ID are required');
    }
    
    // Generate unique filename
    const fileExtension = fileData.fileName?.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${businessId}/${roomId}/${fileName}`;
    
    // Convert base64 to buffer
    const base64Data = fileData.fileData.split(',')[1] || fileData.fileData;
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    console.log(`[venueImageService] Uploading: ${filePath} (${fileBuffer.length} bytes)`);
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: fileData.fileType || 'image/jpeg',
        upsert: false,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('[venueImageService] Upload error:', error);
      
      // Handle specific errors
      if (error.message.includes('Bucket not found')) {
        // Try one more time with bucket creation
        console.log('[venueImageService] Retrying with bucket creation...');
        await ensureBucketExists();
        
        // Retry upload
        const { data: retryData, error: retryError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, fileBuffer, {
            contentType: fileData.fileType || 'image/jpeg',
            upsert: false,
            cacheControl: '3600'
          });
          
        if (retryError) {
          throw new Error(`Upload failed after bucket creation: ${retryError.message}`);
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);
          
        return {
          success: true,
          imageUrl: urlData.publicUrl,
          path: filePath
        };
      }
      
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    console.log(`[venueImageService] Upload successful: ${urlData.publicUrl}`);
    
    return {
      success: true,
      imageUrl: urlData.publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('[venueImageService] uploadVenueImage error:', error);
    throw error;
  }
}

/**
 * Delete a venue image
 */
async function deleteVenueImage(imageUrl, businessId, roomId) {
  try {
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }
    
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `${businessId}/${roomId}/${fileName}`;
    
    console.log(`[venueImageService] Deleting: ${filePath}`);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('[venueImageService] Delete error:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('[venueImageService] deleteVenueImage error:', error);
    throw error;
  }
}

export default {
  uploadVenueImage,
  deleteVenueImage,
  ensureBucketExists
};