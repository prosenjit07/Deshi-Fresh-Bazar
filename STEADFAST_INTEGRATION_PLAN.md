# Steadfast Integration Plan

## Goal
- Review the existing Fresh Bazar order, product, tracking, auth, and API documentation flow.
- Study the local Steadfast PDF and public Steadfast references.
- Produce a proper integration plan for Steadfast courier without changing application code yet.

## Review Scope
- `SteadFast API Documnetation.pdf`
- `src/lib/swagger.ts`
- `src/app/product/`
- `src/app/api/orders/`
- `src/app/track-order/page.tsx`
- `prisma/schema.prisma`
- `.env`
- `src/app/page.tsx`
- `src/middleware.ts`

## Research Tasks
1. Extract as much useful information as possible from the local PDF documentation.
2. Review public Steadfast API references, SDKs, and examples from the web and GitHub.
3. Map Steadfast concepts to the current project:
   - order creation
   - shipment creation
   - delivery status tracking
   - webhook/event handling
   - admin and customer tracking flows
4. Identify required credentials, endpoints, payload fields, status fields, and security requirements.
5. Compare current project APIs and database schema against Steadfast requirements.

## Expected Deliverables
- Recommended integration architecture
- Required backend changes
- Required database changes
- Required API changes
- Required UI changes
- Risks, assumptions, and missing information
- Suggested phased implementation order

## Current Project Findings
- Orders are created only in the local database through `src/app/api/orders/route.ts`.
- Customer tracking UI in `src/app/track-order/page.tsx` calls `/api/orders/{id}` using an internal order ID.
- `/api/orders/{id}` currently requires an authenticated user and does not support guest tracking.
- The database stores local order information but does not store courier shipment identifiers such as consignment ID, invoice, tracking code, merchant balance snapshots, webhook event history, or Steadfast raw responses.
- Swagger docs in `src/lib/swagger.ts` currently describe only the local app APIs and do not include any courier integration endpoints.
- `.env` already contains Steadfast credentials and a custom base URL, but the exact production endpoint should be verified against the active Steadfast merchant environment before implementation.

## Public Steadfast Findings
- Public references consistently show these merchant operations:
  - create order
  - status by consignment ID
  - status by invoice
  - status by tracking code
  - get balance
- Public examples use payload fields such as:
  - `invoice`
  - `recipient_name`
  - `recipient_phone`
  - `recipient_address`
  - `cod_amount`
  - `note`
- Some public examples also show optional shipment detail fields such as:
  - `alternative_phone`
  - `recipient_email`
  - `item_description`
  - `delivery_type`
  - item arrays with `description` and `weight`
- Public SDK examples show shipment creation returning shipment or consignment data that includes a tracking identifier and delivery status lookup methods for:
  - consignment ID
  - invoice
  - tracking code
- Public webhook-capable SDKs exist, which suggests webhook-driven status synchronization is a better long-term architecture than polling only.

## Recommended Integration Shape
1. Keep local order creation as the source of truth for checkout and payment method selection.
2. After a valid COD order is created locally, create a Steadfast shipment from the server only.
3. Use the local order ID as the source for a deterministic Steadfast `invoice` value.
4. Persist returned courier identifiers in the database:
   - `steadfastInvoice`
   - `steadfastConsignmentId`
   - `steadfastTrackingCode`
   - `steadfastStatus`
   - `steadfastStatusNote`
   - `steadfastCreatedAt`
   - `steadfastSyncedAt`
   - `steadfastRawResponse`
5. Add a dedicated tracking flow for guests and users that can search by:
   - internal order ID
   - Steadfast invoice
   - Steadfast tracking code
6. Prefer webhook updates if available for the merchant account; otherwise add a secure manual sync or scheduled sync path.

## Required Data Model Changes
- Extend `Order` with courier integration fields:
  - `courierProvider`
  - `courierInvoice`
  - `courierConsignmentId`
  - `courierTrackingCode`
  - `courierStatus`
  - `courierStatusRaw`
  - `courierShipmentCreatedAt`
  - `courierLastSyncedAt`
  - `courierError`
- Consider a separate `CourierEvent` table if you want webhook history, retries, audit, and debugging.
- Keep local order status and courier status separate, then map them explicitly.

## Required API Changes
- Add an internal Steadfast service layer instead of calling Steadfast directly from route handlers.
- Add local server-side endpoints or internal actions for:
  - create Steadfast shipment for an order
  - fetch status by internal order
  - fetch status by tracking code
  - manual admin sync
  - webhook receive endpoint if merchant webhooks are available
- Update Swagger to document all courier-related internal endpoints and payloads.
- Do not expose API secret keys to the client.

## Required UI Changes
- `track-order` should not rely only on authenticated `/api/orders/{id}`.
- Tracking UI should accept a public-safe lookup value, preferably:
  - order ID plus phone, or
  - Steadfast tracking code, or
  - Steadfast invoice
- Product pages do not require direct Steadfast integration.
- Checkout or order success UI should display the shipment creation state and later show the courier tracking code when available.

