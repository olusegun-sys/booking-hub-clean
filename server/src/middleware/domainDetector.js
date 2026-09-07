// Load environment variables FIRST
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Lazy initialize Supabase client - only create when needed
let supabaseInstance = null;

function getSupabase() {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        
        console.log('[domainDetector] Initializing Supabase client...');
        console.log('[domainDetector] SUPABASE_URL exists:', !!supabaseUrl);
        console.log('[domainDetector] SUPABASE_KEY exists:', !!supabaseKey);
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('[domainDetector] Supabase credentials not available');
            return null;
        }
        
        try {
            supabaseInstance = createClient(supabaseUrl, supabaseKey);
            console.log('[domainDetector] ✅ Supabase client created successfully');
        } catch (err) {
            console.error('[domainDetector] Failed to create Supabase client:', err.message);
            return null;
        }
    }
    return supabaseInstance;
}

async function detectBusinessFromDomain(req, res, next) {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return next();
        }
        
        let host = req.get('host') || '';
        host = host.split(':')[0];

        const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('custom_domain', host)
            .eq('is_domain_verified', true)
            .single();

        if (!error && data) {
            req.detectedBusiness = data;
            req.domainSource = 'custom-domain-verified';
        }

        next();
    } catch (_err) {
        next();
    }
}

module.exports = detectBusinessFromDomain;