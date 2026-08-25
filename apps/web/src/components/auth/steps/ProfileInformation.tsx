'use client';

import { useState } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Camera, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProfileInformation({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { data, updateData } = useRegistrationStore();
  const prof = data.profile;
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateData('profile', { [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('File size must be less than 5MB');
    
    setUploading(true);
    // Mocking Supabase Storage upload for frontend context until real API is wired
    setTimeout(() => {
      const mockUrl = URL.createObjectURL(file);
      updateData('profile', { profilePhoto: mockUrl });
      setUploading(false);
      toast.success('Photo uploaded successfully');
    }, 1500);
  };

  const handleNext = () => {
    if (!prof.dob) return toast.error('Date of Birth is required');
    if (!prof.language) return toast.error('Preferred Language is required');
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Photo Upload */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center overflow-hidden mb-4 group hover:border-green-500 transition-colors">
          {prof.profilePhoto ? (
            <img src={prof.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="text-white/40 flex flex-col items-center">
              <Camera className="w-8 h-8 mb-2" />
              <span className="text-xs">Upload Photo</span>
            </div>
          )}
          
          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
            <Upload className="w-6 h-6 text-white" />
            <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
        {uploading && <div className="text-sm text-green-400 animate-pulse">Uploading...</div>}
        <p className="text-xs text-white/40 text-center">JPG, PNG, WEBP. Max 5MB (Optional)</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Date of Birth *</label>
          <Input 
            type="date"
            name="dob" 
            value={prof.dob} 
            onChange={handleChange} 
            className="w-full bg-white/5 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Gender (Optional)</label>
          <select 
            name="gender" 
            value={prof.gender} 
            onChange={handleChange} 
            className="w-full bg-[#0a0f0a] border border-white/10 text-white rounded-md h-10 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Preferred Language *</label>
          <select 
            name="language" 
            value={prof.language} 
            onChange={handleChange} 
            className="w-full bg-[#0a0f0a] border border-white/10 text-white rounded-md h-10 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Language</option>
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="marathi">Marathi</option>
            <option value="gujarati">Gujarati</option>
            <option value="punjabi">Punjabi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Alternate Mobile (Optional)</label>
          <Input 
            type="tel"
            name="alternatePhone" 
            value={prof.alternatePhone} 
            onChange={handleChange} 
            placeholder="10-digit number"
            className="w-full bg-white/5 border-white/10 text-white" 
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="border-white/10 text-white hover:bg-white/5">
          Previous
        </Button>
        <Button onClick={handleNext} className="bg-green-500 hover:bg-green-600 text-white px-8">
          Next Step
        </Button>
      </div>
    </div>
  );
}
