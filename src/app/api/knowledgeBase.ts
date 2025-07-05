const STACKAI_API_URL = process.env.NEXT_PUBLIC_STACKAI_API_URL!;

export async function createKnowledgeBase(
  connectionId: string,
  resourceIds: string[],
  token: string,
  name: string = "File Picker Knowledge Base",
  description: string = "Created via File Picker"
) {
  const data = {
    connection_id: connectionId,
    connection_source_ids: resourceIds,
    name,
    description,
    indexing_params: {
      ocr: false,
      unstructured: true,
      embedding_params: { embedding_model: "text-embedding-ada-002", api_key: null },
      chunker_params: { chunk_size: 1500, chunk_overlap: 500, chunker: "sentence" },
    },
    org_level_role: null,
    cron_job_id: null,
  };

  const res = await fetch(`${STACKAI_API_URL}/knowledge_bases`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create knowledge base");
  return res.json(); 
}

export async function syncKnowledgeBase(knowledgeBaseId: string, orgId: string, token: string) {
  const url = `${STACKAI_API_URL}/knowledge_bases/sync/trigger/${knowledgeBaseId}/${orgId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to sync knowledge base: ${res.status} - ${errorText}`);
  }
  const result = await res.text();
  return result; 
}

export async function listIndexedResources(knowledgeBaseId: string, resourcePath: string = "/", token: string) {
  const res = await fetch(`${STACKAI_API_URL}/knowledge_bases/${knowledgeBaseId}/resources/children?resource_path=${resourcePath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to list indexed resources");
  return res.json();
}

export async function removeFromIndex(knowledgeBaseId: string, resourcePath: string, token: string) {
  try {
    const res = await fetch(`${STACKAI_API_URL}/knowledge_bases/${knowledgeBaseId}/resources?resource_path=${encodeURIComponent(resourcePath)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("removeFromIndex fetch error:", errorText);
      throw new Error("Failed to remove from index: " + errorText);
    }
    return res.status;  
  } catch (error) {
    console.error("removeFromIndex fetch exception:", error);
    throw error;
  }
}

export async function getKnowledgeBaseStatus(knowledgeBaseId: string, token: string) {
  const res = await fetch(`${STACKAI_API_URL}/knowledge_bases/${knowledgeBaseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to get knowledge base status");
  return res.json();
}