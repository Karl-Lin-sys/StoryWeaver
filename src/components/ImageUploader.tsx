import React, { useCallback } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  imageUrl: string | null;
  isLoading: boolean;
}

export function ImageUploader({ onImageSelected, imageUrl, isLoading }: ImageUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (isLoading) return;
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    },
    [onImageSelected, isLoading]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isLoading) return;
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    },
    [onImageSelected, isLoading]
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-colors ${
        imageUrl ? 'border-transparent bg-black/5' : 'border-black/20 hover:border-black/40 bg-white'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {imageUrl ? (
        <div className="relative w-full h-full overflow-hidden rounded-2xl group">
          <img src={imageUrl} alt="Uploaded scene" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
          {!isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white font-medium flex items-center gap-2">
                <UploadCloud className="w-5 h-5" /> Change Image
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-black/60">
          <ImageIcon className="w-10 h-10 mb-3 text-black/40" />
          <p className="mb-2 text-sm font-medium">
            <span className="font-semibold text-black">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs">SVG, PNG, JPG or GIF</p>
        </div>
      )}
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept="image/*"
        disabled={isLoading}
      />
    </div>
  );
}
