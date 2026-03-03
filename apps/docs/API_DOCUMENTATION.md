# DEBS Insurance API Documentation

## Overview
This document defines all API endpoints, request/response payloads, and validation rules for the DEBS Insurance platform.

**Base URL:** `https://debs-mono-repo-api.vercel.app`  
**Local URL:** `http://localhost:3001`

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 1. Auth Endpoints ✅ (Implemented)

### POST /api/auth/register
Create a new user account.

**Request:**
```json
{
  "name": "string (min 2 chars, required)",
  "email": "string (valid email, required)",
  "password": "string (min 8 chars, 1 uppercase, 1 lowercase, 1 number, required)",
  "phone": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": null,
      "address": null,
      "avatarUrl": null,
      "role": "USER",
      "status": "ACTIVE",
      "emailVerified": false,
      "createdAt": "2026-01-23T12:00:00.000Z",
      "lastLoginAt": null
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

**Errors:**
- `400` - Validation error (email format, password requirements)
- `400` - Email already registered

---

### POST /api/auth/login
Authenticate user and get tokens.

**Request:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* User object */ },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

**Errors:**
- `401` - Invalid credentials

---

### POST /api/auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "tokens": {
      "accessToken": "new_jwt_access_token",
      "refreshToken": "new_jwt_refresh_token"
    }
  }
}
```

---

### POST /api/auth/logout
Invalidate refresh token.

**Request:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/logout-all 🔒
Logout from all devices. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out from all devices"
}
```

---

### GET /api/auth/me 🔒
Get current user profile. **Requires authentication.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* User object */ }
  }
}
```

---

### PATCH /api/auth/me 🔒
Update current user profile. **Requires authentication.**

**Request:**
```json
{
  "name": "string (optional, min 2 chars)",
  "phone": "string (optional)",
  "address": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "user": { /* Updated user object */ }
  }
}
```

---

### POST /api/auth/change-password 🔒
Change password. **Requires authentication.**

**Request:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, same rules as register)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### POST /api/auth/forgot-password
Request password reset email.

**Request:**
```json
{
  "email": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account exists, a reset email has been sent"
}
```

---

### POST /api/auth/reset-password
Reset password with token from email.

**Request:**
```json
{
  "token": "string (required)",
  "password": "string (required, same rules as register)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 2. Policies Endpoints 📋 (To Be Implemented)

### GET /api/policies 🔒
Get all policies for the authenticated user.

**Query Parameters:**
- `status` - Filter by status (ACTIVE, PENDING, EXPIRED, CANCELLED)
- `type` - Filter by policy type ID
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "policies": [
      {
        "id": "cuid",
        "policyNumber": "LP-2024-001234",
        "policyType": {
          "id": "cuid",
          "name": "Life Insurance",
          "icon": "🛡️"
        },
        "status": "ACTIVE",
        "coverageAmount": "500000.00",
        "premiumAmount": "1200.00",
        "startDate": "2024-01-15T00:00:00.000Z",
        "endDate": "2034-01-15T00:00:00.000Z",
        "description": "Comprehensive life insurance",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

---

### GET /api/policies/:policyNumber 🔒
Get single policy details with beneficiaries.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "policy": {
      /* Policy object */
      "beneficiaries": [
        {
          "id": "cuid",
          "name": "Mary Mwape",
          "relationship": "Spouse",
          "percentage": 60,
          "phone": "+260971234567",
          "email": "mary@example.com"
        }
      ]
    }
  }
}
```

---

### POST /api/policies 🔒
Apply for a new policy.

**Request:**
```json
{
  "policyTypeId": "string (required)",
  "coverageAmount": "number (required)",
  "beneficiaries": [
    {
      "name": "string (required)",
      "relationship": "string (required)",
      "percentage": "number (1-100, required)",
      "phone": "string (optional)",
      "email": "string (optional)"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Policy application submitted",
  "data": {
    "policy": { /* Policy object with status: PENDING */ }
  }
}
```

---

## 3. Claims Endpoints 📋 (To Be Implemented)

### GET /api/claims 🔒
Get all claims for the authenticated user.

