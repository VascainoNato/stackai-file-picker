export type DriveConnection = {
    connection_id: string;
};
  
export type DriveResource = {
    resource_id: string;
    inode_type: string;
    inode_path: { path: string };
    status?: "indexed" | "processing" | "not_indexed";
};
  
export type DriveResourcesResponse = {
    data: DriveResource[];
};

