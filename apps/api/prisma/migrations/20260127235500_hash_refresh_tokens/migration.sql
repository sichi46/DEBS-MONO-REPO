-- Add hashed refresh tokens and backfill from existing plaintext tokens
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE refresh_tokens
  ADD COLUMN IF NOT EXISTS "tokenHash" TEXT;

UPDATE refresh_tokens
SET "tokenHash" = encode(digest(token, 'sha256'), 'hex')
WHERE "tokenHash" IS NULL;

ALTER TABLE refresh_tokens
  ALTER COLUMN "tokenHash" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_tokenHash_key"
  ON refresh_tokens ("tokenHash");

ALTER TABLE refresh_tokens
  DROP COLUMN IF EXISTS token;
