'use client';
import { useEffect, useState } from 'react';
import { useSellCropStore } from '@/stores/sellCropStore';
import { IndianRupee, TrendingUp, Sparkles } from 'lucide-react';
import api from '@/lib/api';

export function Step4Pricing() {
  const { sellingMode, pricePerUnit, minPrice, negotiable, updateField, cropName, qualityGrade, quantity } = useSellCropStore();
  const [aiPricing, setAiPricing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPriceSuggestion = async () => {
      if (!cropName) return;
      setLoading(true);
      try {
        const res = await api.get('/marketplace/price-suggestion', {
          params: { cropName, grade: qualityGrade, quantity }
        });
        if (res.data?.success) {
          setAiPricing(res.data.data);
          // Optionally pre-fill the price if empty
          if (!pricePerUnit) updateField('pricePerUnit', res.data.data.suggestedPrice.toString());
        }
      } catch (err) {
        console.error("Failed to fetch price suggestion", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPriceSuggestion();
  }, [cropName, qualityGrade, quantity]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Pricing Strategy</h2>
      
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 flex items-start space-x-3">
        <Sparkles className="w-6 h-6 text-purple-600 mt-1" />
        <div>
          <h3 className="font-bold text-purple-900">AI Price Guidance</h3>
          {loading ? (
            <p className="text-sm text-purple-800">Analyzing market trends...</p>
          ) : aiPricing ? (
            <div className="text-sm text-purple-800 space-y-1">
              <p>Suggested Price: <span className="font-bold">₹{aiPricing.suggestedPrice}/unit</span></p>
              <p>Market Trend: <span className="font-semibold">{aiPricing.marketTrend}</span></p>
              <p>Minimum Acceptable: ₹{aiPricing.minAcceptablePrice}/unit</p>
            </div>
          ) : (
            <p className="text-sm text-purple-800">No data available for this crop.</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Selling Mode *</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['fixed', 'auction', 'negotiation'].map(mode => (
            <label key={mode} className={`border p-4 rounded-lg cursor-pointer flex flex-col items-center justify-center text-center ${sellingMode === mode ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2' : 'hover:bg-gray-50'}`}>
              <input 
                type="radio" 
                name="sellingMode" 
                value={mode} 
                checked={sellingMode === mode}
                onChange={(e) => updateField('sellingMode', e.target.value)}
                className="hidden" 
              />
              <span className="font-bold capitalize">{mode}</span>
              <span className="text-xs text-gray-500 mt-1">
                {mode === 'fixed' ? 'Buy it now price' : mode === 'auction' ? 'Buyers place bids' : 'Open to offers'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Expected Price (₹ per unit) *</label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input 
              type="number"
              min="0"
              value={pricePerUnit} 
              onChange={(e) => updateField('pricePerUnit', e.target.value)}
              className="w-full pl-10 p-2 border rounded-md"
            />
          </div>
        </div>

        {sellingMode !== 'fixed' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Acceptable Price (₹)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input 
                type="number"
                min="0"
                value={minPrice} 
                onChange={(e) => updateField('minPrice', e.target.value)}
                className="w-full pl-10 p-2 border rounded-md"
            />
            </div>
          </div>
        )}

        {sellingMode === 'fixed' && (
          <div className="flex items-center space-x-2 pt-8">
            <input 
              type="checkbox" 
              id="negotiable"
              checked={negotiable}
              onChange={(e) => updateField('negotiable', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="negotiable" className="text-sm font-medium">Price is Negotiable</label>
          </div>
        )}
      </div>
    </div>
  );
}
