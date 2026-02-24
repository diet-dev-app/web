# Plan: Migration from Bootstrap to Tailwind CSS + UI Improvement

**Date:** 2026-02-24  
**Status:** Draft  
**Scope:** Remove Bootstrap & react-bootstrap, adopt Tailwind CSS v4, redesign UI  

---

## 1. Current State Analysis

### Dependencies to Remove
- `bootstrap` (^5.3.3) — CSS framework
- `react-bootstrap` (^2.10.2) — React component wrappers

### Current Styling Breakdown

| Approach | Files | Usage |
|----------|------:|-------|
| Bootstrap CSS classes (hand-rolled) | 14 components | Grids, cards, buttons, alerts, badges, navbars, forms |
| react-bootstrap components | 6 components | Modal, Button, Form, ListGroup, Badge, Dropdown |
| CSS Modules (.module.css) | 6 files | Layout constraints (max-width, grids, spacing) |
| Global CSS (global.css) | 1 file | **Unused** — superseded by CSS Modules |
| Inline styles | 2 components | Minor overrides (fontSize, maxWidth) |

### Components Inventory (26 total)

**No styling (logic-only):** App, ProtectedRoute, CalendarPage, MealOptionsPage, MealsPage (5)

**Bootstrap classes only (hand-rolled HTML):**
- Alert, Layout, Navbar, LoginForm, RegisterForm, CalendarGrid, DayCell, MealChips, MealsSummary, HelpPage, LoginPage, RegisterPage, NotFoundPage, ShoppingListPage (14)

**react-bootstrap component usage:**
- ConfirmDialog (Modal, Button)
- UserDropdown (Dropdown)
- DayModal (Modal, Button)
- MealAdderModal (Modal, ListGroup, Form)
- OptionEditModal (Modal, Button, Form, Row, Col)
- OptionsList (Button, Badge)

**CSS Modules:**
- LoginForm.module.css (max-width, margin, border overrides)
- RegisterForm.module.css (max-width, margin, border overrides)
- CalendarGrid.module.css (grid layout, header, weekday)
- DayModal.module.css (meal section spacing)
- OptionsList.module.css (max-width, margin)
- MealsSummary.module.css (max-width, margin)

---

## 2. Tech Stack Decision

| Choice | Value |
|--------|-------|
| CSS Framework | **Tailwind CSS v4** (latest, CSS-first config) |
| UI Components | **Headless UI v2** (for Modal, Dropdown, Dialog — accessible, unstyled) |
| Icons | **Heroicons** (native Tailwind/Headless UI ecosystem) |
| Build Integration | **Vite + @tailwindcss/vite** |
| Design System | Custom design tokens via Tailwind theme (`tailwind.config.ts`) |

---

## 3. Phases

### Phase 0 — Setup & Infrastructure
**Goal:** Install Tailwind, configure Vite, set up design tokens, add Headless UI.  
**Estimated effort:** Small  
**Files changed:** `package.json`, `vite.config.ts`, new `src/assets/styles/global.css` (replace), `tailwind.config.ts`  

**Steps:**
1. Install dependencies:
   ```bash
   npm install tailwindcss @tailwindcss/vite
   npm install @headlessui/react @heroicons/react
   ```
2. Configure Vite plugin in `vite.config.ts` (add `@tailwindcss/vite` plugin)
3. Replace `global.css` content with Tailwind directives:
   ```css
   @import "tailwindcss";
   ```
4. Remove Bootstrap import from `main.tsx` (`import 'bootstrap/dist/css/bootstrap.min.css'`)
5. Create `tailwind.config.ts` with custom design tokens:
   - Colors: primary (green-600), secondary (slate-500), danger (red-500), background (slate-50)
   - Border radius, spacing, fonts
6. Verify build works with `npm run build`

**Acceptance Criteria:**
- [ ] App compiles without errors
- [ ] Tailwind utility classes work in any component
- [ ] No Bootstrap CSS is loaded

---

### Phase 1 — Shared Components (Low-level → Up)
**Goal:** Migrate reusable components to Tailwind + Headless UI  
**Estimated effort:** Medium  
**Files changed:** 6 components  

**Order & Details:**

