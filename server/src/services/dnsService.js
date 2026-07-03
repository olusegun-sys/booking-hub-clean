// FILE: server/src/services/dnsService.js
// DNS resolution service for domain verification

const dns = require('dns');
const util = require('util');

// Convert callback-based DNS to promise-based
const resolveTxt = util.promisify(dns.resolveTxt);

/**
 * Check if a domain has a specific TXT record
 * @param {string} domain - The domain to check
 * @param {string} expectedCode - The verification code to look for
 * @returns {Promise<{verified: boolean, records: string[], error?: string}>}
 */
async function verifyDomainTxtRecord(domain, expectedCode) {
  try {
    console.log('[DNS] Checking DNS for ' + domain + '...');
    
    // Get all TXT records for the domain
    const records = await resolveTxt(domain);
    
    // Flatten the array (DNS returns array of arrays)
    const flatRecords = records.flat();
    
    console.log('[DNS] Found ' + flatRecords.length + ' TXT records for ' + domain);
    
    // Check if any record matches our verification code
    const hasMatchingRecord = flatRecords.some(function(record) {
      // Check for exact match or contains the code
      return record === expectedCode || 
             record.includes(expectedCode) || 
             record.includes('booking-hub-verify');
    });
    
    if (hasMatchingRecord) {
      console.log('[DNS] DNS verification successful for ' + domain);
      return { verified: true, records: flatRecords };
    } else {
      console.log('[DNS] No matching TXT record found for ' + domain);
      return { 
        verified: false, 
        records: flatRecords,
        error: 'TXT record not found. Please add the verification code to your DNS and wait 10-30 minutes for propagation.'
      };
    }
  } catch (error) {
    // DNS lookup failed - domain might not have TXT records yet
    console.log('[DNS] DNS lookup failed for ' + domain + ':', error.message);
    
    // Handle specific DNS errors
    if (error.code === 'ENOTFOUND' || error.code === 'NXDOMAIN') {
      return { 
        verified: false, 
        records: [],
        error: 'Domain not found. Please check the domain name and try again.'
      };
    } else if (error.code === 'ETIMEOUT') {
      return { 
        verified: false, 
        records: [],
        error: 'DNS lookup timed out. Please wait 10-30 minutes for DNS propagation and try again.'
      };
    } else if (error.code === 'ENODATA') {
      return { 
        verified: false, 
        records: [],
        error: 'No TXT records found for this domain. Please add the verification code to your DNS.'
      };
    } else {
      return { 
        verified: false, 
        records: [],
        error: 'DNS lookup failed: ' + error.message
      };
    }
  }
}

module.exports = { verifyDomainTxtRecord };