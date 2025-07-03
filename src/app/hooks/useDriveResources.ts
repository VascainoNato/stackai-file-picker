import { useState } from "react";
import { listFolderResources, listRootResources } from "../api/drive";

export function useDriveResources(connectionId: string | null, token: string | null, folderId?: string) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchResources() {
    if (!connectionId || !token) return;
    setLoading(true);
    setError(null);
    try {
      let res;
      if (folderId) {
        res = await listFolderResources(connectionId, folderId, token);
      } else {
        res = await listRootResources(connectionId, token);
      }
      setResources(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { resources, loading, error, fetchResources };
}