# Meta Conversions API (CAPI) Implementation Plan

Based on the marketing plan review, relying solely on the browser-based Meta Pixel is no longer sufficient due to privacy restrictions and ad blockers. This plan outlines the technical steps to implement Meta Conversions API (CAPI) alongside the existing browser Pixel for improved event tracking accuracy, specifically targeting **Add to Cart**, **Purchase**, and **Customer Behavior** events.

## 1. Environment Configuration
First, we need to set up the necessary environment variables for server-side API communication with Meta.
*   **Action**: Add the following keys to `.env` and `.env.example`:
    ```env
    META_PIXEL_ID=1466676988255416
    META_ACCESS_TOKEN=your_meta_system_user_access_token
    META_API_VERSION=v19.0
    ```

## 2. Server-Side Utility (`src/lib/meta-capi.ts`)
Create a utility to construct and send server-side payloads to the Meta Graph API.
*   **Action**: Create `src/lib/meta-capi.ts`.
*   **Details**: 
    *   Write a function `sendCapiEvent(eventName, eventData, userData, eventId)` that makes a POST request to `https://graph.facebook.com/${version}/${pixelId}/events`.
    *   Include logic to extract browser cookies (`_fbp`, `_fbc`), IP address, and User-Agent from the incoming request headers to improve event match quality (EMQ).

## 3. Event Deduplication Strategy
To prevent double-counting when both the browser and server send the same event, we must implement event deduplication.
*   **Action**: Update `src/lib/meta-pixel.ts`.
*   **Details**:
    *   Generate a unique `eventId` (e.g., `crypto.randomUUID()`) for each trackable action.
    *   Modify `trackMetaPixelEvent` and `trackMetaPixelCustomEvent` to accept an `eventId` parameter and pass it to `window.fbq` as the fourth argument: `window.fbq('track', eventName, payload, { eventID: eventId })`.

## 4. API Route for Client-to-Server Event Forwarding
For events that happen primarily on the client (like Add to Cart or Page View), we need an endpoint to receive them and forward them to Meta CAPI.
*   **Action**: Create a new API route `src/app/api/meta-capi/route.ts`.
*   **Details**: This endpoint will accept POST requests containing the event name, payload, and `eventId`. It will extract the user's IP, User-Agent, and `_fbp`/`_fbc` cookies, and then call `sendCapiEvent`.

## 5. Implementing Specific Events

### A. Purchase Event (Server-Side + Client-Side)
*   **Server-Side**: Update the order creation endpoint (`src/app/api/orders/route.ts`). Once an order is successfully created in the database, trigger `sendCapiEvent('Purchase', ...)` using the order details.
    *   **User Data**: Include the customer's hashed email, phone number, and address from the order form to maximize match quality.
    *   **Event ID**: Generate an `eventId` (or use the Order ID) and return it in the API response so the client can use it.
*   **Client-Side**: Update `src/app/checkout/page.tsx` to trigger the browser Pixel `Purchase` event using the same `eventId` (or Order ID) returned by the order API.

### B. Add To Cart Event (Client -> Server Forwarding)
*   **Action**: Update `handleBuyNow` and cart additions in `src/app/HomePageClient.tsx` and `src/app/product/[id]/ProductClient.tsx`.
*   **Details**: 
    *   Generate an `eventId`.
    *   Call `trackMetaPixelEvent('AddToCart', pixelPayload, eventId)` for the browser.
    *   Send an asynchronous `fetch` to `/api/meta-capi` with the same payload and `eventId`.

### C. Customer Behavior Tracking (PageView, ViewContent, Search)
*   **Action**: Update `MetaPixelPageView`, `ProductClient.tsx` (ViewContent), and `track-order/page.tsx` (Search).
*   **Details**: Similar to AddToCart, generate an `eventId`, fire the browser event, and asynchronously ping the `/api/meta-capi` endpoint to log these behaviors server-side.

## 6. Testing and Verification
*   **Action**: Use the **Meta Events Manager Test Events** tool.
*   **Details**:
    *   Verify that both Browser and Server events are received.
    *   Ensure the "Deduplication" status shows correctly (meaning the `eventId` matching is working).
    *   Confirm the Event Match Quality (EMQ) score is high (especially for Purchases, by checking hashed user data).