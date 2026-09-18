---
name: Executive Precision Financial Intelligence
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#444653'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#003d28'
  on-tertiary: '#ffffff'
  tertiary-container: '#00563a'
  on-tertiary-container: '#5bcf9e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
  slate-surface: '#F8FAFC'
  slate-border: '#E2E8F0'
  slate-border-subtle: '#F1F5F9'
  slate-muted: '#64748B'
  profit-emerald: '#059669'
  profit-emerald-bg: '#ECFDF5'
  risk-amber: '#D97706'
  risk-amber-bg: '#FFFBEB'
  loss-crimson: '#DC2626'
  loss-crimson-bg: '#FEF2F2'
  info-slate: '#475569'
  info-slate-bg: '#F1F5F9'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  kpi-value:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  tabular-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers an institutional-grade financial analytics environment tailored for executive leadership, certified accountants, and strategic decision-makers. The visual tone balances sovereign authority with analytical transparency. Every component reflects meticulous auditability, mathematical integrity, and zero visual ambiguity.

The aesthetic philosophy is **Corporate / Modern High-Density Analytics**. Surfaces eliminate decorative gradients and distracting glass blurs in favor of architectural clarity, structural lines, calm slate foundations, and purposeful visual anchors. Interfaces prioritize high information density without cognitive clutter, allowing financial officers to rapidly assess multi-billion won variances, margin health, and AI-driven narrative audits across complex operations.

## Colors

The color palette is built upon an institutional slate and navy foundation that commands professional trust. Chromatic accents are restricted entirely to deliberate analytical semantics rather than ornamentation.

- **Primary (`#1E40AF`) & Secondary (`#2563EB`)**: Anchor key executive interactions, active tab states, and directional action controls.
- **Profitability Semantic (`#059669`)**: Reserved strictly for positive financial yield, target over-performance, and validated system states (`passed`).
- **Risk Semantic (`#D97706`)**: Applied to moderate operational discrepancies, margin compression, and medium-severity items (`보통`).
- **Critical Semantic (`#DC2626`)**: Dictates audit blockers, negative margins, and high-severity data validation barriers (`높음` / `failed`).
- **Neutral Foundation (`#0F172A`)**: Provides razor-sharp contrast for ledger typography, backed by a crisp `#F8FAFC` canvas and `#FFFFFF` data cards.

## Typography

Typography establishes an unwavering standard of clarity and quantitative precision across Korean accounting terminology and numerical data. 

- **Primary Family (`Inter`)**: Serves as the executive reading engine for navigation, structural headers, metric titles, and natural language AI narrative commentary. In CJK environments, system Pretendard or Apple SD Gothic Neo handles glyph fallbacks identically to preserve optical weight.
- **Monospace Family (`JetBrains Mono`)**: Mandated for all tabular balance sheets, accounting ledger amounts (`KRW`), percentage variances, order IDs, product codes (`BCR-A100`), and API endpoints. 
- **Tabular Figures & Alignment**: All quantitative monetary representations must enforce tabular lining digits (`font-variant-numeric: tabular-nums`) and right-alignment. Left-alignment is restricted strictly to dimension labels, account categorizations, and diagnostic messages.

## Layout & Spacing

The layout model implements an analytical 12-column fluid grid designed to display large matrices of financial data side-by-side with diagnostic AI reasoning.

- **Desktop (>= 1280px)**: 12-column layout with `1.5rem` gutters and `2rem` safe margins. Allows a persistent 4-column summary or narrative panel adjacent to an 8-column high-density ledger or chart matrix.
- **Tablet (768px - 1279px)**: 8-column responsive grid with `1rem` gutters and `1.5rem` margins. Side-by-side panels stack into sequential analysis zones.
- **Mobile (< 768px)**: 4-column layout with `0.5rem` gutters and `1rem` margins. Dense tables pivot into horizontal-scroll data panes with frozen left-hand identifier columns.
- **Spatial Rhythm**: Component interiors strictly leverage a 4px-derived spacing system (`space-xs` through `space-xl`). Micro-data tables utilize compact vertical cell padding (`0.5rem` / `space-sm`) to maximize visible ledger rows within the viewport.

## Elevation & Depth

