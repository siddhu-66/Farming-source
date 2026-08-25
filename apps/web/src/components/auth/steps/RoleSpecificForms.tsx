'use client';

import { useRegistrationStore } from '@/stores/registrationStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function RoleSpecificForms({ role, onNext, onPrev }: { role: string, onNext: () => void, onPrev: () => void }) {
  const { data, updateData } = useRegistrationStore();
  const info = data.roleInformation || {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateData('roleInformation', { [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (role === 'farmer') {
      if (!info.farmName || !info.landArea || !info.primaryCrops) return toast.error('Please fill all required role details');
    } else if (role === 'buyer') {
      if (!info.businessName || !info.gstNumber || !info.buyingCategories) return toast.error('Please fill all required role details');
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(info.gstNumber.toUpperCase())) return toast.error('Invalid GST Number format');
    } else if (role === 'transport') {
      if (!info.vehicleNumber || !info.vehicleType || !info.drivingLicense) return toast.error('Please fill all required role details');
      if (!/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(info.vehicleNumber.toUpperCase())) return toast.error('Invalid Vehicle Number (e.g. MH12AB1234)');
      if (!/^[A-Z]{2}[0-9]{13}$/.test(info.drivingLicense.toUpperCase())) return toast.error('Invalid Driving License format');
    } else if (role === 'industry') {
      if (!info.industryName || !info.factoryType || !info.gstNumber) return toast.error('Please fill all required role details');
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(info.gstNumber.toUpperCase())) return toast.error('Invalid GST Number format');
    }
    onNext();
  };

  const renderFarmerForm = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Farm Name *</label>
          <Input name="farmName" value={info.farmName || ''} onChange={handleChange} className="w-full bg-white/5 border-white/10 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Land Area (in Acres) *</label>
          <Input name="landArea" type="number" value={info.landArea || ''} onChange={handleChange} className="w-full bg-white/5 border-white/10 text-white" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Primary Crops *</label>
        <Input name="primaryCrops" value={info.primaryCrops || ''} onChange={handleChange} placeholder="e.g. Wheat, Rice, Cotton" className="w-full bg-white/5 border-white/10 text-white" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Soil Type</label>
          <Input name="soilType" value={info.soilType || ''} onChange={handleChange} className="w-full bg-white/5 border-white/10 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Irrigation Method</label>
          <Input name="irrigation" value={info.irrigation || ''} onChange={handleChange} className="w-full bg-white/5 border-white/10 text-white" />
        </div>
      </div>
    </div>
  );

  const renderBuyerForm = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Business Name *</label>
          <Input name="businessName" value={info.businessName || ''} onChange={handleChange} className="w-full bg-white/5 border-white/10 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">GST Number *</label>
          <Input name="gstNumber" value={info.gstNumber || ''} onChange={handleChange} className="w-full bg-white/5 border-white/10 text-white uppercase" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Buying Categories *</label>
        <Input name="buyingCategories" value={info.buyingCategories || ''} onChange={handleChange} placeholder="e.g. Grains, Fruits, Vegetables" className="w-full bg-white/5 border-white/10 text-white" />
      </div>
    </div>
  );

  const renderTransportForm = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Vehicle Number *</label>
          <Input name="vehicleNumber" value={info.vehicleNumber || ''} onChange={handleChange} className="w-full bg-white/5 border-white/10 text-white uppercase" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Vehicle Type *</label>
          <select name="vehicleType" value={info.vehicleType || ''} onChange={handleChange} className="w-full bg-[#0a0f0a] border border-white/10 text-white rounded-md h-10 px-3">
            <option value="">Select Type</option>
            <option value="Mini Truck">Mini Truck</option>
            <option value="Heavy Truck">Heavy Truck</option>
            <option value="Refrigerated">Refrigerated</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Driving License Number *</label>
        <Input name="drivingLicense" value={info.drivingLicense || ''} onChange={handleChange} className="w-full bg-white/5 border-white/10 text-white uppercase" />
      </div>
    </div>
  );

  const renderIndustryForm = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Industry Name *</label>
          <Input name="industryName" value={info.industryName || ''} onChange={handleChange} className="w-full bg-white/5 border-white/10 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Factory Type *</label>
          <select name="factoryType" value={info.factoryType || ''} onChange={handleChange} className="w-full bg-[#0a0f0a] border border-white/10 text-white rounded-md h-10 px-3">
            <option value="">Select Type</option>
            <option value="Food Processing">Food Processing</option>
            <option value="Biofuel">Biofuel Refinery</option>
            <option value="Textile">Textile Mill</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">GST Number *</label>
        <Input name="gstNumber" value={info.gstNumber || ''} onChange={handleChange} className="w-full bg-white/5 border-white/10 text-white uppercase" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {role === 'farmer' && renderFarmerForm()}
      {role === 'buyer' && renderBuyerForm()}
      {role === 'transport' && renderTransportForm()}
      {role === 'industry' && renderIndustryForm()}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="border-white/10 text-white hover:bg-white/5">
          Previous
        </Button>
        <Button onClick={handleNext} className="bg-green-500 hover:bg-green-600 text-white px-8">
          Review Application
        </Button>
      </div>
    </div>
  );
}