## Risks And Gaps
- The local PDF could not be text-extracted with the available tools, so the final endpoint and authentication details must be confirmed directly from the original merchant documentation or dashboard.
- The configured `STEADFAST_BASE_URL` should be verified because public references commonly mention `portal.packzy.com/api/v1` flows while some SDKs abstract the URL entirely.
- The current tracking page and order detail API do not support guest order tracking.
- There is no persistence yet for courier IDs or sync results, which makes reliable tracking impossible after integration.
- Status names returned by Steadfast should be mapped carefully to the local `OrderStatus` enum instead of overwriting local fulfillment logic blindly.

## Suggested Phases
1. Confirm official endpoint base URL, authentication headers, webhook availability, and exact response schema from the merchant docs.
2. Add database fields for Steadfast shipment identifiers and sync metadata.
3. Build a server-only Steadfast client wrapper with error handling and retries.
4. Create shipment immediately after successful COD order creation.
5. Store shipment response data and expose internal admin debug endpoints.
6. Build public-safe tracking by invoice or tracking code.
7. Add webhook ingestion or scheduled sync for status updates.
8. Update Swagger and admin tooling for shipment visibility and manual resync.


**Plan Stage**
- Scope confirmed for Steadfast planning only, with zero implementation edits in this step.
- Planning baseline uses these artifacts: [STEADFAST_INTEGRATION_PLAN.md](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/STEADFAST_INTEGRATION_PLAN.md), [swagger.ts](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/lib/swagger.ts), [schema.prisma](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/prisma/schema.prisma), [track-order page](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/track-order/page.tsx), [checkout success](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/checkout/success/page.tsx), [checkout page](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/checkout/page.tsx), [orders page](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/orders/page.tsx), admin UI in [src/app/admin](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/admin/), and admin APIs in [src/app/api/admin](file:///Users/prosenjitchandrabiswas/Downloads/Telegram%20Desktop/Song/freshbazar_app/src/app/api/admin/).

**Current-State Snapshot**
- Local order lifecycle exists and is the source of truth for checkout/order creation.
- Public order tracking now exists via `/api/orders/{id}` behavior used by track-order and success page.
- No courier-specific persistence fields exist in Prisma yet.
- No Steadfast integration endpoints or webhook routes exist in admin/public APIs.
- Swagger currently documents app APIs but not Steadfast integration contracts.
- Local PDF is present but not text-extractable in current tooling, so endpoint/auth details must be revalidated directly from merchant docs/dashboard.

**Target Integration Shape**
- Keep current checkout flow intact, then create Steadfast shipment server-side after local order creation.
- Use deterministic invoice mapping from local order ID.
- Store courier identifiers and sync metadata in DB without replacing local order status semantics.
- Support customer tracking by safe lookup strategy, then enrich admin with shipment visibility and manual sync tools.
- Prefer webhook-driven status sync; fallback to scheduled/manual sync path.

**Execution Plan (Stages)**
1. **Stage 0: Contract Validation**
- Confirm Steadfast production base URL, auth header format, create-order payload schema, status lookup endpoints, and webhook availability from official merchant docs/dashboard.
- Freeze a single source contract doc for request/response examples and error codes.

2. **Stage 1: Data Model Design**
- Finalize `Order` courier fields and optional `CourierEvent` audit table design in Prisma plan.
- Define status mapping table: `steadfast_status -> local_order_status` with explicit non-destructive rules.

3. **Stage 2: Service Boundary Design**
- Define internal `SteadfastService` interface for create shipment, query status, and normalize errors.
- Define retry/idempotency strategy for shipment creation and status sync.

4. **Stage 3: API Contract Planning**
- Plan internal endpoints for shipment create, single-order courier status, bulk/admin sync, and webhook receive.
- Extend Swagger plan with new schemas, success/error responses, and security notes.

5. **Stage 4: UI/UX Planning**
- Plan track-order UX inputs and response states for public-safe lookups.
- Plan checkout success UI additions for courier tracking details when available.
- Plan admin orders UI additions for courier columns, status chips, and manual resync action.

6. **Stage 5: Rollout & Observability**
- Plan feature flags and phased rollout from staging to production.
- Define logs/metrics for shipment creation failures, sync lag, webhook failures, and reconciliation alerts.

**Acceptance Criteria Per Stage**
- Stage 0 complete when Steadfast contract is signed off with real production examples.
- Stage 1 complete when schema proposal includes migration-safe nullable fields and status mapping doc.
- Stage 2 complete when service interface + retry/idempotency behavior is documented.
- Stage 3 complete when Swagger draft includes all new courier endpoint contracts.
- Stage 4 complete when UI wireflows for customer/admin are approved.
- Stage 5 complete when rollout checklist, monitoring KPIs, and rollback plan are approved.

**Risks To Control Early**
- Wrong Steadfast base URL or auth shape across sandbox/production.
- Status mapping confusion between courier movement vs business fulfillment state.
- Guest/public tracking exposure without proper verification constraints.
- Missing webhook resilience causing stale statuses and support overhead.

**Next Step (Still Planning)**
- If you want, I can now produce the **Stage 0 contract checklist template** (exact fields, headers, sample payloads, expected responses, error matrix) so your team can verify Steadfast in one pass before any coding.





ssh key
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDzqOPJVQOwtcjHnOaI0OgMvXPQkWqHSbjs232nmUbl3 prosenjitbiswas983@gmail.com