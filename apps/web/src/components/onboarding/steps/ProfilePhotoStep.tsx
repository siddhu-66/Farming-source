import { useState, useRef } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/Button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export function ProfilePhotoStep({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { data, updateData } = useOnboardingStore();
  const [preview, setPreview] = useState<string | null>(data.photo?.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit");
        return;
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleNext = async () => {
    if (preview && preview !== data.photo?.avatarUrl) {
      setIsUploading(true);
      // Simulate upload delay for now. In production, post to /api/v1/profile/avatar
      await new Promise(resolve => setTimeout(resolve, 800));
      updateData('photo', { avatarUrl: preview });
      setIsUploading(false);
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/20">
        
        {preview ? (
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-background shadow-xl">
            <Image 
              src={preview} 
              alt="Profile Preview" 
              fill 
              className="object-cover"
            />
            <button 
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full shadow-sm hover:bg-destructive/90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-40 h-40 rounded-full bg-muted flex flex-col items-center justify-center border-4 border-background shadow-sm">
            <ImageIcon className="w-12 h-12 text-muted-foreground/50 mb-2" />
            <span className="text-xs text-muted-foreground font-medium">No Photo</span>
          </div>
        )}

        <div className="mt-6 text-center">
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {preview ? 'Change Photo' : 'Upload Photo'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            JPG, PNG or WEBP. Max 5MB. <br/>
            Recommended 512x512px.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onPrev}>Previous</Button>
        <div className="space-x-2">
          {!preview && (
            <Button variant="ghost" onClick={onNext}>Skip</Button>
          )}
          <Button onClick={handleNext} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Next Step'}
          </Button>
        </div>
      </div>
    </div>
  );
}
