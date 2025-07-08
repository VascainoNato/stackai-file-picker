"use client";
import { FileIcon, Folder, ChevronDown, ChevronUp } from "lucide-react";
import { useDriveResources } from "../../hooks/useDriveResources";
import React from "react";
import { FolderPreviewProps } from "@/app/types/folderPreview";

export default function FolderPreview({
  folderId,
  connectionId,
  token,
  expandedFolders,
  toggleExpand,
  selectedIds,
  toggleSelect,
  indexedIds,
  pendingIds,
}: FolderPreviewProps) {
  const { resources, loading, error } = useDriveResources(connectionId ?? null, token ?? null, folderId);

  function getDescendantResourceIds(folderId: string, allResources: typeof resources): string[] {
    const folder = allResources.find(r => r.resource_id === folderId);
    if (!folder) return [];
    const folderPath = folder.inode_path.path;
    return allResources
      .filter(r => r.inode_path.path.startsWith(folderPath + "/"))
      .map(r => r.resource_id);
  }

  if (loading) {
    return (
      <div className="pl-8 text-gray-400 text-xs py-2">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="pl-8 text-red-400 text-xs py-2">Error loading preview</div>
    );
  }

  return (
    <ul className="ml-6 border-l border-gray-100">
      {resources.map((item) => {
        const isExpanded = expandedFolders.includes(item.resource_id);
        const isSelected = selectedIds.includes(item.resource_id);
        const isIndexed = indexedIds.includes(item.resource_id);
        const isPending = pendingIds.includes(item.resource_id);
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
        const descendants = getDescendantResourceIds(item.resource_id, resources);
        const selectedDescendantsCount = descendants.filter(id => selectedIds.includes(id)).length;
        const isIndeterminate = selectedDescendantsCount > 0 && selectedDescendantsCount < descendants.length;
        return (
          <React.Fragment key={item.resource_id}>
            <li
              className="flex flex-row items-center p-3 min-w-0 align-center bg-white items-center gap-2 overflow-hidden lg:flex lg:w-full lg:p-0 lg:min-h-[40px] lg:border-b lg:border-gray-100 lg:px-2 lg:hover:bg-gray-100"
            >
              {item.inode_type === "directory" ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(item.resource_id)}
                  className="mr-1 flex items-center justify-center"
                  aria-label={isExpanded ? "Collapse preview" : "Expand preview"}
                  tabIndex={0}
                >
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-gray-400 cursor-pointer" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400 cursor-pointer" />
                  )}
                </button>
              ) : (
                <span className="w-4 inline-block" />
              )}
              <input
                type="checkbox"
                checked={isSelected}
                ref={el => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={async e => {
                  e.stopPropagation();
                  await toggleSelect(item.resource_id, item);
                }}
                disabled={false}
                className="w-4 h-4 flex items-center align-center"
              />
              {item.inode_type === "directory" ? <Folder size={20} color="gray" /> : <FileIcon size={20} color="gray" />}
              <span className="flex-1 break-words font-roboto text-sm text-gray-500">{item.inode_path.path}</span>
              <div className="flex items-center gap-8 justify-end">
                <span className="w-36 text-xs text-gray-400 text-right">{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</span>
                <span className="w-36 text-xs text-gray-400 text-right">{item.modified_at ? new Date(item.modified_at).toLocaleString() : ''}</span>
                <span className="w-24 text-xs text-right">
                  {status === "indexed" && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Indexed</span>
                  )}
                  {status === "processing" && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Processing</span>
                  )}
                  {status === "pending" && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Selected</span>
                  )}
                </span>
              </div>
            </li>
            {item.inode_type === "directory" && isExpanded && (
              <li>
                <FolderPreview
                  folderId={item.resource_id}
                  connectionId={connectionId}
                  token={token}
                  expandedFolders={expandedFolders}
                  toggleExpand={toggleExpand}
                  selectedIds={selectedIds}
                  toggleSelect={toggleSelect}
                  indexedIds={indexedIds}
                  pendingIds={pendingIds}
                />
              </li>
            )}
          </React.Fragment>
        );
      })}
    </ul>
  );
}