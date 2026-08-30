"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, ArrowLeft, Loader2, CheckCircle2, Scan } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function DocumentOCR() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [docType, setDocType] = useState('aadhaar');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target?.result as string);
      reader.readAsDataURL(file);
      setReport(null);
    }
  };

  const analyzeDocument = async () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    
    try {
      const res = await api.post('/ai/document/ocr', {
        documentUrl: "base64_simulated_payload",
        documentType: docType
      });
      
      if (res.data?.success) {
        setReport(res.data.data.document);
        toast.success("Document parsed successfully");
      }
    } catch (err) {
      toast.error("Failed to parse document");
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
          <h1 className="text-3xl font-bold text-slate-800">Document Intelligence</h1>
          <p className="text-muted-foreground">Upload official documents to instantly extract and verify details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button 
              variant={docType === 'aadhaar' ? 'primary' : 'outline'} 
              className={docType === 'aadhaar' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
              onClick={() => { setDocType('aadhaar'); setReport(null); }}
            >
              Aadhaar Card
            </Button>
            <Button 
              variant={docType === 'land_record' ? 'primary' : 'outline'} 
              className={docType === 'land_record' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
              onClick={() => { setDocType('land_record'); setReport(null); }}
            >
              Land Record
            </Button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*,application/pdf" 
            className="hidden" 
          />
          
          {!selectedImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-3xl h-80 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 group"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-800">Tap to upload document</h3>
              <p className="text-sm mt-1 text-center max-w-xs">Supports PDF or Image formats.</p>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden border shadow-sm group">
              <img src={selectedImage} alt="Document" className="w-full h-80 object-cover opacity-70" />
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/10 backdrop-blur-[2px]">
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  Change Document
                </Button>
              </div>
            </div>
          )}

          {selectedImage && !report && (
            <Button 
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg shadow-lg shadow-indigo-600/20"
              onClick={analyzeDocument}
              disabled={analyzing}
            >
              {analyzing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Running OCR Engine...</>
              ) : (
                <><Scan className="w-5 h-5 mr-2" /> Extract Data</>
              )}
            </Button>
          )}
        </div>

        {/* Results Section */}
        <div>
          <AnimatePresence mode="wait">
            {!report && !analyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex items-center justify-center text-slate-400 p-8 text-center border-2 border-dashed rounded-3xl">
                <p>Upload a document and click extract to view parsed JSON data here.</p>
              </motion.div>
            )}

            {analyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-indigo-600 space-y-4">
                <Scan className="w-16 h-16 animate-pulse" />
                <p className="font-bold animate-pulse">Scanning Text...</p>
              </motion.div>
            )}

            {report && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                
                <Card className="border-t-4 border-t-indigo-500 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <FileText className="w-32 h-32 text-indigo-900" />
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Document Type</p>
                        <h2 className="text-xl font-bold text-slate-800 capitalize">{report.documentType.replace('_', ' ')}</h2>
                      </div>
                      <div className="px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" /> {report.confidenceScore}% Acc
                      </div>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(report.extractedData).map(([key, value]) => (
                        <div key={key} className="bg-slate-50 p-3 rounded-lg border">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="font-medium text-slate-800 text-lg">{value as string}</p>
                        </div>
                      ))}
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
