import { config } from "../config";

export class LencoApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public lencoMessage?: string,
  ) {
    super(message);
    this.name = "LencoApiError";
  }
}

interface LencoResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
  meta?: unknown;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  attempt = 1,
): Promise<LencoResponse<T>> {
  const url = `${config.lenco.apiBaseUrl}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${config.lenco.apiToken}`,
        "Content-Type": "application/json",
        "User-Agent": "DEBS-Insurance-API/1.0",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.headers.get("content-type")?.includes("application/json")) {
      throw new LencoApiError(
        res.status,
        `Lenco API returned non-JSON response (status ${res.status})`,
      );
    }

    const json = (await res.json()) as LencoResponse<T> & { message?: string };

    if (!res.ok) {
      throw new LencoApiError(
        res.status,
        `Lenco API error ${res.status}: ${json.message ?? "Unknown error"}`,
        json.message,
      );
    }

    return json as LencoResponse<T>;
  } catch (err) {
    clearTimeout(timeoutId);

    const isRetryable =
      (err instanceof LencoApiError &&
        (err.statusCode === 429 || err.statusCode >= 500)) ||
      (err instanceof Error && err.name === "AbortError") ||
      (!(err instanceof LencoApiError) && err instanceof Error);

    if (isRetryable && attempt < 3) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, attempt * 1_000),
      );
      return request<T>(method, path, body, attempt + 1);
    }

    throw err;
  }
}

export const lencoClient = {
  // Accounts
  getAccounts() {
    return request<unknown[]>("GET", "/accounts");
  },

  getAccountBalance(accountId: string) {
    return request<unknown>("GET", `/accounts/${accountId}/balance`);
  },

  // Banks
  getBanks() {
    return request<unknown[]>("GET", "/banks");
  },

  // Resolve
  resolveBankAccount(payload: { accountNumber: string; bankId: string }) {
    return request<unknown>("POST", "/resolve/bank-account", payload);
  },

  // Transfer Recipients
  createBankRecipient(payload: {
    accountName: string;
    accountNumber: string;
    bankId: string;
    currency?: string;
    country?: string;
  }) {
    return request<unknown>("POST", "/transfer-recipients/bank-account", {
      ...payload,
      currency: payload.currency ?? "ZMW",
      country: payload.country ?? "ZM",
    });
  },

  // Transfers
  initiateBankTransfer(payload: {
    accountId: string;
    accountNumber: string;
    bankId: string;
    amount: string;
    narration: string;
    reference: string;
  }) {
    return request<unknown>("POST", "/transfers/bank-account", payload);
  },

  getTransferStatus(reference: string) {
    return request<unknown>(
      "GET",
      `/transfers/status/${encodeURIComponent(reference)}`,
    );
  },

  // Collections
  // NOTE: Lenco API uses "phone" and "operator" (not "phoneNumber"/"provider").
  // Confirmed from Phase 2.5 live collection response observation.
  initiateMobileMoneyCollection(payload: {
    amount: string;
    currency?: string;
    phoneNumber: string;
    provider: string;
    reference: string;
    narration?: string;
  }) {
    return request<unknown>("POST", "/collections/mobile-money", {
      amount: payload.amount,
      currency: payload.currency ?? "ZMW",
      phone: payload.phoneNumber,
      operator: payload.provider,
      reference: payload.reference,
      ...(payload.narration ? { narration: payload.narration } : {}),
    });
  },

  getCollections(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request<unknown[]>("GET", `/collections${qs ? `?${qs}` : ""}`);
  },

  getCollectionById(id: string) {
    return request<unknown>("GET", `/collections/${encodeURIComponent(id)}`);
  },

  getCollectionByReference(reference: string) {
    return request<unknown>(
      "GET",
      `/collections/status/${encodeURIComponent(reference)}`,
    );
  },
};
