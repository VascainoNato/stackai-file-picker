// hooks/useFilePickerLogic.ts
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useDrive } from "./useDrive";
import { useDriveResources } from "./useDriveResources";
import { useKnowledgeBase } from "./useKnowledgeBase";

export function useFilePickerLogic() {
  // Autenticação
  const { token, loading, error, handleLogin } = useAuth();
  const [email] = useState(process.env.NEXT_PUBLIC_TEST_EMAIL || "");
  const [password] = useState(process.env.NEXT_PUBLIC_TEST_PASSWORD || "");

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

  // Estado geral de carregamento
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // 🚀 AUTO-INICIALIZAÇÃO
  useEffect(() => {
    async function autoInitialize() {
      if (!email || !password) {
        setInitError("Credenciais não configuradas");
        setIsInitializing(false);
        return;
      }

      try {
        setIsInitializing(true);
        setInitError(null);

        // 1. Login automático
        if (!token && !loading) {
          await handleLogin(email, password);
        }
      } catch (err) {
        setInitError(err instanceof Error ? err.message : 'Erro no login automático');
        setIsInitializing(false);
      }
    }

    autoInitialize();
  }, []); // Só roda uma vez

  // 🚀 AUTO-CONEXÃO (quando token estiver pronto)
  useEffect(() => {
    async function autoConnect() {
      if (token && !connection && !loadingConn) {
        try {
          await fetchConnection();
        } catch (err) {
          setInitError(err instanceof Error ? err.message : 'Erro na conexão automática');
        }
      }
    }

    autoConnect();
  }, [token]);

  // 🚀 AUTO-FETCH RECURSOS (quando conexão estiver pronta)
  useEffect(() => {
    async function autoFetchResources() {
      if (connection && token && !loadingRes) {
        try {
          await fetchResources();
          setIsInitializing(false); // Inicialização completa!
        } catch (err) {
          setInitError(err instanceof Error ? err.message : 'Erro ao carregar recursos');
          setIsInitializing(false);
        }
      }
    }

    autoFetchResources();
  }, [connection, token, currentFolderId]);

  // 🚀 AUTO-RENOVAÇÃO DE TOKEN (se expirar)
  useEffect(() => {
    if (error && error.includes('token') && email && password) {
      // Token expirou, renova automaticamente
      handleLogin(email, password);
    }
  }, [error]);

  // Efeito para indexação
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
    // Estados de inicialização
    isInitializing,
    initError,
    // Recursos
    resources,
    // Navegação
    folderStack, handleEnterFolder, handleGoBack,
    // Seleção e indexação
    selectedIds, pendingIds, indexedIds, knowledgeBaseId,
    loadingKB, errorKB, handleRemoveFromIndex,
    toggleSelect, handleIndexSelected,
  };
}