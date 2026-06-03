import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the config module so the request function uses predictable values
vi.mock("../config", () => ({
  config: {
    lenco: {
      apiBaseUrl: "https://api.lenco.test",
      apiToken: "test-token",
    },
  },
}));

// Helper to build a mock Response-like object
// Always returns "application/json" content-type so existing tests pass through
// the content-type guard unchanged.
function makeFetchResponse(
  status: number,
  body: Record<string, unknown>,
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe("lenco request()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("1. returns data on a successful first attempt", async () => {
    const { lencoClient } = await import("./lenco.js");

    const mockFetch = vi.fn().mockResolvedValueOnce(
      makeFetchResponse(200, {
        status: true,
        message: "OK",
        data: [{ id: "acc-1" }],
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    // Run the request and advance any pending timers simultaneously
    const promise = lencoClient.getAccounts();
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.data).toEqual([{ id: "acc-1" }]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("2. retries and succeeds on attempt 2 after a timeout (AbortError)", async () => {
    // Re-import to get a fresh module instance with the stubbed fetch
    vi.resetModules();
    const { lencoClient } = await import("./lenco.js");

    const abortError = new Error("The operation was aborted");
    abortError.name = "AbortError";

    const successBody = { status: true, message: "OK", data: { id: "acc-2" } };

    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(abortError)
      .mockResolvedValueOnce(makeFetchResponse(200, successBody));

    vi.stubGlobal("fetch", mockFetch);

    const promise = lencoClient.getAccountBalance("acc-2");
    // Advance timers to fire the retry delay (1000ms) and the AbortController timeout
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.data).toEqual({ id: "acc-2" });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("3. retries up to 3 attempts on 500 errors then throws LencoApiError", async () => {
    vi.resetModules();
    const { lencoClient, LencoApiError } = await import("./lenco.js");

    const mockFetch = vi.fn().mockResolvedValue(
      makeFetchResponse(500, {
        status: false,
        message: "Internal Server Error",
        data: null,
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    // Attach .catch immediately to prevent unhandled rejection warnings
    let capturedError: unknown;
    const promise = lencoClient.getBanks().catch((e: unknown) => {
      capturedError = e;
    });
    await vi.runAllTimersAsync();
    await promise;

    expect(capturedError).toBeInstanceOf(LencoApiError);
    expect(
      (capturedError as InstanceType<typeof LencoApiError>).statusCode,
    ).toBe(500);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("4. retries after 429 then throws LencoApiError after exhaustion", async () => {
    vi.resetModules();
    const { lencoClient, LencoApiError } = await import("./lenco.js");

    const mockFetch = vi.fn().mockResolvedValue(
      makeFetchResponse(429, {
        status: false,
        message: "Too Many Requests",
        data: null,
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    let capturedError: unknown;
    const promise = lencoClient.getBanks().catch((e: unknown) => {
      capturedError = e;
    });
    await vi.runAllTimersAsync();
    await promise;

    expect(capturedError).toBeInstanceOf(LencoApiError);
    expect(
      (capturedError as InstanceType<typeof LencoApiError>).statusCode,
    ).toBe(429);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("5. does NOT retry on 400 (validation error) — throws immediately", async () => {
    vi.resetModules();
    const { lencoClient, LencoApiError } = await import("./lenco.js");

    const mockFetch = vi.fn().mockResolvedValueOnce(
      makeFetchResponse(400, {
        status: false,
        message: "Bad Request",
        data: null,
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    let capturedError: unknown;
    const promise = lencoClient
      .resolveBankAccount({
        accountNumber: "000",
        bankId: "bad-id",
      })
      .catch((e: unknown) => {
        capturedError = e;
      });
    await vi.runAllTimersAsync();
    await promise;

    expect(capturedError).toBeInstanceOf(LencoApiError);
    expect(
      (capturedError as InstanceType<typeof LencoApiError>).statusCode,
    ).toBe(400);
    // Only one attempt — no retries for 4xx (except 429)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("6. does NOT retry on 401 (auth error) — throws immediately", async () => {
    vi.resetModules();
    const { lencoClient, LencoApiError } = await import("./lenco.js");

    const mockFetch = vi.fn().mockResolvedValueOnce(
      makeFetchResponse(401, {
        status: false,
        message: "Unauthorized",
        data: null,
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    let capturedError: unknown;
    const promise = lencoClient.getAccounts().catch((e: unknown) => {
      capturedError = e;
    });
    await vi.runAllTimersAsync();
    await promise;

    expect(capturedError).toBeInstanceOf(LencoApiError);
    expect(
      (capturedError as InstanceType<typeof LencoApiError>).statusCode,
    ).toBe(401);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("7. throws LencoApiError immediately on non-JSON response (e.g. Cloudflare HTML 403 error page)", async () => {
    // Use a 403 status so the request function does NOT retry (only 429/5xx/AbortError retry).
    // This verifies the content-type guard fires before any attempt to call res.json().
    vi.resetModules();
    const { lencoClient, LencoApiError } = await import("./lenco.js");

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: {
        get: (name: string) =>
          name === "content-type" ? "text/html; charset=utf-8" : null,
      },
      json: () => Promise.reject(new SyntaxError("Unexpected token")),
    } as unknown as Response);
    vi.stubGlobal("fetch", mockFetch);

    let capturedError: unknown;
    const promise = lencoClient.getAccounts().catch((e: unknown) => {
      capturedError = e;
    });
    await vi.runAllTimersAsync();
    await promise;

    expect(capturedError).toBeInstanceOf(LencoApiError);
    expect(
      (capturedError as InstanceType<typeof LencoApiError>).statusCode,
    ).toBe(403);
    expect(
      (capturedError as InstanceType<typeof LencoApiError>).message,
    ).toContain("non-JSON response");
    // Should not have called res.json() since we guard before it
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("8. initiateMobileMoneyCollection sends 'phone' and 'operator' fields to Lenco API", async () => {
    vi.resetModules();
    const { lencoClient } = await import("./lenco.js");

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: () =>
        Promise.resolve({ status: true, message: "OK", data: { id: "col-1" } }),
    } as unknown as Response);
    vi.stubGlobal("fetch", mockFetch);

    const promise = lencoClient.initiateMobileMoneyCollection({
      amount: "1200",
      phoneNumber: "260971234567",
      provider: "MTN",
      reference: "DEBS-TEST-001",
      narration: "Premium payment",
    });
    await vi.runAllTimersAsync();
    await promise;

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const callArgs = mockFetch.mock.calls[0];
    const sentBody = JSON.parse(callArgs[1].body as string);

    // Lenco API requires "phone" and "operator" — NOT "phoneNumber"/"provider"
    expect(sentBody).toMatchObject({
      phone: "260971234567",
      operator: "MTN",
      amount: "1200",
      reference: "DEBS-TEST-001",
      narration: "Premium payment",
    });
    expect(sentBody).not.toHaveProperty("phoneNumber");
    expect(sentBody).not.toHaveProperty("provider");
  });
});
