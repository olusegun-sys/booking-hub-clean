// FILE: server/src/routes/businessRoutes.js
// ENHANCED BUSINESS ROUTES - SEPTEMBER 2026
// Handles features, amenities, area guide, phone numbers, property details, and gallery

const { createClient } = require('@supabase/supabase-js');

// ============================================================
// SUPABASE CLIENT (passed from server.js)
// ============================================================
// This file expects supabase client to be passed from server.js
// or it will create its own using environment variables

let supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

// Set the supabase client from server.js (called during initialization)
function setSupabaseClient(client) {
  supabaseClient = client;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Safe JSON parse with fallback
function safeJsonParse(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

// ============================================================
// ROUTE: GET ENHANCED BUSINESS DATA
// ============================================================
async function getEnhancedBusinessRoute(req, res) {
  try {
    const supabase = getSupabase();
    const { identifier } = req.params;
    
    // Check if identifier is UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    let query = supabase
      .from('businesses')
      .select('*')
      .eq('status', 'approved');
    
    if (isUUID) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('slug', identifier);
    }
    
    const { data: business, error } = await query.single();
    
    if (error || !business) {
      return res.status(404).json({ 
        success: false, 
        error: 'Business not found' 
      });
    }
    
    // Parse JSON fields
    const enhancedData = {
      ...business,
      features: safeJsonParse(business.features),
      amenities: safeJsonParse(business.amenities),
      area_guide: safeJsonParse(business.area_guide),
      phone_numbers: safeJsonParse(business.phone_numbers)
    };
    
    // Increment view count (safe update)
    try {
      const currentViews = business.view_count || 0;
      await supabase
        .from('businesses')
        .update({ view_count: currentViews + 1 })
        .eq('id', business.id);
    } catch (viewError) {
      console.log('[Enhanced] View count update skipped:', viewError.message);
    }
    
    res.json({
      success: true,
      business: enhancedData
    });
  } catch (error) {
    console.error('[Enhanced Route] Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch business data: ' + error.message 
    });
  }
}

// ============================================================
// ROUTE: GET PUBLIC GALLERY
// ============================================================
async function getPublicGalleryRoute(req, res) {
  try {
    const supabase = getSupabase();
    const { businessId } = req.params;
    
    const { data, error } = await supabase
      .from('business_gallery')
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      images: data || []
    });
  } catch (error) {
    console.error('[Gallery Public] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gallery: ' + error.message
    });
  }
}

// ============================================================
// ROUTE: GET PUBLIC PHONE NUMBERS
// ============================================================
async function getPublicPhoneNumbersRoute(req, res) {
  try {
    const supabase = getSupabase();
    const { businessId } = req.params;
    
    const { data, error } = await supabase
      .from('businesses')
      .select('phone_numbers')
      .eq('id', businessId)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      phoneNumbers: safeJsonParse(data?.phone_numbers)
    });
  } catch (error) {
    console.error('[Phone Numbers Public] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch phone numbers: ' + error.message
    });
  }
}

// ============================================================
// ROUTE: UPDATE FEATURES
// ============================================================
async function updateFeaturesRoute(req, res) {
  try {
    const supabase = getSupabase();
    const { businessId } = req.params;
    const { features } = req.body;
    
    if (!Array.isArray(features)) {
      return res.status(400).json({
        success: false,
        error: 'Features must be an array'
      });
    }
    
    const { data, error } = await supabase
      .from('businesses')
      .update({ features: features })
      .eq('id', businessId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Features updated successfully',
      business: data
    });
  } catch (error) {
    console.error('[Features Update] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update features: ' + error.message
    });
  }
}

