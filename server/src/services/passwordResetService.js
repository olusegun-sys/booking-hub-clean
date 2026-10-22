// FILE: server/src/services/passwordResetService.js
// PURPOSE: Password reset token lifecycle — generate, hash, verify, revoke.
//
// UPDATED 18 Oct 2026:
//   1. Timezone fix: expires_at is now stored as a timestamptz-safe string
//      and compared using UTC parsing, so tokens created in one timezone
//      and read in another don't falsely appear expired.
//   2. Purge grace period: used tokens are kept for 2 minutes before being
//      deleted, so a just-created token is never purged.
//   3. Debug logs throughout for test-run visibility.
//
// The overall pattern is unchanged: this file only knows how to create,
// verify, and clean up tokens. It doesn't send emails, doesn't touch
// Express, doesn't know about HTTP.

const crypto = require("crypto");

// ============================================================
// CONSTANTS
// ============================================================
const TOKEN_BYTE_LENGTH = 30; // 240 bits of entropy
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const PURGE_GRACE_MS = 2 * 60 * 1000; // 2 minutes before purging used tokens

// ============================================================
// TIME HELPERS
// ============================================================
// WHY these helpers: Postgres TIMESTAMP columns strip the timezone
// marker. When Supabase returns a row, expires_at may come back as
// "2026-10-18T23:00:41.792" (no Z), and JavaScript then interprets
// it as local time. If the app runs in UTC+1 (Nigeria), that silently
// shifts the value back an hour and makes a just-created token look
// expired.
//
// The fix: always interpret DB timestamps as UTC. This matches how
// Postgres stores them internally — every timestamp in a Supabase DB
// is UTC underneath. The suffix is just stripped on the way out.

/**
 * Parse a timestamp string from the DB. Ensures it's treated as UTC
 * regardless of whether the string ends in "Z" or "+00:00" or neither.
 */
function parseDbTimestamp(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value !== "string") return null;

  // If the string already has a timezone marker, use it as-is.
  // Otherwise, append "Z" to force UTC interpretation.
  const hasTimezone = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(value);
  const isoString = hasTimezone ? value : value + "Z";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Build an ISO timestamp string for expires_at that's explicit about
 * being UTC. This is what gets written to the DB — always ends in "Z".
 */
function buildUtcTimestamp(msFromNow) {
  return new Date(Date.now() + msFromNow).toISOString();
}

// ============================================================
// TOKEN HELPERS
// ============================================================

/**
 * Create a new reset token and store its hash against the business.
 *
 * Returns the RAW token (only chance to get it — we don't keep it).
 */
