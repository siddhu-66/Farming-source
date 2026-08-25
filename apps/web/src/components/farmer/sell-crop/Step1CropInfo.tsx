'use client';
import { useSellCropStore } from '@/stores/sellCropStore';

export function Step1CropInfo() {
  const { cropCategory, cropName, cropVariety, harvestDate, organicCertified, irrigationType, description, updateField } = useSellCropStore();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Crop Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Crop Category *</label>
          <select 
            value={cropCategory} 
            onChange={(e) => updateField('cropCategory', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Category...</option>
            <option value="Cereals">Cereals</option>
            <option value="Pulses">Pulses</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Crop Name *</label>
          <input 
            type="text"
            value={cropName} 
            onChange={(e) => updateField('cropName', e.target.value)}
            placeholder="e.g. Tomato"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Variety</label>
          <input 
            type="text"
            value={cropVariety} 
            onChange={(e) => updateField('cropVariety', e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Harvest Date *</label>
          <input 
            type="date"
            value={harvestDate} 
            onChange={(e) => updateField('harvestDate', e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Irrigation Type</label>
          <select 
            value={irrigationType} 
            onChange={(e) => updateField('irrigationType', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select...</option>
            <option value="Drip">Drip</option>
            <option value="Sprinkler">Sprinkler</option>
            <option value="Flood">Flood</option>
            <option value="Rainfed">Rainfed</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 pt-8">
          <input 
            type="checkbox" 
            id="organic"
            checked={organicCertified}
            onChange={(e) => updateField('organicCertified', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="organic" className="text-sm font-medium">Organic Certified</label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea 
          value={description} 
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Describe your crop quality..."
          className="w-full p-2 border rounded-md h-24"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 text-right">{description.length}/500</p>
      </div>
    </div>
  );
}
