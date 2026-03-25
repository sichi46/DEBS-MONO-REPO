import crypto from "crypto";

/**
 * Verify a Lenco webhook signature.
 * Lenco derives the webhook hash key by SHA-256 hashing the API token,
 * then uses HMAC-SHA-512 with that key to sign the raw body.
 */
export function verifyLencoWebhook(
  rawBody: string,
  signature: string,
  apiToken: string,
): boolean {
  if (!signature || !apiToken) return false;

  const webhookHashKey = crypto
    .createHash("sha256")
    .update(apiToken)
    .digest("hex");

  const computed = crypto
    .createHmac("sha512", webhookHashKey)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(signature, "hex"),
    );
  } catch {
    return false;
  }
}
