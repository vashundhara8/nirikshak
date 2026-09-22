# Design System

## 1. Visual Identity
**Professional Government Digital Mission + Enterprise Intelligence Platform**

We avoid:
- Cartoonish UI or AI-themed decorative graphics (e.g. AI brain graphics).
- Excessive gradients or futuristic neon UI.
- Excessive rounded cards or unnecessary animations.
- Generic AI dashboard appearance.
- Decorative elements that don't communicate information.

## 2. Color System
- **Primary Navy:** `#0F172A`
- **Primary Teal:** `#0F766E`
- **Light Teal:** `#E8F5F3`
- **Gold:** `#F4B942`
- **Background:** `#F8FAFC`
- **Border:** `#CBD5E1`
- **Primary Text:** `#1E293B`
- **Muted Text:** `#64748B`
- **Success:** `#15803D`
- **Warning:** `#B45309`
- **Error:** `#B91C1C`

## 3. Typography
- **Font Family:** Inter
- **Typography Hierarchy:** Clean, readable, focused on data density and clear headings.

## 4. UI Elements
- **Spacing System:** Based on 4px grid (4, 8, 12, 16, 24, 32...).
- **Button Styles:** Flat or subtle shadows, sharp or slightly rounded corners (e.g., 4px radius).
- **Cards:** White backgrounds with subtle `#CBD5E1` borders, no excessive drop shadows.
- **Tables:** Data-dense, zebra-striped or clear row borders, sticky headers.
- **Badges:** Used for status (Success/Warning/Error color backgrounds with dark text).
- **Status Indicators:** Simple dots or icons.
- **Alerts:** Clear context mapping (Info, Warning, Error).
- **Forms:** Clean inputs with clear label separation and inline validation.
- **Document Viewer:** Integrated PDF.js viewer with zoom/pan.
- **Evidence Panel:** Contextual panels showing VALUE → EVIDENCE → RULE → REASON.
- **Timeline:** Vertical steps indicating lifecycle progress.
- **Charts:** Clean Recharts/ECharts with primary teal and gold accents.
- **Navigation:** Left sidebar for deep navigation, top bar for global context/user.
- **Responsive Behavior:** Graceful degradation on smaller screens, though Officer Workspace targets desktop/tablet.

## 5. Major Screens
1. Landing/Demo page
2. Applicant dashboard
3. Applicant application detail
4. Document upload
5. Officer dashboard
6. Application verification workspace
7. Document viewer
8. Extracted data view
9. Cross-document comparison
10. Policy evaluation view
11. Evidence/explainability panel
12. Deficiency/correction view
13. Exception queue
14. Policy Manager
15. Scholarship lifecycle
16. Analytics
17. Audit trail
18. User/RBAC management

## 6. IMPORTANT: Main Officer Verification Workspace
The officer workspace is the core demonstration of the product's value. It should support a three-panel layout concept:

**LEFT:** Document viewer / uploaded documents
**CENTER:** Extracted structured fields + cross-document comparison
**RIGHT:** Verification findings + policy result + evidence + officer action

The primary screen must visually communicate the following flow left-to-right or top-to-bottom:
**DOCUMENTS → EXTRACTED DATA → VALIDATION → POLICY RESULT → EVIDENCE → OFFICER DECISION**

**Crucial Note:** Evidence should be directly traceable to the source document and page where technically possible.
