"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as Provider } from "posthog-js/react";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

function isPostHogEnabled() {
  return Boolean(posthogKey && posthogHost);
}

export function captureEvent(eventName, properties) {
  if (!isPostHogEnabled() || !posthog.__loaded) return;
  posthog.capture(eventName, properties);
}

export default function PostHogProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isPostHogEnabled() || posthog.__loaded) return;

    posthog.init(posthogKey, {
      api_host: posthogHost,
      defaults: "2026-05-30",
      capture_pageview: false,
      person_profiles: "identified_only",
    });
  }, []);

  useEffect(() => {
    if (!isPostHogEnabled() || !posthog.__loaded || !pathname) return;

    const query = searchParams.toString();
    posthog.capture("$pageview", {
      $current_url: `${window.location.origin}${pathname}${query ? `?${query}` : ""}`,
    });
  }, [pathname, searchParams]);

  if (!isPostHogEnabled()) return children;

  return <Provider client={posthog}>{children}</Provider>;
}
