'use client';

import { useState, useEffect } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function AccountCredentials({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { data, updateData } = useRegistrationStore();
  const acc = data.account;
  const [confirmPass, setConfirmPass] = useState(acc.password);
  
  // Password Strength Logic
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = calculateStrength(acc.password);
  const strengthLabels = ['Weak', 'Medium', 'Strong', 'Excellent'];
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData('account', { [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (acc.username.length < 5) return toast.error('Username must be at least 5 characters');
    if (strengthScore < 2) return toast.error('Password is too weak');
    if (acc.password !== confirmPass) return toast.error('Passwords do not match');
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Username *</label>
        <Input 
          name="username" 
          value={acc.username} 
          onChange={handleChange} 
          placeholder="Choose a unique username" 
          className="w-full bg-white/5 border-white/10 text-white" 
        />
        <p className="text-xs text-white/40 mt-2">Minimum 5 characters (letters, numbers, underscore)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Password *</label>
        <Input 
          type="password"
          name="password" 
          value={acc.password} 
          onChange={handleChange} 
          placeholder="Enter a strong password" 
          className="w-full bg-white/5 border-white/10 text-white" 
        />
        
        {/* Strength Meter */}
        {acc.password && (
          <div className="mt-3">
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3].map((level) => (
                <div 
                  key={level} 
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${strengthScore > level ? strengthColors[strengthScore - 1] : 'bg-white/10'}`} 
                />
              ))}
            </div>
            <div className={`text-xs font-semibold ${strengthScore > 0 ? strengthColors[strengthScore - 1].replace('bg-', 'text-') : 'text-white/40'}`}>
              Strength: {strengthScore > 0 ? strengthLabels[strengthScore - 1] : 'Too Short'}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password *</label>
        <Input 
          type="password"
          value={confirmPass} 
          onChange={(e) => setConfirmPass(e.target.value)} 
          placeholder="Re-enter your password" 
          className={`w-full bg-white/5 text-white ${confirmPass && confirmPass !== acc.password ? 'border-red-500 focus:border-red-500' : 'border-white/10'}`} 
        />
        {confirmPass && confirmPass !== acc.password && (
          <p className="text-xs text-red-400 mt-2">Passwords do not match</p>
        )}
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
