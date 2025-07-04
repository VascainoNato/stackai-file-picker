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

  // Se ainda não é client, usa SWR sem provider customizado
  if (!isClient) {
    return (
      <SWRConfig>
        {children}
      </SWRConfig>
    );
  }

  // Se é client, usa o provider com localStorage
  return (
    <SWRConfig value={{ provider: localStorageProvider }}>
      {children}
    </SWRConfig>
  );
}