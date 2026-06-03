# Lenco Webhook Contract Comparison

## Phase 3A.5 — Live Capture Analysis

## Status: AWAITING FIRST CAPTURE

---

## How to Capture a Live Webhook

1. Start the API server: cd apps/api && pnpm dev
2. In a separate terminal: ngrok http 3001
3. Copy the ngrok HTTPS URL (e.g. https://abc123.ngrok-free.app)
4. In the Lenco dashboard: Settings > Webhooks > set URL to https://abc123.ngrok-free.app/api/lenco/webhooks/capture
5. Initiate a ZMW 1 test transfer or mobile money collection
6. Payload will be saved to: apps/api/webhook-captures/capture-\*.json

---

## Contract Assumptions vs Actual

### Envelope Structure

| Field              | Assumed | Actual    | Match?    |
| ------------------ | ------- | --------- | --------- |
| Event field name   | event   | _pending_ | _pending_ |
| Data wrapper field | data    | _pending_ | _pending_ |

### Event Type Strings (HIGHEST RISK)

| Flow                     | Assumed               | Actual    | Match?    |
| ------------------------ | --------------------- | --------- | --------- |
| Successful bank transfer | transfer.successful   | _pending_ | _pending_ |
| Failed bank transfer     | transfer.failed       | _pending_ | _pending_ |
| Successful mobile money  | collection.successful | _pending_ | _pending_ |
| Failed mobile money      | collection.failed     | _pending_ | _pending_ |

### Reference Fields (HIGH RISK)

| Field                         | Assumed              | Actual    | Match?    |
| ----------------------------- | -------------------- | --------- | --------- |
| Transaction reference in data | reference            | _pending_ | _pending_ |
| Alt: client reference         | clientReference      | _pending_ | _pending_ |
| Alt: transaction reference    | transactionReference | _pending_ | _pending_ |

### Failure and Identifier Fields

| Field                            | Assumed      | Actual    | Match?    |
| -------------------------------- | ------------ | --------- | --------- |
| Failure reason field             | reason       | _pending_ | _pending_ |
| Top-level event id (idempotency) | id (in data) | _pending_ | _pending_ |

### Signature Header

| Field       | Assumed           | Actual    | Match?    |
| ----------- | ----------------- | --------- | --------- |
| Header name | x-lenco-signature | _pending_ | _pending_ |

---

## Code Changes Required (after comparison)

| #   | Mismatch | File | Location | Change Required |
| --- | -------- | ---- | -------- | --------------- |
| -   | None yet | -    | -        | -               |

---

## Raw Captured Payload

Paste the contents of webhook-captures/capture-\*.json here after capture.

---

## Outcome Checklist

- [ ] Payload captured
- [ ] Envelope structure confirmed
- [ ] Event type strings confirmed or corrected
- [ ] Reference field confirmed or corrected
- [ ] Signature verified
- [ ] All unknowns resolved
