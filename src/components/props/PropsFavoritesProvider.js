"use client";

import { createContext, useContext } from "react";
import { useFavorites } from "@/hooks/useFavorites";

const PropsFavoritesContext = createContext(null);

export function PropsFavoritesProvider({ children }) {
  const favorites = useFavorites();

  return (
    <PropsFavoritesContext.Provider value={favorites}>
      {children}
    </PropsFavoritesContext.Provider>
  );
}

export function usePropsFavorites() {
  const context = useContext(PropsFavoritesContext);
  if (!context) {
    throw new Error("usePropsFavorites must be used within PropsFavoritesProvider");
  }
  return context;
}
