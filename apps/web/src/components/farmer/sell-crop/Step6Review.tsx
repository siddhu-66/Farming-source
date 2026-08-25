'use client';
import { useSellCropStore } from '@/stores/sellCropStore';
import { CheckCircle2 } from 'lucide-react';

export function Step6Review() {
  const state = useSellCropStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center text-green-600 mb-6">
        <CheckCircle2 className="w-6 h-6 mr-2" />
        <h2 className="text-xl font-bold">Review Your Listing</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-xl p-6 border">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Crop Details</h3>
            <p className="font-medium">{state.cropName} {state.cropVariety ? `(${state.cropVariety})` : ''}</p>
            <p className="text-sm">Category: {state.cropCategory}</p>
            <p className="text-sm">Harvest: {state.harvestDate}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Quality & Quantity</h3>
            <p className="font-medium">{state.quantity} {state.unit}</p>
            <p className="text-sm">Grade: {state.qualityGrade}</p>
            {state.packagingType && <p className="text-sm">Packaging: {state.packagingType}</p>}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Pricing</h3>
            <p className="font-medium">₹{state.pricePerUnit} per {state.unit}</p>
            <p className="text-sm capitalize">Mode: {state.sellingMode}</p>
            <p className="text-sm">Negotiable: {state.negotiable ? 'Yes' : 'No'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Pickup Location</h3>
            <p className="font-medium">{state.address.village}, {state.address.district}</p>
            <p className="text-sm">{state.address.state} - {state.address.pincode}</p>
            <p className="text-sm mt-1 text-primary">Transport: {state.transportPreference === 'buyer' ? 'Buyer Arranges' : state.transportPreference === 'farmer' ? 'Self Arranged' : 'AgriAssist Network'}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
        By clicking Publish, your listing will be visible to buyers across the platform. You will receive notifications when buyers place bids or initiate contact.
      </div>
    </div>
  );
}
