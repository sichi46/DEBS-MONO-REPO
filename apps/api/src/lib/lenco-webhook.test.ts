import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyLencoWebhook } from "./lenco-webhook";

const TEST_API_TOKEN = "test-api-token-12345";

function signPayload(rawBody: string, apiToken: string): string {
  const webhookHashKey = crypto
    .createHash("sha256")
    .update(apiToken)
    .digest("hex");

  return crypto
    .createHmac("sha512", webhookHashKey)
    .update(rawBody)
    .digest("hex");
}

describe("verifyLencoWebhook", () => {
  it("should return true for a valid signature", () => {
    const body = JSON.stringify({
      event: "transfer.successful",
      data: { reference: "REF-001" },
    });
    const signature = signPayload(body, TEST_API_TOKEN);

    expect(verifyLencoWebhook(body, signature, TEST_API_TOKEN)).toBe(true);
  });

  it("should return false for an invalid signature", () => {
    const body = JSON.stringify({ event: "transfer.successful" });
    const badSignature = "deadbeef".repeat(16); // 128 hex chars for SHA-512

    expect(verifyLencoWebhook(body, badSignature, TEST_API_TOKEN)).toBe(false);
  });

  it("should return false for a tampered body", () => {
    const originalBody = JSON.stringify({
      event: "transfer.successful",
      amount: "100",
    });
    const signature = signPayload(originalBody, TEST_API_TOKEN);
    const tamperedBody = JSON.stringify({
      event: "transfer.successful",
      amount: "999999",
    });

    expect(verifyLencoWebhook(tamperedBody, signature, TEST_API_TOKEN)).toBe(
      false,
    );
  });

  it("should return false for wrong API token", () => {
    const body = JSON.stringify({ event: "transfer.successful" });
    const signature = signPayload(body, TEST_API_TOKEN);

    expect(verifyLencoWebhook(body, signature, "wrong-token")).toBe(false);
  });

  it("should return false when signature is empty", () => {
    const body = JSON.stringify({ event: "transfer.successful" });
    expect(verifyLencoWebhook(body, "", TEST_API_TOKEN)).toBe(false);
  });

  it("should return false when apiToken is empty", () => {
    const body = JSON.stringify({ event: "transfer.successful" });
    const signature = signPayload(body, TEST_API_TOKEN);
    expect(verifyLencoWebhook(body, signature, "")).toBe(false);
  });
});
