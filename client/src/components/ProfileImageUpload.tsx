import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Camera, Upload, User, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await apiRequest('POST', '/api/user/upload-profile-image', formData);
      return response;
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

  const handleUpload = () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    uploadMutation.mutate(selectedFile);
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsDialogOpen(false);
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Image</DialogTitle>
            <DialogDescription>
              Upload a new profile image. Supported formats: JPG, PNG, GIF (max 5MB)
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
            
            {/* Preview Area */}
            {previewUrl ? (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden">
                      <img 
                        src={previewUrl} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Preview</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedFile?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No image selected
                    </p>
                    <Button onClick={handleButtonClick} variant="outline">
                      Choose Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              
              {!selectedFile && (
                <Button onClick={handleButtonClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Image
                </Button>
              )}
              
              {selectedFile && (
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
              )}
            </div>
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