import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function PersonalProfileStep({ onNext }: { onNext: () => void }) {
  const { data, updateData } = useOnboardingStore();
  const personal = data.personal || {
    firstName: '',
    lastName: '',
    displayName: '',
    dateOfBirth: '',
    preferredLanguage: 'English'
  };

  const [formData, setFormData] = useState(personal);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.displayName) newErrors.displayName = 'Display name is required';
    if (formData.displayName && (formData.displayName.length < 3 || formData.displayName.length > 30)) {
      newErrors.displayName = 'Display name must be 3-30 characters';
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.preferredLanguage) newErrors.preferredLanguage = 'Preferred language is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateData('personal', formData);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name *</label>
          <Input 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleChange} 
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <Input 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleChange}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Display Name *</label>
        <Input 
          name="displayName" 
          value={formData.displayName} 
          onChange={handleChange}
          className={errors.displayName ? 'border-red-500' : ''}
          placeholder="e.g. siddhu66"
        />
        <p className="text-xs text-muted-foreground mt-1">3-30 characters, unique on platform</p>
        {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth *</label>
          <Input 
            type="date"
            name="dateOfBirth" 
            value={formData.dateOfBirth} 
            onChange={handleChange}
            className={errors.dateOfBirth ? 'border-red-500' : ''}
          />
          {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gender (Optional)</label>
          <select 
            name="gender" 
            value={formData.gender || ''} 
            onChange={handleChange}
            className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Alternate Mobile (Optional)</label>
          <Input 
            name="alternateMobile" 
            value={formData.alternateMobile || ''} 
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Preferred Language *</label>
          <select 
            name="preferredLanguage" 
            value={formData.preferredLanguage} 
            onChange={handleChange}
            className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
            <option value="Tamil">Tamil</option>
            <option value="Kannada">Kannada</option>
            <option value="Marathi">Marathi</option>
            <option value="Gujarati">Gujarati</option>
            <option value="Punjabi">Punjabi</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
