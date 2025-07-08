import { useState, useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useDrive } from "./useDrive";
import { useDriveResources } from "./useDriveResources";
import { useKnowledgeBase } from "./useKnowledgeBase";
import { getCurrentOrganization } from "../api/organization";
import { listFolderResources } from "../api/drive";
import { mutate } from "swr";

export function useFilePickerLogic() {
  const { token, loading, error: authError, handleLogin } = useAuth();
  const [email] = useState(process.env.NEXT_PUBLIC_TEST_EMAIL || "");
  const [password] = useState(process.env.NEXT_PUBLIC_TEST_PASSWORD || "");
  const { connection, loading: loadingConn, fetchConnection } = useDrive(token);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<string[]>([]);
  const { resources, loading: loadingRes } = useDriveResources(
    connection?.connection_id || null,
    token,
    currentFolderId || undefined
  );
  const { loading: loadingKB, error: errorKB, handleCreate, handleSync, getIndexedResourceIds, getKBStatus, handleRemoveFromIndex } = useKnowledgeBase(token);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [indexedIds, setIndexedIds] = useState<string[]>([]);
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function initialize() {
      if (!email || !password) {
        setInitError("Credentials not configured");
        setIsInitializing(false);
        return;
      }
      setIsInitializing(true);
      setInitError(null);
  
      try {
        if (!token && !loading) {
          await handleLogin(email, password);
        }
        if (token && !connection && !loadingConn) {
          await fetchConnection();
        }
      } catch (err) {
        setInitError(err instanceof Error ? err.message : 'Initialization error');
        setIsInitializing(false);
      }
    }
        initialize();
        if (connection && token && !loadingRes) {
        setIsInitializing(false);
        }
    }, [
        email,
        password,
        token,
        loading,
        connection,
        loadingConn,
        loadingRes,
        handleLogin,
        fetchConnection,
    ]); 

    useEffect(() => {
        if (authError && authError.includes('token') && email && password) {
          handleLogin(email, password);
        }
      }, [authError, email, password, handleLogin]);

  function handleEnterFolder(folderId: string) {
    setFolderStack((prev) => [...prev, currentFolderId!]);
    setCurrentFolderId(folderId);
  }

  function handleGoBack() {
    const prevStack = [...folderStack];
    const prevFolder = prevStack.pop() || null;
    setFolderStack(prevStack);
    setCurrentFolderId(prevFolder);
  }

  function getDescendantResourceIds(folderId: string, allResources: typeof resources): string[] {
    const folder = allResources.find(r => r.resource_id === folderId);
    if (!folder) return [];
    const folderPath = folder.inode_path.path;
    const descendants = allResources
      .filter(r => r.inode_path.path.startsWith(folderPath + "/"))
      .map(r => r.resource_id);
    return descendants;
  }

  function getParentResourceId(resource: typeof resources[0], allResources: typeof resources): string | null {
    const path = resource.inode_path.path;
    const parts = path.split("/");
    if (parts.length <= 1) return null;
    const parentPath = parts.slice(0, -1).join("/");
    const parent = allResources.find(r => r.inode_path.path === parentPath);
    return parent ? parent.resource_id : null;
  }

  async function toggleSelect(resourceId: string, resourceArg?: typeof resources[0]) {
    const resource = resourceArg || resources.find(r => r.resource_id === resourceId);
    if (!resource) return;
    const isSelected = selectedIds.includes(resourceId);
    let newSelectedIds = [...selectedIds];
  
    if (resource.inode_type === "directory") {
      if (isSelected) {
        const descendants = getDescendantResourceIds(resourceId, resources);
        newSelectedIds = newSelectedIds.filter(id => id !== resourceId && !descendants.includes(id));
      } else {
        if (connection?.connection_id && token) {
          const folderResources = await listFolderResources(connection.connection_id, resourceId, token);
          const folderResourceIds = folderResources.data.map((item: unknown) => {
            const resource = item as { resource_id: string };
            return resource.resource_id;
          });
          newSelectedIds = Array.from(new Set([...newSelectedIds, resourceId, ...folderResourceIds]));
        } else {
          newSelectedIds.push(resourceId);
        }
      }
    } else {
      if (isSelected) {
        newSelectedIds = newSelectedIds.filter(id => id !== resourceId);
      } else {
        newSelectedIds.push(resourceId);
      }
    }
  
    function updateParentsSelection(id: string) {
      const res = resourceArg && id === resourceId ? resourceArg : resources.find(r => r.resource_id === id);
      if (!res) return;
  
      const parentId = getParentResourceId(res, resources);
      if (!parentId) return;
  
      const parentDescendants = getDescendantResourceIds(parentId, resources);
      const allDescendantsSelected = parentDescendants.every(descId => newSelectedIds.includes(descId));
  
      if (allDescendantsSelected) {
        if (!newSelectedIds.includes(parentId)) {
          newSelectedIds.push(parentId);
        }
      } else {
        newSelectedIds = newSelectedIds.filter(id => id !== parentId);
      }
      updateParentsSelection(parentId);
    }
  
    updateParentsSelection(resourceId);
    setSelectedIds(newSelectedIds);
  }

  async function handleIndexSelected() {
    if (!connection || selectedIds.length === 0 || !token) return;
    try {
      const kb = await handleCreate(connection.connection_id, selectedIds, "My Knowledge Base");
      if (!kb?.knowledge_base_id) {
        throw new Error("Failed to create knowledge base");
      }
      const orgId = await getCurrentOrganization(token);

      try {
        await handleSync(kb.knowledge_base_id, orgId);
      } catch (syncError) {
        throw syncError;
      }
      setKnowledgeBaseId(kb.knowledge_base_id);
      setPendingIds(selectedIds);
      setSelectedIds([]);
      if (connection?.connection_id && token) {
        mutate([connection.connection_id, token, currentFolderId || 'root']);
      }
      return { success: true, message: "Indexing started!" };
    } catch (err: unknown) {
      return { success: false, message: "Error indexing: " + (err instanceof Error ? err.message : 'Unknown error') };
    }
  }

  async function handleCancelIndexed() {
    if (!connection || selectedIds.length === 0 || !token) return;
    
    const indexedSelectedIds = selectedIds.filter(id => indexedIds.includes(id));
    if (indexedSelectedIds.length === 0) return;
    
    try {
      for (const resourceId of indexedSelectedIds) {
        const resource = resources.find(r => r.resource_id === resourceId);
        if (resource) {
          await handleRemoveFromIndex(knowledgeBaseId!, resource.inode_path.path);
        }
      }
      
      setIndexedIds(prev => prev.filter(id => !indexedSelectedIds.includes(id)));
      setSelectedIds([]);
      
      if (connection?.connection_id && token) {
        mutate([connection.connection_id, token, currentFolderId || 'root']);
      }
      
      return { success: true, message: "Indexing cancelled!" };
    } catch (err: unknown) {
      return { success: false, message: "Error cancelling: " + (err instanceof Error ? err.message : 'Unknown error') };
    }
  }

  useEffect(() => {
    if (!knowledgeBaseId) return;
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    async function refreshIndexed(kbId: string) {
      try {
        const ids = await getIndexedResourceIds(kbId);
        const validIds = ids.filter(id => id !== 'STACK_VFS_VIRTUAL_DIRECTORY');
        setIndexedIds(validIds);
        setPendingIds(prev => {
          const filtered = prev.filter(id => !validIds.includes(id));
          if (filtered.length === 0 && prev.length > 0) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
          return filtered;
        });
      } catch {
      }
    }
    refreshIndexed(knowledgeBaseId);
    if (pendingIds.length > 0) {
      pollingIntervalRef.current = setInterval(() => {
        refreshIndexed(knowledgeBaseId);
      }, 120000); 
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    }, [knowledgeBaseId, getIndexedResourceIds, getKBStatus, pendingIds.length]); 

    useEffect(() => {
        if (pendingIds.length === 0 && pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
    }, [pendingIds.length]);

  return {
    isInitializing,
    initError,
    resources,
    folderStack, handleEnterFolder, handleGoBack,
    selectedIds, pendingIds, indexedIds, knowledgeBaseId, setSelectedIds,
    loadingKB, errorKB, handleRemoveFromIndex, loadingRes,
    toggleSelect, handleIndexSelected, handleCancelIndexed, setIndexedIds, setPendingIds,
    connection, token 
  };
}