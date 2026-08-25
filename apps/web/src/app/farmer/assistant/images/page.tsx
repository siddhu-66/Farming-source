"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, ShieldAlert, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, Droplet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function ImageDiagnosis() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target?.result as string);
      reader.readAsDataURL(file);
      setReport(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    
    try {
      const res = await api.post('/api/v1/ai/image', {
        imageUrl: "base64_simulated_payload",
        cropType: "Tomato"
      });
      
      if (res.data?.success) {
        setReport(res.data.data.report);
        toast.success("Analysis complete");
      }
    } catch (err) {
      toast.error("Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Crop Image Diagnosis</h1>
          <p className="text-muted-foreground">Upload a photo of your crop to instantly identify diseases and get treatment advice.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <div className="space-y-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />
          
          {!selectedImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-3xl h-80 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 group"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-800">Tap to upload photo</h3>
              <p className="text-sm mt-1 text-center max-w-xs">Upload a clear photo of the affected leaf or plant for best results.</p>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden border shadow-sm group">
              <img src={selectedImage} alt="Crop" className="w-full h-80 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  Change Photo
                </Button>
              </div>
            </div>
          )}

          {selectedImage && !report && (
            <Button 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-lg shadow-lg shadow-emerald-600/20"
              onClick={analyzeImage}
              disabled={analyzing}
            >
              {analyzing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Image with AI...</>
              ) : (
                <><Camera className="w-5 h-5 mr-2" /> Analyze Crop Health</>
              )}
            </Button>
          )}
        </div>

        {/* Results Section */}
        <div>
          <AnimatePresence mode="wait">
            {!report && !analyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex items-center justify-center text-slate-400 p-8 text-center border-2 border-dashed rounded-3xl">
                <p>Upload a photo and click analyze to view the AI health report here.</p>
              </motion.div>
            )}

            {analyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-emerald-600 space-y-4">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping" />
                  <div className="absolute inset-2 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="font-bold animate-pulse">Running Vision Models...</p>
              </motion.div>
            )}

            {report && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                
                <Card className={`border-t-4 ${report.healthStatus === 'infected' ? 'border-t-red-500' : 'border-t-emerald-500'}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Detected Crop</p>
                        <h2 className="text-2xl font-bold text-slate-800">{report.detectedCrop}</h2>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${report.healthStatus === 'infected' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {report.healthStatus === 'infected' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        {report.healthStatus.toUpperCase()}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-500" /> Issues Detected
                        </h4>
                        <div className="space-y-2">
                          {report.diseases.map((d: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                              <span className="font-medium text-slate-700">{d.name}</span>
                              <span className="text-xs font-bold bg-white px-2 py-1 rounded shadow-sm text-slate-500">
                                {d.confidence}% match
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                          <Droplet className="w-4 h-4 text-blue-500" /> Recommended Treatment
                        </h4>
                        <ul className="space-y-2">
                          {report.treatmentSuggestions.map((t: string, i: number) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
