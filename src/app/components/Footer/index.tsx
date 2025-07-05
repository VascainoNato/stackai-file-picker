"use client";
import { useFilePicker } from "@/app/contexts/FilePickerContext";
import { AlertCircle } from "lucide-react";

export default function Footer() {
  const {
    folderStack,
    handleGoBack,
    selectedIds,
    setSelectedIds,
    loadingKB,
    handleIndexSelected,
    knowledgeBaseId,
    handleRemoveFromIndex,  
    setIndexedIds,
    resources,
    setPendingIds,  
  } = useFilePicker();

  const { token } = useFilePicker();
  async function handleCancel() {
    if (!knowledgeBaseId) {
      return;
    }
  
    const resourcePaths = selectedIds.map(id => {
      const resource = resources.find(r => r.resource_id === id);
      return resource?.inode_path.path || "";
    }).filter(Boolean);
  
    try {
      await Promise.all(
        resourcePaths.map(path => handleRemoveFromIndex(knowledgeBaseId, path))
      );
      setIndexedIds(prev => prev.filter(id => !selectedIds.includes(id)));
      setPendingIds(prev => prev.filter(id => !selectedIds.includes(id)));
      setSelectedIds([]);
    } catch (err) {
      console.error("Erro em handleCancel:", err);
    }
  }

  return (
    <section className="w-full flex h-20 bg-white border-t-2 border-gray-200 lg:px-8 xl:px-16 lg:gap-0">
      <div className="flex w-full justify-end items-center gap-4 lg:gap-2 px-6 lg:px-0">
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 py-2 px-2 text-[color:#202124] hidden lg:flex bg-gray-200 rounded">
            <AlertCircle size={20} color="#202124" />
            We recommend selecting as few items as needed.
          </div>
        )}
        {folderStack.length > 0 && (
          <button
            className="bg-white px-4 py-2 rounded border-gray-300 border cursor-pointer"
            onClick={handleGoBack}
          >
            Return
          </button>
        )}

        {selectedIds.length > 0 && (
          <button
            onClick={() => {
              console.log("handleCancel disparado");
              handleCancel();
            }}
            disabled={loadingKB}
          >
            Cancel
          </button>
        )}


        {selectedIds.length > 0 && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer font-roboto"
            disabled={loadingKB}
            onClick={async () => {
              const result = await handleIndexSelected();
              console.log("Resultado da indexação:", result);
              if (result) {
                alert(result.message);
              }
            }}
          >
            {loadingKB ? "Indexing..." : "Select"}
            <div className="flex items-center justify-center text-white r px-2 text-xs font-semibold">
              {selectedIds.length}
            </div>
          </button>
        )}
      </div>
    </section>
  );
}