import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/Button';

export function PreferencesStep({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { data, updateData } = useOnboardingStore();
  const [prefs, setPrefs] = useState(data.preferences || {
    smsAlerts: true,
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    marketingMessages: false,
    governmentSchemeAlerts: true,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const handleNext = () => {
    updateData('preferences', prefs);
    onNext();
  };

  const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${checked ? 'bg-primary' : 'bg-input'}`}
    >
      <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      
      <div className="space-y-4">
        <h4 className="font-medium">Communication Channels</h4>
        <div className="space-y-3 bg-muted/20 p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">SMS Alerts</p>
              <p className="text-xs text-muted-foreground">Receive critical updates via text message</p>
            </div>
            <Switch checked={prefs.smsAlerts} onChange={() => toggle('smsAlerts')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive detailed reports and order summaries</p>
            </div>
            <Switch checked={prefs.emailNotifications} onChange={() => toggle('emailNotifications')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Push Notifications</p>
              <p className="text-xs text-muted-foreground">App notifications on your device</p>
            </div>
            <Switch checked={prefs.pushNotifications} onChange={() => toggle('pushNotifications')} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Notification Types</h4>
        <div className="space-y-3 bg-muted/20 p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Order & Transport Updates</p>
              <p className="text-xs text-muted-foreground">Get notified about your requests and deliveries</p>
            </div>
            <Switch checked={prefs.orderUpdates} onChange={() => toggle('orderUpdates')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Government Scheme Alerts</p>
              <p className="text-xs text-muted-foreground">Updates on subsidies and new policies</p>
            </div>
            <Switch checked={prefs.governmentSchemeAlerts} onChange={() => toggle('governmentSchemeAlerts')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Marketing & Offers</p>
              <p className="text-xs text-muted-foreground">Occasional promotional messages and news</p>
            </div>
            <Switch checked={prefs.marketingMessages} onChange={() => toggle('marketingMessages')} />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onPrev}>Previous</Button>
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
