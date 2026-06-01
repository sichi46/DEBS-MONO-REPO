# Lenco V2 API Validation Report

## Phase: 2.5

## Environment: Production (https://api.lenco.co/access/v2)

## Validated: 2026-06-01

---

## Account Under Test

| Field             | Value                                |
| ----------------- | ------------------------------------ |
| Account ID        | d904bba8-71c3-40a9-9f75-92a1076ade1a |
| Account Name      | Nicholas De Beer                     |
| Type              | Lenco Merchant                       |
| Till Number       | 1708767                              |
| Currency          | ZMW                                  |
| Available Balance | ZMW 1.50                             |
| Ledger Balance    | ZMW 1.50                             |
| Status            | active                               |

---

## Authentication

**Method:** `Authorization: Bearer <token>` header on every request.

**Result:** CONFIRMED WORKING. The 63-character hex API token is accepted and returns HTTP 200 on all read endpoints.

**Critical discovery:** Requests without a `User-Agent` header are rejected by Cloudflare WAF with HTTP 403 (HTML response, not JSON). Adding `User-Agent: DEBS-Insurance-API/1.0` bypasses the block. The DEBS codebase MUST send a User-Agent header on every Lenco request.

**Code fix applied:** `apps/api/src/lib/lenco.ts` — `User-Agent` header added to the `request()` function fetch call (see Code Fixes section).

**401 error format (confirmed):**

```json
{
  "status": false,
  "errorCode": "09",
  "message": "Unauthorized",
  "data": null
}
```

Note: the `success` field is ABSENT on 401 responses.

---

## Endpoint Validation

### GET /accounts

- **Status:** 200 OK
- **Request:** No body. Auth header only.
- **Response envelope:**
  ```json
  {
    "status": true,
    "message": "",
    "data": [
      /* array of account objects */
    ],
    "meta": { "total": 1, "pageCount": 1, "perPage": 100, "currentPage": 1 }
  }
  ```
- **Account object fields confirmed:** `id`, `details` (object with `type`, `accountName`, `tillNumber`), `type`, `status`, `createdAt`, `currency`, `availableBalance`, `ledgerBalance`
- **Notes:** Pagination `meta` object present. `perPage` defaults to 100 even without query params.

---

### GET /accounts/{id}/balance

- **Status:** 200 OK
- **Request:** Account ID in path. No body.
- **Response envelope:**
  ```json
  {
    "status": true,
    "message": "",
    "data": {
      "currency": "ZMW",
      "availableBalance": "1.50",
      "ledgerBalance": "1.50"
    }
  }
  ```
- **Notes:** Balance values are **strings**, not numbers. No `meta` object on single-resource endpoints. Assumption #7 VERIFIED.

---

### GET /banks

- **Status:** 200 OK
- **Request:** No body. Auth header only.
- **Response envelope:**
  ```json
  {
    "status": true,
    "message": "",
    "data": [
      /* array of bank objects */
    ]
  }
  ```
- **Bank object fields confirmed:** `id` (string, e.g. `"002"`), `name`, `country` (lowercase ISO: `"zm"`)
- **Sample banks:** Absa Bank (002), Zanaco (023), FNB (014), Stanbic (016), Standard Chartered (017)
- **Notes:** 21 banks returned. `id` is a zero-padded numeric string, not a UUID.

---

### POST /resolve/bank-account

- **Status tested:** 400 (no valid account to test with)
- **Request shape (sent):**
  ```json
  { "accountNumber": "1000000000", "bankId": "002" }
  ```
- **Response on account-not-found (HTTP 400):**
  ```json
  {
    "success": true,
    "message": "Account details was not found",
    "status": false,
    "errorCode": "05",
    "data": null
  }
  ```
- **Response on empty body (HTTP 400):**
  ```json
  {
    "success": true,
    "message": "Invalid Account Number",
    "status": false,
    "errorCode": "01",
    "data": null
  }
  ```
