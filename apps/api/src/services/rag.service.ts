import { supabase } from '../config/supabase';
import { generateEmbedding } from './gemini.service';

export interface RAGDocument {
  id?: string;
  title: string;
  description?: string;
  source?: string;
  source_url?: string;
  category?: string;
  language?: string;
  content: string;
}

export interface RetrievalResult {
  id: string;
  document_id: string;
  chunk_text: string;
  similarity: number;
  ai_documents: {
    title: string;
    source: string;
    source_url: string;
    category: string;
    language: string;
  };
}

export const ingestDocument = async (doc: RAGDocument) => {
  // 1. Insert document
  const { data: document, error: docError } = await supabase
    .from('ai_documents')
    .insert({
      title: doc.title,
      description: doc.description,
      source: doc.source,
      source_url: doc.source_url,
      category: doc.category,
      language: doc.language || 'en',
      content: doc.content,
      status: 'indexed'
    })
    .select('id')
    .single();

  if (docError) throw new Error(`Failed to insert document: ${docError.message}`);

  // 2. Chunk content (Simple implementation - split by paragraphs or newlines)
  const chunks = doc.content.split(/\n\s*\n/).filter(c => c.trim().length > 0);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    // 3. Generate embedding for each chunk
    const embedding = await generateEmbedding(chunkText);
    
    // 4. Insert chunk
    const { error: chunkError } = await supabase
      .from('ai_document_chunks')
      .insert({
        document_id: document.id,
        chunk_index: i,
        chunk_text: chunkText,
        language: doc.language || 'en',
        embedding: `[${embedding.join(',')}]`
      });
      
    if (chunkError) {
      console.error(`Failed to insert chunk ${i} for doc ${document.id}:`, chunkError);
    }
  }

  return document.id;
};

export const searchKnowledge = async (query: string, match_threshold = 0.7, match_count = 5): Promise<RetrievalResult[]> => {
  const queryEmbedding = await generateEmbedding(query);
  const embeddingString = `[${queryEmbedding.join(',')}]`;

  // Use the match_ai_document_chunks RPC or similar logic. 
  // Since we haven't created the RPC yet, let's create it on the fly using standard pgvector operations
  const { data, error } = await supabase.rpc('match_ai_document_chunks', {
    query_embedding: embeddingString,
    match_threshold,
    match_count
  });

  if (error) {
    console.error("Vector search error:", error);
    return [];
  }

  return data;
};