// ============================================================
// ROUTE: UPDATE AMENITIES
// ============================================================
async function updateAmenitiesRoute(req, res) {
  try {
    const supabase = getSupabase();
    const { businessId } = req.params;
    const { amenities } = req.body;
    
    if (!Array.isArray(amenities)) {
      return res.status(400).json({
        success: false,
        error: 'Amenities must be an array'
      });
    }
    
    const { data, error } = await supabase
      .from('businesses')
      .update({ amenities: amenities })
      .eq('id', businessId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Amenities updated successfully',
      business: data
    });
  } catch (error) {
    console.error('[Amenities Update] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update amenities: ' + error.message
    });
  }
}

// ============================================================
// ROUTE: UPDATE AREA GUIDE
// ============================================================
async function updateAreaGuideRoute(req, res) {
  try {
    const supabase = getSupabase();
    const { businessId } = req.params;
    const { areaGuide } = req.body;
    
    if (!Array.isArray(areaGuide)) {
      return res.status(400).json({
        success: false,
        error: 'Area guide must be an array'
      });
    }
    
    const { data, error } = await supabase
      .from('businesses')
      .update({ area_guide: areaGuide })
      .eq('id', businessId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Area guide updated successfully',
      business: data
    });
  } catch (error) {
    console.error('[Area Guide Update] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update area guide: ' + error.message
    });
  }
}

// ============================================================
// ROUTE: UPDATE PHONE NUMBERS
// ============================================================
async function updatePhoneNumbersRoute(req, res) {
  try {
    const supabase = getSupabase();
    const { businessId } = req.params;
    const { phoneNumbers } = req.body;
    
    if (!Array.isArray(phoneNumbers)) {
      return res.status(400).json({
        success: false,
        error: 'Phone numbers must be an array'
      });
    }
    
    const { data, error } = await supabase
      .from('businesses')
      .update({ phone_numbers: phoneNumbers })
      .eq('id', businessId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Phone numbers updated successfully',
      business: data
    });
  } catch (error) {
    console.error('[Phone Numbers Update] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update phone numbers: ' + error.message
    });
  }
}

// ============================================================
// ROUTE: UPDATE PROPERTY DETAILS (FIXED)
// ============================================================
async function updatePropertyDetailsRoute(req, res) {
  try {
    const supabase = getSupabase();
    const { businessId } = req.params;
    const { propertyDetails } = req.body;
    
    // Get current business data first (to preserve ref_id)
    const { data: currentBusiness, error: fetchError } = await supabase
      .from('businesses')
      .select('ref_id, property_type, bathrooms, parking_spaces, year_built, furnishing_status, listing_status')
      .eq('id', businessId)
      .single();
    
    if (fetchError) {
      console.error('[Property Details] Fetch error:', fetchError);
      return res.status(404).json({
        success: false,
        error: 'Business not found: ' + fetchError.message
      });
    }
    
    // Build update data - ONLY update fields that are provided
    const updateData = {};
    
    // Property Type
    if (propertyDetails.property_type !== undefined) {
      updateData.property_type = propertyDetails.property_type || null;
    }
    
    // Bathrooms
    if (propertyDetails.bathrooms !== undefined) {
      updateData.bathrooms = parseInt(propertyDetails.bathrooms) || 0;
    }
    
    // Parking Spaces
    if (propertyDetails.parking_spaces !== undefined) {
      updateData.parking_spaces = parseInt(propertyDetails.parking_spaces) || 0;
    }
    
    // Year Built
    if (propertyDetails.year_built !== undefined) {
      updateData.year_built = propertyDetails.year_built ? parseInt(propertyDetails.year_built) : null;
    }
    
    // Furnishing Status
    if (propertyDetails.furnishing_status !== undefined) {
      updateData.furnishing_status = propertyDetails.furnishing_status || 'unfurnished';
    }
    
    // Listing Status
    if (propertyDetails.listing_status !== undefined) {
      updateData.listing_status = propertyDetails.listing_status || 'for_rent';
    }
    
    // CRITICAL: ref_id is NOT editable - preserve existing value
    // This ensures the Reference ID cannot be changed by the user
    if (currentBusiness?.ref_id) {
      updateData.ref_id = currentBusiness.ref_id;
    }
    
    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    console.log('[Property Details] Updating business:', businessId);
    console.log('[Property Details] Update data:', updateData);
    
    const { data, error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', businessId)
      .select()
      .single();
    
    if (error) {
      console.error('[Property Details] Update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Database error: ' + error.message
      });
    }
    
    res.json({
      success: true,
      message: 'Property details saved successfully',
      business: data
    });
  } catch (error) {
    console.error('[Property Details] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save property details: ' + error.message
    });
  }
}

