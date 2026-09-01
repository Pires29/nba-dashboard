import * as Sentry from "@sentry/nextjs";

import "../sentry.client.config.js";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
