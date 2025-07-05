"use client";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useFilePicker } from "../../contexts/PickerContext";

export default function Footer() {
  const {
    folderStack,
    handleGoBack,
    selectedIds,
    loadingKB,
    handleIndexSelected,
    handleCancelIndexed,
    indexedIds,
  } = useFilePicker();

  const [isCancelling, setIsCancelling] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);

  async function handleCancel() {
    setIsCancelling(true);
    try {
      const result = await handleCancelIndexed();
      if (result) {
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      }
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleIndex() {
    setIsIndexing(true);
    try {
      const result = await handleIndexSelected();
      if (result) {
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      }
    } finally {
      setIsIndexing(false);
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
            className="bg-white px-4 py-2 rounded border-gray-300 border cursor-pointer text-[color:#202124]"
            onClick={handleGoBack}
          >
            Return
          </button>
        )}

        {selectedIds.some(id => indexedIds.includes(id)) && (
          <button
            onClick={handleCancel}
            disabled={loadingKB || isCancelling || isIndexing}
            className="bg-white text-[color:#202124] border border-gray-300 px-4 py-2 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelling ? "Cancelling..." : "Cancel Indexed"}
          </button>
        )}

        {selectedIds.some(id => !indexedIds.includes(id)) && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer font-roboto disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loadingKB || isCancelling || isIndexing}
            onClick={handleIndex}
          >
            {isIndexing ? "Indexing..." : "Select"}
            <div className="flex items-center justify-center text-white r px-2 text-xs font-semibold">
              {selectedIds.filter(id => !indexedIds.includes(id)).length}
            </div>
          </button>
        )}
      </div>
    </section>
  );
}