// ============================================================
// ROUTE: ADD GALLERY IMAGE (Authenticated)
// ============================================================
async function addGalleryImageRoute(req, res) {
  try {
    const supabase = getSupabase();
    const { businessId } = req.params;
    const { imageUrl, fileName } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }
    
    // Check gallery limit (max 16 images)
    const { count, error: countError } = await supabase
      .from('business_gallery')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId);
    
    if (countError) throw countError;
    
    if ((count || 0) >= 16) {
      return res.status(400).json({
        success: false,
        error: 'Gallery is full. Maximum 16 images allowed.'
      });
    }
    
    // Get next sort order
    const { data: lastImage } = await supabase
      .from('business_gallery')
      .select('sort_order')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: false })
      .limit(1);
    
    const nextSortOrder = (lastImage && lastImage.length > 0) ? lastImage[0].sort_order + 1 : 0;
    
    const { data, error } = await supabase
      .from('business_gallery')
      .insert({
        business_id: businessId,
        image_url: imageUrl,
        file_name: fileName || 'gallery-image',
        sort_order: nextSortOrder
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Gallery image added successfully',
      image: data
    });
  } catch (error) {
    console.error('[Gallery Add] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add gallery image: ' + error.message
    });
  }
}

// ============================================================
// ROUTE: DELETE GALLERY IMAGE (Authenticated)
// ============================================================
async function deleteGalleryImageRoute(req, res) {
  try {
    const supabase = getSupabase();
    const { businessId, imageId } = req.params;
    
    // Get the image to delete
    const { data: image, error: fetchError } = await supabase
      .from('business_gallery')
      .select('id, image_url')
      .eq('id', imageId)
      .eq('business_id', businessId)
      .single();
    
    if (fetchError || !image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }
    
    // Delete from storage (try, but don't fail if it doesn't work)
    try {
      const parts = image.image_url.split('/business-images/');
      if (parts.length === 2) {
        const storagePath = decodeURIComponent(parts[1]);
        await supabase.storage.from('business-images').remove([storagePath]);
        console.log('[Gallery Delete] Deleted from storage:', storagePath);
      }
    } catch (e) {
      console.log('[Gallery Delete] Storage delete skipped:', e.message);
    }
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('business_gallery')
      .delete()
      .eq('id', imageId)
      .eq('business_id', businessId);
    
    if (deleteError) throw deleteError;
    
    // Reorder remaining images
    const { data: remaining } = await supabase
      .from('business_gallery')
      .select('id')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true });
    
    if (remaining && remaining.length > 0) {
      for (let i = 0; i < remaining.length; i++) {
        await supabase
          .from('business_gallery')
          .update({ sort_order: i })
          .eq('id', remaining[i].id);
      }
    }
    
    res.json({
      success: true,
      message: 'Gallery image deleted successfully'
    });
  } catch (error) {
    console.error('[Gallery Delete] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete gallery image: ' + error.message
    });
  }
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  setSupabaseClient,
  getEnhancedBusinessRoute,
  getPublicGalleryRoute,
  getPublicPhoneNumbersRoute,
  updateFeaturesRoute,
  updateAmenitiesRoute,
  updateAreaGuideRoute,
  updatePhoneNumbersRoute,
  updatePropertyDetailsRoute,
  addGalleryImageRoute,
  deleteGalleryImageRoute
};