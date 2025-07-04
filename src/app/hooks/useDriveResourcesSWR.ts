
import useSWR from 'swr';
import { listFolderResources, listRootResources } from '../api/drive';
import { DriveResourcesResponse, SWRKey } from '../types/drive';

const fetcher = async (connectionId: string, folderId: string | null, token: string): Promise<DriveResourcesResponse> => {
  if (folderId) {
    const res = await listFolderResources(connectionId, folderId, token);
    return res;
  } else {
    const res = await listRootResources(connectionId, token);
    return res;
  }
};

export function useDriveResourcesSWR(
  connectionId: string | null,
  token: string | null,
  folderId?: string | null
) {
  // ✅ Só ativa SWR quando tudo está pronto
  const key: SWRKey | null = connectionId && token 
    ? [`/drive/${connectionId}/resources`, folderId || 'root', token]
    : null;

  const { data, error, isLoading, mutate } = useSWR<DriveResourcesResponse>(
    key,
    ([path, folderIdKey, tokenKey]: SWRKey) => {
      const actualFolderId = folderIdKey === 'root' ? null : folderIdKey;
      return fetcher(connectionId!, actualFolderId, tokenKey);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30s cache
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      keepPreviousData: true, // ✅ Mantém dados durante navegação
    }
  );

  return {
    resources: data?.resources || [],
    error: error?.message || null,
    isLoading,
    mutate
  };
}