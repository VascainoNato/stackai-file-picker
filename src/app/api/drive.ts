const STACKAI_API_URL = process.env.NEXT_PUBLIC_STACKAI_API_URL!;

export async function getGDriveConnection(token: string) {
  const res = await fetch(`${STACKAI_API_URL}/connections?connection_provider=gdrive&limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error("Failed to get connection");
    throw new Error("Failed to get connection");
  }
  const data = await res.json();
  return data[0];
}

export async function listRootResources(connectionId: string, token: string) {
  const res = await fetch(`${STACKAI_API_URL}/connections/${connectionId}/resources/children`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error("Failed to list resources");
    throw new Error("Failed to list resources");
  }
  const data = await res.json();
  return data;
}

export async function listFolderResources(connectionId: string, resourceId: string, token: string) {
  const res = await fetch(`${STACKAI_API_URL}/connections/${connectionId}/resources/children?resource_id=${resourceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error("Failed to list folder resources");
    throw new Error("Failed to list folder resources");
  }
  const data = await res.json();
  return data;
}

export async function getResourceDetails(connectionId: string, resourceId: string, token: string) {
  const res = await fetch(`${STACKAI_API_URL}/connections/${connectionId}/resources?resource_ids=${resourceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error("Failed to get resource details");
    throw new Error("Failed to get resource details");
  }
  const data = await res.json();
  return data;
}