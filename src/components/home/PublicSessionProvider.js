"use client";

import { createContext, useContext, useEffect, useState } from "react";

const PublicSessionContext = createContext({ user: null });

export function usePublicSession() {
  return useContext(PublicSessionContext);
}

export default function PublicSessionProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { signal: controller.signal });
        if (!response.ok) return;
        const session = await response.json();
        setUser(session?.user?.id ? session.user : null);
      } catch (error) {
        if (error.name !== "AbortError") console.error("Unable to load session", error);
      }
    }

    loadSession();
    return () => controller.abort();
  }, []);

  return (
    <PublicSessionContext.Provider value={{ user }}>
      {children}
    </PublicSessionContext.Provider>
  );
}
