# Product Status And Archive Plan

## Purpose

This document is the implementation plan for adding a proper product lifecycle to the Fresh Bazar codebase.

Target lifecycle:

- `ACTIVE`: product is visible on the website
- `INACTIVE`: product is hidden from the website but still manageable in admin
- `ARCHIVED`: product is retired from normal catalog flow and preserved for history

This plan also fixes the current delete problem in an industry-standard way:

- if a product is already referenced by an order, do not physically delete it
- archive it instead
- preserve order history and referential integrity

No application code is changed in this step. This file is the approved implementation plan only.

## Review Of Current State

The current codebase already supports product CRUD, reorder, public listing, and order history, but it does not yet support business lifecycle state.

Observed current behavior:

- [schema.prisma](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/prisma/schema.prisma) has `Product.sequence` but no `status` or `archivedAt`
- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/admin/products/route.ts) lists all products for admin with no status filter
- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/admin/products/%5Bid%5D/route.ts) blocks delete when `OrderItem` exists, which is correct for data integrity but incomplete for business workflow
- [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/page.tsx) loads homepage products without filtering by lifecycle state
- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/products/route.ts) returns public products without filtering by lifecycle state
- [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/fruits/page.tsx) loads catalog products without filtering by lifecycle state
- [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/product/%5Bid%5D/page.tsx) shows product details for any existing product, regardless of lifecycle state
- [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/orders/page.tsx), [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/orders/route.ts), and [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/orders/%5Bid%5D/route.ts) already rely on snapshot fields like `productName` and `productImage`, which is good for archived-product history

## Review Of Existing Plan

The previous version of this plan was directionally correct and already recommended the right high-level solution:

- use enum-based product status instead of a boolean
- hide inactive and archived products from the storefront
- archive instead of delete when order history exists
- preserve old order data

What needed refinement:

- align the plan more closely with the exact files currently used by this project
- account for the real storefront data flow in [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/page.tsx), [HomePageClient.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/HomePageClient.tsx), [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/fruits/page.tsx), and [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/product/%5Bid%5D/page.tsx)
- clarify delete behavior so the admin receives a success outcome with `action: "archived"` instead of a confusing failure
- define reorder rules relative to status
- define how Swagger should document both archive and delete outcomes
- explain why order endpoints do not need structural changes for archived products

## Recommended Business Rules

### Product Status Rules

- `ACTIVE`
  - visible on homepage
  - visible on fruits listing
  - visible on public product detail page
  - purchasable when `stock > 0`
  - included in public sequence/reorder logic

- `INACTIVE`
  - hidden from homepage
  - hidden from fruits listing
  - public product detail should return `notFound()`
  - still visible and editable in admin
  - not purchasable
  - should not participate in public-facing reorder meaning

- `ARCHIVED`
  - hidden from all public pages and public APIs
  - hidden from default admin list unless archive filter is selected
  - visible in admin archive view/filter
  - not purchasable
  - not reorderable with active catalog products
  - preserved for order history and internal lookup

### Delete And Archive Rules

- Never hard delete a product that has one or more `OrderItem` references
- If a product has order history, convert delete intent into archive behavior
- Allow hard delete only for products with no order history
- Recommended stricter rule: allow permanent delete only when product is already `ARCHIVED`

This is the safest production pattern for commerce systems because historical order references must remain valid.

### Order History Rules

- Existing orders must continue to show `productName`, `productImage`, quantity, price, and package snapshot values from `OrderItem`
- Archived products must still appear correctly in customer order history and admin order history
- Customer order pages should not break if the original product is inactive or archived later

## Data Model Plan

### Target File

- [schema.prisma](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/prisma/schema.prisma)

### New Enum

