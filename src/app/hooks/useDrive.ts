import { useState } from "react";
import { getGDriveConnection } from "../api/drive";
import { DriveConnection } from "../types/drive";

export function useDrive(token: string | null) {
  const [connection, setConnection] = useState<DriveConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function fetchConnection() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const conn = await getGDriveConnection(token);
      setConnection(conn);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return { connection, loading, error, fetchConnection };
}