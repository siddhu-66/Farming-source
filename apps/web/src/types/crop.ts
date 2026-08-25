export interface CropActivity {
  id: string;
  activityType: string;
  activityDate: string;
  description?: string;
  cost?: number;
  performedBy?: string;
}

export interface CropImage {
  id: string;
  imageUrl: string;
  imageType: string;
  analysisResult?: any;
  capturedAt?: string;
}

export interface CropNote {
  id: string;
  note: string;
  createdAt: string;
}

export interface CropCalendar {
  id: string;
  eventType: string;
  eventDate: string;
  status: string;
  notes?: string;
}

export interface YieldPrediction {
  expectedYield: number;
  confidenceScore: number;
  estimatedHarvestDate: string;
}

export interface IrrigationPlan {
  nextIrrigationDate: string;
  waterQuantity: number;
  durationMinutes: number;
  recommendedMethod: string;
  rainDelayWarning: boolean;
}

export interface FertilizerPlan {
  stage: string;
  fertilizer: string;
  status: string;
}

export interface CropAnalytics {
  growthProgress: { week: string; height: number; healthy: number }[];
  costVsProfit: { category: string; cost: number }[];
  expectedRevenue: number;
}

export interface Crop {
  id: string;
  farmId: string;
  parcelId: string;
  parcelName?: string;
  cropName: string;
  category: string;
  variety: string;
  area: number;
  seedSource?: string;
  seedQuantity?: number;
  sowingDate: string;
  expectedHarvestDate: string;
  season?: string;
  soilType?: string;
  irrigationMethod?: string;
  currentStage: string;
  healthScore: number;
  status: string;
  activities?: CropActivity[];
  images?: CropImage[];
  notes?: CropNote[];
  calendar?: CropCalendar[];
}
