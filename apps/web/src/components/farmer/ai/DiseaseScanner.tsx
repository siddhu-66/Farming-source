import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Upload, Camera, AlertTriangle, CheckCircle, Leaf, Activity, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export function DiseaseScanner() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropName, setCropName] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image exceeds 10MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setReport(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    try {
      setLoading(true);
      const res = await api.post('/ai/disease-detect', {
        imageBase64: selectedImage,
        cropName: cropName || 'Unknown Crop',
      });
      if (res.data.success) {
        setReport(res.data.data.result);
        toast.success('Analysis complete');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!report ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Camera className="w-5 h-5 mr-2 text-primary" /> Scan Crop for Disease
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Crop Name (Optional)</label>
              <Input 
                placeholder="e.g. Tomato, Wheat" 
                value={cropName} 
                onChange={(e) => setCropName(e.target.value)} 
              />
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-gray-50 dark:bg-gray-800/50">
              {selectedImage ? (
                <div className="space-y-4">
                  <img src={selectedImage} alt="Uploaded crop" className="max-h-64 mx-auto rounded-lg shadow-sm" />
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => { setSelectedImage(null); setReport(null); }}>
                      Remove
                    </Button>
                    <Button onClick={handleAnalyze} disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
                      Analyze Now
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500 mb-4">Upload a clear photo of the affected crop leaf</p>
                  <p className="text-xs text-gray-400 mb-6">Supported: JPG, PNG (Max 10MB)</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/webp" 
                    onChange={handleImageUpload} 
                    ref={fileInputRef}
                  />
                  <Button type="button" onClick={() => fileInputRef.current?.click()}>
                    Select Image
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-100 dark:border-green-900/30 overflow-hidden">
          <div className="bg-green-500 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center text-lg">
              <CheckCircle className="w-5 h-5 mr-2" /> Analysis Report
            </h3>
            <Button variant="ghost" className="text-white hover:text-white hover:bg-green-600 h-8" onClick={() => { setReport(null); setSelectedImage(null); }}>
              New Scan
            </Button>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 shrink-0">
                <img src={selectedImage!} alt="Scanned crop" className="w-full rounded-lg border shadow-sm" />
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Detected Condition</p>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{report.disease || 'Unknown'}</h2>
                    </div>
                    {report.confidence && (
                      <Badge className="text-lg py-1 px-3 bg-gray-50 text-gray-800 border border-gray-200">
                        {report.confidence}% Match
                      </Badge>
                    )}
                  </div>
                  
                  {report.severity && (
                    <div className="mt-2">
                       <Badge className={
                         report.severity.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                         report.severity.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                         'bg-green-100 text-green-800'
                       }>
                         Severity: {report.severity.toUpperCase()}
                       </Badge>
                    </div>
                  )}
                </div>

                {report.treatment && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center mb-2">
                      <Activity className="w-4 h-4 mr-2" /> Recommended Treatment
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{report.treatment}</p>
                  </div>
                )}

                {report.prevention && (
                  <div>
                    <h4 className="font-semibold flex items-center mb-2 text-gray-700 dark:text-gray-300">
                      <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" /> Preventive Measures
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{report.prevention}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
