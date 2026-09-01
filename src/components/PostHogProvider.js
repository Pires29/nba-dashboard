"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
let posthogClient;
let posthogLoadPromise;

function isPostHogEnabled() {
  return Boolean(posthogKey && posthogHost);
}

function loadPostHog() {
  if (!isPostHogEnabled()) return Promise.resolve(null);
  if (posthogClient?.__loaded) return Promise.resolve(posthogClient);
  if (!posthogLoadPromise) {
    posthogLoadPromise = import("posthog-js").then((module) => {
      const client = module.default;
      if (!client.__loaded) {
        client.init(posthogKey, {
          api_host: posthogHost,
          defaults: "2026-05-30",
          capture_pageview: false,
          capture_pageleave: false,
          capture_performance: false,
          person_profiles: "identified_only",
          autocapture: false,
          disable_surveys: true,
          disable_session_recording: true,
          disable_external_dependency_loading: true,
          advanced_disable_decide: true,
          advanced_disable_feature_flags: true,
        });
      }
      posthogClient = client;
      return client;
    });
  }

  return posthogLoadPromise;
}

function requestIdle(callback) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(callback, 2000);
  return () => window.clearTimeout(id);
}

export async function captureEvent(eventName, properties) {
  const client = await loadPostHog();
  if (!client?.__loaded) return;
  client.capture(eventName, properties);
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isPostHogEnabled() || !pathname) return;

    return requestIdle(async () => {
      const client = await loadPostHog();
      if (!client?.__loaded) return;

      const query = searchParams.toString();
      client.capture("$pageview", {
        $current_url: `${window.location.origin}${pathname}${query ? `?${query}` : ""}`,
      });
    });
  }, [pathname, searchParams]);

  return null;
}

export default function PostHogProvider({ children }) {
  useEffect(() => {
    if (!isPostHogEnabled()) return;
    return requestIdle(() => {
      loadPostHog();
    });
  }, []);

  if (!isPostHogEnabled()) return children;

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}