async function createResetToken(supabase, businessId) {
  if (!supabase) throw new Error("supabase client is required");
  if (!businessId) throw new Error("businessId is required");

  const rawToken = crypto.randomBytes(TOKEN_BYTE_LENGTH).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = buildUtcTimestamp(TOKEN_TTL_MS);

  console.log(
    "[PasswordReset] Creating token for business:",
    businessId,
    "| hash prefix:",
    tokenHash.substring(0, 16),
    "| expires_at:",
    expiresAt,
  );

  // Revoke any pending tokens for this business before creating a new one.
  const { error: updateError } = await supabase
    .from("password_reset_tokens")
    .update({ used: true })
    .eq("business_id", businessId)
    .eq("used", false);

  if (updateError) {
    console.error("[PasswordReset] Failed to revoke old tokens:", updateError);
  } else {
    console.log("[PasswordReset] Old unused tokens revoked (if any)");
  }

  const { data: inserted, error: insertError } = await supabase
    .from("password_reset_tokens")
    .insert({
      business_id: businessId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used: false,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[PasswordReset] INSERT FAILED:", insertError);
    throw insertError;
  }

  console.log(
    "[PasswordReset] INSERT SUCCESS — id:",
    inserted.id,
    "| used:",
    inserted.used,
    "| hash prefix:",
    tokenHash.substring(0, 16),
  );

  return rawToken;
}

/**
 * Look up a token by its raw value. Returns the row if valid, null otherwise.
 */
async function findValidToken(supabase, rawToken) {
  if (!supabase) throw new Error("supabase client is required");
  if (!rawToken || typeof rawToken !== "string") {
    console.log("[PasswordReset] findValidToken: rawToken missing or invalid");
    return null;
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  console.log(
    "[PasswordReset] findValidToken — hash prefix:",
    tokenHash.substring(0, 16),
    "| raw token length:",
    rawToken.length,
  );

  const { data, error } = await supabase
    .from("password_reset_tokens")
    .select("id, business_id, expires_at, used, created_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error("[PasswordReset] findValidToken query error:", error);
    return null;
  }

  if (!data) {
    console.log("[PasswordReset] findValidToken: no row found for this hash");
    return null;
  }

  const expiresAt = parseDbTimestamp(data.expires_at);
  const now = new Date();

  console.log(
    "[PasswordReset] findValidToken: row found — id:",
    data.id,
    "| used:",
    data.used,
    "| expires_at (raw):",
    data.expires_at,
    "| expires_at (parsed UTC):",
    expiresAt ? expiresAt.toISOString() : "INVALID",
    "| now:",
    now.toISOString(),
    "| diff (ms):",
    expiresAt ? expiresAt.getTime() - now.getTime() : "N/A",
  );

  if (data.used) {
    console.log("[PasswordReset] findValidToken: row marked used=true — rejecting");
    return null;
  }

  if (!expiresAt) {
    console.error(
      "[PasswordReset] findValidToken: could not parse expires_at — rejecting",
    );
    return null;
  }

  if (expiresAt.getTime() < now.getTime()) {
    console.log(
      "[PasswordReset] findValidToken: row is expired (diff:",
      expiresAt.getTime() - now.getTime(),
      "ms) — rejecting",
    );
    return null;
  }

  console.log("[PasswordReset] findValidToken: row is valid — accepting");
  return data;
}

/**
 * Mark a token as used so it can't be redeemed twice.
 */
async function markTokenUsed(supabase, tokenId) {
  if (!supabase) throw new Error("supabase client is required");
  if (!tokenId) throw new Error("tokenId is required");

  const { error } = await supabase
    .from("password_reset_tokens")
    .update({ used: true })
    .eq("id", tokenId);

  if (error) {
    console.error("[PasswordReset] markTokenUsed failed:", error);
    throw error;
  }

  console.log("[PasswordReset] Token marked used — id:", tokenId);
}

/**
 * Delete old tokens. Used tokens are kept for at least PURGE_GRACE_MS
 * after they're created before being purged.
 */
async function purgeOldTokens(supabase) {
  if (!supabase) throw new Error("supabase client is required");

  const now = new Date();
  const usedCutoff = new Date(now.getTime() - PURGE_GRACE_MS).toISOString();
  const expiredCutoff = new Date(now.getTime() - PURGE_GRACE_MS).toISOString();

  console.log(
    "[PasswordReset] purgeOldTokens — usedCutoff:",
    usedCutoff,
    "| expiredCutoff:",
    expiredCutoff,
  );

  const { data: deleted, error } = await supabase
    .from("password_reset_tokens")
    .delete()
    .or(
      `and(used.eq.true,created_at.lt.${usedCutoff}),expires_at.lt.${expiredCutoff}`,
    )
    .select();

  if (error) {
    console.error("[PasswordReset] purgeOldTokens failed:", error);
    throw error;
  }

  console.log(
    "[PasswordReset] purgeOldTokens: deleted",
    deleted ? deleted.length : 0,
    "rows",
  );
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  createResetToken,
  findValidToken,
  markTokenUsed,
  purgeOldTokens,
  parseDbTimestamp,
  TOKEN_TTL_MS,
  PURGE_GRACE_MS,
};