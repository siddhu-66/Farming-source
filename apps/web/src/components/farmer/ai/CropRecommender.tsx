import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sprout, Loader2, ArrowRight, Droplets, MapPin, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export function CropRecommender() {
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    soilType: '',
    season: '',
    waterAvailability: 'moderate',
    landArea: 1,
  });
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.state || !formData.soilType || !formData.season) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.post('/ai/crop-recommend', formData);
      if (res.data.success) {
        setRecommendations(res.data.data.recommendations || []);
        toast.success('Recommendations generated');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!recommendations ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Sprout className="w-5 h-5 mr-2 text-primary" /> AI Crop Recommender
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">State *</label>
                  <Input 
                    required 
                    placeholder="e.g. Maharashtra" 
                    value={formData.state} 
                    onChange={e => setFormData({...formData, state: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">District</label>
                  <Input 
                    placeholder="e.g. Pune" 
                    value={formData.district} 
                    onChange={e => setFormData({...formData, district: e.target.value})} 
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
                  <label className="text-sm font-medium mb-1 block">Season *</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.season}
                    onChange={e => setFormData({...formData, season: e.target.value})}
                    required
                  >
                    <option value="">Select Season</option>
                    <option value="Kharif">Kharif (Monsoon)</option>
                    <option value="Rabi">Rabi (Winter)</option>
                    <option value="Zaid">Zaid (Summer)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Water Availability</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.waterAvailability}
                    onChange={e => setFormData({...formData, waterAvailability: e.target.value})}
                  >
                    <option value="abundant">Abundant (Canal/Tubewell)</option>
                    <option value="moderate">Moderate</option>
                    <option value="scarce">Scarce</option>
                    <option value="rainfed">Rainfed Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Land Area (Acres)</label>
                  <Input 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    value={formData.landArea} 
                    onChange={e => setFormData({...formData, landArea: parseFloat(e.target.value)})} 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sprout className="w-4 h-4 mr-2" />}
                Generate Recommendations
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Top Recommendations</h2>
            <Button variant="outline" onClick={() => setRecommendations(null)}>Start Over</Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-l-4 border-l-primary hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                          {rec.crop} <span className="ml-2 text-sm font-normal text-gray-500">({rec.duration} days)</span>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.reasoning}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 md:justify-end shrink-0">
                        <div className="flex items-center text-sm text-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                          <Droplets className="w-4 h-4 mr-2 text-blue-500" />
                          {rec.waterRequired}
                        </div>
                        <div className="flex items-center text-sm text-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                          <IndianRupee className="w-4 h-4 mr-2 text-green-600" />
                          Est: ₹{rec.estimatedRevenue}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
