"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useDrive } from "../../hooks/useDrive";
import { useDriveResources } from "../../hooks/useDriveResources";
import { useKnowledgeBase } from "@/app/hooks/useKnowledgeBase";

export default function Content() {
  const { token, loading, error, handleLogin } = useAuth();
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_TEST_EMAIL || "");
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_TEST_PASSWORD || "");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<string[]>([]);
  const { loading: loadingKB, error: errorKB, handleCreate, getIndexedResourceIds, handleRemoveFromIndex } = useKnowledgeBase(token);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [indexedIds, setIndexedIds] = useState<string[]>([]);
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const { connection, loading: loadingConn, error: errorConn, fetchConnection } = useDrive(token);
  const { resources, loading: loadingRes, error: errorRes, fetchResources } = useDriveResources(
    connection?.connection_id || null,
    token,
    currentFolderId || undefined
  );

  useEffect(() => {
    if (connection && token) fetchResources();
  }, [connection, token, currentFolderId]);

  useEffect(() => {
    if (knowledgeBaseId && getIndexedResourceIds) {
      getIndexedResourceIds(knowledgeBaseId).then((ids) => {
        setIndexedIds(ids);
        // Remove dos pendentes os que já foram indexados
        setPendingIds((prev) => prev.filter((id) => !ids.includes(id)));
      });
    }
  }, [knowledgeBaseId, currentFolderId, getIndexedResourceIds]);

  // Entrar em uma pasta
  function handleEnterFolder(folderId: string) {
    setFolderStack((prev) => [...prev, currentFolderId!]);
    setCurrentFolderId(folderId);
  }

  // Voltar para a pasta anterior
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
    
    // Se está selecionando, adiciona aos pendentes
    // Se está desselecionando, remove dos pendentes
    setPendingIds((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : selectedIds.includes(resourceId) 
          ? prev // Se já estava selecionado, não adiciona novamente
          : [...prev, resourceId]
    );
  }

  return (
    <section className="w-full flex flex-col gap-4 p-8">
      <h2 className="text-xl font-bold">Teste de Login e Conexão</h2>
      <div className="flex gap-2">
        <input
          className="border px-2 py-1 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="border px-2 py-1 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Senha"
          type="password"
        />
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded"
          onClick={() => handleLogin(email, password)}
          disabled={loading}
        >
          {loading ? "Logando..." : "Login"}
        </button>
      </div>
      {error && <div className="text-red-600">Erro: {error}</div>}
      {token && (
        <div className="bg-gray-100 p-2 rounded break-all">
          <strong>Token:</strong>
          <pre className="whitespace-pre-wrap">{token}</pre>
        </div>
      )}

      {/* Se já tem token, mostra botão para buscar conexão */}
      {token && (
        <button
          className="bg-green-600 text-white px-4 py-1 rounded mt-4"
          onClick={fetchConnection}
          disabled={loadingConn}
        >
          {loadingConn ? "Buscando conexão..." : "Buscar conexão Google Drive"}
        </button>
      )}
      {errorConn && <div className="text-red-600">Erro conexão: {String(errorConn)}</div>}
      {connection && (
        <div className="bg-gray-100 p-2 rounded break-all mt-2">
          <strong>Conexão Google Drive:</strong>
          <pre className="whitespace-pre-wrap">{JSON.stringify(connection, null, 2)}</pre>
        </div>
      )}
      {connection && (
      <button
        className="bg-purple-600 text-white px-4 py-1 rounded mt-4"
        onClick={fetchResources}
        disabled={loadingRes}
      >
        {loadingRes ? "Listando arquivos..." : "Listar arquivos/pastas"}
      </button>
    )}
    {errorRes && <div className="text-red-600">Erro arquivos: {errorRes}</div>}

    {resources.length > 0 && (
      <div className="bg-gray-100 p-2 rounded break-all mt-2">
        <strong>Arquivos/Pastas:</strong>
        
        {/* Contador de selecionados */}
        {selectedIds.length > 0 && (
          <div className="text-sm text-gray-700 mb-2 mt-2">
            {selectedIds.length} arquivo(s)/pasta(s) selecionado(s) para indexação
          </div>
        )}
        
        <ul className="mt-2">
        {resources.map((item) => {
          const isIndexed = indexedIds.includes(item.resource_id);
          const isPending = pendingIds.includes(item.resource_id);
          const isSelected = selectedIds.includes(item.resource_id);
          
          // Determina o status
          let status: "indexed" | "processing" | "pending" | "not_indexed";
          if (isIndexed) {
            status = "indexed";
          } else if (isPending && !isSelected) {
            status = "processing"; // Foi indexado mas ainda não confirmado
          } else if (isSelected) {
            status = "pending"; // Selecionado para indexar
          } else {
            status = "not_indexed";
          }
          
          return (
              <li key={item.resource_id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.resource_id)}
                  onChange={() => toggleSelect(item.resource_id)}
                  disabled={isIndexed}
                />
                {item.inode_type === "directory" ? (
                  <button
                    className="text-blue-600 underline"
                    onClick={() => handleEnterFolder(item.resource_id)}
                  >
                    📁 {item.inode_path.path}
                  </button>
                ) : (
                  <span>📄 {item.inode_path.path}</span>
                )}
                
               {/* Badge de status */}
                {status === "indexed" ? (
                  <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs">
                    Indexado
                  </span>
                ) : status === "processing" ? (
                  <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-800 rounded text-xs">
                    Processando
                  </span>
                ) : status === "pending" ? (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs">
                    Pendente
                  </span>
                ) : (
                  <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-800 rounded text-xs">
                    Não indexado
                  </span>
                )}
                
                {/* Botão de remover se já está indexado */}
                {isIndexed && knowledgeBaseId && (
                  <button
                    className="ml-2 text-red-600 underline text-xs hover:bg-red-50 px-1 rounded"
                    onClick={async () => {
                      try {
                        const kb = await handleCreate(connection!.connection_id, selectedIds, "My Knowledge Base");
                        alert("Indexação iniciada!");
                        
                        // Move os selecionados para "processando"
                        setPendingIds((prev) => [...prev, ...selectedIds]);
                        setSelectedIds([]);
                        
                        if (kb?.id) setKnowledgeBaseId(kb.id);
                      } catch (err: unknown) {
                        alert("Erro ao indexar: " + (err instanceof Error ? err.message : 'Erro desconhecido'));
                      }
                    }}
                  >
                    Remover
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        
        {/* Botão Voltar */}
        {folderStack.length > 0 && (
          <button
            className="mt-2 bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
            onClick={handleGoBack}
          >
            Voltar
          </button>
        )}
        
        {/* Botão de indexar */}
        {selectedIds.length > 0 && (
          <button
            className="bg-orange-600 text-white px-4 py-1 rounded mt-4 hover:bg-orange-700"
            disabled={loadingKB}
            onClick={async () => {
              try {
                const kb = await handleCreate(connection!.connection_id, selectedIds, "My Knowledge Base");
                alert("Indexação iniciada!");
                setSelectedIds([]);
                if (kb?.id) setKnowledgeBaseId(kb.id);
              } catch (err: unknown) {
                alert("Erro ao indexar: " + (err instanceof Error ? err.message : 'Erro desconhecido'));
              }
            }}
          >
            {loadingKB ? "Indexando..." : "Indexar selecionados"}
          </button>
        )}
        
        {errorKB && <div className="text-red-600 mt-2">Erro indexação: {errorKB}</div>}
      </div>
    )}
      {selectedIds.length > 0 && (
        <div className="text-sm text-gray-700 mb-2">
          {selectedIds.length} arquivo(s)/pasta(s) selecionado(s) para indexação
        </div>
      )}
    </section>
  );
}