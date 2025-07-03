import { useState } from "react";
import { getGDriveConnection } from "../api/drive";

export function useDrive(token: string | null) {
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchConnection() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const conn = await getGDriveConnection(token);
      setConnection(conn);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { connection, loading, error, fetchConnection };
}