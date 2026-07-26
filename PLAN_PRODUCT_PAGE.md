## Goal
Modernize the product details page UI (layout + product cards) to feel closer to the reference product page, and add a smooth main product image zoom interaction without introducing new dependencies.

## Scope
- Update product details layout to a more modern “gallery + sticky purchase panel” structure.
- Improve related product cards (visual hierarchy, hover, spacing, CTA).
- Add main product image zoom on hover (desktop) and a sensible fallback for touch devices.

## Constraints
- Keep existing data model (no new API fields required).
- No new UI libraries or heavy image zoom packages.
- Preserve current behaviors: add-to-cart, buy-now, package selection, meta pixel tracking.
- Keep server component data fetching unchanged unless needed for UI correctness.

## Proposed UI (High Level)
- **Breadcrumbs**: compact, consistent spacing.
- **Left column**: product content
  - Product gallery (thumbnails + main image)
  - Description section
  - Details section (rich text)
  - Thumbnails (if multiple images are present).
  - Large main image with hover zoom and cursor-based transform origin.
  - Mobile-friendly: no hover zoom; allow tap-to-toggle zoom.
- **Right column (sticky on desktop)**: purchase panel
  - Title, price, stock status.
  - Package selector styled like selectable cards.
  - Quantity stepper.
  - Primary CTAs (Add to Cart / Buy Now).
  - Out-of-stock messaging.
- **Sticky behavior**: Right column stays sticky while the left column scrolls (page scroll).

## Data Handling
- Support multiple images by treating `product.image` as:
  - a single URL, or
  - a comma-separated list of URLs (split + trim + filter empty).
- Keep `details` rendering as rich text HTML (existing behavior).

## Implementation Steps
1. Refactor [ProductClient.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/product/%5Bid%5D/ProductClient.tsx)
   - Introduce local gallery state (`selectedImageIndex`).
   - Implement a small internal `ZoomableImage` component.
   - Rebuild layout with responsive grid and a sticky purchase panel.
   - Restyle package selector and CTAs to match a modern product page pattern.
   - Ensure Description and Details are in the left column beneath the gallery.
2. Update related product cards within `ProductClient`
   - Improve card spacing, hover elevation, consistent CTA.
   - Use the same image parsing approach for related product images.
3. Keep [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/product/%5Bid%5D/page.tsx) as-is unless types require tightening.
4. Verify
   - TypeScript diagnostics (no new errors).
   - Visual check in dev server: hover zoom works, mobile/touch behaves acceptably, CTAs still work.

## Acceptance Criteria
- Main product image smoothly zooms on hover (desktop) and follows cursor position.
- Layout is visually more modern (clear hierarchy, spacing, sticky buy panel on desktop).
- Related product cards look polished and consistent with the new style.
- No new external dependencies added.