#### 1.1 Alert Component
**File:** `src/components/Alert/Alert.tsx`  
**Current:** Hand-rolled Bootstrap alert with `alert`, `alert-${type}`, `alert-dismissible`  
**Target:** Tailwind utility classes with color variants via className mapping  
**Tailwind classes:** `rounded-lg px-4 py-3 flex items-center justify-between text-sm shadow-sm`  
**Variants:** success → `bg-green-50 text-green-800 border border-green-200`, danger → `bg-red-50 text-red-800 border border-red-200`, etc.

#### 1.2 ConfirmDialog Component
**File:** `src/components/ConfirmDialog/ConfirmDialog.tsx`  
**Current:** `react-bootstrap` Modal + Button  
**Target:** Headless UI `Dialog` + Tailwind  
**Key change:** Replace `<Modal>` with `<Dialog>` from `@headlessui/react`, style with Tailwind backdrop + panel classes  

#### 1.3 Layout Component
**File:** `src/components/Layout/Layout.tsx`  
**Current:** `<div className="container py-3">`  
**Target:** `<div className="max-w-7xl mx-auto px-4 py-6">`

#### 1.4 Navbar Component
**File:** `src/components/Layout/Navbar.tsx`  
**Current:** Hand-rolled Bootstrap navbar with `data-bs-toggle` (requires Bootstrap JS)  
**Target:** Headless UI `Disclosure` or custom responsive nav with Tailwind  
**Key change:** Remove dependency on Bootstrap JS for collapse behavior. Use React state for mobile menu toggle.  
**UI Improvement:** Modern sticky navbar with backdrop blur, cleaner mobile menu with slide animation

#### 1.5 UserDropdown Component
**File:** `src/components/UserDropdown/UserDropdown.tsx`  
**Current:** `react-bootstrap` Dropdown  
**Target:** Headless UI `Menu` + Tailwind  
**UI Improvement:** Smoother dropdown animation, better hover states

#### 1.6 ProtectedRoute (no changes needed — logic-only)

**Acceptance Criteria:**
- [ ] All shared components render correctly with Tailwind
- [ ] Navbar mobile menu works without Bootstrap JS
- [ ] ConfirmDialog opens/closes with proper transitions
- [ ] UserDropdown keyboard-accessible

---

### Phase 2 — Auth Features
**Goal:** Migrate login & register forms  
**Estimated effort:** Small  
**Files changed:** 4 files (2 components + 2 pages)  

#### 2.1 LoginForm
**File:** `src/features/Auth/LoginForm.tsx`  
**Current:** Bootstrap card + form classes + `LoginForm.module.css`  
**Target:** Tailwind card pattern, custom form styling  
**Delete:** `LoginForm.module.css`  
**UI Improvement:** Modern card with subtle shadow, focus rings on inputs, smooth loading state

#### 2.2 RegisterForm
**File:** `src/features/Auth/RegisterForm.tsx`  
**Current:** Bootstrap card + form classes + `RegisterForm.module.css`  
**Target:** Same card pattern as LoginForm  
**Delete:** `RegisterForm.module.css`

#### 2.3 LoginPage & RegisterPage
**Files:** `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`  
**Current:** Bootstrap grid for centering (`container row justify-content-center min-vh-100`)  
**Target:** `<div className="min-h-screen flex items-center justify-center bg-slate-50">`

**Acceptance Criteria:**
- [ ] Login & register forms are responsive and visually polished
- [ ] Form validation states display correctly
- [ ] Loading spinners work with Tailwind animation
- [ ] CSS Module files removed

---

### Phase 3 — Calendar Features (Core)
**Goal:** Migrate the calendar grid, day cells, modals, and meal chips  
**Estimated effort:** Large (most complex UI)  
**Files changed:** 6 files  

#### 3.1 CalendarGrid
**File:** `src/features/Calendar/CalendarGrid.tsx`  
**Current:** CSS Module grid layout + Bootstrap buttons  
**Target:** Tailwind CSS Grid (`grid grid-cols-7`), styled navigation buttons  
**Delete:** `CalendarGrid.module.css`  
**UI Improvement:** Cleaner month navigation, subtle grid lines, better visual hierarchy

