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


ssh key
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDzqOPJVQOwtcjHnOaI0OgMvXPQkWqHSbjs232nmUbl3 prosenjitbiswas983@gmail.com