- **Notes:** The `success: true` + `status: false` combination is anomalous — this appears to be a Lenco API inconsistency. The `success` field is absent on 200 and 401 responses; it only appears on 400 responses from the resolve endpoint. DEBS code reads `status` not `success`, so this is handled correctly. Assumption #4 VERIFIED (path is correct). Error codes confirmed: `"01"` = validation error, `"05"` = account not found.

---

### POST /transfer-recipients/bank-account

- **Status:** NOT TESTED directly (skipped — resolve step did not return a valid account)
- **Request shape (from code):**
  ```json
  {
    "accountName": "...",
    "accountNumber": "...",
    "bankId": "...",
    "currency": "ZMW",
    "country": "ZM"
  }
  ```
- **Assumptions #1, #8-10, #19: UNVERIFIED**

---

### POST /transfers/bank-account

- **Status:** NOT TESTED (skipped — no valid recipient; live ZMW balance not to be risked)
- **Request shape (from code):**
  ```json
  {
    "accountId": "d904bba8-71c3-40a9-9f75-92a1076ade1a",
    "recipientId": "<lenco-recipient-id>",
    "amount": "1",
    "narration": "...",
    "reference": "DEBS-<timestamp>-<hex>"
  }
  ```
- **Assumptions #2, #11-15, #20: UNVERIFIED**

---

### GET /transfers/status/{reference}

- **Status:** NOT TESTED (no transfer initiated)
- **Assumptions #3, #22-24: UNVERIFIED**

---

### POST /collections/mobile-money

- **Status:** NOT TESTED (not executed to avoid triggering a real mobile money charge)
- **Request shape (from code):**
  ```json
  {
    "amount": "1",
    "currency": "ZMW",
    "phoneNumber": "260971234567",
    "provider": "AIRTEL",
    "reference": "DEBS-<timestamp>-<hex>",
    "narration": "DEBS Insurance premium payment"
  }
  ```
- **Historical collection confirmed:** One successful collection exists in the account history (ZMW 50.00, Airtel, phone 0973013036, status: successful/settled). This confirms the mobile money collection flow works end-to-end on this account.
- **Field name discrepancy (MEDIUM RISK — see below):** The live collection record shows fields `phone` and `operator` in `mobileMoneyDetails`, NOT `phoneNumber` and `provider`. The request body field names used by the DEBS code (`phoneNumber`, `provider`) are **unverified** against what Lenco actually expects in the POST body. The response uses `phone`/`operator`.
- **Assumptions #5, #16-18, #21: UNVERIFIED (request body fields #16-17 flagged as medium risk)**

---

### GET /collections?page=1&limit=5

- **Status:** 200 OK
- **Response envelope:**
  ```json
  {
    "status": true,
    "message": "",
    "data": [
      /* array of collection objects */
    ],
    "meta": { "total": 1, "pageCount": 1, "perPage": 100, "currentPage": 1 }
  }
  ```
- **Collection object fields confirmed:** `id`, `initiatedAt`, `completedAt`, `amount`, `fee`, `bearer`, `currency`, `reference` (nullable), `lencoReference`, `type`, `status`, `source`, `reasonForFailure`, `settlementStatus`, `settlement` (object), `mobileMoneyDetails` (object: `country`, `phone`, `operator`, `accountName`, `operatorTransactionId`), `bankAccountDetails` (null), `cardDetails` (null)
- **Notes:** The `?page=1&limit=5` query parameters were IGNORED — Lenco returned `perPage: 100` and all records. The pagination query param names may differ from what DEBS sends, or the endpoint may not honour them. The `reference` field in the collection object was `null` for the historical record; this means collections initiated outside DEBS will not have a `reference` and webhook reconciliation would fail for them.

---

### Webhook Endpoints

