export type DriveConnection = {
    connection_id: string;
    [key: string]: any;
};
  
export type DriveResource = {
    resource_id: string;
    inode_type: string;
    inode_path: { path: string };
    [key: string]: any;
};
  
export type DriveResourcesResponse = {
    data: DriveResource[];
};