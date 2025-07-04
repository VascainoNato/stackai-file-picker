import { useState, useEffect } from "react";
import { getGDriveConnection } from "../api/drive";
import { DriveConnection } from "../types/drive";

export function useDrive(token: string | null) {
  const [connection, setConnection] = useState<DriveConnection | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("drive_connection");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connection) {
      localStorage.setItem("drive_connection", JSON.stringify(connection));
    } else {
      localStorage.removeItem("drive_connection");
    }
  }, [connection]);
  
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