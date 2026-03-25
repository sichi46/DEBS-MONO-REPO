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
): Promise<LencoResponse<T>> {
  const url = `${config.lenco.apiBaseUrl}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${config.lenco.apiToken}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json = (await res.json()) as LencoResponse<T> & { message?: string };

  if (!res.ok) {
    throw new LencoApiError(
      res.status,
      `Lenco API error ${res.status}: ${json.message ?? "Unknown error"}`,
      json.message,
    );
  }

  return json as LencoResponse<T>;
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
    recipientId: string;
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
};
