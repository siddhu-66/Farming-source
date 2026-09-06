import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) console.error('Missing GEMINI_API_KEY environment variable');
const genAI = new GoogleGenerativeAI(apiKey || '');

export const getGeminiModel = (modelName: string = process.env.AI_MODEL || 'gemini-2.0-flash') => genAI.getGenerativeModel({ model: modelName });
export const getEmbeddingModel = () => genAI.getGenerativeModel({ model: process.env.AI_EMBEDDING_MODEL || 'text-embedding-004' });

export interface GenerateChatOptions { prompt: string; context?: string; language?: string; farmerContext?: unknown; }

export const generateGroundedResponse = async (options: GenerateChatOptions) => {
  const system = `You are AgriAssist, an agricultural assistant for Indian farmers. Prioritize supplied agricultural context. Never invent market prices, weather observations, government scheme eligibility, or pesticide dosages. If retrieved context is absent or insufficient, clearly say the information could not be verified. Respond in ${options.language || 'en'}.`;
  let prompt = `System: ${system}\n\n`;
  if (options.farmerContext) prompt += `Farmer Context:\n${JSON.stringify(options.farmerContext)}\n\n`;
  if (options.context) prompt += `Retrieved Agricultural Context:\n${options.context}\n\n`;
  prompt += `User Question:\n${options.prompt}`;
  try { return (await (await getGeminiModel().generateContent(prompt)).response).text(); }
  catch (error) { console.error('Gemini Generation Error:', error); throw new Error('Failed to generate response from Gemini'); }
};

const parseObject = <T>(text: string): T | null => {
  const cleaned = text.replace(/```json|```/gi, '').trim();
  const start = cleaned.indexOf('{'); const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)) as T; } catch { return null; }
};

export interface MultimodalInput { data: string; mimeType: string; }

export const transcribeAudio = async (input: MultimodalInput, language = 'en') => {
  const result = await getGeminiModel().generateContent([
    `Transcribe this farmer voice recording verbatim and detect its language. Return JSON only: {"transcript":"...","language":"en|hi|gu|mr|te|ta|kn|bn|pa|ml","confidence":0-100}. Language hint: ${language}.`,
    { inlineData: { data: input.data, mimeType: input.mimeType } },
  ]);
  const parsed = parseObject<{ transcript: string; language: string; confidence: number }>(result.response.text());
  if (!parsed?.transcript) throw new Error('Gemini could not transcribe the audio');
  return parsed;
};

export const analyzeDocument = async (input: MultimodalInput, documentType = 'unknown') => {
  const result = await getGeminiModel().generateContent([
    `Read this agricultural document accurately. Never invent unreadable values. Type: ${documentType}. Return JSON only: {"documentType":"...","language":"...","extractedText":"verbatim","fields":{},"tables":[],"confidence":0-100,"unreadableSections":[],"needsManualReview":true|false}. Preserve scripts, numbers, units, NPK, pH and identifiers exactly as visible.`,
    { inlineData: { data: input.data, mimeType: input.mimeType } },
  ]);
  const parsed = parseObject<{ documentType: string; language: string; extractedText: string; fields: Record<string, unknown>; tables: unknown[]; confidence: number; unreadableSections: string[]; needsManualReview: boolean }>(result.response.text());
  if (!parsed) throw new Error('Gemini returned an invalid OCR result');
  return parsed;
};

export const translateText = async (text: string, targetLang: string, sourceLang = 'auto') => {
  const supported = new Set(['en','hi','gu','mr','te','ta','kn','bn','pa','ml']);
  if (!supported.has(targetLang)) throw new Error('Unsupported target language');
  if (!text.trim()) throw new Error('Text is required');
  if (sourceLang === targetLang) return { original: text, translated: text, sourceLang, targetLang };
  const result = await getGeminiModel().generateContent(`Translate this agricultural text from ${sourceLang} to ${targetLang}. Preserve numbers, units, NPK, pH, PM-KISAN, PMFBY, KCC, Soil Health Card, IPM and Mandi. Return only the translation.\n\n${text}`);
  return { original: text, translated: result.response.text().trim(), sourceLang, targetLang };
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try { return (await getEmbeddingModel().embedContent(text)).embedding.values; }
  catch (error) { console.error('Gemini Embedding Error:', error); throw new Error('Failed to generate embedding'); }
};
