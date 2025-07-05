"use client";
import { mutate } from "swr";
import { fetcher } from "../../hooks/useDriveResources";
import { useRef, useState } from "react";
import { ChevronDown, ChevronUp,  File, Filter, Folder, ListFilter, Search, SortDesc } from "lucide-react";
import FolderPreview from "./FolderPreview";
import React from "react";
import { LoadingDots } from '../ui/Skeleton';
import { useFilePicker } from "../../contexts/PickerContext";

export default function Content() {
  const {
    isInitializing,
    resources,
    handleEnterFolder, 
    selectedIds, pendingIds, indexedIds, setSelectedIds,
    loadingRes,
    toggleSelect,
    connection, token
  } = useFilePicker();
  
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"az" | "za" | "type">("type");
  const [statusFilter, setStatusFilter] = useState<"all" | "indexed" | "pending" | "processing" | "not_indexed">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "directory" | "file">("all");
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const isLoadingResources = isInitializing || loadingRes;
  const prefetchedFolders = useRef<Set<string>>(new Set());

  const prefetchFolder = (folderId: string) => {
    if (connection?.connection_id && token) {
      if (prefetchedFolders.current.has(folderId)) {
        return;
      }
      prefetchedFolders.current.add(folderId);
      mutate(
        [connection.connection_id, token, folderId],
        () => fetcher([connection.connection_id, token, folderId]),
        { revalidate: false }
      );
    }
  };

  function getDescendantResourceIds(folderId: string, allResources: typeof resources): string[] {
    const folder = allResources.find(r => r.resource_id === folderId);
    if (!folder) return [];
    const folderPath = folder.inode_path.path;
    return allResources
      .filter(r => r.inode_path.path.startsWith(folderPath + "/"))
      .map(r => r.resource_id);
  }

  function getParentResourceId(resource: typeof resources[0], allResources: typeof resources): string | null {
    const path = resource.inode_path.path;
    const parts = path.split("/");
    if (parts.length <= 1) return null;
    const parentPath = parts.slice(0, -1).join("/");
    const parent = allResources.find(r => r.inode_path.path === parentPath);
    return parent ? parent.resource_id : null;
  }

  const filteredResources = React.useMemo(() => {
    return resources
      .filter(item => {
        const matchesSearch = item.inode_path.path.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "all" || 
          (typeFilter === "directory" && item.inode_type === "directory") ||
          (typeFilter === "file" && item.inode_type !== "directory");
        const isIndexed = indexedIds.includes(item.resource_id);
        const isPending = pendingIds.includes(item.resource_id);
        const isSelected = selectedIds.includes(item.resource_id);
        
        let status: "indexed" | "processing" | "pending" | "not_indexed";
        if (isIndexed) {
          status = "indexed";
        } else if (isPending) {
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
          if (a.inode_type !== b.inode_type) {
            return a.inode_type === "directory" ? -1 : 1;
          }
          return a.inode_path.path.localeCompare(b.inode_path.path);
        }
        return 0;
      });
  }, [resources, search, typeFilter, statusFilter, sort, indexedIds, pendingIds, selectedIds]);

  function handleSelectAll(checked: boolean) {
    if (checked) {
      const allIds = filteredResources
        .filter(item => !indexedIds.includes(item.resource_id))
        .map(item => item.resource_id);
      
      let newSelectedIds = [...allIds];
      
      for (const id of allIds) {
        const resource = resources.find(r => r.resource_id === id);
        if (resource?.inode_type === "directory") {
          const descendants = getDescendantResourceIds(id, resources);
          newSelectedIds = Array.from(new Set([...newSelectedIds, ...descendants]));
        }
      }
      
      function updateParentsSelection(id: string) {
        const res = resources.find(r => r.resource_id === id);
        if (!res) return;
        const parentId = getParentResourceId(res, resources);
        if (!parentId) return;
        const parentDescendants = getDescendantResourceIds(parentId, resources);
        const allDescendantsSelected = parentDescendants.every(descId => newSelectedIds.includes(descId));
        if (allDescendantsSelected) {
          if (!newSelectedIds.includes(parentId)) {
            newSelectedIds.push(parentId);
          }
        } else {
          newSelectedIds = newSelectedIds.filter(id => id !== parentId);
        }
        updateParentsSelection(parentId);
      }
      
      allIds.forEach(id => updateParentsSelection(id));
      setSelectedIds(newSelectedIds);
    } else {
      setSelectedIds([]);
    }
  }

  function toggleFolderPreview(folderId: string) {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  }
  
  return (
    <section className="w-full flex flex-col gap-2 p-4 lg:px-8 xl:px-16 lg:gap-0">
      <h2 className="text-sm font-roboto text-gray-500 flex lg:hidden">Folders</h2>
      <div className="hidden lg:flex lg:w-full lg:h-10 gap-2 border-b border-gray-200 justify-between">
        <div className="flex w-full gap-2 items-center align-center">
        <input
          type="checkbox"
          checked={
            filteredResources.length > 0 &&
            filteredResources
              .filter(item => !indexedIds.includes(item.resource_id))
              .every(item => selectedIds.includes(item.resource_id))
          }
          onChange={e => handleSelectAll(e.target.checked)}
          disabled={filteredResources.length === 0}
        />
          <h5 className="text-sm font-roboto text-[color:#202124] font-roboto items-center align-center flex">Select all</h5>
        </div>
        <div className="flex w-full justify-end text-sm font-roboto text-gray-500 font-roboto font-sm items-center align-center">
        <div className="text-sm text-gray-700 mb-4">
          {selectedIds.length === 0
            ? "0"
            : `${selectedIds.length}`}
        </div>
        </div>
      </div>

        <div className=" ">
          <div className="hidden lg:flex w-full items-center py-2 border-b border-gray-200">
            <div className="flex items-center gap-16 w-[70%]">
            <div className="relative flex items-center gap-2">
              <ListFilter size={24} className="text-gray-300 pointer-events-none" />
              <h5 className="text-sm font-roboto text-[color:#202124] font-roboto items-center align-center flex">Sort</h5>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as "az" | "za" | "type")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-none outline-none text-sm text-gray-300 font-roboto p-2"
                aria-label="Sort"
              >
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
                <option value="type">Folders first</option>
              </select>
            </div>

            <div className="relative flex items-center gap-2">
              <Filter size={24} className="text-gray-300 pointer-events-none" />
              <h5 className="text-sm font-roboto text-[color:#202124] font-roboto items-center align-center flex">Filter</h5>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as "all" | "directory" | "file")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-none outline-none text-sm text-gray-300 font-roboto p-2"
                aria-label="Filtrar por tipo"
              >
                <option value="all">All files</option>
                <option value="directory">Only folders</option>
                <option value="file">Only files</option>
              </select>
            </div>

            <div className="relative flex items-center gap-2">
              <SortDesc size={24} className="text-gray-300 pointer-events-none" />
              <h5 className="text-sm font-roboto text-[color:#202124] font-roboto items-center align-center flex">Status</h5>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(
                  e.target.value as "all" | "indexed" | "pending" | "processing" | "not_indexed"
                )}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-none outline-none text-sm text-gray-300 font-roboto p-2"
                aria-label="Filtrar by Status"
              >
                <option value="all">All</option>
                <option value="indexed">Indexed</option>
                <option value="pending">Pendings</option>
                <option value="processing">Processing</option>
                <option value="not_indexed">Not indexed</option>
              </select>
          </div>
            </div>
              <div className="flex items-center w-[30%]">
                <div className="relative w-full">
                  <Search
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-gray-200 w-full h-8 pl-8 pr-2 rounded-sm text-sm font-roboto text-[color:#202124] outline-none border-none"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
          </div>

          {filteredResources.length === 0 && !isLoadingResources && (
            <div className="text-center text-gray-500 py-4">
              No items found matching your search or filters.
            </div>
          )}


          {isLoadingResources ? (
         <ul className="grid grid-cols-2 gap-2 ...">
         <li className="col-span-full text-center text-gray-500 py-6">
           <LoadingDots />
         </li>
       </ul>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:flex lg:flex-col lg:overflow-y-auto lg:max-h-screen lg:gap-0 cursor-pointer">
            {filteredResources.map((item) => {
            const isIndexed = indexedIds.includes(item.resource_id);
            const isPending = pendingIds.includes(item.resource_id);
            const isSelected = selectedIds.includes(item.resource_id);
            const isExpanded = expandedFolders.includes(item.resource_id);
          
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
                key={item.resource_id}
                className="flex flex-row items-center p-3 min-w-0 align-center bg-white items-center gap-2 overflow-hidden lg:flex lg:p-0 lg:min-h-[40px] lg:border-b lg:border-gray-100 lg:px-2 lg:hover:bg-gray-100"
                onMouseEnter={
                  item.inode_type === "directory"
                    ? () => prefetchFolder(item.resource_id)
                    : undefined
                }
             >
                <div className="flex items-center align-center lg:gap-2">
                  {item.inode_type === "directory" && (
                    <button
                      type="button"
                      onClick={() => toggleFolderPreview(item.resource_id)}
                      className="mr-1 flex items-center justify-center hidden lg:flex"
                      aria-label={isExpanded ? "Recolher preview" : "Expandir preview"}
                      tabIndex={0}
                    >
                      {isExpanded
                        ? <ChevronUp size={16} className="text-gray-400 cursor-pointer" />
                        : <ChevronDown size={16} className="text-gray-400 cursor-pointer" />}
                    </button>
                  )}
                <input
                  type="checkbox"
                  checked={isSelected}
                  ref={el => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={async e => {
                    e.stopPropagation();
                    await toggleSelect(item.resource_id);
                  }}
                  disabled={false}
                  className="w-4 h-4 flex items-center align-center"
                />
                </div>

                {item.inode_type === "directory" ? (
                  <button
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    onClick={() => handleEnterFolder(item.resource_id)}
                    onMouseEnter={() => prefetchFolder(item.resource_id)}
                  >
                    <Folder size={20} color="gray" /> <p className="break-words font-roboto text-sm text-gray-500 cursor-pointer">{item.inode_path.path}</p>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                     <File size={20} color="gray" /> <p className="break-words font-roboto text-sm text-gray-500 truncate">{item.inode_path.path}</p>
                  </div>
                )}
                {status === "indexed" ? (
                  <p className="ml-auto px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Indexed
                  </p>
                ) : status === "processing" ? (
                  <p className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Processing
                  </p>
                ) : status === "pending" ? (
                  <p className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    Pending
                  </p>
                ) :  status === "not_indexed" ? (
                  <p className="ml-auto px-2 py-1 bg-red-100 text-yellow-800 rounded-full text-xs">
                    Not indexed
                  </p>
                ) : null}
              </li>
              {item.inode_type === "directory" && isExpanded && (
                  <li
                    key={item.resource_id + "-preview"}
                    className="hidden lg:block p-0 m-0 border-0 bg-transparent"
                  >
                    <FolderPreview
                      folderId={item.resource_id}
                      connectionId={connection?.connection_id}
                      token={token}
                    />
                  </li>
                )}
              </React.Fragment>
            );
          })}
          </ul>
        )}
        </div>
    </section>
  );
}