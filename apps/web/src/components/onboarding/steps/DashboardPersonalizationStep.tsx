import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/Button';

export function DashboardPersonalizationStep({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { data, updateData } = useOnboardingStore();
  const [theme, setTheme] = useState(data.personalization?.theme || 'system');
  const [aiPrefs, setAiPrefs] = useState(data.aiAssistant || {
    enabled: true,
    cropRecommendations: true,
    weatherSuggestions: true,
    pricePrediction: true,
  });

  const handleNext = () => {
    updateData('personalization', { theme, widgets: [] }); // We mock widgets for now
    updateData('aiAssistant', aiPrefs);
    onNext();
  };

  const toggleAi = (key: keyof typeof aiPrefs) => {
    setAiPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const Switch = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: () => void, disabled?: boolean }) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${checked ? 'bg-primary' : 'bg-input'}`}
    >
      <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      
      <div className="space-y-4">
        <h4 className="font-medium">App Theme</h4>
        <div className="flex gap-4">
          {['light', 'dark', 'system'].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t as any)}
              className={`flex-1 p-4 rounded-lg border-2 text-center capitalize transition-colors ${
                theme === t 
                  ? 'border-primary bg-primary/5 font-medium' 
                  : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium flex items-center justify-between">
          <span>AI Assistant Preferences</span>
          <Switch checked={aiPrefs.enabled} onChange={() => toggleAi('enabled')} />
        </h4>
        
        <div className={`space-y-3 p-4 rounded-lg border border-border transition-opacity ${aiPrefs.enabled ? 'bg-muted/20 opacity-100' : 'bg-muted/10 opacity-50 pointer-events-none'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Crop Recommendations</p>
              <p className="text-xs text-muted-foreground">AI suggestions for optimal planting</p>
            </div>
            <Switch checked={aiPrefs.cropRecommendations} onChange={() => toggleAi('cropRecommendations')} disabled={!aiPrefs.enabled} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Weather Insights</p>
              <p className="text-xs text-muted-foreground">Predictive analytics based on forecasts</p>
            </div>
            <Switch checked={aiPrefs.weatherSuggestions} onChange={() => toggleAi('weatherSuggestions')} disabled={!aiPrefs.enabled} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Price Prediction</p>
              <p className="text-xs text-muted-foreground">Market trend forecasting</p>
            </div>
            <Switch checked={aiPrefs.pricePrediction} onChange={() => toggleAi('pricePrediction')} disabled={!aiPrefs.enabled} />
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
