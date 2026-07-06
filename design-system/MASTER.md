# Sanjeevani Hospital — Design System (Master)

Source of truth for all pages. Page-specific overrides go in `design-system/pages/<page>.md`.

## 1. Brand direction

**Concept:** "Sanjeevani" is the mythical life-restoring herb — the brand leans on **healing green/teal** with a clean clinical white base. Tone: trustworthy, calm, accessible to rural patients. The mission line "serving needy and poor patients" is a core brand message, not a footnote.

**Style:** Modern medical minimalism — flat design, soft shadows, rounded cards, generous whitespace. NO glassmorphism, brutalism, neumorphism, or heavy animation (wrong tone for healthcare + slow on low-end devices).

## 2. Color tokens

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#0D9488` (teal-600) | Buttons, links, section accents, icons |
| `--primary-dark` | `#0F766E` (teal-700) | Hover states, header/footer accents |
| `--primary-light` | `#CCFBF1` (teal-100) | Icon chips, badges, highlights |
| `--surface` | `#FFFFFF` | Cards, header |
| `--surface-alt` | `#F0FDFA` (teal-50) | Alternating sections |
| `--surface-muted` | `#F8FAFC` (slate-50) | Alternate neutral sections |
| `--text` | `#0F172A` (slate-900) | Headings, body |
| `--text-muted` | `#475569` (slate-600) | Secondary text (4.5:1 on white ✓) |
| `--emergency` | `#DC2626` (red-600) | Emergency badge/CTA ONLY — never decorative |
| `--whatsapp` | `#25D366` | WhatsApp buttons only |
| `--border` | `#E2E8F0` (slate-200) | Card borders, dividers |
| `--footer-bg` | `#134E4A` (teal-900) | Footer |

Rules: semantic tokens only in components (no raw hex). Red is reserved for emergency. Contrast ≥4.5:1 for text, ≥3:1 for large text/icons.

## 3. Typography

- **Headings:** Poppins (600/700) — geometric, friendly-professional, widely legible
- **Body:** Inter (400/500) — highly readable at small sizes
- **Telugu fallback:** Noto Sans Telugu must be in every font stack (Poppins/Inter have no Telugu glyphs):
  `font-family: 'Poppins', 'Noto Sans Telugu', sans-serif;` (headings)
  `font-family: 'Inter', 'Noto Sans Telugu', sans-serif;` (body)
- **Scale:** 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48px. Body base **18px mobile / 18px desktop** (older rural audience — err large), line-height 1.6, headings 1.2
- Load via Google Fonts with `font-display: swap`, preload only the two critical weights

## 4. Spacing, layout, radius, shadow

- **Spacing:** 8px scale (4/8/16/24/32/48/64/96). Section padding: 64px desktop / 48px mobile
- **Container:** `max-width: 1152px` (max-w-6xl), 16px side gutters mobile, 24px tablet+
- **Breakpoints:** 375 / 768 / 1024 / 1440 — mobile-first
- **Radius:** cards 16px, buttons 10px, badges/chips 999px
- **Shadow scale:** `sm: 0 1px 3px rgb(0 0 0 / .08)`, `md: 0 4px 12px rgb(0 0 0 / .10)` — nothing heavier
- **Z-index scale:** 0 / 10 (sticky header) / 40 (floating buttons) / 100 (mobile menu)

## 5. Components

- **Buttons:** min-height 48px, padding 12px 24px, font-weight 600, cursor pointer, visible focus ring (2px offset teal), pressed state darkens. One primary CTA per screen section.
- **Sticky header:** logo left, nav center/right, "Call Now" button always visible. Collapses to hamburger <1024px.
- **Mobile sticky bottom bar** (≤768px): 3 equal actions — 📞 Call / WhatsApp / Directions — each ≥48px tall, labeled icon+text (SVG icons, never emoji in production markup).
- **Floating WhatsApp button:** bottom-right desktop, hidden on mobile (bottom bar covers it).
- **Cards:** white surface, 1px border, radius 16, shadow-sm, hover lift = shadow-md + translateY(-2px), 150ms ease-out.
- **Icons:** Lucide (stroke 2px), single style, inline SVG, sized via tokens (20/24/32).
- **Emergency strip:** thin red-tinted bar or badge near hero — "24×7 Emergency — Call 090105 90108" click-to-call.

## 6. Imagery

- Real photos preferred; demo images live in `assets/images/` — keep original names, reference from HTML.
- Hero: photo with dark teal gradient overlay (`linear-gradient(to right, rgb(15 118 110 / .92), rgb(15 118 110 / .45))`) so white text always passes contrast.
- All images: explicit width/height (no CLS), `loading="lazy"` below the fold, WebP where possible, compress ≤200KB each.
- No stock-photo clichés (handshake doctors, fake smiles) if real photos exist.

## 7. Motion

- Micro-interactions 150–300ms, ease-out enter / ease-in exit, transform+opacity only
- Scroll-reveal: subtle fade-up 16px, once, staggered 50ms — respect `prefers-reduced-motion` (disable all)
- No carousels that auto-move faster than 6s; prefer static review grid on mobile

## 8. Accessibility & performance budget

- Semantic HTML5 landmarks, h1→h6 in order, skip-link, alt text on all meaningful images
- All interactive elements keyboard-reachable; `aria-label` on icon-only buttons
- `tel:` and `https://wa.me/` links for call/WhatsApp; input types `tel`/`email` on forms
- Page weight target ≤1MB, no JS framework — vanilla HTML/CSS/JS, single stylesheet
- `viewport` meta with zoom enabled; no horizontal scroll at 375px

## 9. Voice & content rules

- English primary, key headings dual-language (Telugu subtitle) — full Telugu toggle in Phase 2
- Simple sentences, no medical jargon; numbers as trust signals (24×7, 4.0★, years serving)
- Every page ends with a contact CTA block (call + WhatsApp + directions)
