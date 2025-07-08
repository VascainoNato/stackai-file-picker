

export type DriveConnection = {
    connection_id: string;
};
  
export type DriveResource = {
    resource_id: string;
    inode_type: string;
    inode_path: { path: string };
    status?: "indexed" | "processing" | "not_indexed";
    created_at?: string;
    modified_at?: string;
};
  
export type DriveResourcesResponse = {
    resources: DriveResource[]; 
};

export type SWRKey = [string, string, string];