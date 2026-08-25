import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { createApiError } from '../middleware';

const router = Router();
router.use(authenticate);

const toCamel = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(v => toCamel(v));
  if (obj !== null && obj !== undefined && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      result[camelKey] = toCamel(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

// GET /api/v1/ai/history
router.get('/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: conversations, error } = await supabase
      .from('ai_conversations')
      .select('*, ai_messages(*)')
      .eq('farmer_id', req.user!.id)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, data: { conversations: toCamel(conversations) } });
  } catch (err) { next(err); }
});

import { generateGroundedResponse } from '../services/gemini.service';
import { searchKnowledge, ingestDocument } from '../services/rag.service';

// POST /api/v1/ai/chat
router.post('/chat', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, conversationId, language = 'en' } = req.body;
    
    let convId = conversationId;
    
    if (!convId) {
      const { data: conv, error: convErr } = await supabase
        .from('ai_conversations')
        .insert({
          farmer_id: req.user!.id,
          title: message.substring(0, 30) + '...',
          language
        })
        .select()
        .single();
      
      if (convErr) throw convErr;
      convId = conv.id;
    } else {
      await supabase.from('ai_conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);
    }

    await supabase.from('ai_messages').insert({
      conversation_id: convId,
      farmer_id: req.user!.id,
      role: 'user',
      content: message
    });

    // 1. Fetch Farmer Context
    const { data: farmerData } = await supabase.from('farmers').select('*').eq('id', req.user!.id).single();

    // 2. Perform RAG Retrieval
    const ragResults = await searchKnowledge(message, 0.7, 3);
    let contextString = '';
    const sources: any[] = [];
    
    if (ragResults && ragResults.length > 0) {
      ragResults.forEach(r => {
        contextString += `[Source: ${r.ai_documents.title}]\n${r.chunk_text}\n\n`;
        sources.push({
          title: r.ai_documents.title,
          source: r.ai_documents.source,
          url: r.ai_documents.source_url
        });
      });
    }

    // 3. Generate Grounded AI Response
    const aiResponseText = await generateGroundedResponse({
      prompt: message,
      context: contextString,
      language,
      farmerContext: farmerData
    });

    // Format response JSON with sources if any
    const finalResponse = {
      text: aiResponseText,
      sources: sources.length > 0 ? sources : null
    };

    const { data: aiMsg, error: aiErr } = await supabase.from('ai_messages').insert({
      conversation_id: convId,
      farmer_id: req.user!.id,
      role: 'assistant',
      content: JSON.stringify(finalResponse) // Storing as JSON string to keep backward schema compatibility if it's text
    }).select().single();

    if (aiErr) throw aiErr;

    res.json({ success: true, data: { message: toCamel(aiMsg), conversationId: convId, sources } });
  } catch (err) { next(err); }
});

// POST /api/v1/ai/voice
router.post('/voice', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // In a real app, req.file would contain the audio blob.
    // For this simulation, we'll assume the frontend sends a mock text transcript if no audio is processed.
    const { transcript, language = 'en' } = req.body;
    
    // Simulate STT and LLM delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    let aiResponse = "Voice command received. I am analyzing your request.";
    const transcriptLower = (transcript || '').toLowerCase();
    
    if (transcriptLower.includes('weather')) {
      aiResponse = "The weather is currently clear, but light showers are expected tomorrow evening.";
    } else if (transcriptLower.includes('price')) {
      aiResponse = "The current market price for tomatoes is 25 rupees per kilogram in your local mandi.";
    }

    // In a real app, we would generate a TTS audio blob here and upload to Supabase Storage.
    // We'll simulate by returning text that the frontend browser TTS can read out loud.
    
    res.json({ success: true, data: { transcript: transcript || "Detected voice", response: aiResponse } });
  } catch (err) { next(err); }
});

// POST /api/v1/ai/image
router.post('/image', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { imageUrl, cropType } = req.body;
    
    // Simulate Vision AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simulated Disease Analysis
    const mockReport = {
      detected_crop: cropType || 'Tomato',
      health_status: 'infected',
      diseases: [
        { name: 'Early Blight (Alternaria solani)', confidence: 92 },
        { name: 'Nitrogen Deficiency', confidence: 45 }
      ],
      treatment_suggestions: [
        'Apply copper-based fungicide immediately.',
        'Ensure proper spacing between plants for air circulation.',
        'Avoid overhead watering to keep leaves dry.'
      ],
      confidence_score: 92
    };

    const { data: report, error } = await supabase.from('ai_image_reports').insert({
      farmer_id: req.user!.id,
      image_url: imageUrl || 'simulated_image.jpg',
      ...mockReport
    }).select().single();

    if (error) throw error;

    res.json({ success: true, data: { report: toCamel(report) } });
  } catch (err) { next(err); }
});

// POST /api/v1/ai/document/ocr
router.post('/document/ocr', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { documentUrl, documentType = 'aadhaar' } = req.body;
    
    // Simulate OCR delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockData = documentType === 'aadhaar' 
      ? { name: 'Ramesh Kumar', uid: 'XXXX-XXXX-1234', dob: '1985-04-12', address: 'Vill: Rampur, Dist: Solapur' }
      : { farmArea: '5.2 Acres', soilType: 'Black Cotton', surveyNo: '124/B' };

    const { data: ocrDoc, error } = await supabase.from('ai_ocr_documents').insert({
      farmer_id: req.user!.id,
      document_url: documentUrl || 'simulated_doc.pdf',
      document_type: documentType,
      extracted_data: mockData,
      confidence_score: 95.5
    }).select().single();

    if (error) throw error;
    res.json({ success: true, data: { document: toCamel(ocrDoc) } });
  } catch (err) { next(err); }
});

// POST /api/v1/ai/knowledge/ingest
router.post('/knowledge/ingest', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Basic admin check - assuming role comes from auth
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
      return;
    }

    const { title, description, source, sourceUrl, category, language, content } = req.body;
    
    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required' });
      return;
    }

    const docId = await ingestDocument({
      title,
      description,
      source,
      source_url: sourceUrl,
      category,
      language: language || 'en',
      content
    });

    res.json({ success: true, data: { documentId: docId } });
  } catch (err) { next(err); }
});

// GET /api/v1/ai/knowledge/search
router.get('/knowledge/search', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
      return;
    }

    const results = await searchKnowledge(q, 0.7, 5);

    res.json({ success: true, data: { results, query: q } });
  } catch (err) { next(err); }
});

// POST /api/v1/ai/translate
router.post('/translate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { text, targetLang } = req.body;
    
    // Simulate Translation Delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock translation mapping
    const mockTranslations: Record<string, string> = {
      'hi': 'नमस्ते, मैं आपकी कैसे मदद कर सकता हूँ?',
      'te': 'నమస్కారం, నేను మీకు ఎలా సహాయపడగలను?',
      'mr': 'नमस्कार, मी तुम्हाला कशी मदत करू शकतो?'
    };

    const translatedText = mockTranslations[targetLang] || `[Translated to ${targetLang}]: ${text}`;
    
    res.json({ success: true, data: { original: text, translated: translatedText, targetLang } });
  } catch (err) { next(err); }
});

// GET /api/v1/ai/analytics
router.get('/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Return mock aggregated AI analytics for the dashboard
    const analytics = {
      totalConversations: 12450,
      activeUsers: 3200,
      voiceRequests: 4500,
      imageDiagnoses: 1800,
      averageResponseTimeMs: 1200,
      avgAccuracyScore: 94.5
    };
    
    res.json({ success: true, data: analytics });
  } catch (err) { next(err); }
});

export default router;
