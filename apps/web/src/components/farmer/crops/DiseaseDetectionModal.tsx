import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Upload, X, ScanSearch, CheckCircle2, AlertTriangle, Bug } from "lucide-react";

interface DiseaseDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (file: File) => Promise<{
    diseaseName: string;
    severity: string;
    confidenceScore: number;
    recommendedTreatment: string;
  }>;
}

export function DiseaseDetectionModal({ isOpen, onClose, onAnalyze }: DiseaseDetectionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      // Simulate network/AI delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      const res = await onAnalyze(file);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="AI Disease Detection">
      <div className="mb-4">
        <p className="text-sm text-slate-500">Upload an image of a leaf or crop to scan for diseases.</p>
      </div>

      <div className="space-y-4">
        {!preview ? (
          <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center relative">
            <Upload className="w-8 h-8 text-muted-foreground mb-4" />
            <p className="text-sm font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            {!isAnalyzing && !result && (
              <Button 
                variant="danger" 
                size="icon" 
                className="absolute top-2 right-2 rounded-full h-8 w-8"
                onClick={() => { setPreview(null); setFile(null); }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center text-white"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ScanSearch className="w-12 h-12 mb-4 text-emerald-400" />
                  </motion.div>
                  <p className="font-medium animate-pulse">AI is analyzing your crop...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${result.severity === 'Healthy' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
          >
            <div className="flex items-start gap-3">
              {result.severity === 'Healthy' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <Bug className="w-6 h-6 text-red-600 shrink-0" />
              )}
              <div>
                <h4 className={`font-bold ${result.severity === 'Healthy' ? 'text-emerald-800' : 'text-red-800'}`}>
                  {result.diseaseName}
                </h4>
                <div className="flex gap-4 text-sm mt-1 mb-2">
                  <span className="font-medium">Confidence: {result.confidenceScore}%</span>
                  <span className="font-medium">Severity: {result.severity}</span>
                </div>
                {result.recommendedTreatment && (
                  <p className="text-sm text-slate-700 bg-white/50 p-2 rounded border border-white">
                    <strong>AI Recommendation:</strong> {result.recommendedTreatment}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={handleClose}>Cancel</Button>
        {!result && preview && (
          <Button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-emerald-600 hover:bg-emerald-700">
            {isAnalyzing ? "Analyzing..." : "Analyze Image"}
          </Button>
        )}
        {result && (
          <Button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700">
            Done
          </Button>
        )}
      </div>
    </Dialog>
  );
}
