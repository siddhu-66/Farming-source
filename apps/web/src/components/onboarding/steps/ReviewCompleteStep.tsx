import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export function ReviewCompleteStep({ onPrev, setStep }: { onPrev: () => void, setStep: (s: number) => void }) {
  const { data, reset } = useOnboardingStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // POST all data to backend
      const response = await api.post('/v1/onboarding/complete', data);
      
      if (response.data.success) {
        // Clear local storage wizard state
        reset();
        
        // Redirect to dashboard (user object from authStore will dictate which dashboard)
        const role = user?.role || response.data.data?.role || 'farmer';
        router.push(`/${role.toLowerCase()}/dashboard`);
      } else {
        setError(response.data.message || 'Failed to save profile setup.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        
        {/* Personal */}
        <div className="p-4 rounded-lg border border-border bg-muted/10 relative">
          <button onClick={() => setStep(1)} className="absolute top-4 right-4 text-xs text-primary hover:underline">Edit</button>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wider">Personal</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Name:</div>
            <div className="font-medium">{data.personal?.firstName} {data.personal?.lastName}</div>
            <div className="text-muted-foreground">Display Name:</div>
            <div className="font-medium">{data.personal?.displayName}</div>
            <div className="text-muted-foreground">Language:</div>
            <div className="font-medium">{data.personal?.preferredLanguage}</div>
          </div>
        </div>

        {/* Address */}
        <div className="p-4 rounded-lg border border-border bg-muted/10 relative">
          <button onClick={() => setStep(3)} className="absolute top-4 right-4 text-xs text-primary hover:underline">Edit</button>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wider">Address</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Location:</div>
            <div className="font-medium">{data.address?.village}, {data.address?.district}</div>
            <div className="text-muted-foreground">State:</div>
            <div className="font-medium">{data.address?.state}, {data.address?.country}</div>
          </div>
        </div>

      </div>

      <div className="flex justify-between pt-6">
        <Button variant="ghost" onClick={onPrev} disabled={isSubmitting}>Previous</Button>
        <Button onClick={handleComplete} disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Complete Setup
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
