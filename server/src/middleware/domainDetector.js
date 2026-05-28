const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function detectBusinessFromDomain(req, res, next) {
  try {
    let host = req.get('host') || '';
    host = host.split(':')[0];

    // Always check database for custom domain, even on localhost
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
  } catch (err) {
    next();
  }
}

module.exports = detectBusinessFromDomain;