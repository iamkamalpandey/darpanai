import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Camera, Upload, User, X, Check, RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  userName: string;
  userRole?: string;
  onImageUpdate?: (newImageUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ProfileImageUpload({ 
  currentImageUrl, 
  userName, 
  userRole = 'user',
  onImageUpdate,
  size = 'md' 
}: ProfileImageUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Image cropping state
  const [cropData, setCropData] = useState({
    zoom: 1,
    rotation: 0,
    x: 0,
    y: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: { container: 'h-16 w-16', text: 'text-xs', icon: 'h-4 w-4' },
    md: { container: 'h-24 w-24', text: 'text-sm', icon: 'h-5 w-5' },
    lg: { container: 'h-32 w-32', text: 'text-lg', icon: 'h-6 w-6' }
  };

  const currentSize = sizeConfig[size];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log('=== PROFILE IMAGE UPLOAD STARTED ===');
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      const formData = new FormData();
      formData.append('profileImage', file);
      
      console.log('FormData prepared with file:', file.name);
      
      console.log('Sending request to:', '/api/user/upload-profile-image');
      
      try {
        const response = await apiRequest('POST', '/api/user/upload-profile-image', formData);
        console.log('Upload response:', response);
        return response;
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      toast({
        title: "Profile Image Updated",
        description: "Your profile image has been successfully updated.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Call callback if provided
      if (onImageUpdate && data?.profileImageUrl) {
        onImageUpdate(data.profileImageUrl);
      }
      
      // Reset states
      setPreviewUrl(null);
      setSelectedFile(null);
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Create cropped image file
  const createCroppedImage = useCallback((): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      const image = imageRef.current;
      
      if (!canvas || !image || !selectedFile) {
        reject(new Error('Missing canvas, image, or file'));
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Set canvas size to perfect circle (300x300)
      canvas.width = 300;
      canvas.height = 300;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save context for transformations
      ctx.save();
      
      // Apply transformations in order: translate -> rotate -> scale
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((cropData.rotation * Math.PI) / 180);
      ctx.scale(cropData.zoom, cropData.zoom);
      
      // Calculate image positioning
      const imageAspectRatio = image.naturalWidth / image.naturalHeight;
      let drawWidth = canvas.width / cropData.zoom;
      let drawHeight = canvas.height / cropData.zoom;
      
      if (imageAspectRatio > 1) {
        drawHeight = drawWidth / imageAspectRatio;
      } else {
        drawWidth = drawHeight * imageAspectRatio;
      }
      
      // Draw the image with position offset
      ctx.drawImage(
        image,
        -drawWidth / 2 + cropData.x / cropData.zoom,
        -drawHeight / 2 + cropData.y / cropData.zoom,
        drawWidth,
        drawHeight
      );
      
      // Restore context
      ctx.restore();
      
      // Create circular mask
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Convert to blob and then to file
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], selectedFile.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(croppedFile);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 0.9);
    });
  }, [cropData, selectedFile]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const croppedFile = await createCroppedImage();
      uploadMutation.mutate(croppedFile);
    } catch (error) {
      console.error('Error creating cropped image:', error);
      toast({
        title: "Crop Failed",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  // Image manipulation handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropData.x, y: e.clientY - cropData.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setCropData(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (value: number[]) => {
    setCropData(prev => ({ ...prev, zoom: value[0] }));
  };

  const handleRotate = () => {
    setCropData(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  const resetCrop = () => {
    setCropData({ zoom: 1, rotation: 0, x: 0, y: 0 });
  };

  // Update preview canvas when crop data changes
  useEffect(() => {
    if (!previewUrl || !imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const image = imageRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Wait for image to load
    const updateCanvas = () => {
      // Set canvas size
      canvas.width = 300;
      canvas.height = 300;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save context
      ctx.save();
      
      // Apply transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((cropData.rotation * Math.PI) / 180);
      ctx.scale(cropData.zoom, cropData.zoom);
      
      // Calculate image dimensions
      const imageAspectRatio = image.naturalWidth / image.naturalHeight;
      let drawWidth = canvas.width / cropData.zoom;
      let drawHeight = canvas.height / cropData.zoom;
      
      if (imageAspectRatio > 1) {
        drawHeight = drawWidth / imageAspectRatio;
      } else {
        drawWidth = drawHeight * imageAspectRatio;
      }
      
      // Draw image
      ctx.drawImage(
        image,
        -drawWidth / 2 + cropData.x / cropData.zoom,
        -drawHeight / 2 + cropData.y / cropData.zoom,
        drawWidth,
        drawHeight
      );
      
      // Restore context
      ctx.restore();
      
      // Create circular mask
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    if (image.complete) {
      updateCanvas();
    } else {
      image.onload = updateCanvas;
    }
  }, [cropData, previewUrl]);

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsDialogOpen(false);
    resetCrop();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    return userName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin': return 'bg-red-600';
      case 'expert': return 'bg-purple-600';
      default: return 'bg-blue-600';
    }
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin': return 'bg-red-500';
      case 'expert': return 'bg-purple-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Profile Image Display */}
      <div className="relative">
        <div className={`${currentSize.container} rounded-full overflow-hidden ${getRoleColor()} flex items-center justify-center relative group cursor-pointer`}>
          {currentImageUrl || previewUrl ? (
            <img 
              src={previewUrl || currentImageUrl} 
              alt={`${userName}'s profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`${currentSize.text} font-medium text-white`}>
              {getInitials()}
            </span>
          )}
          
          {/* Role Badge */}
          <div className={`absolute -bottom-1 -right-1 h-6 w-6 ${getRoleBadgeColor()} rounded-full flex items-center justify-center border-2 border-white`}>
            <User className="h-3 w-3 text-white" />
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className={`${currentSize.icon} text-white`} />
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {currentImageUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload & Crop Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile image and adjust the crop area.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!previewUrl ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={handleButtonClick}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to select an image or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-6">
                  {/* Crop Editor */}
                  <div className="flex-1">
                    <div className="relative">
                      <div 
                        className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden cursor-move"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        {/* Hidden image for reference */}
                        <img 
                          ref={imageRef}
                          src={previewUrl} 
                          alt="Source" 
                          className="hidden"
                        />
                        
                        {/* Visible transformed image */}
                        <img 
                          src={previewUrl} 
                          alt="Crop preview" 
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.zoom}) rotate(${cropData.rotation}deg)`,
                            transformOrigin: 'center'
                          }}
                          draggable={false}
                        />
                        
                        {/* Crop Circle Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-48 border-4 border-white rounded-full shadow-lg bg-black bg-opacity-20"></div>
                        </div>
                      </div>
                      
                      {/* Crop Controls */}
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <ZoomOut className="h-4 w-4" />
                          <Slider
                            value={[cropData.zoom]}
                            onValueChange={handleZoomChange}
                            max={3}
                            min={0.5}
                            step={0.1}
                            className="flex-1"
                          />
                          <ZoomIn className="h-4 w-4" />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleRotate}
                          >
                            <RotateCw className="h-4 w-4 mr-2" />
                            Rotate
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={resetCrop}
                          >
                            <Move className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="w-40 space-y-4">
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">Preview</p>
                      <div className="relative w-32 h-32 mx-auto">
                        <canvas
                          ref={canvasRef}
                          className="w-full h-full rounded-full border-2 border-gray-200"
                          style={{ width: '128px', height: '128px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Role Indicator */}
      <div className="text-center">
        <p className="text-sm font-medium">{userName}</p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <span className={`inline-block w-2 h-2 ${getRoleBadgeColor()} rounded-full`}></span>
          <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
        </div>
      </div>
    </div>
  );
}