import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../config/logger';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_CONTEXT = `You are AgriAssist AI — an expert agricultural assistant for Indian farmers. 
You specialize in: crop management, disease detection, yield prediction, market prices, government schemes, 
weather interpretation, sustainable farming, and agricultural best practices.
Always respond in the user's language (Hindi or English). Be concise, practical, and farmer-friendly.
Use ₹ for prices. Reference Indian agricultural context (MSP, APMC, Kisan Credit Card, PM-Kisan etc.).
When discussing diseases, provide actionable treatment steps.`;

export const analyzeListing = async (listingData: any, images: string[] = []): Promise<any> => {
  // In a real scenario, this would use a multimodal Gemini model passing images and data.
  // For now, we return mocked structured data based on the spec.
  return {
    crop: listingData.cropName || 'Unknown Crop',
    confidence: 95 + Math.random() * 4,
    quality: listingData.qualityGrade || 'Grade B',
    freshness: 'High',
    disease: 'None detected',
    suggestion: `Good quality. Consider setting your price around ₹${(listingData.pricePerUnit || 100) * 1.05} based on market demand.`
  };
};

export const chatWithAI = async (
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  userContext?: {
    role: string;
    location?: string;
    crops?: string[];
  }
): Promise<string> => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_CONTEXT + (userContext ? `\nUser is a ${userContext.role} from ${userContext.location || 'India'}.` : ''),
  });

  const chat = model.startChat({
    history: history.slice(-10), // Keep last 10 messages for context
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
};

export const detectCropDisease = async (imageBase64: string, cropName?: string): Promise<object> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Analyze this crop/plant image for diseases, pests, or nutrient deficiencies.
${cropName ? `This is a ${cropName} plant.` : ''}
Provide a JSON response with:
{
  "disease": "disease name or 'Healthy'",
  "confidence": 0-100,
  "description": "brief description",
  "severity": "low|medium|high|none",
  "treatment": ["step 1", "step 2", ...],
  "prevention": ["prevention 1", "prevention 2", ...],
  "organicTreatment": ["organic option 1", ...],
  "estimatedYieldImpact": "percentage reduction"
}`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: 'image/jpeg' as const,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    logger.warn('Failed to parse disease detection JSON');
  }

  return {
    disease: 'Unable to detect',
    confidence: 0,
    description: text,
    severity: 'unknown',
    treatment: [],
    prevention: [],
  };
};

export const getCropRecommendations = async (context: {
  state: string;
  district?: string;
  soilType: string;
  season: string;
  waterAvailability: string;
  previousCrop?: string;
  landArea: number;
  budget?: number;
}): Promise<object[]> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Based on the following farm conditions, recommend the top 5 crops to grow:
State: ${context.state}, District: ${context.district || 'not specified'}
Soil Type: ${context.soilType}
Season: ${context.season}
Water Availability: ${context.waterAvailability}
Previous Crop: ${context.previousCrop || 'none'}
Land Area: ${context.landArea} acres
Budget: ₹${context.budget || 'not specified'}

Provide a JSON array of 5 crop recommendations:
[{
  "cropName": "name",
  "variety": "recommended variety",
  "confidence": 0-100,
  "reason": "why this crop is suitable",
  "expectedYield": "expected yield per acre",
  "marketPrice": "current MSP or market price",
  "growingPeriod": "X months",
  "waterRequirement": "low|medium|high",
  "profitEstimate": "estimated profit per acre in ₹"
}]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    logger.warn('Failed to parse crop recommendations JSON');
  }

  return [];
};

export const getYieldPrediction = async (context: {
  cropName: string;
  variety?: string;
  landArea: number;
  soilType: string;
  irrigationType: string;
  state: string;
  season: string;
  fertilizersUsed?: string[];
}): Promise<object> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Predict the crop yield for:
Crop: ${context.cropName} (${context.variety || 'standard variety'})
Land: ${context.landArea} acres
Soil: ${context.soilType}
Irrigation: ${context.irrigationType}
State: ${context.state}
Season: ${context.season}
Fertilizers: ${context.fertilizersUsed?.join(', ') || 'standard NPK'}

Provide JSON:
{
  "predictedYield": "X quintals per acre",
  "totalYield": "X quintals",
  "confidence": 0-100,
  "factors": [{
    "factor": "name",
    "impact": "positive|negative|neutral",
    "description": "brief"
  }],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "estimatedRevenue": "₹X at current MSP"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    logger.warn('Failed to parse yield prediction JSON');
  }

  return { predictedYield: 'Unavailable', confidence: 0, factors: [], suggestions: [] };
};

export const getMarketInsights = async (cropName: string, state: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent(
    `Provide current market insights for ${cropName} in ${state}, India. Include:
    1. Current approximate market price (MSP and APMC mandi price)
    2. Price trend (rising/falling/stable)
    3. Best time to sell
    4. Key buyers/markets
    5. Export potential
    Keep it concise and practical.`
  );

  return result.response.text();
};

export const getFertilizerRecommendation = async (cropName: string, soilType: string, growthStage: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(
    `Provide organic and chemical fertilizer recommendations for ${cropName} growing in ${soilType} soil at the ${growthStage} stage. Include specific NPK ratios, application methods, and precautions.`
  );
  return result.response.text();
};

export const getIrrigationAdvice = async (cropName: string, weatherForecast: string, soilMoisture: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(
    `Provide irrigation advice for ${cropName}. The upcoming weather forecast is: ${weatherForecast}. Current soil moisture level is ${soilMoisture}. Should the farmer irrigate? If yes, how much and when?`
  );
  return result.response.text();
};

export const getGovernmentSchemes = async (state: string, farmerCategory: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(
    `List the top 5 active government agricultural schemes available for a ${farmerCategory} farmer in ${state}, India. Provide a brief description of the benefits and how to apply for each.`
  );
  return result.response.text();
};

export const getCircularFarmingAdvice = async (farmResources: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(
    `Based on these available farm resources: ${farmResources}, provide practical circular farming advice. How can the farmer reuse waste, integrate livestock/crops, and minimize external inputs?`
  );
  return result.response.text();
};

export const getSustainabilityInsights = async (farmPractices: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(
    `Analyze these current farming practices: ${farmPractices}. Provide a sustainability score out of 100 and suggest 3 high-impact changes to improve soil health, water conservation, and long-term sustainability.`
  );
  return result.response.text();
};

