import useSWR from "swr";
import { listFolderResources, listRootResources } from "../api/drive";
import { DriveResource } from "../types/drive";

export const fetcher = async ([connectionId, token, folderId]: [string, string, string | undefined]) => {
  const start = performance.now();
  let res;
  if (folderId) {
    res = await listFolderResources(connectionId, folderId, token);
  } else {
    res = await listRootResources(connectionId, token);
  }
  const end = performance.now();
  return res.data;
};

export function useDriveResources(connectionId: string | null, token: string | null, folderId?: string) {
  const key = connectionId && token ? [connectionId, token, folderId ?? 'root'] : null;
  const { data, error, isLoading } = useSWR<DriveResource[]>(
    key,
  
    ([connectionId, token, folderId]) => fetcher([connectionId, token, folderId === 'root' ? undefined : folderId]),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    },
  );

  return {
    resources: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    fetchResources: () => {} 
  };
}