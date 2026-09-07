import { supabase } from '../config/supabase';
import { generateEmbedding } from './gemini.service';

export interface RAGDocument { id?: string; title: string; description?: string; source?: string; source_url?: string; category?: string; language?: string; content: string; }
export interface RetrievalResult { id: string; document_id: string; chunk_text: string; similarity: number; ai_documents: { title: string; source: string; source_url: string; category: string; language: string; }; }

export const ingestDocument = async (doc: RAGDocument) => {
  const { data: document, error: docError } = await supabase.from('ai_documents').insert({ title: doc.title, description: doc.description, source: doc.source, source_url: doc.source_url, category: doc.category, language: doc.language || 'en', content: doc.content, status: 'processing' }).select('id').single();
  if (docError || !document) throw new Error(`Failed to insert document: ${docError?.message || 'unknown error'}`);
  try {
    const chunks = doc.content.split(/\n\s*\n/).map(c => c.trim()).filter(Boolean);
    if (!chunks.length) throw new Error('Document contains no indexable content');
    for (let i=0;i<chunks.length;i++) {
      const embedding = await generateEmbedding(chunks[i]);
      if (embedding.length !== 768) throw new Error(`Embedding dimension mismatch: expected 768, received ${embedding.length}`);
      const { error } = await supabase.from('ai_document_chunks').insert({ document_id: document.id, chunk_index: i, chunk_text: chunks[i], language: doc.language || 'en', embedding: `[${embedding.join(',')}]` });
      if (error) throw new Error(`Failed to insert chunk ${i}: ${error.message}`);
    }
    const { error: statusError } = await supabase.from('ai_documents').update({ status: 'indexed', updated_at: new Date().toISOString() }).eq('id', document.id);
    if (statusError) throw new Error(`Failed to finalize document: ${statusError.message}`);
    return document.id;
  } catch (error) {
    await supabase.from('ai_document_chunks').delete().eq('document_id', document.id);
    await supabase.from('ai_documents').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', document.id);
    throw error;
  }
};

export const searchKnowledge = async (query: string, match_threshold = 0.7, match_count = 5): Promise<RetrievalResult[]> => {
  const queryEmbedding = await generateEmbedding(query);
  if (queryEmbedding.length !== 768) throw new Error(`Embedding dimension mismatch: expected 768, received ${queryEmbedding.length}`);
  const { data, error } = await supabase.rpc('match_ai_document_chunks', { query_embedding: `[${queryEmbedding.join(',')}]`, match_threshold, match_count });
  if (error) throw new Error(`Vector search unavailable: ${error.message}`);
  return data || [];
};
