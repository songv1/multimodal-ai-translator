
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageInputProps {
  onImageText: (text: string, imageUrl: string) => void;
  onRemoveImage: () => void;
  apiKey: string;
  isDisabled: boolean;
  imageUrl?: string;
  showThumbnail?: boolean;
}

const ImageInput: React.FC<ImageInputProps> = ({ 
  onImageText, 
  onRemoveImage, 
  apiKey, 
  isDisabled, 
  imageUrl,
  showThumbnail = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (e.g., .jpg, .png).",
        variant: "destructive",
      });
      return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image is too large. Please upload a smaller image.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create image URL for preview
      const imageUrl = URL.createObjectURL(file);
      
      const base64Image = await convertToBase64(file);
      const extractedText = await extractTextFromImage(base64Image, apiKey);
      
      if (extractedText.trim()) {
        onImageText(extractedText, imageUrl);
      } else {
        toast({
          title: "No Text Found",
          description: "No readable text found in the image. Try uploading a clearer image.",
          variant: "destructive",
        });
        URL.revokeObjectURL(imageUrl);
      }
    } catch (error) {
      console.error('Image processing error:', error);
      toast({
        title: "Image Processing Failed",
        description: "Could not process the image. Try again later or with a different image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const extractTextFromImage = async (base64Image: string, apiKey: string): Promise<string> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all readable text from this image. Return only the text content, no explanations or formatting.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to process image: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    onRemoveImage();
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button
          onClick={triggerFileInput}
          disabled={isDisabled || isProcessing}
          variant="outline"
          size="icon"
          className="h-10 w-10"
          title="Upload image to extract text"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {showThumbnail && imageUrl && (
        <div className="relative inline-block">
          <img 
            src={imageUrl} 
            alt="Uploaded" 
            className="w-20 h-20 object-cover rounded-md border-2 border-gray-200"
          />
          <Button
            onClick={handleRemoveImage}
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageInput;
