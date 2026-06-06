"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackMetaPixelEvent, sendEventToCapi, generateEventId } from "@/lib/meta-pixel";

export default function MetaPixelPageView() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const eventId = generateEventId();
    trackMetaPixelEvent("PageView", undefined, eventId);
    sendEventToCapi("PageView", undefined, eventId);
  }, [pathname]);

  return null;
}
