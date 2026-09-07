-- Forward migration for databases where 20260816000000_ai_rag_tables.sql
-- was already applied before the RAG security hardening.

ALTER TABLE ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_document_chunks ENABLE ROW LEVEL SECURITY;

-- Remove the legacy public-read policies created by the original migration.
DROP POLICY IF EXISTS "Public read indexed ai_documents" ON ai_documents;
DROP POLICY IF EXISTS "Public read indexed ai_document_chunks" ON ai_document_chunks;

-- The backend uses the Supabase service-role client and performs application-level
-- authorization. Do not expose the knowledge tables through direct public access.
REVOKE ALL ON TABLE ai_documents FROM PUBLIC;
REVOKE ALL ON TABLE ai_document_chunks FROM PUBLIC;

-- Keep vector retrieval behind the backend service-role RPC. SECURITY DEFINER is
-- paired with a fixed search_path and an explicit service_role-only EXECUTE grant.
CREATE OR REPLACE FUNCTION match_ai_document_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_text text,
  similarity float,
  ai_documents jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.chunk_text,
    1 - (c.embedding <=> query_embedding) AS similarity,
    jsonb_build_object(
      'title', d.title,
      'source', d.source,
      'source_url', d.source_url,
      'category', d.category,
      'language', d.language
    ) AS ai_documents
  FROM ai_document_chunks c
  JOIN ai_documents d ON c.document_id = d.id
  WHERE c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
    AND d.status = 'indexed'
  ORDER BY c.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 20);
END;
$$;

REVOKE ALL ON FUNCTION match_ai_document_chunks(vector(768), float, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION match_ai_document_chunks(vector(768), float, int) TO service_role;

-- Ensure production databases have the same vector index expected by the RAG layer.
CREATE INDEX IF NOT EXISTS ai_document_chunks_embedding_hnsw_idx
  ON ai_document_chunks
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS ai_document_chunks_document_id_idx
  ON ai_document_chunks (document_id);

CREATE INDEX IF NOT EXISTS ai_documents_status_idx
  ON ai_documents (status);
