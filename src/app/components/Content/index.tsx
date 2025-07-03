"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useDrive } from "../../hooks/useDrive";
import { useDriveResources } from "../../hooks/useDriveResources";
import { useKnowledgeBase } from "@/app/hooks/useKnowledgeBase";

export default function Content() {
  const { token, loading, error, handleLogin } = useAuth();
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_TEST_EMAIL || "");
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_TEST_PASSWORD || "");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<string[]>([]);
  const { loading: loadingKB, error: errorKB, handleCreate } = useKnowledgeBase(token);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { connection, loading: loadingConn, error: errorConn, fetchConnection } = useDrive(token);
  const { resources, loading: loadingRes, error: errorRes, fetchResources } = useDriveResources(
    connection?.connection_id || null,
    token,
    currentFolderId || undefined
  );

  // Buscar arquivos sempre que mudar de pasta/conexão/token
  useEffect(() => {
    if (connection && token) fetchResources();
    // eslint-disable-next-line
  }, [connection, token, currentFolderId]);

  // Entrar em uma pasta
  function handleEnterFolder(folderId: string) {
    setFolderStack((prev) => [...prev, currentFolderId!]);
    setCurrentFolderId(folderId);
  }

  // Voltar para a pasta anterior
  function handleGoBack() {
    const prevStack = [...folderStack];
    const prevFolder = prevStack.pop() || null;
    setFolderStack(prevStack);
    setCurrentFolderId(prevFolder);
  }

  function toggleSelect(resourceId: string) {
    setSelectedIds((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId]
    );
  }

  return (
    <section className="w-full flex flex-col gap-4 p-8">
      <h2 className="text-xl font-bold">Teste de Login e Conexão</h2>
      <div className="flex gap-2">
        <input
          className="border px-2 py-1 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="border px-2 py-1 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Senha"
          type="password"
        />
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded"
          onClick={() => handleLogin(email, password)}
          disabled={loading}
        >
          {loading ? "Logando..." : "Login"}
        </button>
      </div>
      {error && <div className="text-red-600">Erro: {error}</div>}
      {token && (
        <div className="bg-gray-100 p-2 rounded break-all">
          <strong>Token:</strong>
          <pre className="whitespace-pre-wrap">{token}</pre>
        </div>
      )}

      {/* Se já tem token, mostra botão para buscar conexão */}
      {token && (
        <button
          className="bg-green-600 text-white px-4 py-1 rounded mt-4"
          onClick={fetchConnection}
          disabled={loadingConn}
        >
          {loadingConn ? "Buscando conexão..." : "Buscar conexão Google Drive"}
        </button>
      )}
      {errorConn && <div className="text-red-600">Erro conexão: {errorConn}</div>}
      {connection && (
        <div className="bg-gray-100 p-2 rounded break-all mt-2">
          <strong>Conexão Google Drive:</strong>
          <pre className="whitespace-pre-wrap">{JSON.stringify(connection, null, 2)}</pre>
        </div>
      )}
      {connection && (
      <button
        className="bg-purple-600 text-white px-4 py-1 rounded mt-4"
        onClick={fetchResources}
        disabled={loadingRes}
      >
        {loadingRes ? "Listando arquivos..." : "Listar arquivos/pastas"}
      </button>
    )}
    {errorRes && <div className="text-red-600">Erro arquivos: {errorRes}</div>}
    {resources.length > 0 && (
  <div className="bg-gray-100 p-2 rounded break-all mt-2">
    <strong>Arquivos/Pastas:</strong>
    <ul>
      {resources.map((item) => (
        <li key={item.resource_id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.includes(item.resource_id)}
            onChange={() => toggleSelect(item.resource_id)}
          />
          {item.inode_type === "directory" ? (
            <button
              className="text-blue-600 underline"
              onClick={() => handleEnterFolder(item.resource_id)}
            >
              📁 {item.inode_path.path}
            </button>
          ) : (
            <>
              📄 {item.inode_path.path}
            </>
          )}
        </li>
      ))}
    </ul>
    {folderStack.length > 0 && (
      <button
        className="mt-2 bg-gray-300 px-2 py-1 rounded"
        onClick={handleGoBack}
      >
        Voltar
      </button>
    )}
    {selectedIds.length > 0 && (
      <button
        className="bg-orange-600 text-white px-4 py-1 rounded mt-4"
        disabled={loadingKB}
        onClick={async () => {
          try {
            await handleCreate(connection!.connection_id, selectedIds, "Minha Knowledge Base");
            alert("Indexação iniciada!");
            setSelectedIds([]);
          } catch (err: any) {
            alert("Erro ao indexar: " + err.message);
          }
        }}
      >
        {loadingKB ? "Indexando..." : "Indexar selecionados"}
      </button>
    )}
    {errorKB && <div className="text-red-600">Erro indexação: {errorKB}</div>}
  </div>
)}
    </section>
  );
}