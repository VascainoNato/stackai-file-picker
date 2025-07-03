import { useState } from "react";
import { login } from "../api/auth";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const accessToken = await login(email, password);
      setToken(accessToken);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { token, loading, error, handleLogin };
}