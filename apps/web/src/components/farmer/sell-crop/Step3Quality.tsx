'use client';
import { useSellCropStore } from '@/stores/sellCropStore';

export function Step3Quality() {
  const { qualityGrade, quantity, unit, moisture, packagingType, updateField } = useSellCropStore();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Quality & Quantity</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Quality Grade *</label>
          <select 
            value={qualityGrade} 
            onChange={(e) => updateField('qualityGrade', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Grade...</option>
            <option value="Grade A (Premium)">Grade A (Premium)</option>
            <option value="Grade B">Grade B</option>
            <option value="Grade C">Grade C</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Packaging Type</label>
          <select 
            value={packagingType} 
            onChange={(e) => updateField('packagingType', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select...</option>
            <option value="Loose">Loose (Unpackaged)</option>
            <option value="Jute Bags (50kg)">Jute Bags (50kg)</option>
            <option value="Plastic Crates">Plastic Crates</option>
            <option value="Carton Boxes">Carton Boxes</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Total Quantity *</label>
          <div className="flex">
            <input 
              type="number"
              min="1"
              value={quantity} 
              onChange={(e) => updateField('quantity', e.target.value)}
              className="w-full p-2 border rounded-l-md"
            />
            <select 
              value={unit} 
              onChange={(e) => updateField('unit', e.target.value)}
              className="p-2 border-y border-r rounded-r-md bg-gray-50"
            >
              <option value="kg">kg</option>
              <option value="quintal">quintal</option>
              <option value="ton">ton</option>
              <option value="crate">crate</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Moisture Content (%)</label>
          <input 
            type="number"
            min="0"
            max="100"
            value={moisture} 
            onChange={(e) => updateField('moisture', e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
