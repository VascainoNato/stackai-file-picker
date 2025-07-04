"use client";
import { useFilePickerLogic } from "../../hooks/useFilePicker";
import { mutate } from "swr";

export default function Content() {
  const {
    isInitializing,
    initError,
    resources,
    folderStack, handleEnterFolder, handleGoBack,
    selectedIds, pendingIds, indexedIds, knowledgeBaseId,
    loadingKB, errorKB, handleRemoveFromIndex,
    toggleSelect, handleIndexSelected,
    connection, token
  } = useFilePickerLogic();

  const prefetchFolder = (folderId: string) => {
    if (connection?.connection_id && token) {
      mutate([connection.connection_id, token, folderId]);
    }
  };

  if (isInitializing) {
    return (
      <section className="w-full flex flex-col gap-4 p-8">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Carregando arquivos do Google Drive...</span>
        </div>
      </section>
    );
  }

  if (initError) {
    return (
      <section className="w-full flex flex-col gap-4 p-8">
        <div className="text-red-600">
          Erro ao carregar: {initError}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full flex flex-col gap-4 p-8">
      <h2 className="text-xl font-bold">Google Drive File Picker</h2>

      {resources.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          {selectedIds.length > 0 && (
            <div className="text-sm text-gray-700 mb-4">
              {selectedIds.length} arquivo(s)/pasta(s) selecionado(s) para indexação
            </div>
          )}
          
          <ul className="space-y-2">
            {resources.map((item) => {
              const isIndexed = indexedIds.includes(item.resource_id);
              const isPending = pendingIds.includes(item.resource_id);
              const isSelected = selectedIds.includes(item.resource_id);
              
              let status: "indexed" | "processing" | "pending" | "not_indexed";
              if (isIndexed) {
                status = "indexed";
              } else if (isPending && !isSelected) {
                status = "processing";
              } else if (isSelected) {
                status = "pending";
              } else {
                status = "not_indexed";
              }
              
              return (
                <li key={item.resource_id} className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.resource_id)}
                    onChange={() => toggleSelect(item.resource_id)}
                    disabled={isIndexed}
                    className="w-4 h-4"
                  />
                  
                  {item.inode_type === "directory" ? (
                    <button
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                      onClick={() => handleEnterFolder(item.resource_id)}
                      onMouseEnter={() => prefetchFolder(item.resource_id)}
                    >
                      📁 <span>{item.inode_path.path}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      📄 <span>{item.inode_path.path}</span>
                    </div>
                  )}
                  
                  {status === "indexed" ? (
                    <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Indexado
                    </span>
                  ) : status === "processing" ? (
                    <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Processando
                    </span>
                  ) : status === "pending" ? (
                    <span className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      Pendente
                    </span>
                  ) : null}
                  
                  {isIndexed && knowledgeBaseId && (
                    <button
                      className="ml-2 text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50"
                      onClick={async () => {
                        try {
                          await handleRemoveFromIndex(knowledgeBaseId, item.inode_path.path);
                          alert("Item removido da indexação!");
                        } catch (err: unknown) {
                          alert("Erro ao remover: " + (err instanceof Error ? err.message : 'Erro desconhecido'));
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
          
          {folderStack.length > 0 && (
            <button
              className="mt-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              onClick={handleGoBack}
            >
              ← Voltar
            </button>
          )}
          
          {selectedIds.length > 0 && (
            <button
              className="mt-4 ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              disabled={loadingKB}
              onClick={async () => {
                const result = await handleIndexSelected();
                if (result) {
                  alert(result.message);
                }
              }}
            >
              {loadingKB ? "Indexando..." : "Indexar selecionados"}
            </button>
          )}
          
          {errorKB && <div className="text-red-600 mt-2">Erro indexação: {errorKB}</div>}
        </div>
      )}

      {resources.length === 0 && !isInitializing && (
        <div className="text-gray-500">Nenhum arquivo encontrado.</div>
      )}
    </section>
  );
}