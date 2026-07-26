import { NextResponse } from "next/server";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, eventId, eventSourceUrl, customData } = body;

    if (!eventName || !eventId) {
      return NextResponse.json({ error: "Missing eventName or eventId" }, { status: 400 });
    }

    // Extract user data from headers/cookies
    const clientIpAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
    const clientUserAgent = req.headers.get("user-agent") || undefined;

    // get cookies
    const cookieHeader = req.headers.get("cookie") || "";
    const fbp = cookieHeader.match(/_fbp=([^;]+)/)?.[1];
    const fbc = cookieHeader.match(/_fbc=([^;]+)/)?.[1];

    await sendMetaCapiEvent({
      eventName,
      eventId,
      eventSourceUrl,
      customData,
      userData: {
        clientIpAddress,
        clientUserAgent,
        fbp,
        fbc,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CAPI Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
