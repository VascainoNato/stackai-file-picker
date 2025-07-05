"use client";
import { SWRConfig } from "swr";
import { useEffect, useState } from "react";

function localStorageProvider() {
  const map = new Map<string, any>(JSON.parse(localStorage.getItem("swr-cache") || "[]"));
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("swr-cache", JSON.stringify(Array.from(map.entries())));
  });
  return map;
}

export function SWRProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <SWRConfig>
        {children}
      </SWRConfig>
    );
  }

  return (
    <SWRConfig value={{ provider: localStorageProvider }}>
      {children}
    </SWRConfig>
  );
}