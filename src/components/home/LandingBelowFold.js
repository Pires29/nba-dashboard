"use client";

import { useEffect, useState } from "react";

export default function LandingBelowFold({ children, fallback }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // The full server-rendered tree is already in the route payload. Give the
    // browser one frame to paint the shell before replacing it with that tree.
    const frameId = window.requestAnimationFrame(() => setIsReady(true));
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return isReady ? children : fallback;
}
