"use client";
import { useFilePickerLogic } from "../../hooks/useFilePicker";
import { mutate } from "swr";
import { fetcher } from "../../hooks/useDriveResources";
import { useState } from "react";

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
  
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"az" | "za" | "type">("type");
  const [statusFilter, setStatusFilter] = useState<"all" | "indexed" | "pending" | "processing" | "not_indexed">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "directory" | "file">("all");

  const prefetchFolder = (folderId: string) => {
    if (connection?.connection_id && token) {
      mutate(
        [connection.connection_id, token, folderId],
        () => fetcher([connection.connection_id, token, folderId]),
        { revalidate: false }
      );
    }
  };

  // Filtrar e ordenar recursos
  const filteredResources = resources
    .filter(item => {
      // Filtro por busca
      const matchesSearch = item.inode_path.path.toLowerCase().includes(search.toLowerCase());
      
      // Filtro por tipo
      const matchesType = typeFilter === "all" || 
        (typeFilter === "directory" && item.inode_type === "directory") ||
        (typeFilter === "file" && item.inode_type !== "directory");
      
      // Filtro por status
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
      
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sort === "az") {
        return a.inode_path.path.localeCompare(b.inode_path.path);
      }
      if (sort === "za") {
        return b.inode_path.path.localeCompare(a.inode_path.path);
      }
      if (sort === "type") {
        // Pastas primeiro, depois arquivos, ambos ordenados A-Z
        if (a.inode_type !== b.inode_type) {
          return a.inode_type === "directory" ? -1 : 1;
        }
        return a.inode_path.path.localeCompare(b.inode_path.path);
      }
      return 0;
    });

  // Skeleton simples
  const Skeleton = () => (
    <div className="bg-white border rounded-lg p-4">
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Mostra skeleton enquanto inicializa OU carrega recursos
  const isLoadingResources = isInitializing || (resources.length === 0 && !initError);

  return (
    <section className="w-full flex flex-col gap-4 p-8">
      <h2 className="text-xl font-bold">Google Drive File Picker</h2>

      {/* Mostra erro se houver */}
      {initError && (
        <div className="text-red-600">
          Erro ao carregar: {initError}
        </div>
      )}

      {/* Mostra skeleton enquanto carrega */}
      {isLoadingResources && <Skeleton />}

      {/* Lista de arquivos/pastas */}
      {resources.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          {selectedIds.length > 0 && (
            <div className="text-sm text-gray-700 mb-4">
              {selectedIds.length} arquivo(s)/pasta(s) selecionado(s) para indexação
            </div>
          )}

          {/* FILTROS E BUSCA - AQUI É O LUGAR CERTO */}
          <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-50 rounded">
            <input
              type="text"
              placeholder="Buscar arquivos ou pastas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 flex-1 min-w-[200px]"
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as "az" | "za" | "type")}
              className="border rounded px-3 py-2"
            >
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
              <option value="type">Tipo (Pastas primeiro)</option>
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as "all" | "directory" | "file")}
              className="border rounded px-3 py-2"
            >
              <option value="all">Todos os tipos</option>
              <option value="directory">Só pastas</option>
              <option value="file">Só arquivos</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as "all" | "indexed" | "pending" | "processing" | "not_indexed")}
              className="border rounded px-3 py-2"
            >
              <option value="all">Todos os status</option>
              <option value="indexed">Indexados</option>
              <option value="pending">Pendentes</option>
              <option value="processing">Processando</option>
              <option value="not_indexed">Não indexados</option>
            </select>
          </div>
          
          <ul className="space-y-2">
            {filteredResources.map((item) => {
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
                      📁 <p>{item.inode_path.path}</p>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      📄 <p>{item.inode_path.path}</p>
                    </div>
                  )}

                  {status === "indexed" ? (
                    <p className="ml-auto px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Indexado
                    </p>
                  ) : status === "processing" ? (
                    <p className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Processando
                    </p>
                  ) : status === "pending" ? (
                    <p className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      Pendente
                    </p>
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

          {/* Mostra se não há resultados após filtrar */}
          {filteredResources.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              Nenhum resultado encontrado para os filtros aplicados.
            </div>
          )}
          
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

      {/* Só mostra "nenhum arquivo" se não está carregando e não tem erro */}
      {!isLoadingResources && resources.length === 0 && !initError && (
        <div className="text-gray-500">Nenhum arquivo encontrado.</div>
      )}
    </section>
  );
}