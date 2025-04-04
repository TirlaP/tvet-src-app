import React, { useRef, useState } from 'react';
import { Upload, X, File, Image } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface FileUploadProps {
  onFileChange: (base64: string) => void;
  accept?: string;
  maxSize?: number; // Size in MB
  initialPreview?: string;
  description?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  accept = 'image/*',
  maxSize = 5, // Default 5MB
  initialPreview,
  description,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreview || null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setError(null);
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB`);
      return;
    }
    
    // Read file as Data URL (Base64)
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      if (result) {
        setPreviewUrl(result);
        setFileName(file.name);
        onFileChange(result);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
    };
    
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearFile = () => {
    setPreviewUrl(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileChange('');
  };

  const isImage = accept.includes('image/') || accept === 'image/*';

  return (
    <div className={className}>
      {previewUrl ? (
        // Display preview
        <div className="border rounded-md overflow-hidden relative">
          {isImage ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-auto object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center p-4 bg-gray-50">
              <File className="h-8 w-8 text-primary mr-2" />
              <div className="flex-1 truncate">
                <p className="text-sm">{fileName}</p>
                <p className="text-xs text-gray-500">Click to view</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="text-gray-500 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        // File upload dropzone
        <div
          className={cn(
            "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary/50 hover:bg-gray-50",
            "focus:outline-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          tabIndex={0}
          role="button"
          aria-label="Upload file"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept={accept}
            className="hidden"
          />
          
          <div className="flex flex-col items-center">
            {isImage ? (
              <Image className="h-10 w-10 text-gray-400 mb-2" />
            ) : (
              <File className="h-10 w-10 text-gray-400 mb-2" />
            )}
            
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-gray-500">
                {description || `Upload a file (max ${maxSize}MB)`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export { FileUpload };
