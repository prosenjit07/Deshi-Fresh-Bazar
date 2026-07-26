# SteadFast API Contract

This document acts as the single source of truth for the SteadFast courier API contract. It is derived from the official `SteadFast API Documentation.pdf` and public knowledge.

## Base Configuration

- **Production Base URL:** `https://portal.packzy.com/api/v1`
- **Authentication Headers:**
  - `api-key`: "Your API Key Here"
  - `secret-key`: "Your Secret Key Here"

## Endpoints

### 1. Create Order
Creates a new courier shipment/consignment.

- **Method:** `POST`
- **Path:** `/create_order`
- **Headers:** `api-key`, `secret-key`, `Content-Type: application/json`
- **Payload:**
  ```json
  {
    "invoice": "13151523",
    "recipient_name": "Badrul Hasan Sajib",
    "recipient_phone": "+8801309055966",
    "recipient_address": "Dhanmondi, Zigatola",
    "recipient_email": "badrul.sajib@gmail.com",
    "alternative_phone": "01309055966",
    "item_description": "iPhone 16pro Max 512GB",
    "cod_amount": "3010",
    "note": "Optional delivery note"
  }
  ```
- **Response (Expected):**
  ```json
  {
    "status": 200,
    "message": "Order created successfully",
    "consignment_id": "160757328",
    "tracking_code": "E942C9CBFFFFBEF",
    "invoice": "13151523"
  }
  ```

### 2. Status By Consignment ID (CID)
Fetches the current delivery status using the consignment ID.

- **Method:** `GET`
- **Path:** `/status_by_cid/{cid}`
- **Headers:** `api-key`, `secret-key`
- **Response (Expected):**
  ```json
  {
    "status": 200,
    "delivery_status": "delivered"
  }
  ```

### 3. Trackings By Invoice
Fetches tracking details using the local order invoice.

- **Method:** `GET`
- **Path:** `/trackings_by_invoice/{invoice}`
- **Headers:** `api-key`, `secret-key`

### 4. Check Balance
Fetches the current merchant balance.

- **Method:** `GET`
- **Path:** `/get_balance`
- **Headers:** `api-key`, `secret-key`

## Status Mapping (Steadfast -> Local OrderStatus)

| Steadfast Status | Local OrderStatus | Note |
|------------------|-------------------|------|
| `pending`        | `PROCESSING`      | Order is logged in courier system |
| `delivered`      | `DELIVERED`       | Order reached customer |
| `cancelled`      | `CANCELLED`       | Courier cancelled delivery |
| `in_transit`     | `SHIPPED`         | Courier is on the way |
| `returned`       | `CANCELLED`       | Item returned to merchant |

> Note: Local order creation always starts as `PENDING`. Courier status updates should only move it forward, never backwards (e.g. from DELIVERED back to PENDING).

## Error Handling
- Use retry mechanism with exponential backoff for 5xx errors.
- Do not retry 4xx errors without modifying payload.
