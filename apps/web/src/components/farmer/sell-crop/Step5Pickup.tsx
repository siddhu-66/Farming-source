'use client';
import { useSellCropStore } from '@/stores/sellCropStore';

export function Step5Pickup() {
  const { farmName, address, pickupDate, transportPreference, updateField, updateAddress } = useSellCropStore();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Pickup & Transport Details</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Location Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Farm/Storage Name</label>
            <input 
              type="text"
              value={farmName} 
              onChange={(e) => updateField('farmName', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Village / Town *</label>
            <input 
              type="text"
              value={address.village} 
              onChange={(e) => updateAddress('village', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">District *</label>
            <input 
              type="text"
              value={address.district} 
              onChange={(e) => updateAddress('district', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">State *</label>
            <input 
              type="text"
              value={address.state} 
              onChange={(e) => updateAddress('state', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">PIN Code *</label>
            <input 
              type="text"
              value={address.pincode} 
              onChange={(e) => updateAddress('pincode', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-medium border-b pb-2">Transport Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Pickup Date *</label>
            <input 
              type="date"
              value={pickupDate} 
              onChange={(e) => updateField('pickupDate', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Who manages transport? *</label>
            <select 
              value={transportPreference} 
              onChange={(e) => updateField('transportPreference', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="buyer">Buyer arranges transport</option>
              <option value="farmer">I will arrange transport</option>
              <option value="agriassist">Use AgriAssist Transport Network</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
