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
function makeFetchResponse(
  status: number,
  body: Record<string, unknown>,
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
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

    const mockFetch = vi
      .fn()
      .mockResolvedValue(
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

    const mockFetch = vi
      .fn()
      .mockResolvedValue(
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

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
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

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
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
});