#### 3.2 DayCell
**File:** `src/features/Calendar/DayCell.tsx`  
**Current:** CSS Module classes (`.dayCell`, `.today`, `.hasMeals`) + Bootstrap badge  
**Target:** Tailwind utilities with conditional classes  
**UI Improvement:** Hover elevation effect, today indicator ring, subtle background for days with meals

#### 3.3 DayModal
**File:** `src/features/Calendar/DayModal.tsx`  
**Current:** `react-bootstrap` Modal  
**Target:** Headless UI `Dialog` with Tailwind  
**Delete:** `DayModal.module.css`  
**UI Improvement:** Slide-up animation, better meal time section headers, cleaner layout

#### 3.4 MealAdderModal
**File:** `src/features/Calendar/MealAdderModal.tsx`  
**Current:** `react-bootstrap` Modal + ListGroup + Form  
**Target:** Headless UI `Dialog` + Tailwind list/form  
**UI Improvement:** Search input with icon, better list item hover states, selection indicator

#### 3.5 MealChips
**File:** `src/features/Calendar/MealChips.tsx`  
**Current:** Bootstrap badges + inline style  
**Target:** Tailwind pill badges  
**UI Improvement:** Better color coding per meal time, smooth delete animation

**Acceptance Criteria:**
- [ ] Calendar grid displays correctly on all screen sizes
- [ ] Day cells show proper states (today, has meals, empty)
- [ ] Modals open/close with transitions
- [ ] Meal chips are properly styled with delete functionality
- [ ] All CSS Module files removed

---

### Phase 4 — Meal Options & Meals Features
**Goal:** Migrate options CRUD and meals summary  
**Estimated effort:** Medium  
**Files changed:** 4 files  

#### 4.1 OptionEditModal
**File:** `src/features/MealOptions/OptionEditModal.tsx`  
**Current:** `react-bootstrap` Modal + Form + Row/Col  
**Target:** Headless UI `Dialog` + Tailwind form layout  
**UI Improvement:** Better form field grouping, clearer ingredient management, modern select styling

#### 4.2 OptionsList
**File:** `src/features/MealOptions/OptionsList.tsx`  
**Current:** `react-bootstrap` Button/Badge + Bootstrap card grid + `OptionsList.module.css`  
**Target:** Tailwind card grid with responsive columns  
**Delete:** `OptionsList.module.css`  
**UI Improvement:** Card hover effects, better badge styling, clearer hierarchy, search/filter header

#### 4.3 MealsSummary
**File:** `src/features/Meals/MealsSummary.tsx`  
**Current:** Bootstrap cards + list groups + `MealsSummary.module.css`  
**Target:** Tailwind cards with custom list styling  
**Delete:** `MealsSummary.module.css`  
**UI Improvement:** Modern summary cards, better data visualization, cleaner meal grouping

**Acceptance Criteria:**
- [ ] Option cards display in responsive grid
- [ ] Edit modal form is usable and well-organized
- [ ] Meals summary presents data clearly
- [ ] All CSS Module files removed

---

### Phase 5 — Remaining Pages
**Goal:** Migrate simple pages  
**Estimated effort:** Small  
**Files changed:** 4 files  

#### 5.1 HelpPage
**Current:** Bootstrap `list-group`  
**Target:** Tailwind styled list with spacing and borders

#### 5.2 ProfilePage
**Current:** Bootstrap card + inline style (maxWidth)  
**Target:** Tailwind card with `max-w-md`

#### 5.3 ShoppingListPage
**Current:** Bootstrap alert  
**Target:** Tailwind info box

#### 5.4 NotFoundPage
**Current:** Bootstrap centering + button  
**Target:** Tailwind flex centering + styled button

**Acceptance Criteria:**
- [ ] All pages render correctly
- [ ] Consistent visual language across all pages

---

### Phase 6 — Cleanup & Polish
**Goal:** Remove Bootstrap, clean up unused files, final UI polish  
**Estimated effort:** Small  
**Files changed:** Multiple  

**Steps:**
1. Uninstall Bootstrap packages:
   ```bash
   npm uninstall bootstrap react-bootstrap
   ```
2. Remove `@types/react-bootstrap` if present
3. Delete remaining CSS Module files (should be 0 at this point)
4. Delete `global.css` unused classes or consolidate into Tailwind `@layer`
5. Verify no Bootstrap class references remain:
   ```bash
   grep -r "bootstrap" src/ --include="*.tsx" --include="*.ts" --include="*.css"
   grep -r "react-bootstrap" src/ --include="*.tsx" --include="*.ts"
   ```
