"use client";
import { FileIcon, Folder } from "lucide-react";
import { useDriveResources } from "../../hooks/useDriveResources";

interface FolderPreviewProps {
  folderId: string;
  connectionId: string | null | undefined;
  token: string | null | undefined;
}

export default function FolderPreview({ folderId, connectionId, token }: FolderPreviewProps) {
  const { resources, loading, error } = useDriveResources(connectionId ?? null, token ?? null, folderId);

  if (loading) {
    return (
      <div className="pl-8 text-gray-400 text-xs py-2">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="pl-8 text-red-400 text-xs py-2">
       Error loading preview
      </div>
    );
  }

  return (
    <ul className="">
      {resources.map((item) => (
        <li
          key={item.resource_id}
          className="flex flex-row items-center p-3 min-w-0 align-center bg-white items-center gap-2 overflow-hidden lg:flex lg:p-0 lg:min-h-[40px] lg:border-b lg:border-gray-100 lg:px-2 lg:hover:bg-gray-100"
        >
          <span className="w-4 inline-block" />
          {item.inode_type === "directory" ? <Folder size={20} color="gray" /> : <FileIcon size={20} color="gray" /> }
          <span className="break-words font-roboto text-sm text-gray-300">{item.inode_path.path}</span>
        </li>
      ))}
    </ul>
  );
}