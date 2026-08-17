"use client";

import { StatePanel } from "./PageState";

export default function RouteError({ reset, area = "page" }) {
  return <StatePanel title={`${area} could not be loaded`} description="Something went wrong while loading this data. Your previous changes have not been hidden." actionLabel="Try again" onAction={reset} />;
}
