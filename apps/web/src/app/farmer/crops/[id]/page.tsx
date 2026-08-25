"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCropStore } from "@/stores/useCropStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { format, differenceInDays } from "date-fns";
import { 
  ArrowLeft, Calendar, Droplets, MapPin, 
  Sprout, Activity, Image as ImageIcon, 
  AlertTriangle, Upload, Plus, BrainCircuit, LineChart, Target, ScanSearch
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { DiseaseDetectionModal } from "@/components/farmer/crops/DiseaseDetectionModal";

export default function CropDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    selectedCrop, fetchCropDetails, isLoading, uploadPhoto, addActivity,
    yieldPrediction, irrigationPlan, fertilizerSchedule, analytics,
    fetchYieldPrediction, fetchIrrigationPlan, fetchFertilizerSchedule, fetchAnalytics
  } = useCropStore();
  const id = params.id as string;
  const [isDiseaseModalOpen, setIsDiseaseModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCropDetails(id);
      fetchYieldPrediction(id);
      fetchIrrigationPlan(id);
      fetchFertilizerSchedule(id);
      fetchAnalytics(id);
    }
  }, [id, fetchCropDetails, fetchYieldPrediction, fetchIrrigationPlan, fetchFertilizerSchedule, fetchAnalytics]);

  const handleDiseaseAnalysis = async (file: File) => {
    // Simulated API Call
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({
          diseaseName: Math.random() > 0.5 ? "Leaf Blight (Early)" : "Healthy",
          severity: Math.random() > 0.5 ? "Moderate" : "Healthy",
          confidenceScore: 92,
          recommendedTreatment: "Apply copper-based fungicide and ensure adequate spacing for airflow."
        });
      }, 2000);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real app, upload logic here
      toast.success("Image uploaded successfully");
    }
  };

  if (isLoading && !selectedCrop) {
    return <div className="space-y-4">
      <Skeleton className="h-12 w-1/3" />
      <Skeleton className="h-[400px] w-full" />
    </div>;
  }

  if (!selectedCrop) {
    return <div>Crop not found</div>;
  }

  const daysSinceSowing = differenceInDays(new Date(), new Date(selectedCrop.sowingDate));
  const daysToHarvest = differenceInDays(new Date(selectedCrop.expectedHarvestDate), new Date());
  
  const handleSimulatePhotoUpload = async () => {
    // In a real app, this would open a file picker and upload to Supabase Storage
    const mockImageUrl = "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop";
    await uploadPhoto(id, mockImageUrl, "Leaf");
  };

  const handleSimulateActivity = async () => {
    await addActivity(id, {
      activityType: "Irrigation",
      activityDate: new Date().toISOString(),
      description: "Applied drip irrigation for 2 hours.",
      performedBy: "Farmer"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/farmer/crops')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {selectedCrop.cropName}
              <Badge className={
                selectedCrop.healthScore >= 75 ? "text-emerald-500 border-emerald-200 bg-emerald-50" : 
                selectedCrop.healthScore >= 50 ? "text-yellow-500 border-yellow-200 bg-yellow-50" : 
                "text-red-500 border-red-200 bg-red-50"
              }>
                Health: {selectedCrop.healthScore}%
              </Badge>
            </h1>
            <p className="text-muted-foreground">{selectedCrop.variety} • {selectedCrop.season}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSimulateActivity}>
            <Plus className="w-4 h-4 mr-2" /> Log Activity
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSimulatePhotoUpload}>
            <Upload className="w-4 h-4 mr-2" /> Analyze Photo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">{selectedCrop.currentStage}</div>
              <p className="text-sm mt-1 text-muted-foreground">
                {daysSinceSowing} days since sowing
              </p>
              <p className="text-sm mt-1 font-medium">
                {daysToHarvest > 0 ? `${daysToHarvest} days to harvest` : "Harvest Ready!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{selectedCrop.parcelName || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">{selectedCrop.area} Acres</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Sowing Date</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(selectedCrop.sowingDate), 'PPP')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Droplets className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Irrigation</p>
                  <p className="text-sm text-muted-foreground">{selectedCrop.irrigationMethod || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sprout className="w-4 h-4 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Seed Source</p>
                  <p className="text-sm text-muted-foreground">{selectedCrop.seedSource || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="mb-4 overflow-x-auto hide-scrollbar flex justify-start border-b w-full pb-px h-auto rounded-none bg-transparent gap-4">
              <TabsTrigger value="timeline" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none bg-transparent">
                <Activity className="w-4 h-4" /> Timeline
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none bg-transparent">
                <ImageIcon className="w-4 h-4" /> Images & Disease Detection
              </TabsTrigger>
              <TabsTrigger value="ai-insights" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none bg-transparent text-purple-600">
                <BrainCircuit className="w-4 h-4" /> AI Yield & Plans
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>History of all farming operations on this crop.</CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedCrop.activities || selectedCrop.activities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No activities recorded yet.</div>
                  ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                      {selectedCrop.activities.map((activity, index) => (
                        <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          {/* Marker */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Activity className="w-4 h-4" />
                          </div>
                          
                          {/* Card */}
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-slate-900">{activity.activityType}</h4>
                              <time className="text-xs font-medium text-emerald-600">
                                {format(new Date(activity.activityDate), 'MMM d, yyyy')}
                              </time>
                            </div>
                            <p className="text-sm text-slate-500">{activity.description}</p>
                            {activity.cost && (
                              <p className="text-xs font-medium mt-2 text-slate-600">Cost: ₹{activity.cost}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Crop Images</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>
                    <Upload className="w-4 h-4 mr-2" /> Upload Photo
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsDiseaseModalOpen(true)}>
                    <ScanSearch className="w-4 h-4 mr-2" /> AI Scan
                  </Button>
                </div>
                <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Images & AI Analysis</CardTitle>
                  <CardDescription>Visual record of crop growth and AI health assessments.</CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedCrop.images || selectedCrop.images.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                      <ImageIcon className="w-12 h-12 opacity-20 mb-4" />
                      <p>No images uploaded yet.</p>
                      <Button variant="outline" className="mt-4" onClick={handleSimulatePhotoUpload}>Upload First Photo</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedCrop.images.map(image => (
                        <div key={image.id} className="border rounded-lg overflow-hidden group">
                          <div className="relative h-48 w-full bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={image.imageUrl} 
                              alt="Crop" 
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                              {image.imageType}
                            </div>
                          </div>
                          <div className="p-3 bg-white">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-muted-foreground">
                                {image.capturedAt ? format(new Date(image.capturedAt), 'PPP') : 'Unknown Date'}
                              </span>
                              {image.analysisResult && (
                                <Badge className={
                                  image.analysisResult.status === 'Healthy' ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-red-600 border-red-200 bg-red-50"
                                }>
                                  {image.analysisResult.status}
                                </Badge>
                              )}
                            </div>
                            {image.analysisResult?.disease && (
                              <p className="text-sm font-medium text-red-600 flex items-center gap-1 mb-1">
                                <AlertTriangle className="w-3 h-3" /> Detected: {image.analysisResult.disease}
                              </p>
                            )}
                            {image.analysisResult?.recommendation && (
                              <p className="text-xs text-slate-600 mt-1">
                                <span className="font-medium text-slate-900">AI Rec:</span> {image.analysisResult.recommendation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <DiseaseDetectionModal 
                isOpen={isDiseaseModalOpen} 
                onClose={() => setIsDiseaseModalOpen(false)} 
                onAnalyze={handleDiseaseAnalysis} 
              />
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-6">
              {/* Yield Prediction */}
              <Card className="border-purple-100 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-900/10">
                <CardHeader>
                  <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center gap-2">
                    <Target className="w-5 h-5" /> AI Yield Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expected Yield</p>
                    <p className="text-2xl font-bold">{yieldPrediction?.expectedYield || 'N/A'} Tons</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{yieldPrediction?.confidenceScore || 0}%</p>
                      <Badge className="border-purple-200 text-purple-700 bg-purple-100">High</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Est. Harvest</p>
                    <p className="text-2xl font-bold">{yieldPrediction?.estimatedHarvestDate ? format(new Date(yieldPrediction.estimatedHarvestDate), 'MMM d, yyyy') : 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Irrigation Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <Droplets className="w-5 h-5" /> AI Irrigation Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Next Irrigation</span>
                      <span className="font-medium">{irrigationPlan?.nextIrrigationDate ? format(new Date(irrigationPlan.nextIrrigationDate), 'MMM d, yyyy') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Water Quantity</span>
                      <span className="font-medium">{irrigationPlan?.waterQuantity || 0} Liters</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{irrigationPlan?.durationMinutes || 0} Mins</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium">{irrigationPlan?.recommendedMethod || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Fertilizer Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-600">
                      <Sprout className="w-5 h-5" /> Fertilizer Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {fertilizerSchedule?.map((plan, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{plan.stage}</p>
                            <p className="text-sm text-muted-foreground">{plan.fertilizer}</p>
                          </div>
                          <Badge className={
                            plan.status === 'Completed' ? "bg-emerald-100 text-emerald-800" :
                            plan.status === 'Due' ? "bg-amber-100 text-amber-800" :
                            "bg-slate-100 text-slate-800"
                          }>
                            {plan.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
