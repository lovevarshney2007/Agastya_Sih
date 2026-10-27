# DESIGN SYSTEM — Agastya SIH / APAAR Portal

## Anti-AI Design Philosophy
This is a government institutional platform. The design must communicate:
- Trust, Security, Institutional Authority, Accuracy, Accessibility
- NOT: generic SaaS, marketing website, AI portfolio project

## Anti-Pattern Rules (Strictly Avoided)
- Purple-to-blue gradients on every page
- Glowing glassmorphism backgrounds on every card
- Fake floating decorative shapes
- Emoji as primary icons (use Lucide icons exclusively)
- Giant hero headings inside administrative portals
- Repeated identical 3-card or 4-card grids across unrelated pages
- Fake charts with meaningless statistics
- Animated particles or confetti in operational UIs
- Random badge decorations beside every heading
- Gradient text on body content

## Color System (Tailwind CSS 4)
### Government-appropriate Palette
- Primary: Indigo-700 / Blue-700 (institutional authority)
- Accent: Emerald-600 (positive/verified status)
- Warning: Amber-600 (caution / pending)
- Error/Critical: Red-600 (violations, rejections)
- Status-Neutral: Slate-500 (secondary information)

### Status Colors (meaningful only)
- VERIFIED / VALID: text-emerald-700, bg-emerald-50, border-emerald-200
- PENDING: text-amber-700, bg-amber-50, border-amber-200
- REJECTED / CRITICAL: text-red-700, bg-red-50, border-red-200
- FLAGGED: text-orange-700, bg-orange-50, border-orange-200
- HOLD: text-blue-700, bg-blue-50, border-blue-200

## Typography
- Font Sans: Inter (loaded from Google Fonts or system fallback)
- Font Mono: JetBrains Mono (for APAAR IDs, hashes, codes)
- Hindi: Noto Sans Devanagari (to be added when full HI support implemented)
- Body: text-sm (14px) for dense institutional data tables
- Headings: Controlled hierarchy, no giant decorative headings in portals

## Layout Principles
- Max content width: max-w-7xl (institutional dashboards need space)
- Sidebar navigation preferred over tab-soup for portals
- Tables: primary data display format for registries and audit logs
- Cards: only for summarized KPI metrics, not everything
- Forms: clean, labeled, compact - not expanded decorative forms

## Component Standards
- Buttons: Use purpose-appropriate sizes (sm for table actions, md for primary CTA)
- Icons: Lucide only, consistent size (w-4 h-4 inline, w-5 h-5 standalone)
- Badges/Chips: Only for status values, not decorative
- Modals: Focused, form-only - not decorative sheets
- Loading: Spinner + text description (not full-page overlays)
- Empty states: Informative text + appropriate action

## Page-Specific Design Notes
- Institution Portal: Dense registry table primary, KPI strip secondary
- AICTE Portal: Violation workbench primary, dual-officer workflow visible
- Verifier Portal: Search-first workflow, minimal decoration
- Student Portal: Clarity-first, privacy-forward, Hindi-friendly
- Analytics: Accurate data charts only, no decorative statistics
