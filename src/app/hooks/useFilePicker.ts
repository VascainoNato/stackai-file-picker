import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useDrive } from "./useDrive";
import { useDriveResources } from "./useDriveResources";
import { useKnowledgeBase } from "./useKnowledgeBase";

export function useFilePickerLogic() {
  const { token, loading, error, handleLogin } = useAuth();
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

  const { loading: loadingKB, error: errorKB, handleCreate, getIndexedResourceIds, handleRemoveFromIndex } = useKnowledgeBase(token);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [indexedIds, setIndexedIds] = useState<string[]>([]);
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

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
    if (error && error.includes('token') && email && password) {
      handleLogin(email, password);
    }
  }, [error, email, password, handleLogin]);

  useEffect(() => {
    if (knowledgeBaseId && getIndexedResourceIds) {
      getIndexedResourceIds(knowledgeBaseId).then((ids) => {
        setIndexedIds(ids);
        setPendingIds((prev) => prev.filter((id) => !ids.includes(id)));
      });
    }
  }, [knowledgeBaseId, currentFolderId, getIndexedResourceIds]);

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

  function toggleSelect(resourceId: string) {
    setSelectedIds((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId]
    );
    setPendingIds((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : selectedIds.includes(resourceId) 
          ? prev
          : [...prev, resourceId]
    );
  }

  async function handleIndexSelected() {
    if (!connection || selectedIds.length === 0) return;
    try {
      const kb = await handleCreate(connection.connection_id, selectedIds, "My Knowledge Base");
      setPendingIds((prev) => [...prev, ...selectedIds]);
      setSelectedIds([]);
      if (kb?.id) setKnowledgeBaseId(kb.id);
      return { success: true, message: "Indexing started!" };
    } catch (err: unknown) {
      return { success: false, message: "Error indexing: " + (err instanceof Error ? err.message : 'Unknown error') };
    }
  }

  return {
    isInitializing,
    initError,
    resources,
    folderStack, handleEnterFolder, handleGoBack,
    selectedIds, pendingIds, indexedIds, knowledgeBaseId, setSelectedIds,
    loadingKB, errorKB, handleRemoveFromIndex, loadingRes,
    toggleSelect, handleIndexSelected,
    connection, token 
  };
}