"use client";
import { SWRConfig } from "swr";
import { useEffect, useState } from "react";
import type { Cache } from "swr";

function localStorageProvider(): Cache {
  const map = new Map<string, unknown>(JSON.parse(localStorage.getItem("swr-cache") || "[]"));

  window.addEventListener("beforeunload", () => {
    localStorage.setItem("swr-cache", JSON.stringify(Array.from(map.entries())));
  });

  return map as Cache;
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
    <SWRConfig value={{ 
      provider: localStorageProvider,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      refreshInterval: 60000,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      errorRetryCount: 3,
      errorRetryInterval: 60000,
    }}>
      {children}
    </SWRConfig>
  );
}