6. Run full build: `npm run build`
7. Run tests: `npm test`
8. Cross-browser visual check
9. Responsive check at breakpoints: 320px, 768px, 1024px, 1440px

**Acceptance Criteria:**
- [ ] Zero Bootstrap references in codebase
- [ ] `bootstrap` and `react-bootstrap` removed from `package.json`
- [ ] Build passes without errors
- [ ] All tests pass
- [ ] App looks consistent and polished at all breakpoints

---

## 4. UI Improvement Principles

Throughout all phases, apply these design improvements:

### Color Palette
```
Primary:   green-600 (#16a34a) → buttons, active states, accents
Secondary: slate-500 (#64748b) → muted text, secondary actions
Success:   emerald-500 (#10b981) → positive feedback
Danger:    red-500 (#ef4444) → destructive actions, errors
Warning:   amber-500 (#f59e0b) → warnings
Background: slate-50 (#f8fafc) → page background
Surface:   white (#ffffff) → cards, modals
Text:      slate-900 (#0f172a) → primary text
Text muted: slate-500 (#64748b) → secondary text
```

### Design Tokens
- **Shadows:** `shadow-sm` for cards, `shadow-lg` for modals, `shadow-xl` for dropdowns
- **Border Radius:** `rounded-xl` for cards/modals, `rounded-lg` for buttons/inputs, `rounded-full` for badges
- **Transitions:** `transition-all duration-200` for hover effects
- **Focus rings:** `focus:ring-2 focus:ring-green-500 focus:ring-offset-2` for accessibility

### Typography
- Headings: `font-semibold` with `text-slate-900`
- Body: `text-slate-700`
- Captions: `text-sm text-slate-500`

### Component Patterns
- **Cards:** `bg-white rounded-xl shadow-sm border border-slate-200 p-6`
- **Buttons Primary:** `bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-medium transition-colors`
- **Buttons Secondary:** `bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-2`
- **Buttons Danger:** `bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2`
- **Inputs:** `border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500`
- **Badges:** `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`

---

## 5. Execution Order Summary

```
Phase 0 → Setup & Infrastructure
  ↓
Phase 1 → Shared Components (Alert, ConfirmDialog, Layout, Navbar, UserDropdown)
  ↓
Phase 2 → Auth (LoginForm, RegisterForm, LoginPage, RegisterPage)
  ↓
Phase 3 → Calendar (CalendarGrid, DayCell, DayModal, MealAdderModal, MealChips)
  ↓
Phase 4 → Meal Options & Meals (OptionEditModal, OptionsList, MealsSummary)
  ↓
Phase 5 → Remaining Pages (Help, Profile, ShoppingList, NotFound)
  ↓
Phase 6 → Cleanup & Polish (remove Bootstrap, final QA)
```

**Total files to modify:** ~24 components/pages  
**Files to delete:** 6 CSS Module files + unused global.css classes  
**Packages to add:** `tailwindcss`, `@tailwindcss/vite`, `@headlessui/react`, `@heroicons/react`  
**Packages to remove:** `bootstrap`, `react-bootstrap`  

---

## 6. QA Guidelines (Per Phase)

For each phase, the AI agent must:

1. **Before starting:** Read the current component code fully
2. **During migration:** Replace classNames one component at a time, test after each
3. **After migration:**
   - Verify `npm run build` passes
   - Verify `npx tsc --noEmit` passes
   - Check for visual regressions by loading the page
   - Remove any deleted CSS Module imports
   - Ensure no Bootstrap class references remain in migrated files
4. **Commit checkpoint:** After each phase, the code should be in a working state

---

## 7. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Headless UI API differences | Follow official docs, test keyboard navigation |
| Missing Bootstrap-specific behaviors | Map each behavior to Tailwind/Headless UI equivalent before coding |
| Visual regressions | Compare before/after for each component |
| Bundle size increase | Tailwind purges unused CSS; should be smaller than full Bootstrap |
| Test breakage | Update test selectors if needed (role-based selectors preferred) |

---

*This plan is designed for sequential execution by an AI agent. Each phase is self-contained and leaves the app in a working state.*
