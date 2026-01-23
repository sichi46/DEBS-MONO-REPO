# Implementation Plan: Align Web App with DEBS Insurance Design System

## Overview
Migrate the design system from `apps/Debs Insurance Design System` to `apps/web` following the specified architecture while keeping existing auth/landing feature structure.

---

## Phase 1: Dependencies & Configuration

### 1.1 Update package.json
Add missing Radix UI and utility dependencies:
- `@radix-ui/react-*` (all 26 packages)
- `class-variance-authority`
- `cmdk` (command palette)
- `embla-carousel-react`
- `input-otp`
- `react-day-picker`
- `react-hook-form`
- `react-resizable-panels`
- `recharts`
- `sonner`
- `vaul` (drawer)

### 1.2 Update index.css (Design Tokens)
Replace HSL dark theme with DEBS Insurance blue theme:
- Primary: `#0057B7` (professional blue)
- Background: `#F7F9FC` (light gray)
- Add success, warning, sidebar, chart colors
- Keep Tailwind v3 format (not v4)

### 1.3 Update tailwind.config.ts
Add new color tokens:
- `success` / `success-foreground`
- `warning` / `warning-foreground`
- `sidebar` colors (6 variants)
- `chart` colors (1-5)

---

## Phase 2: UI Components (48 files)

### 2.1 Copy all UI components to `src/components/ui/`
From design system, copy:
- Form: button, input, label, textarea, form, checkbox, radio-group, select, switch, slider, input-otp
- Layout: card, badge, separator, scroll-area, resizable, sidebar, breadcrumb, pagination
- Dialogs: dialog, alert-dialog, sheet, drawer, popover, hover-card, tooltip
- Navigation: navigation-menu, menubar, dropdown-menu, context-menu, tabs, accordion, collapsible
- Data: table, progress, skeleton, carousel, chart, command
- Utility: aspect-ratio, avatar, use-mobile, utils, alert, toggle, toggle-group, calendar, sonner

### 2.2 Update lib/utils.ts
Ensure `cn()` utility matches design system version.

---

## Phase 3: Layout Components

### 3.1 Update `src/components/layout/`
- **DashboardLayout.tsx** - Update to use design system sidebar component
- **DashboardSidebar.tsx** - Create from design system (navigation links)
- **MobileHeader.tsx** - Create for responsive navigation

---

## Phase 4: Feature Modules

### 4.1 Update `features/auth/`
Keep existing structure, update components to use new UI:
- `components/LoginForm.tsx` - Use design system Button, Input, Card
- `components/RegisterForm.tsx` - Use design system components
- Keep: api/, state/, types/, routes.tsx

### 4.2 Update `features/landing/`
- `LandingPage.tsx` - Update to match design system landing page styling

### 4.3 Create `features/dashboard/`
```
features/dashboard/
├── components/
│   ├── DashboardOverview.tsx
│   ├── PolicyCard.tsx
│   └── ClaimCard.tsx
├── types/
│   └── index.ts
└── routes.tsx
```

### 4.4 Create `features/policies/`
```
features/policies/
├── api/
│   └── index.ts
├── components/
│   ├── PolicyList.tsx
│   └── PolicyDetails.tsx
├── types/
│   └── index.ts
└── routes.tsx
```

### 4.5 Create `features/claims/`
```
features/claims/
├── api/
│   └── index.ts
├── components/
│   ├── ClaimsList.tsx
│   └── ClaimSubmitDialog.tsx
├── types/
│   └── index.ts
└── routes.tsx
```

---

## Phase 5: App Integration

### 5.1 Update App.tsx
- Add routes for dashboard, policies, claims
- Integrate all feature routes
- Add protected routes for authenticated sections

### 5.2 Update main.tsx
- Ensure proper providers (React Query, Recoil, Router)

---

## Final Structure

```
apps/web/src/
├── components/
│   ├── ui/                  # 48 shadcn components
│   └── layout/
│       ├── DashboardLayout.tsx
│       ├── DashboardSidebar.tsx
│       └── MobileHeader.tsx
├── features/
│   ├── auth/                # Existing (updated styling)
│   ├── landing/             # Existing (updated styling)
│   ├── dashboard/           # New
│   ├── policies/            # New
│   └── claims/              # New
├── lib/
│   ├── axios.ts
│   └── utils.ts
├── index.css                # Updated design tokens
├── App.tsx                  # Updated routes
└── main.tsx
```

---

## Execution Order

1. **Dependencies** - Install all required packages
2. **Design tokens** - Update index.css and tailwind.config.ts
3. **UI components** - Copy all 48 components
4. **Layout** - Update DashboardLayout, create sidebar/header
5. **Auth feature** - Update LoginForm, RegisterForm styling
6. **Landing feature** - Update LandingPage styling
7. **Dashboard feature** - Create new feature module
8. **Policies feature** - Create new feature module
9. **Claims feature** - Create new feature module
10. **App routing** - Wire everything together
11. **Test** - Run build and verify

---

## Notes
- Keep Tailwind v3 (web app) - don't upgrade to v4
- Convert design system colors from hex to match existing HSL approach OR use hex directly
- Preserve existing Recoil state management for auth
- Keep existing axios setup and API patterns
