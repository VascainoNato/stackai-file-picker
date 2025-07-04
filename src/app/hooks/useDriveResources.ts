import useSWR from "swr";
import { listFolderResources, listRootResources } from "../api/drive";
import { DriveResource } from "../types/drive";

const fetcher = async ([connectionId, token, folderId]: [string, string, string | undefined]) => {
  if (folderId) {
    const res = await listFolderResources(connectionId, folderId, token);
    return res.data;
  } else {
    const res = await listRootResources(connectionId, token);
    return res.data;
  }
};

export function useDriveResources(connectionId: string | null, token: string | null, folderId?: string) {
  const { data, error, isLoading } = useSWR<DriveResource[]>(
    connectionId && token ? [connectionId, token, folderId] : null,
    fetcher
  );

  return {
    resources: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    fetchResources: () => {} 
  };
}