This design system deliberately minimizes artificial depth, avoiding soft diffuse blurs or floating shadows that degrade data legibility. Visual order is articulated through crisp, structural boundaries and tonal surface containment.

- **Surface Layering**: The primary foundation rests on an off-white slate backdrop (`#F8FAFC`). Data panels, KPI modules, and grid containers rise onto pure `#FFFFFF` sheets.
- **Low-Contrast Structural Outlines**: Rather than relying on drop shadows, cards and modular containers are bounded by sharp, 1px low-contrast borders (`#E2E8F0`). Secondary nested zones (such as calculation callouts or parameter filters) drop into a muted inner tier (`#F1F5F9`).
- **Elevation via Popovers**: Flyouts, audit modal disclosures, and date pickers use a precise, direct shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`, bounded cleanly with an active structural ring (`#CBD5E1`).

## Shapes

The geometric framework follows a soft, tailored discipline (`roundedness: 1`). Radii are kept small and structured (`0.25rem` / 4px) to retain an analytical, ledger-like precision without harsh brutalist points.

- **Standard Elements (4px / `0.25rem`)**: Action buttons, input controls, KPI container cards, and micro-table boundaries.
- **Group Containers (8px / `0.5rem`)**: Master dashboard panes, modal dialogue wrappers, and upload drop zones.
- **Status Pills**: Pill radii are strictly reserved for audit tags and severity badges (`1rem`) to distinguish atomic status metadata from interactive rectangular controls.

## Components

### Action Buttons
- **Primary**: Solid corporate blue (`#1E40AF`) background, white typography (`#FFFFFF`), `0.25rem` corner radius, 8px vertical padding, 16px horizontal padding. Subtle hover shifts to `#1D4ED8`.
- **Secondary / Audit Action**: Surface white (`#FFFFFF`) with 1px slate outline (`#CBD5E1`), text `#0F172A`. Hover transitions to `#F8FAFC`.
- **Destructive**: Crisp crimson border (`#DC2626`) with light tint (`#FEF2F2`), text `#DC2626`.

### Financial KPI Cards
- White background (`#FFFFFF`), 1px solid `#E2E8F0` border, `0.25rem` radius, `1.25rem` interior padding.
- Top row: Metric label in uppercase slate (`#64748B`, `label-md`) coupled with an audit trail indicator or tooltip icon.
- Value row: High-contrast numerical readout (`kpi-value`, `#0F172A`).
- Footnote: Contextual delta pill showing green (`#ECFDF5` / `#059669`) or red (`#FEF2F2` / `#DC2626`) percentage variance alongside prior-period comparison text.

### Micro-Data Ledger Tables
- Table header: `#F8FAFC` background, bottom border 2px solid `#E2E8F0`, uppercase text (`#475569`, `label-md`), height 36px.
- Table body rows: White `#FFFFFF`, height 40px, separated by 1px `#F1F5F9` borders. Hover state shifts row surface to `#F8FAFC`.
- Alignment: Text columns left-aligned; codes and identifiers centered; all financial figures and currency metrics right-aligned using `tabular-data` typography.

### Validation & Severity Badges
- Compact pill presentation (`rounded-full`, vertical padding 2px, horizontal padding 8px, `label-md`).
- **High Severity (`높음` / `failed`)**: Background `#FEF2F2`, border 1px solid `#FCA5A5`, text `#DC2626`.
- **Medium Severity (`보통`)**: Background `#FFFBEB`, border 1px solid `#FCD34D`, text `#D97706`.
- **Low Severity / Success (`낮음` / `passed`)**: Background `#ECFDF5`, border 1px solid `#A7F3D0`, text `#059669`.

### AI Narrative Insight Callout
- Distinct container embedded within analytical dashboards. Background `#F8FAFC` with a left structural accent border (3px solid `#2563EB`).
- Top metadata bar identifying model version, calculation reference date, and audit confidence score.
- Body formatted in `body-md` slate (`#334155`), highlighting critical variance drivers directly inline using bold mono chips.

### Form Inputs & Selectors
- Height 36px, `0.25rem` radius, border 1px solid `#CBD5E1`, background `#FFFFFF`. Focus ring: 2px solid `#2563EB` with zero offset blur.