import { useState } from "react";
import {
  createKnowledgeBase,
  syncKnowledgeBase,
  listIndexedResources,
  removeFromIndex,
} from "../api/knowledgeBase";

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

  return {
    loading,
    error,
    knowledgeBase,
    handleCreate,
    handleSync,
    handleListIndexed,
    handleRemoveFromIndex,
  };
}