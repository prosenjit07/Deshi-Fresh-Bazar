"use client";

type MetaPixelPayload = Record<string, unknown>;

type MetaPixelStandardEvent =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Search";

type ProductPixelInput = {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
};

type CheckoutPixelItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

declare global {
  interface Window {
    fbq?: (...args: [string, string, ...unknown[]]) => void;
  }
}

export function isMetaPixelReady() {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

export function generateEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function trackMetaPixelEvent(
  eventName: MetaPixelStandardEvent,
  payload?: MetaPixelPayload,
  eventId?: string
) {
  if (!isMetaPixelReady()) {
    return;
  }

  if (eventId) {
    window.fbq?.("track", eventName, payload, { eventID: eventId });
  } else {
    window.fbq?.("track", eventName, payload);
  }
}

export function trackMetaPixelCustomEvent(
  eventName: string,
  payload?: MetaPixelPayload,
  eventId?: string
) {
  if (!isMetaPixelReady()) {
    return;
  }

  if (eventId) {
    window.fbq?.("trackCustom", eventName, payload, { eventID: eventId });
  } else {
    window.fbq?.("trackCustom", eventName, payload);
  }
}

export async function sendEventToCapi(
  eventName: MetaPixelStandardEvent | string,
  payload: MetaPixelPayload | undefined,
  eventId: string
) {
  try {
    await fetch("/api/meta-capi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName,
        customData: payload,
        eventId,
        eventSourceUrl: window.location.href,
      }),
    });
  } catch (error) {
    console.error("Failed to forward event to CAPI", error);
  }
}

export function buildProductPixelPayload(
  product: ProductPixelInput,
  extraPayload?: MetaPixelPayload,
): MetaPixelPayload {
  const quantity = product.quantity ?? 1;

  return {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    currency: "BDT",
    value: product.price * quantity,
    num_items: quantity,
    ...(product.category ? { content_category: product.category } : {}),
    ...extraPayload,
  };
}

export function buildCheckoutPixelPayload(
  items: CheckoutPixelItem[],
  totalValue: number,
  extraPayload?: MetaPixelPayload,
): MetaPixelPayload {
  return {
    contents: items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      item_price: item.price,
      title: item.name,
    })),
    content_ids: items.map((item) => item.id),
    content_type: "product",
    currency: "BDT",
    value: totalValue,
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    ...extraPayload,
  };
}
