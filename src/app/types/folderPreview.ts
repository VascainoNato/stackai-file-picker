import { DriveResource } from "./drive";

export interface FolderPreviewProps {
    folderId: string;
    connectionId: string | null | undefined;
    token: string | null | undefined;
    expandedFolders: string[];
    toggleExpand: (id: string) => void;
    selectedIds: string[];
    toggleSelect: (id: string, item: DriveResource) => void;
    indexedIds: string[];
    pendingIds: string[];
}