- **Status:** NOT TESTED with live webhook delivery
- **All webhook assumptions (#27-39): UNVERIFIED**
- **See Remaining Unknowns section.**

---

## Response Envelope Analysis

### Success (HTTP 2xx)

```json
{
  "status": true,
  "message": "",
  "data": <T>,
  "meta": { "total": N, "pageCount": N, "perPage": N, "currentPage": N }  // list endpoints only
}
```

### Business Logic Failure (HTTP 400)

```json
{
  "success": true, // anomalous — only on 400s from resolve endpoint; value is always true even when status=false
  "status": false,
  "message": "Human-readable error",
  "errorCode": "NN", // two-digit string: "01"=validation, "05"=not found, "09"=auth
  "data": null
}
```

### Auth Failure (HTTP 401)

```json
{
  "status": false,
  "message": "Unauthorized",
  "errorCode": "09",
  "data": null
}
```

### Non-JSON responses

Cloudflare returns an HTML page on 403. The `request()` function in `lenco.ts` calls `res.json()` unconditionally, which will throw a `SyntaxError` on non-JSON bodies. This is caught as a generic `Error` (not `LencoApiError`) and retried twice before failing, causing a 20-second delay on Cloudflare blocks. **Partially mitigated by the User-Agent fix** (which prevents Cloudflare 403s), but 502/503 gateway errors can still return HTML.

---

## Discrepancies Found

### CONFIRMED (live evidence)

| #    | Discrepancy                                                                                                                    | Evidence                                                                                      | Fix Applied                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| CF-1 | Missing `User-Agent` header causes Cloudflare WAF to return HTTP 403 HTML                                                      | Live test: without User-Agent got 403 HTML; with `User-Agent: DEBS-Insurance-API/1.0` got 200 | YES — added to `lenco.ts`                                                                             |
| CF-2 | `res.json()` called unconditionally; will throw `SyntaxError` on HTML error bodies (Cloudflare 403, 502 gateways)              | Confirmed by live Cloudflare 403 HTML response                                                | Partially mitigated by CF-1; full fix would require content-type check before `res.json()` — deferred |
| CF-3 | Collections `?page` and `?limit` query params are ignored by Lenco — returned `perPage: 100` regardless                        | Live test with `?page=1&limit=5` returned `perPage: 100`                                      | NO (no code change warranted; local DB pagination still works)                                        |
| CF-4 | `success: true` + `status: false` combination on 400 responses (resolve endpoint) — not reflected in `LencoResponse` interface | Live observation                                                                              | NO (DEBS reads `status` field, which is correct; `success` is Lenco's inconsistency)                  |

### SUSPECTED (cannot confirm without further Lenco docs or testing)

| #    | Discrepancy                                                                                  | Evidence                                                                                                       | Risk                                   |
| ---- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| SD-1 | Mobile money collection request body may use `phone`/`operator` not `phoneNumber`/`provider` | Live collection record uses `phone` and `operator` in response `mobileMoneyDetails`; request fields unverified | HIGH — collections would fail with 400 |
| SD-2 | Webhook signature algorithm (SHA-256 key derivation + HMAC-SHA-512) unconfirmed              | No webhook delivery tested                                                                                     | HIGH — all webhooks rejected if wrong  |
| SD-3 | Webhook payload envelope fields (`body.event`, `body.data`, event type strings) unconfirmed  | No webhook delivery tested                                                                                     | HIGH — all events silently skipped     |
| SD-4 | `data.id` field name in recipient/transfer/collection create responses unconfirmed           | Not tested                                                                                                     | HIGH — `lencoId` stored as undefined   |

---

## Assumption Audit Results

### Legend

- **VERIFIED** — confirmed by live API test
- **UNVERIFIED** — could not test in this phase
- **LIKELY CORRECT** — consistent with live data but not directly tested
- **SUSPECT** — inconsistency found suggesting the assumption may be wrong

| #   | Assumption                                                | Status         | Notes                                                                                                                                                                            |
| --- | --------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `POST /transfer-recipients/bank-account` path             | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 2   | `POST /transfers/bank-account` path                       | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 3   | `GET /transfers/status/{reference}` lookup by reference   | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 4   | `POST /resolve/bank-account` path                         | VERIFIED       | HTTP 400 (not 404) confirms path is correct                                                                                                                                      |
| 5   | `POST /collections/mobile-money` path                     | LIKELY CORRECT | Historical collection exists; path untested directly                                                                                                                             |
| 6   | `GET /collections/status/{reference}` lookup by reference | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 7   | `GET /accounts/{id}/balance` path                         | VERIFIED       | HTTP 200 confirmed                                                                                                                                                               |
| 8   | Recipient create body: `accountName` field                | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 9   | Recipient create body: `accountNumber` field              | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 10  | Recipient create body: `bankId` field                     | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 11  | Transfer body: `accountId` field                          | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 12  | Transfer body: `recipientId` field                        | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 13  | Transfer body: `narration` field                          | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 14  | Transfer body: `reference` field                          | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 15  | `amount` sent as string                                   | UNVERIFIED     | Lenco balance values are strings; likely correct                                                                                                                                 |
| 16  | Collection body: `provider` field name                    | SUSPECT        | Live collection response uses `operator` in `mobileMoneyDetails`; request body field name unverified                                                                             |
| 17  | Collection body: `phoneNumber` field name                 | SUSPECT        | Live collection response uses `phone` in `mobileMoneyDetails`; request body field name unverified                                                                                |
| 18  | Collection body: `narration` field                        | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 19  | `res.data.id` in recipient create response                | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 20  | `res.data.id` in transfer initiate response               | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 21  | `res.data.id` in collection initiate response             | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 22  | Transfer status response: `.data.status` field            | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 23  | Collection status response: `.data.status` field          | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 24  | Transfer status values lowercase                          | UNVERIFIED     | `.toLowerCase()` normalisation is a safe mitigation                                                                                                                              |
| 25  | Collection status values lowercase                        | UNVERIFIED     | `.toLowerCase()` normalisation is a safe mitigation                                                                                                                              |
| 26  | `"pay-offline"` exact string                              | UNVERIFIED     | Historical collection shows `"successful"` status only                                                                                                                           |
| 27  | Webhook event type `"transfer.successful"`                | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 28  | Webhook event type `"transfer.failed"`                    | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 29  | Webhook event type `"collection.successful"`              | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 30  | Webhook event type `"collection.failed"`                  | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 31  | `body.event` holds event type                             | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 32  | Business data under `body.data`                           | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 33  | `data.reference` is reference field                       | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 34  | `data.reason` is failure message field                    | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 35  | `data.id` as idempotency key                              | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 36  | Webhook header `"x-lenco-signature"`                      | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 37  | SHA-256 key derivation + HMAC-SHA-512                     | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 38  | HMAC digest is hex-encoded                                | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 39  | API token used as HMAC seed                               | UNVERIFIED     | No webhook tested                                                                                                                                                                |
| 40  | Lenco error body has `message` field                      | VERIFIED       | All tested error responses contain `message`                                                                                                                                     |
| 41  | Non-2xx always returns JSON                               | FAILED         | Cloudflare 403 returns HTML; see CF-2 above                                                                                                                                      |
| 42  | Default currency `"ZMW"`                                  | VERIFIED       | Account and collection both use ZMW                                                                                                                                              |
| 43  | Default country `"ZM"`                                    | VERIFIED       | Banks all tagged `"zm"`                                                                                                                                                          |
| 44  | Provider values `"MTN"`, `"AIRTEL"`, `"ZAMTEL"` uppercase | LIKELY CORRECT | Historical collection shows `"airtel"` (lowercase) in response; controller enum accepts uppercase and code calls `.toUpperCase()` before sending — request body value unverified |
| 45  | Reference format `DEBS-{timestamp}-{4-byte hex}` accepted | UNVERIFIED     | Not tested                                                                                                                                                                       |
| 46  | Narration `"DEBS Insurance premium payment"` (32 chars)   | UNVERIFIED     | Borderline if Lenco cap is 30 chars                                                                                                                                              |
| 47  | Local dedup by `accountNumber + bankId`                   | UNVERIFIED     | Logic not exercised                                                                                                                                                              |
| 48  | Base URL has no trailing slash                            | VERIFIED       | All requests succeeded without double-slash issues                                                                                                                               |
| 49  | Balance `:id` is Lenco account ID                         | VERIFIED       | Used confirmed account ID; HTTP 200 returned                                                                                                                                     |
| 50  | `recipientId` is local DB ID not Lenco ID                 | LIKELY CORRECT | Code uses `prisma.lencoTransferRecipient.findUnique` with local ID then passes `recipient.lencoId` to Lenco                                                                      |

---

## Remaining Unknowns

The following assumptions could not be verified in this phase and represent the highest-priority items to confirm with Lenco support or documentation before going live with transfers and webhooks.

### Priority 1 — Must confirm before enabling withdrawals

1. **Webhook signature** (assumptions #36-39): Confirm the header name (`x-lenco-signature`?), the algorithm (HMAC-SHA-512?), whether the key is SHA-256(apiToken) or a separate webhook secret, and whether the digest is hex or base64. A wrong assumption here means zero webhooks are processed.

2. **Webhook payload envelope** (assumptions #27-33): Confirm the event type field name (`event`?), the event type strings (`transfer.successful` vs `transfer_successful`?), and whether business data is nested under `data`. A wrong assumption means transfers and collections are never reconciled.

3. **Mobile money collection request body field names** (assumptions #16-17): The live response uses `phone` and `operator` inside `mobileMoneyDetails`. Confirm whether the POST request body expects `phoneNumber`/`provider` or `phone`/`operator`. If `phone`/`operator` are correct, two field names in `lenco.ts` and `lenco.service.ts` need to change.

### Priority 2 — Must confirm before enabling bank transfers

4. **Response field name for created records** (assumptions #19-21): Confirm that `data.id` is the identifier returned for a newly created recipient, transfer, or collection. If the field is `_id`, `recipientId`, or similar, `lencoId` will be stored as `undefined`.

5. **Transfer status endpoint** (assumption #3): Confirm that `/transfers/status/{reference}` accepts a reference string and not an internal Lenco ID.

### Priority 3 — Lower risk, confirm when possible

6. **Amount field type** (assumption #15): Confirm Lenco expects `amount` as a numeric string (e.g. `"50.00"`) or a JSON number (`50.00`). Balance values in responses are strings, suggesting strings are preferred.

7. **Collection `pay-offline` status string** (assumption #26): Confirm the exact string Lenco sends for the offline payment status.

8. **Pagination query param names** (observed CF-3): Confirm the correct query parameter names for paginating collections. `?page=1&limit=5` was ignored; the correct params may be `?pageNumber=1&pageSize=5` or similar.

---

## Code Fixes Applied

### Fix 1 — Added `User-Agent` header to all Lenco API requests

**File:** `apps/api/src/lib/lenco.ts`
**Line:** 34-37 (the `headers` object inside `request()`)
**Change:** Added `"User-Agent": "DEBS-Insurance-API/1.0"` to the fetch headers.
**Reason:** Live testing confirmed that requests without a User-Agent header are blocked by Cloudflare WAF with HTTP 403 (HTML body, not JSON). This is the only confirmed code defect with direct live evidence.

---

## Historical Collection Data (Reference)

One successful mobile money collection exists on the account, confirming the payment flow has been exercised previously:

| Field                | Value                                |
| -------------------- | ------------------------------------ |
| ID                   | c1187841-11dd-463c-8918-a51a7df2cac6 |
| Amount               | ZMW 50.00                            |
| Fee                  | ZMW 0.50 (bearer: customer)          |
| Operator             | Airtel                               |
| Phone                | 0973013036                           |
| Account Name         | Nicholas debeer                      |
| Status               | successful                           |
| Settlement           | settled (instant)                    |
| Lenco Reference      | 2602602147                           |
| Operator Transaction | MP260126.0847.M16640                 |
| Initiated            | 2026-01-26T06:47:48.902Z             |
| Completed            | 2026-01-26T06:48:00.513Z             |
