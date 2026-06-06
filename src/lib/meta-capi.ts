import crypto from "crypto";

export type CapiEventData = {
  eventName: string;
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string;
  actionSource?: "website" | "app" | "physical_store" | "system_generated" | "chat" | "email" | "other";
  customData?: Record<string, unknown>;
  userData?: {
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbp?: string;
    fbc?: string;
    emails?: string[];
    phones?: string[];
    firstName?: string;
    lastName?: string;
    cities?: string[];
    states?: string[];
    zipCodes?: string[];
    countries?: string[];
    externalId?: string;
  };
};

function hashData(data: string): string {
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
}

export async function sendMetaCapiEvent(event: CapiEventData) {
  const PIXEL_ID = process.env.META_PIXEL_ID || "1466676988255416";
  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
  const API_VERSION = process.env.META_API_VERSION || "v19.0";

  if (!ACCESS_TOKEN) {
    console.warn("Meta CAPI: META_ACCESS_TOKEN is not set. Skipping server-side event.");
    return null;
  }

  const userDataPayload: Record<string, unknown> = {
    client_ip_address: event.userData?.clientIpAddress,
    client_user_agent: event.userData?.clientUserAgent,
    fbp: event.userData?.fbp,
    fbc: event.userData?.fbc,
  };

  // Hash PII fields
  if (event.userData?.emails?.length) {
    userDataPayload.em = event.userData.emails.map(hashData);
  }
  if (event.userData?.phones?.length) {
    userDataPayload.ph = event.userData.phones.map(hashData);
  }
  if (event.userData?.firstName) userDataPayload.fn = hashData(event.userData.firstName);
  if (event.userData?.lastName) userDataPayload.ln = hashData(event.userData.lastName);
  if (event.userData?.cities?.length) userDataPayload.ct = event.userData.cities.map(hashData);
  if (event.userData?.states?.length) userDataPayload.st = event.userData.states.map(hashData);
  if (event.userData?.zipCodes?.length) userDataPayload.zp = event.userData.zipCodes.map(hashData);
  if (event.userData?.countries?.length) userDataPayload.country = event.userData.countries.map(hashData);
  if (event.userData?.externalId) userDataPayload.external_id = hashData(event.userData.externalId);

  // Remove undefined fields
  Object.keys(userDataPayload).forEach(
    (key) => userDataPayload[key] === undefined && delete userDataPayload[key]
  );

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime || Math.floor(Date.now() / 1000),
        action_source: event.actionSource || "website",
        event_source_url: event.eventSourceUrl,
        event_id: event.eventId,
        user_data: userDataPayload,
        custom_data: event.customData,
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Meta CAPI Error:", result);
    }
    return result;
  } catch (error) {
    console.error("Meta CAPI Fetch Error:", error);
    return null;
  }
}
