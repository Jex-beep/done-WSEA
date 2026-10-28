# M&J Quality Cars: Frontend Design Plan

Status: draft for review. Nothing here is implemented.

## 1. Where the site is today

What the code shows (frontend/src):

- Look: black hero, red accent (#e30613), white car cut-out, hard fade to a white page below. System font stack (`Segoe UI`), no web font.
- Styling: per-component CSS with hardcoded hex values and no shared tokens. `styles.css` is 18 lines. Several templates use inline `style=""`.
- Structure: Home, About, Products (+ detail), Blog (+ detail), Contact, Admin login, 404. Nav has 5 links; footer is separate.
- Admin: edit and delete buttons appear inside the public product cards when logged in.

Problems worth fixing as part of the redesign (found while reading, not cosmetic):

| # | Issue | Where | Why it matters |
|---|-------|-------|----------------|
| 1 | `<head>` with title/meta tags is written inside component templates | products.html (and likely others) | Angular does not move these into the real `<head>`. Titles, descriptions and canonicals are probably not applied. Use `Title` / `Meta` services. |
| 2 | Canonical URL says `mjqualityusedcars.com`, the live domain is `mjqualitycars.com` | products.html | Tells Google the wrong site is canonical. |
| 3 | Viewport meta has `user-scalable=0, maximum-scale=1` | products.html | Blocks pinch zoom; fails WCAG 1.4.4. |
| 4 | Home category links pass `Pick-Up` and `SUV`, filter uses `Pickup` and `Suv` | home.html vs products.html | Clicking those home cards likely shows no filter match. |
| 5 | Clickable `<div>`s (category cards, filter trigger) | home.html, products.html | Not keyboard accessible. |
| 6 | Hero fades to pure white while rest of home is black | home.css | Reads as two different sites stacked. |
| 7 | Admin controls live in the public grid | products.html | Visitors see a different page than the owner; edit logic is mixed into display. |

## 2. Design direction

Purpose: a used-car dealer in Mabalacat, Pampanga. Visitors want to browse stock, trust the dealer, and contact them. The site is a catalogue first, a brand page second.

Audience: local buyers, mostly on phones, many arriving from Facebook or search. They scan price, year, photo and a contact button.

Tone: confident and clean, not flashy. Keep the black and red identity from the logo, but use it as an accent on a calmer base, not as the whole page.

Memorable detail: the car photography. Large, consistently framed photos, with a thin red line used as the only recurring ornament (section dividers, active states, price underline).

Avoid: purple gradients, glass cards, decorative blobs, scroll-triggered animations everywhere.

## 3. Design tokens (new, in `styles.css`)

Define once as CSS custom properties; every component CSS reads these.

- Color: `--ink` #0b0b0c, `--surface` #ffffff, `--surface-alt` #f4f4f5, `--line` #e4e4e7, `--muted` #5b5b63, `--brand` #e30613 (verify contrast: use `--brand-dark` #b8000d for small text on white).
- Type: one display face and one text face (for example a condensed grotesque for headings, plus a readable sans for body, self-hosted, `font-display: swap`). Scale: 14 / 16 / 20 / 28 / 40 / 56 with `clamp()` for headings.
- Space: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 72 / 96.
- Radius: 6 for controls, 10 for cards. One elevation shadow.
- Motion: 150 ms (state) and 300 ms (reveal), all disabled under `prefers-reduced-motion`.
- Breakpoints: 480, 768, 1100.

## 4. Page-by-page plan

**Global shell**
- Slim sticky header: logo left, 5 links, one persistent "Call / Message us" button on mobile.
- Mobile nav as a proper button with `aria-expanded`, close on Esc.
- Footer: address, hours, phone, Facebook link, sitemap links. Same on every page.

**Home**
1. Hero: headline, one sentence, two buttons (View Inventory, Contact). One car photo, no radial glow stack. Keep the dark hero but end it with a straight edge or short fade into `--surface-alt`, not a fade to pure white.
2. Browse by type: five tiles, real `<a>` links, labels fixed to match the filter values (issue 4).
3. Latest arrivals: 4 to 6 cards pulled from the API (newest first). Most useful thing a dealer home page can show, and missing today.
4. Trust row: inspection, transparent pricing, after-sale support (existing copy and icons, tightened).
5. Inspection block: keep the two photos, drop the accent-colored card.
6. Closing call to action with phone and map link.

**Products**
- Filter bar: type, price range, year, availability. Chips on mobile in a horizontal scroller, not a dropdown.
- Cards: 4:3 photo, make and model, year, price, one primary button. Sold or reserved shown as a clear badge.
- Skeleton loaders instead of a spinner; clear empty state with a "Message us what you're looking for" link.
- Pagination or "Load more" once stock exceeds about 24.

**Product detail**
- Gallery with thumbnails and keyboard arrows; spec grid (gearbox, fuel, engine, A/C, seats, distance) using the existing icons; sticky contact bar on mobile with Call and Message buttons; related cars row.

**Blog and blog detail**
- Readable article width (about 70 characters), real heading hierarchy, reading time, related posts.

**Contact**
- Form first, with visible labels and inline errors; map and hours beside it. Keep the existing email integration.

**Admin**
- Move add, edit and delete out of the public grid into an `/admin` area behind the login (route guard checking the token). Public pages become display-only. This matches the new server-side auth.

**404**
- Keep the artwork; add links to Inventory and Home.

## 5. Accessibility and SEO baseline (applies everywhere)

- Remove `user-scalable=0` and `maximum-scale`; one viewport tag in `index.html`.
- Per-route title and description through the `Title` and `Meta` services; canonical on the real domain; one `h1` per page.
- Replace clickable divs with links or buttons; visible focus ring; 24 px minimum targets (44 px on touch).
- Alt text on car photos built from make, model, year; decorative icons `alt=""`.
- Contrast check on every red-on-black and red-on-white pairing.
- `LocalBusiness` and `Car` structured data; update `sitemap.xml` for any route changes.
- Images: keep the existing `.webp` files, add `width` and `height`, `loading="lazy"` below the fold, `fetchpriority="high"` on the hero image.

## 6. Build order

1. Tokens and global styles; fix the head and meta handling (issues 1 to 3). No visual change yet, immediate SEO and accessibility gain.
2. Header and footer.
3. Products list and filters, including the type-name fix (issue 4).
4. Product detail.
5. Home.
6. Contact, Blog, 404.
7. Admin area split-out.
8. QA: Lighthouse on mobile, keyboard-only pass, a real mid-range phone, Core Web Vitals.

Each step is a separate commit so any one can be reverted.

## 7. Decisions needed from you and the client

- Keep the black and red identity, or open to a lighter overall look?
- Higher-resolution originals of the logo and photos?
- Contact details to show everywhere: phone, Messenger or Facebook link, address, hours.
- Show price on cards, or "Inquire"?
- Any reference site the client likes.
- Is a separate admin area acceptable, or should editing stay inline?

## 8. Out of scope

Backend changes, hosting or domain migration, new features such as financing calculators or online reservations.