```prisma
enum ProductStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

### Product Model Changes

Add these fields to `Product`:

```prisma
status     ProductStatus @default(ACTIVE)
archivedAt DateTime?
```

Recommended model shape:

- `status` controls business lifecycle
- `archivedAt` stores when archival happened
- `stock` remains separate from lifecycle state
- `sequence` remains the ordering field for visible catalog order

### Migration And Backfill

- backfill all existing products to `ACTIVE`
- set `archivedAt = null` for all existing rows
- regenerate Prisma client after migration

### Optional Indexes

Recommended additional indexes:

```prisma
@@index([status, sequence])
@@index([status, createdAt])
```

These help admin filtering and public active-only queries.

## API Plan

### 1. Admin Product List API

Target file:

- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/admin/products/route.ts)

Current behavior:

- returns paginated products
- no lifecycle filter

Required changes:

- accept `status` query param
- supported values:
  - `ACTIVE`
  - `INACTIVE`
  - `ARCHIVED`
  - `all`
- recommended default:
  - return `ACTIVE` and `INACTIVE`
  - exclude `ARCHIVED` unless explicitly requested

Response additions:

- include `status`
- include `archivedAt`

Recommended filter semantics:

```ts
status=ACTIVE
status=INACTIVE
status=ARCHIVED
status=all
```

### 2. Admin Product Update API

Target file:

- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/admin/products/%5Bid%5D/route.ts)

Current behavior:

- updates normal product fields
- replaces packages
- no lifecycle handling

Required changes:

- accept `status` in `PUT`
- validate against allowed enum values
- on transition to `ARCHIVED`:
  - set `archivedAt = new Date()`
- on transition from `ARCHIVED` to `ACTIVE` or `INACTIVE`:
  - set `archivedAt = null`

Recommended validation:

- reject unknown `status`
- keep slug uniqueness behavior
- keep existing package replacement logic

Recommended optional behavior:

- if archiving via edit flow, optionally set `stock = 0`
- do not silently change `sequence` unless business rule explicitly requires it

### 3. Admin Delete Endpoint

Target file:

- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/admin/products/%5Bid%5D/route.ts)

Current behavior:

- deletes cart items
- checks order item references
- throws error if order references exist
- deletes packages and product only when safe

Recommended industry-standard replacement:

1. Check whether the product has `OrderItem` references
2. If yes:
   - do not throw a conflict for the admin workflow
   - update product to `status = ARCHIVED`
   - set `archivedAt = new Date()`
   - optionally set `stock = 0`
   - optionally delete related cart items so it can no longer remain in active carts
   - return success payload with action metadata
3. If no:
   - remove dependent cart items
   - remove packages
   - permanently delete product
   - return success payload with action metadata

Recommended success payloads:

```json
{
  "message": "Product archived because it exists in order history",
  "action": "archived"
}
```

```json
{
  "message": "Product deleted successfully",
  "action": "deleted"
}
```

Recommended stricter permanent-delete policy:

- if product has no orders but is still `ACTIVE` or `INACTIVE`, either:
  - archive first, then allow permanent delete, or
  - show a confirmation that this is a permanent delete

Preferred business rule:

- permanent delete is allowed only when product has no orders and is already `ARCHIVED`

That rule prevents accidental deletion of active catalog items.

### 4. Admin Reorder Endpoint

Target file:

- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/admin/products/reorder/route.ts)

Recommended rule:

- allow reorder only for `ACTIVE` products

Reason:

- sequence only matters for public storefront ordering
- archived products should not interfere with live catalog positioning
- inactive products should not shift active storefront order unexpectedly

Implementation options:

- simplest: only enable drag-and-drop in UI when current filter is `ACTIVE`
- stronger: validate on API side that all reordered items are `ACTIVE`

### 5. Public Products API

Target file:

- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/products/route.ts)

Required change:

- filter by `status = ACTIVE`

Recommended query shape:

```ts
where: { status: 'ACTIVE' }
```

Keep:

- sequence ordering
- existing category/package selection

### 6. Order APIs

Target files:

- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/orders/route.ts)
- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/orders/%5Bid%5D/route.ts)

Recommended position:

- no schema-level lifecycle changes are required in these endpoints for archived products
- they already read order snapshots from `OrderItem`
- keep returning historical order data even if referenced products become inactive or archived

Optional future enhancement:

- document clearly in Swagger that order items represent a historical snapshot and should remain visible after archival

## Storefront Plan

### Homepage Query

Target file:

- [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/page.tsx)

Current behavior:

- selects first 8 products by `sequence`
- no lifecycle filter

Required change:

- fetch only `ACTIVE` products

Recommended query addition:

```ts
where: { status: 'ACTIVE' }
```

### Homepage Client

Target file:

- [HomePageClient.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/HomePageClient.tsx)

Recommended approach:

- keep filtering on the server in `src/app/page.tsx`
- `HomePageClient.tsx` should receive only already-public products
- no major behavior change is needed here beyond possible type updates if `status` is passed through

### Fruits Listing

Target file:

- [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/fruits/page.tsx)

Current behavior:

- queries all products ordered by `sequence`

Required change:

- query only `ACTIVE` products

### Product Detail Page

Target file:

- [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/product/%5Bid%5D/page.tsx)

Current behavior:

- returns any found product

Required change:

- if product is not `ACTIVE`, return `notFound()`
- related products query should also include only `ACTIVE` products

Recommended rule:

- inactive and archived products are not directly accessible on the public site, even if someone has the URL

## Admin UI Plan

### 1. Product List Page

Target file:

- [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/admin/products/page.tsx)

Current behavior:

- paginated products
- drag-and-drop reorder
- edit and delete actions
- no lifecycle filtering or badges

Required changes:

- add status badge on mobile cards and desktop rows
- add filter control:
  - Active
  - Inactive
  - Archived
  - All
- add quick status actions:
  - Activate
  - Deactivate
  - Archive
- update delete toast handling using returned `action`

Recommended badge colors:

- `ACTIVE`: green
- `INACTIVE`: yellow or neutral
- `ARCHIVED`: slate or red

Recommended delete UX:

- if response action is `archived`, show toast like:
  - `Product archived because it exists in order history`
- if response action is `deleted`, show normal delete success toast

Recommended reorder UX:

- enable drag-and-drop only when viewing `ACTIVE`
- disable reorder in `ARCHIVED`
- optionally disable reorder in `INACTIVE`

### 2. Product Edit Page

Target file:

- [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/admin/products/%5Bid%5D/edit/page.tsx)

Required changes:

- add status field to form
- fetch existing `status`
- submit `status` in update payload

Recommended UI:

- select input with:
  - Active
  - Inactive
  - Archived

Recommended helper text:

- `INACTIVE`: `This product will be hidden from the website`
- `ARCHIVED`: `This product will be retired from the storefront and normal admin listing`

### 3. Admin Dashboard

Target files:

- [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/admin/page.tsx)
- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/admin/stats/route.ts)

Recommended enhancement:

- add separate product counts for:
  - active products
  - inactive products
  - archived products

Minimum acceptable improvement:

- add a quick link from dashboard to archived products filter

## Swagger Plan

### Target File

- [swagger.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/lib/swagger.ts)

Required documentation updates:

- add `ProductStatus` enum schema
- add `status` and `archivedAt` to `Product`
- add `status` to `ProductInput` or introduce a separate admin update schema if needed
- document admin product list `status` query parameter
- document delete endpoint with two success outcomes:
  - archived
  - deleted
- document that public product endpoints return active products only
- optionally clarify that order items are historical snapshots

Recommended schemas:

```ts
ProductStatus: {
  type: 'string',
  enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED']
}
```

Add to product schema:

```ts
status: { $ref: '#/components/schemas/ProductStatus' }
archivedAt: { type: 'string', format: 'date-time', nullable: true }
```

## Customer Orders Plan

### Orders Page

Target file:

- [page.tsx](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/orders/page.tsx)

Recommended behavior:

- no product lifecycle filtering is required here
- customers should still see purchased items even if the product later becomes inactive or archived

Why:

- order history is a legal and business record
- the page already renders `productName`, `productImage`, and pricing snapshot fields from order items

### Orders API

Target files:

- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/orders/route.ts)
- [route.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/orders/%5Bid%5D/route.ts)

Recommended behavior:

- no lifecycle-based filtering should remove historical order items
- order retrieval should remain unchanged unless additional metadata is desired later

## Cache And Revalidation Plan

Whenever a product changes status, is archived, restored, or permanently deleted:

- revalidate `products` tag
- ensure homepage, fruits listing, and product detail caches are refreshed consistently

Required affected areas:

- homepage product cache
- fruits page product cache
- public product API cache behavior
- admin list views

## Edge Cases

- `ACTIVE` with `stock = 0`
  - still visible publicly
  - not purchasable
  - different from `INACTIVE`

- `INACTIVE` restored to `ACTIVE`
  - should become visible again
  - keep `archivedAt = null`

- `ARCHIVED` restored to `ACTIVE`
  - clear `archivedAt`
  - preserve old `sequence` or append to end based on chosen business rule
  - recommended simpler rule: preserve existing sequence unless it conflicts with active-only reorder strategy

- direct links to inactive or archived products
  - must return 404 on public side

- carts containing a product that becomes archived
  - recommended cleanup: remove cart items for that product during archive flow

- hard delete on product with packages but no orders
  - packages and cart items should be removed before delete as already done today

- archived product in old orders
  - order page must continue to render historical snapshot data normally

## Recommended Final Policy

- `ACTIVE`: public and purchasable when stock is available
- `INACTIVE`: hidden from public, still editable in admin
- `ARCHIVED`: retired from public and normal admin flow, preserved for history
- public pages and public APIs show only `ACTIVE` products
- public product detail page returns 404 for non-active products
- reorder applies only to `ACTIVE` products
- products with order history are archived, never hard deleted
- permanent delete is only for products without order history, ideally only after they are already archived

## Suggested Implementation Order

### Phase 1. Schema

- add `ProductStatus` enum
- add `status`
- add `archivedAt`
- run migration and backfill existing products to `ACTIVE`

### Phase 2. Admin APIs

- update admin list API with status filtering
- update admin product `GET` and `PUT` to include and accept `status`
- replace delete conflict behavior with archive fallback
- align reorder rules with active-only products

### Phase 3. Admin UI

- add status badge and filters to product list
- add activate, deactivate, and archive actions
- add status field to product edit page
- update delete toast behavior based on returned action

### Phase 4. Storefront

- filter homepage to `ACTIVE`
- filter fruits page to `ACTIVE`
- filter public products API to `ACTIVE`
- return 404 for inactive and archived product detail pages

### Phase 5. Dashboard And Docs

- add product status counts to admin stats and dashboard
- update Swagger for new enum, fields, filters, and delete/archive response behavior

## Decision Summary

This is the recommended industry-standard solution for this project:

- use lifecycle status instead of hard delete as the main control for visibility
- preserve order-linked products through archive, not deletion
- keep customer order history intact through `OrderItem` snapshot fields
- allow the storefront to show only `ACTIVE` products
- let admin manage `ACTIVE`, `INACTIVE`, and `ARCHIVED` products intentionally
