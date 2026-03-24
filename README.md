# DEBS Insurance Monorepo

This repo contains the DEBS Insurance API and frontend apps managed in a Turborepo setup.

## Apps & Packages

### Apps

- `apps/api`: Express + Prisma API server for auth and policy management.
- `apps/web`: Vite React app (customer portal).
- `apps/docs`: Vite app (docs/playground).

### Packages

- `packages/ui`: shared UI components/utilities.
- `packages/eslint-config`: shared ESLint configuration.
- `packages/typescript-config`: shared TypeScript configs.

## API Overview

Base routes (from `apps/api/src`):

- `GET /health` - health check.
- `POST /api/auth/register` - register.
- `POST /api/auth/login` - login.
- `POST /api/auth/refresh` - refresh access token.
- `POST /api/auth/logout` - logout (refresh token).
- `POST /api/auth/logout-all` - logout all devices.
- `POST /api/auth/forgot-password` - request password reset.
- `POST /api/auth/reset-password` - reset password.
- `POST /api/auth/change-password` - change password.
- `GET /api/auth/me` - current user profile.
- `PATCH /api/auth/me` - update profile.
- `GET /api/policies` - list policies for current user.
- `POST /api/policies` - create policy (current user).
- `GET /api/policies/:id` - get one policy (current user).

## Environment Variables (API)

From `apps/api/.env.example`:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN` (default `15m`)
- `JWT_REFRESH_EXPIRES_IN` (default `7d`)
- `PORT` (default `3001`)
- `NODE_ENV` (default `development`)
- `FRONTEND_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

## Security Notes

Implemented hardening:

- Rate limiting applied to auth and password reset routes.
- Refresh tokens are stored hashed in the database (requires migration).
- Password change revokes all refresh tokens.
- Server-side policy pricing validation checks minimum premium per policy type.

Remaining gaps / follow-ups:

- Password reset email delivery is still TODO (tokens are not sent).
- Access tokens remain valid after `logout-all` until they expire (default 15 minutes).
- No account lockout or anomaly detection beyond rate limiting.
