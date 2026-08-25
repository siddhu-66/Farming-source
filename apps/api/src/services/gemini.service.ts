import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini using the provided API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const getGeminiModel = (modelName: string = 'gemini-1.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

export const getEmbeddingModel = () => {
  return genAI.getGenerativeModel({ model: 'text-embedding-004' });
};

export interface GenerateChatOptions {
  prompt: string;
  context?: string;
  language?: string;
  farmerContext?: any;
}

export const generateGroundedResponse = async (options: GenerateChatOptions) => {
  const model = getGeminiModel(process.env.AI_MODEL || 'gemini-1.5-flash');
  
  const systemInstruction = `You are AgriAssist, an advanced AI agricultural assistant.
You MUST prioritize answering using the provided agricultural context.
If the information is not in the context, you may use your general agricultural knowledge, but be cautious and state if you are unsure.
Do NOT fabricate government schemes, market prices, or weather data.
For safety-sensitive queries (pesticides, loans), advise consulting an expert or official source.
You MUST respond in the user's requested language: ${options.language || 'en'}.
`;

  let fullPrompt = `System: ${systemInstruction}\n\n`;
  
  if (options.farmerContext) {
    fullPrompt += `Farmer Context:
${JSON.stringify(options.farmerContext, null, 2)}\n\n`;
  }
  
  if (options.context) {
    fullPrompt += `Retrieved Agricultural Context:
${options.context}\n\n`;
  }
  
  fullPrompt += `User Question:
${options.prompt}`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate response from Gemini");
  }
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const model = getEmbeddingModel();
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Gemini Embedding Error:", error);
    throw new Error("Failed to generate embedding");
  }
};
