// hooks/useFilePickerLogic.ts
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useDrive } from "./useDrive";
import { useDriveResources } from "./useDriveResources";
import { useKnowledgeBase } from "./useKnowledgeBase";

export function useFilePickerLogic() {
  // Autenticação
  const { token, loading, error, handleLogin } = useAuth();
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_TEST_EMAIL || "");
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_TEST_PASSWORD || "");

  // Conexão
  const { connection, loading: loadingConn, error: errorConn, fetchConnection } = useDrive(token);

  // Navegação
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<string[]>([]);

  // Recursos
  const { resources, loading: loadingRes, error: errorRes, fetchResources } = useDriveResources(
    connection?.connection_id || null,
    token,
    currentFolderId || undefined
  );

  // Indexação
  const { loading: loadingKB, error: errorKB, handleCreate, getIndexedResourceIds, handleRemoveFromIndex } = useKnowledgeBase(token);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [indexedIds, setIndexedIds] = useState<string[]>([]);
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  // Efeitos
  useEffect(() => {
    if (connection && token) fetchResources();
  }, [connection, token, currentFolderId]);

  useEffect(() => {
    if (knowledgeBaseId && getIndexedResourceIds) {
      getIndexedResourceIds(knowledgeBaseId).then((ids) => {
        setIndexedIds(ids);
        setPendingIds((prev) => prev.filter((id) => !ids.includes(id)));
      });
    }
  }, [knowledgeBaseId, currentFolderId, getIndexedResourceIds]);

  // Navegação
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

  // Seleção
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

  // Indexação
  async function handleIndexSelected() {
    if (!connection || selectedIds.length === 0) return;
    try {
      const kb = await handleCreate(connection.connection_id, selectedIds, "My Knowledge Base");
      setPendingIds((prev) => [...prev, ...selectedIds]);
      setSelectedIds([]);
      if (kb?.id) setKnowledgeBaseId(kb.id);
      return { success: true, message: "Indexação iniciada!" };
    } catch (err: unknown) {
      return { success: false, message: "Erro ao indexar: " + (err instanceof Error ? err.message : 'Erro desconhecido') };
    }
  }

  return {
    // Autenticação
    token, loading, error, handleLogin, email, setEmail, password, setPassword,
    // Conexão
    connection, loadingConn, errorConn, fetchConnection,
    // Recursos
    resources, loadingRes, errorRes, fetchResources,
    // Navegação
    currentFolderId, folderStack, handleEnterFolder, handleGoBack,
    // Seleção e indexação
    selectedIds, setSelectedIds, pendingIds, setPendingIds, indexedIds, setIndexedIds,
    knowledgeBaseId, setKnowledgeBaseId,
    loadingKB, errorKB, handleCreate, getIndexedResourceIds, handleRemoveFromIndex,
    toggleSelect, handleIndexSelected,
  };
}