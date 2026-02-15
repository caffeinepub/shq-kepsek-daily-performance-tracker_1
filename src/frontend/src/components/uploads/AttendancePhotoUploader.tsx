import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ExternalBlob } from '../../backend';
import { MAX_FILE_SIZE_BYTES, ALLOWED_IMAGE_TYPES } from '../../constants/uploads';
import { toast } from 'sonner';

interface AttendancePhotoUploaderProps {
  onPhotoChange: (photo: ExternalBlob | null) => void;
}

export default function AttendancePhotoUploader({ onPhotoChange }: AttendancePhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File size exceeds ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB limit.`);
      return;
    }

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Convert to bytes and create ExternalBlob
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      onPhotoChange(blob);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to process image');
      console.error(error);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadProgress(0);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Attendance Photo</Label>
      <p className="text-sm text-muted-foreground">
        Upload a photo as proof of attendance (Max {MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB, JPEG/PNG/WebP)
      </p>

      {!preview ? (
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Click to upload photo</p>
                <p className="text-sm text-muted-foreground">or drag and drop</p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="relative border rounded-lg overflow-hidden">
          <img src={preview} alt="Attendance preview" className="w-full h-auto" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
