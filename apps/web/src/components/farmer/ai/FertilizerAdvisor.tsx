import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Beaker, Loader2, Calendar, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export function FertilizerAdvisor() {
  const [formData, setFormData] = useState({
    cropName: '',
    soilType: '',
    growthStage: '',
  });
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cropName || !formData.soilType || !formData.growthStage) {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.post('/ai/fertilizer-recommend', formData);
      if (res.data.success) {
        setAdvice(res.data.data.advice);
        toast.success('Advice generated');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to get fertilizer advice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!advice ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Beaker className="w-5 h-5 mr-2 text-primary" /> Fertilizer & Nutrient Advisor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Crop Name *</label>
                <Input 
                  required 
                  placeholder="e.g. Wheat, Tomato" 
                  value={formData.cropName} 
                  onChange={e => setFormData({...formData, cropName: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Soil Type *</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.soilType}
                  onChange={e => setFormData({...formData, soilType: e.target.value})}
                  required
                >
                  <option value="">Select Soil Type</option>
                  <option value="Alluvial">Alluvial</option>
                  <option value="Black">Black (Regur)</option>
                  <option value="Red">Red</option>
                  <option value="Laterite">Laterite</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Clay">Clay</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Current Growth Stage *</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.growthStage}
                  onChange={e => setFormData({...formData, growthStage: e.target.value})}
                  required
                >
                  <option value="">Select Stage</option>
                  <option value="Seedling">Seedling / Early Vegetative</option>
                  <option value="Vegetative">Active Vegetative</option>
                  <option value="Flowering">Flowering</option>
                  <option value="Fruiting">Fruiting / Grain Filling</option>
                  <option value="Pre-Harvest">Pre-Harvest</option>
                </select>
              </div>
              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Beaker className="w-4 h-4 mr-2" />}
                Get Fertilizer Plan
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl">Recommended Nutrient Plan</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setAdvice(null)}>New Plan</Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Recommended Fertilizer</h4>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{advice.fertilizerType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Quantity Required</h4>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{advice.quantity}</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center mb-2">
                  <Calendar className="w-4 h-4 mr-2" /> Application Method & Schedule
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{advice.schedule}</p>
              </div>

              {advice.warnings && (
                <div>
                  <h4 className="font-semibold flex items-center mb-2 text-gray-700 dark:text-gray-300">
                    <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" /> Important Warnings
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{advice.warnings}</p>
                </div>
              )}

            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