**Query Parameters:**
- `status` - Filter by status (PENDING, UNDER_REVIEW, APPROVED, REJECTED)
- `policyId` - Filter by policy
- `page`, `limit` - Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "claims": [
      {
        "id": "cuid",
        "claimNumber": "CLM-2024-0001",
        "policyId": "cuid",
        "policy": {
          "policyNumber": "HI-2024-005678",
          "policyType": { "name": "Health Insurance" }
        },
        "claimType": "Medical",
        "status": "APPROVED",
        "amount": "5000.00",
        "description": "Hospital admission",
        "submittedAt": "2025-10-10T00:00:00.000Z",
        "processedAt": "2025-10-12T00:00:00.000Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### GET /api/claims/:claimNumber 🔒
Get single claim details.

---

### POST /api/claims 🔒
Submit a new claim.

**Request:**
```json
{
  "policyId": "string (required)",
  "claimType": "string (required)",
  "amount": "number (required)",
  "description": "string (required)"
}
```

**Validation:**
- Policy must belong to the user
- Policy must be ACTIVE
- Claim amount cannot exceed coverage amount

**Response (201):**
```json
{
  "success": true,
  "message": "Claim submitted successfully",
  "data": {
    "claim": { /* Claim object with status: PENDING */ }
  }
}
```

---

## 4. Payments Endpoints 📋 (To Be Implemented)

### GET /api/payments 🔒
Get payment history for the authenticated user.

**Query Parameters:**
- `policyId` - Filter by policy
- `status` - Filter by status (PAID, PENDING, FAILED)
- `page`, `limit` - Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "cuid",
        "policyId": "cuid",
        "policy": {
          "policyNumber": "LP-2024-001234",
          "policyType": { "name": "Life Insurance" }
        },
        "amount": "1200.00",
        "status": "PAID",
        "method": "MOBILE_MONEY",
        "transactionId": "TXN123456",
        "paidAt": "2025-10-01T10:00:00.000Z",
        "createdAt": "2025-10-01T09:00:00.000Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### POST /api/payments 🔒
Process a premium payment.

**Request:**
```json
{
  "policyId": "string (required)",
  "amount": "number (required)",
  "method": "MOBILE_MONEY | BANK_TRANSFER | CARD (required)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Payment processed",
  "data": {
    "payment": { /* Payment object */ }
  }
}
```

---

## 5. Policy Types Endpoints 📋 (To Be Implemented)

### GET /api/policy-types
Get available policy types (public, no auth required).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "policyTypes": [
      {
        "id": "cuid",
        "name": "Life Insurance",
        "description": "Comprehensive coverage...",
        "icon": "🛡️",
        "minPremium": "350.00"
      }
    ]
  }
}
```

---

## 6. Dashboard Endpoints 📋 (To Be Implemented)

### GET /api/dashboard/stats 🔒
Get dashboard statistics for the authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalPolicies": 3,
    "activePolicies": 2,
    "pendingClaims": 2,
    "approvedClaims": 2,
    "totalClaimsAmount": "78000.00",
    "nextPaymentDate": "2025-11-01T00:00:00.000Z",
    "nextPaymentAmount": "2050.00"
  }
}
```

---

## 7. Admin Endpoints 📋 (To Be Implemented)

All admin endpoints require `ADMIN` role.

### GET /api/admin/users 🔒👑
### GET /api/admin/analytics 🔒👑
### GET /api/admin/policies 🔒👑
### GET /api/admin/claims 🔒👑
### PATCH /api/admin/claims/:id 🔒👑 (Approve/Reject)
### PATCH /api/admin/users/:id 🔒👑 (Suspend/Activate)

---

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

**Common Status Codes:**
- `400` - Validation error
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `500` - Server error

---

## Development Status

| Endpoint Group | Status | Tests |
|----------------|--------|-------|
| Auth | ✅ Complete | ⚠️ Needs tests |
| Policies | 📋 Planned | - |
| Claims | 📋 Planned | - |
| Payments | 📋 Planned | - |
| Policy Types | 📋 Planned | - |
| Dashboard | 📋 Planned | - |
| Admin | 📋 Planned | - |
