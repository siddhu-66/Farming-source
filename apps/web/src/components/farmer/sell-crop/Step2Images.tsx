'use client';
import { useState } from 'react';
import { useSellCropStore } from '@/stores/sellCropStore';
import { UploadCloud, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Step2Images() {
  const { images, imageUrls, setImages } = useSellCropStore();
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newUrls = newFiles.map(f => URL.createObjectURL(f));
      setImages([...images, ...newFiles], [...imageUrls, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...images];
    const newUrls = [...imageUrls];
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    setImages(newFiles, newUrls);
  };

  const runAiAnalysis = () => {
    if (images.length === 0) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAiAnalysis({
        detected: 'Tomato (Roma)',
        quality: 'Grade A (Estimated)',
        damage: 'None visible',
        suggestions: 'Lighting is good. Consider adding a photo with a size reference.'
      });
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Upload Images</h2>
        {images.length > 0 && (
          <Button onClick={runAiAnalysis} disabled={analyzing} className="bg-purple-600 hover:bg-purple-700">
            <Sparkles className="w-4 h-4 mr-2" /> {analyzing ? 'Analyzing...' : 'AI Image Analysis'}
          </Button>
        )}
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
        <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm font-medium mb-1">Drag & Drop or Click to Upload</p>
        <p className="text-xs text-gray-500 mb-4">JPG, PNG, WEBP (Max 10MB each)</p>
        <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
          Select Images
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {imageUrls.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {aiAnalysis && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-bold text-purple-900 flex items-center mb-2"><Sparkles className="w-4 h-4 mr-2"/> AI Insights</h3>
          <ul className="space-y-1 text-sm text-purple-800">
            <li><strong>Detected Crop:</strong> {aiAnalysis.detected}</li>
            <li><strong>Estimated Quality:</strong> {aiAnalysis.quality}</li>
            <li><strong>Visible Damage:</strong> {aiAnalysis.damage}</li>
            <li><strong>Suggestions:</strong> {aiAnalysis.suggestions}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
