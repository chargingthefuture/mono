# Design Guidelines: Survivor Support Platform

## Core Principles
**Approach:** Accessibility-First Design System (WCAG AAA compliance)
- Trust Through Clarity: Communicate safety and transparency
- Calm Progression: Gradual complexity, no overwhelming elements
- Respectful Efficiency: Streamline without rushing
- No parallax/scroll animations: Predictable interface for vulnerable users

---

## Typography

**Fonts:**
- Primary: Inter (Google Fonts) - body/headings
- Monospace: JetBrains Mono - codes/payments

**Scale:**
- Hero: `text-5xl md:text-6xl font-bold tracking-tight`
- Page Headings: `text-3xl md:text-4xl font-semibold`
- Section Headings: `text-2xl font-semibold`
- Body: `text-base font-normal leading-relaxed`
- Supporting: `text-sm`, Captions: `text-xs font-medium uppercase tracking-wide`

**Optimization:** Body content `max-w-prose` (65ch), headings `max-w-4xl`, `leading-relaxed` for body

---

## Layout

**Spacing:** Tailwind scale (2, 4, 6, 8, 12, 16)
- Components: `p-4/p-6/p-8`
- Sections: `py-12 md:py-16 lg:py-20`
- Grids: `gap-4/gap-6/gap-8`

**Containers:**
- Desktop: `max-w-7xl mx-auto px-6`
- Content: `max-w-6xl mx-auto px-4`
- Forms: `max-w-2xl`
- Sidebar: `w-64` fixed, `ml-64` main content

**Responsive:** Mobile-first, breakpoints at md(768px), lg(1024px), xl(1280px)

---

## Components

### Landing/Login
**Hero:**
- `min-h-screen` centered, `lg:grid-cols-2`
- Left: Welcome (max-w-xl), Right: Login card
- Background: Full-bleed supportive community imagery (abstract, warm, no faces), gradient overlay

**Login Card:**
- `rounded-2xl shadow-2xl p-8 md:p-10`
- Forms: `space-y-6`, inputs `h-12 rounded-lg border-2 px-4`
- Focus: `ring-4` with 3px offset
- Invite code: Monospace, letter-spaced
- "Secure & Private" badge below form

### Navigation
**Top Bar:** `h-16 sticky top-0` backdrop-blur, logo left, user menu/notifications right
**Admin Sidebar:** `w-64`, icons (Heroicons outline/solid), active state with left border accent

### Dashboard

**Stats Cards:**
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- `p-6 rounded-xl shadow-sm`
- Layout: Icon, Value (`text-3xl tabular-nums`), Label, Trend

**Data Tables:**
- `rounded-lg border shadow-sm`
- Sticky header, `bg-subtle text-sm uppercase tracking-wide`
- Hover rows, right-aligned actions, bottom pagination
- Mobile: Horizontal scroll

**Invite Management:**
- Two columns: Generation form (left) + Recent codes (right)
- Code display: Large monospace, copy button, progress bar for usage

**Payment Tracking:**
- Calendar view, vertical timeline, manual entry form
- Status badges: `rounded-full px-3 py-1 text-xs font-medium`

**Product Catalog (Admin):**
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Cards: Image (`aspect-video`), title, description, type badge, pricing
- Add/Edit modal: `md:max-w-4xl`, tabbed interface

### Forms

**Text Inputs:**
- `h-11 rounded-lg border-2 px-4`
- Label: `text-sm font-medium mb-2`, required asterisk
- Focus: `ring-4` offset, Error: border-error + message
- Helper: `text-xs`

**Selects:** Match input styling, custom Heroicon chevron-down

**Checkboxes/Radio:** `w-5 h-5`, label `ml-3 cursor-pointer`, `ring-4` focus

**Buttons:**
- Primary/Secondary: `h-11 px-6 rounded-lg font-semibold`
- Icon: `w-10 h-10 rounded-lg`
- Disabled: Reduced opacity, `cursor-not-allowed`
- Loading: Spinner replaces content

**Date Picker:** Calendar dropdown, quick presets (Today/Next week/No expiration)

### Modals

**Structure:**
- Overlay: `fixed inset-0 backdrop-blur-sm`
- Container: `max-w-2xl rounded-2xl shadow-2xl`
- Header: `p-6 pb-4 border-b`, close button
- Body: `p-6 max-h-[70vh] overflow-y-auto`
- Footer: `p-6 pt-4 border-t`, right-aligned buttons

**Confirmations:** `max-w-md`, icon top, centered text, Cancel + Confirm

**Toasts:** Top-right, `max-w-sm p-4 rounded-lg shadow-lg`, 5s auto-dismiss with progress bar

### User Profile

**Profile Card:**
- Avatar: `w-20 h-20 rounded-full`
- Vertical mobile, horizontal desktop
- Subscription badge, payment history table/timeline

**Subscription:** Current plan card, grandparented pricing callout, admin "Mark as Paid" with confirmation

---

## Product Catalog (User)

**Layout:**
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`
- Filter sidebar: `w-64` desktop, drawer mobile
- Category tags: Rounded pills with icons

**Cards:**
- `aspect-[4/3]` image, `p-6` content
- Title: `text-xl font-semibold`, Description: `text-sm line-clamp-3`
- Type badge overlay (top-right), prominent pricing
- Full-width CTA button

**Detail View:**
- Full-width hero image with gradient, breadcrumb nav
- Two-column: description + sidebar
- Styled attribute blocks (not raw data)
- Fixed bottom CTA on mobile

---

## Images

**Landing Hero:** Abstract community support (hands joining, light breaking, growing plants), no faces. Gradient overlay for text legibility. Fixed attachment.

**Product Placeholders:** Icon-based (transportation/home icons), `aspect-video`, centered on gradient backgrounds unique per type.

**Empty States:** Simple line art, encouraging

---

## Animations

**Duration & Easing:**
- Modals: Fade + scale (`duration-200`)
- Dropdowns: Slide-down + fade (`duration-150`)
- Toasts: Slide from right (`duration-300`)
- Hover: Instant or `duration-75`
- Loading: Spinner rotation only

**Disabled:** Page transitions, skeleton screens, scroll-triggered effects

---

## Accessibility (AAA Standard)

**Required:**
- Keyboard nav: Full support, `ring-4 offset-2` focus indicators
- Min 44×44px touch targets
- 7:1 contrast ratio (text)
- Semantic HTML + ARIA labels (icon buttons)
- Live regions (notifications)
- Inline form errors with icons
- Respect `prefers-reduced-motion`
- Clear, jargon-free copy

---

Every design decision reinforces safety and empowers users with dignity.