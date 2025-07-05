"use client";
import { useFilePickerLogic } from "@/app/hooks/useFilePicker";
import { AlertCircle } from "lucide-react";

export default function Footer() {
  const {
    folderStack,
    handleGoBack,
    selectedIds,
    setSelectedIds,
    loadingKB,
    handleIndexSelected,
  } = useFilePickerLogic();

  return (
    <section className="w-full flex h-20 bg-white border-t-2 lg:px-8 xl:px-16 lg:gap-0">
      <div className="flex w-full justify-end items-center gap-8">
     
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle size={20} color="gray" />
            We recommend selecting as few items as needed.
          </div>
        )}

        {/* Botão Voltar */}
        {folderStack.length > 0 && (
          <button
            className="bg-white hover:bg-gray-300 px-4 py-2 rounded border"
            onClick={handleGoBack}
          >
            ← Return
          </button>
        )}

        {/* Botão Cancelar - só aparece se tiver algo selecionado */}
        {selectedIds.length > 0 && (
          <button
            className="bg-white hover:bg-gray-300 px-4 py-2 rounded border"
            onClick={() => setSelectedIds([])}
          >
            Cancel
          </button>
        )}

        {/* Botão Confirmar Indexação - só aparece se tiver algo selecionado */}
        {selectedIds.length > 0 && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled={loadingKB}
            onClick={async () => {
              const result = await handleIndexSelected();
              if (result) {
                alert(result.message);
              }
            }}
          >
            {loadingKB ? "Indexing..." : "Index selected"}
          </button>
        )}
      </div>
    </section>
  );
}