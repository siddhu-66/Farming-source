import { useState } from 'react';
import { useFarmerOnboardingStore } from '@/stores/farmerOnboardingStore';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Check, Edit2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export function ReviewCompleteStep({ onPrev, setStep }: { onPrev: () => void; setStep: (s: number) => void }) {
  const store = useFarmerOnboardingStore();
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        farm: {
          name: store.farmName,
          farmerType: store.farmerType,
          totalArea: store.totalArea,
          areaUnit: store.areaUnit,
          numberOfFields: store.numberOfFields,
          yearsOfExperience: store.yearsOfExperience,
          organicCertified: store.organicCertified,
          certificationNumber: store.certificationNumber,
        },
        location: {
          state: store.state,
          district: store.district,
          mandal: store.mandal,
          village: store.village,
          address: store.farmAddress,
          latitude: store.latitude,
          longitude: store.longitude,
        },
        crops: store.crops,
        irrigation: {
          irrigationType: store.irrigationType,
          waterSource: store.waterSource,
          frequency: store.irrigationFrequency,
          waterAvailability: store.waterAvailability,
        },
        equipment: store.equipment,
        storageAndLivestock: {
          storageType: store.storageType,
          livestock: store.livestock,
        },
        governmentSchemes: {
          pmKisanBeneficiary: store.pmKisanBeneficiary,
          soilHealthCard: store.soilHealthCard,
          cropInsurance: store.cropInsurance,
          kisanCreditCard: store.kisanCreditCard,
          fpoMember: store.fpoMember,
        }
      };

      const res = await api.post('/v1/farmer/onboarding/complete', payload);
      
      if (res.data.success) {
        // Update local auth store so layout knows farmer onboarding is done if we track it there
        // clear wizard
        store.resetOnboarding();
        // redirect
        router.push('/farmer/dashboard');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h3 className="text-lg font-medium">Review & Submit</h3>
        <p className="text-sm text-muted-foreground">Please review your farm details before finalizing setup.</p>
      </div>
      
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pb-2">
        {/* Farm Info */}
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base">Farm Information</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}><Edit2 className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Name:</div><div>{store.farmName}</div>
            <div className="text-muted-foreground">Type:</div><div>{store.farmerType}</div>
            <div className="text-muted-foreground">Area:</div><div>{store.totalArea} {store.areaUnit}</div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base">Location</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}><Edit2 className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">State:</div><div>{store.state}</div>
            <div className="text-muted-foreground">District:</div><div>{store.district}</div>
            <div className="text-muted-foreground">Village:</div><div>{store.village}</div>
          </CardContent>
        </Card>

        {/* Crops */}
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base">Crops ({store.crops.length})</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setStep(3)}><Edit2 className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-sm">
            {store.crops.map((c, i) => (
              <div key={i} className="flex justify-between border-b last:border-0 pb-2 last:pb-0">
                <span className="font-medium">{c.name}</span>
                <span className="text-muted-foreground">{c.cultivatedArea} {store.areaUnit} ({c.season})</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Irrigation */}
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base">Irrigation</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setStep(4)}><Edit2 className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Type:</div><div>{store.irrigationType}</div>
            <div className="text-muted-foreground">Source:</div><div>{store.waterSource}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onPrev} disabled={submitting}>Back</Button>
        <Button onClick={handleSubmit} disabled={submitting} className="min-w-[120px]">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
          Finish Setup
        </Button>
      </div>
    </motion.div>
  );
}
