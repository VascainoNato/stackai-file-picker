import { useState } from "react";
import {
  createKnowledgeBase,
  syncKnowledgeBase,
  listIndexedResources,
  removeFromIndex,
} from "../api/knowledgeBase";
import { DriveResource } from "../types/drive";

export function useKnowledgeBase(token: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<unknown>(null);

  async function handleCreate(connectionId: string, resourceIds: string[], name?: string, description?: string) {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const kb = await createKnowledgeBase(connectionId, resourceIds, token, name, description);
      setKnowledgeBase(kb);
      return kb;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSync(knowledgeBaseId: string, orgId: string) {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await syncKnowledgeBase(knowledgeBaseId, orgId, token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleListIndexed(knowledgeBaseId: string, resourcePath: string = "/") {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      return await listIndexedResources(knowledgeBaseId, resourcePath, token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFromIndex(knowledgeBaseId: string, resourcePath: string) {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      return await removeFromIndex(knowledgeBaseId, resourcePath, token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function getIndexedResourceIds(knowledgeBaseId: string): Promise<string[]> {
    if (!token) return [];
    try {
      const res = await listIndexedResources(knowledgeBaseId, "/", token);
      return res.data.map((item: DriveResource) => item.resource_id);
    } catch {
      return [];
    }
  }

  return {
    loading,
    error,
    knowledgeBase,
    handleCreate,
    handleSync,
    handleListIndexed,
    handleRemoveFromIndex,
    getIndexedResourceIds,
  };
}