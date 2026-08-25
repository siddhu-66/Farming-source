'use client';

import { useState } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function PersonalInfo({ onNext }: { onNext: () => void }) {
  const { data, updateData } = useRegistrationStore();
  const [loading, setLoading] = useState(false);
  const info = data.personalInfo;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData('personalInfo', { [e.target.name]: e.target.value });
  };

  const handleNext = async () => {
    if (!info.firstName || !info.lastName || !info.phone || !info.email) {
      return toast.error('Please fill all required fields');
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(info.phone)) {
      return toast.error('Please enter a valid 10-digit mobile number');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(info.email)) {
      return toast.error('Please enter a valid email address');
    }
    
    // API Validation
    setLoading(true);
    try {
      const { data: result } = await api.post('/v1/auth/check-user', { 
        email: info.email, 
        phone: info.phone 
      });
      
      if (!result.emailAvailable || !result.phoneAvailable) {
        toast.error('Email or mobile number is already in use');
      } else {
        onNext();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Network error during validation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">First Name *</label>
          <Input name="firstName" value={info.firstName} onChange={handleChange} placeholder="e.g. Ramesh" className="w-full bg-white/5 border-white/10 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Last Name *</label>
          <Input name="lastName" value={info.lastName} onChange={handleChange} placeholder="e.g. Patel" className="w-full bg-white/5 border-white/10 text-white" />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Mobile Number *</label>
          <Input name="phone" type="tel" value={info.phone} onChange={handleChange} placeholder="10-digit number" className="w-full bg-white/5 border-white/10 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Email Address *</label>
          <Input name="email" type="email" value={info.email} onChange={handleChange} placeholder="your@email.com" className="w-full bg-white/5 border-white/10 text-white" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Country *</label>
          <Input name="country" value={info.country} onChange={handleChange} placeholder="India" className="w-full bg-white/5 border-white/10 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">State *</label>
          <Input name="state" value={info.state} onChange={handleChange} placeholder="e.g. Maharashtra" className="w-full bg-white/5 border-white/10 text-white" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">District *</label>
          <Input name="district" value={info.district} onChange={handleChange} placeholder="e.g. Nashik" className="w-full bg-white/5 border-white/10 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Village / City *</label>
          <Input name="villageCity" value={info.villageCity} onChange={handleChange} placeholder="Village name" className="w-full bg-white/5 border-white/10 text-white" />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={handleNext} disabled={loading} className="bg-green-500 hover:bg-green-600 text-white px-8">
          {loading ? 'Validating...' : 'Next Step'}
        </Button>
      </div>
    </div>
  );
}
