import { useState, useEffect } from "react";
import { login } from "../api/auth";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("drive_token");
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("drive_token", token);
    } else {
      localStorage.removeItem("drive_token");
    }
  }, [token]);

  async function handleLogin(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const accessToken = await login(email, password);
      setToken(accessToken);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return { token, loading, error, handleLogin };
}