import { useRef, useState, useCallback, ChangeEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export default function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit');
        return;
      }
      
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit');
        return;
      }
      
      onFileSelect(file);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1
  });

  const removeFile = () => {
    onFileSelect(null as unknown as File);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div 
        {...getRootProps()}
        className={`border-2 border-dashed ${
          isDragActive ? 'border-primary' : 'border-gray-300 dark:border-gray-700'
        } rounded-lg p-8 text-center cursor-pointer`}
      >
        <input 
          {...getInputProps()} 
          ref={fileInputRef}
          onChange={handleFileInputChange}
        />
        <div className="mx-auto flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
          Drag and drop your file here
        </p>
        <div className="mt-3 flex justify-center">
          <Button 
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleBrowseClick();
            }}
            className="inline-flex items-center"
          >
            <Upload className="mr-2 h-4 w-4" />
            Browse Files
          </Button>
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          PDF, JPG or PNG (max 10MB)
        </p>
      </div>
      
      {selectedFile && (
        <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{selectedFile.name}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
