// ============================================================
// FILE: server/src/services/businessService.js
// FIXED: Removed supabase.raw() - using safe increment instead
// FIXED: Added try/catch around all database operations
// ============================================================

// Load environment variables FIRST
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// ============================================================
// LAZY SUPABASE INITIALIZATION
// ============================================================
let supabaseInstance = null;

function getSupabase() {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('[businessService] Supabase credentials missing');
            return null;
        }
        
        try {
            supabaseInstance = createClient(supabaseUrl, supabaseKey);
            console.log('[businessService] ✅ Supabase client created successfully');
        } catch (err) {
            console.error('[businessService] Failed to create Supabase client:', err.message);
            return null;
        }
    }
    return supabaseInstance;
}

// ============================================================
// REFERENCE ID GENERATION
// ============================================================
function generateRefId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BH-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateUniqueRefId() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  
  let attempts = 0;
  let maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const refId = generateRefId();
    
    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .eq('ref_id', refId)
      .single();
    
    if (error || !data) {
      return refId;
    }
    
    attempts++;
  }
  
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BH-${timestamp.substring(0, 4)}${random}`;
}

// ============================================================
// BUSINESS FETCHING
// ============================================================
async function getBusinessByIdentifier(identifier) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  
  if (!identifier) {
    throw new Error('Identifier is required');
  }

  const isRefId = identifier && identifier.startsWith('BH-');
  
  let query = supabase
    .from('businesses')
    .select('*');
  
  if (isRefId) {
    query = query.eq('ref_id', identifier);
  } else {
    query = query.eq('id', identifier);
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    throw new Error(error.message || 'Business not found');
  }
  
  return data;
}

// ============================================================
// GET ENHANCED BUSINESS - FIXED
// ============================================================
async function getEnhancedBusiness(businessId) {
  const supabase = getSupabase();
  if (!supabase) {
    console.error('[businessService] Supabase client not available');
    throw new Error('Supabase client not available');
  }
  
  if (!businessId) {
    throw new Error('Business ID is required');
  }

  console.log('[businessService] Fetching enhanced data for:', businessId);

  // ============================================================
  // STEP 1: GET BUSINESS DATA
  // ============================================================
  let business = null;
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error || !data) {
      console.error('[businessService] Business not found:', error);
      throw new Error('Business not found');
    }
    business = data;
    console.log('[businessService] Found business:', business.name);
  } catch (err) {
    console.error('[businessService] Failed to fetch business:', err.message);
    throw err;
  }

  // ============================================================
  // STEP 2: GET GALLERY (with graceful fallback)
  // ============================================================
  let gallery = [];
  try {
    const { data, error } = await supabase
      .from('business_gallery')
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true });
    
    if (!error && data) {
      gallery = data;
    } else if (error && error.message.includes('does not exist')) {
      console.warn('[businessService] Gallery table not found, skipping');
    } else if (error) {
      console.warn('[businessService] Gallery fetch error:', error.message);
    }
  } catch (err) {
    console.warn('[businessService] Gallery fetch failed:', err.message);
  }

  // ============================================================
  // STEP 3: GET ROOMS (with graceful fallback)
  // ============================================================
  let rooms = [];
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', 'available');
    
    if (!error && data) {
      rooms = data;
    }
  } catch (err) {
    console.warn('[businessService] Rooms fetch failed:', err.message);
  }

  // ============================================================
  // STEP 4: GET BOOKINGS COUNT (with graceful fallback)
  // ============================================================
  let bookingCount = 0;
  try {
    const { count, error } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId);
    
    if (!error) {
      bookingCount = count || 0;
    }
  } catch (err) {
    console.warn('[businessService] Bookings count failed:', err.message);
  }

  // ============================================================
  // STEP 5: INCREMENT VIEW COUNT (safely)
  // ============================================================
  try {
    const currentViews = business.view_count || 0;
    const { error } = await supabase
      .from('businesses')
      .update({ view_count: currentViews + 1 })
      .eq('id', businessId);
    
    if (error) {
      console.warn('[businessService] View count update failed:', error.message);
    }
  } catch (err) {
    console.warn('[businessService] View count update error:', err.message);
  }

  // ============================================================
  // STEP 6: RETURN ENHANCED DATA
  // ============================================================
  const result = {
    ...business,
    gallery: gallery,
    rooms: rooms,
    totalBookings: bookingCount,
    features: business.features || [],
    amenities: business.amenities || [],
    area_guide: business.area_guide || [],
    phone_numbers: business.phone_numbers || []
  };

  console.log('[businessService] Enhanced data loaded successfully');
  return result;
}

// ============================================================
// INCREMENT VIEW COUNT - SAFE VERSION
// ============================================================
async function incrementViewCount(businessId) {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('[businessService] Cannot increment view count - no Supabase client');
    return null;
  }
  
  if (!businessId) {
    console.warn('[businessService] Cannot increment view count - no business ID');
    return null;
  }

  try {
    // Get current view count first
    const { data, error: fetchError } = await supabase
      .from('businesses')
      .select('view_count')
      .eq('id', businessId)
      .single();

    if (fetchError) {
      console.warn('[businessService] Failed to fetch view count:', fetchError.message);
      return null;
    }

    const currentViews = data?.view_count || 0;

    const { error } = await supabase
      .from('businesses')
      .update({ view_count: currentViews + 1 })
      .eq('id', businessId);

    if (error) {
      console.warn('[businessService] Failed to increment view count:', error.message);
      return null;
    }

    return { success: true, view_count: currentViews + 1 };
  } catch (error) {
    console.warn('[businessService] Increment view count error:', error.message);
    return null;
  }
}

// ============================================================
// FEATURES MANAGEMENT
// ============================================================
async function updateFeatures(businessId, features) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  
  if (!businessId) {
    throw new Error('Business ID is required');
  }

  if (!Array.isArray(features)) {
    throw new Error('Features must be an array');
  }

  const { data, error } = await supabase
    .from('businesses')
    .update({ features: features })
    .eq('id', businessId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update features');
  }

  return data;
}

// ============================================================
// AMENITIES MANAGEMENT
// ============================================================
async function updateAmenities(businessId, amenities) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  
  if (!businessId) {
    throw new Error('Business ID is required');
  }

  if (!Array.isArray(amenities)) {
    throw new Error('Amenities must be an array');
  }

  const { data, error } = await supabase
    .from('businesses')
    .update({ amenities: amenities })
    .eq('id', businessId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update amenities');
  }

  return data;
}

// ============================================================
// AREA GUIDE MANAGEMENT
// ============================================================
async function updateAreaGuide(businessId, areaGuide) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  
  if (!businessId) {
    throw new Error('Business ID is required');
  }

  if (!Array.isArray(areaGuide)) {
    throw new Error('Area guide must be an array');
  }

  const { data, error } = await supabase
    .from('businesses')
    .update({ area_guide: areaGuide })
    .eq('id', businessId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update area guide');
  }

  return data;
}

// ============================================================
// PHONE NUMBERS MANAGEMENT
// ============================================================
async function updatePhoneNumbers(businessId, phoneNumbers) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  
  if (!businessId) {
    throw new Error('Business ID is required');
  }

  if (!Array.isArray(phoneNumbers)) {
    throw new Error('Phone numbers must be an array');
  }

  const { data, error } = await supabase
    .from('businesses')
    .update({ phone_numbers: phoneNumbers })
    .eq('id', businessId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update phone numbers');
  }

  return data;
}

// ============================================================
// GET PHONE NUMBERS
// ============================================================
async function getPhoneNumbers(businessId) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  
  if (!businessId) {
    throw new Error('Business ID is required');
  }

  const { data, error } = await supabase
    .from('businesses')
    .select('phone_numbers, phone')
    .eq('id', businessId)
    .single();

  if (error) {
    throw new Error(error.message || 'Business not found');
  }

  const numbers = data.phone_numbers || [];
  
  if (data.phone && !numbers.includes(data.phone)) {
    numbers.unshift(data.phone);
  }

  return numbers;
}

// ============================================================
// GALLERY MANAGEMENT
// ============================================================
async function getGallery(businessId) {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('[businessService] No Supabase client for gallery');
    return [];
  }
  
  if (!businessId) {
    console.warn('[businessService] No business ID for gallery');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('business_gallery')
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true });

    if (error) {
      if (error.message && error.message.includes('does not exist')) {
        console.warn('[businessService] Gallery table does not exist');
        return [];
      }
      console.warn('[businessService] Gallery fetch error:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn('[businessService] Gallery fetch error:', error.message);
    return [];
  }
}

// ============================================================
// GALLERY IMAGE CRUD (with graceful fallback)
// ============================================================
async function addGalleryImage(businessId, imageData) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  
  if (!businessId || !imageData || !imageData.imageUrl) {
    throw new Error('Business ID and image URL are required');
  }

  try {
    const { data, error } = await supabase
      .from('business_gallery')
      .insert({
        business_id: businessId,
        image_url: imageData.imageUrl,
        file_name: imageData.fileName || 'gallery-image',
        sort_order: 0,
        is_cover: imageData.isCover || false
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to add gallery image');
    }

    return data;
  } catch (error) {
    console.error('[businessService] Add gallery image error:', error.message);
    throw error;
  }
}

async function deleteGalleryImage(businessId, imageId) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  
  if (!businessId || !imageId) {
    throw new Error('Business ID and image ID are required');
  }

  try {
    const { error } = await supabase
      .from('business_gallery')
      .delete()
      .eq('id', imageId)
      .eq('business_id', businessId);

    if (error) {
      throw new Error(error.message || 'Failed to delete gallery image');
    }

    return true;
  } catch (error) {
    console.error('[businessService] Delete gallery image error:', error.message);
    throw error;
  }
}

// ============================================================
// PROPERTY DETAILS MANAGEMENT
// ============================================================
async function updatePropertyDetails(businessId, details) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  
  if (!businessId) {
    throw new Error('Business ID is required');
  }

  const updateData = {};
  
  if (details.property_size !== undefined) updateData.property_size = details.property_size;
  if (details.bedrooms !== undefined) updateData.bedrooms = details.bedrooms;
  if (details.bathrooms !== undefined) updateData.bathrooms = details.bathrooms;
  if (details.parking_spaces !== undefined) updateData.parking_spaces = details.parking_spaces;
  if (details.year_built !== undefined) updateData.year_built = details.year_built;
  if (details.furnishing_status !== undefined) updateData.furnishing_status = details.furnishing_status;
  if (details.listing_status !== undefined) updateData.listing_status = details.listing_status;

  const { data, error } = await supabase
    .from('businesses')
    .update(updateData)
    .eq('id', businessId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update property details');
  }

  return data;
}

// ============================================================
// EXPORT MODULE
// ============================================================
module.exports = {
  generateRefId,
  generateUniqueRefId,
  
  getBusinessByIdentifier,
  getEnhancedBusiness,
  incrementViewCount,
  
  updateFeatures,
  updateAmenities,
  updateAreaGuide,
  updatePhoneNumbers,
  getPhoneNumbers,
  
  getGallery,
  addGalleryImage,
  deleteGalleryImage,
  
  updatePropertyDetails
};