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

function isMetaPixelReady() {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

export function trackMetaPixelEvent(
  eventName: MetaPixelStandardEvent,
  payload?: MetaPixelPayload,
) {
  if (!isMetaPixelReady()) {
    return;
  }

  window.fbq?.("track", eventName, payload);
}

export function trackMetaPixelCustomEvent(
  eventName: string,
  payload?: MetaPixelPayload,
) {
  if (!isMetaPixelReady()) {
    return;
  }

  window.fbq?.("trackCustom", eventName, payload);
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
