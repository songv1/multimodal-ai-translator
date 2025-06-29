
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import VoiceInput from '@/components/VoiceInput';
import ImageInput from '@/components/ImageInput';

type InputType = 'text' | 'image';

interface InputSectionProps {
  currentInputType: InputType;
  inputText: string;
  apiKey: string;
  isLoading: boolean;
  imageUrl?: string;
  onInputTextChange: (text: string) => void;
  onTabChange: (value: string) => void;
  onVoiceTranscription: (transcript: string) => void;
  onImageText: (extractedText: string, imageUrl: string) => void;
  onRemoveImage: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  currentInputType,
  inputText,
  apiKey,
  isLoading,
  imageUrl,
  onInputTextChange,
  onTabChange,
  onVoiceTranscription,
  onImageText,
  onRemoveImage
}) => {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold text-gray-700">
        Input Content
      </Label>
      
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Enter any text in any language, use voice input, or upload an image..."
            value={inputText}
            onChange={(e) => onInputTextChange(e.target.value)}
            className="min-h-[200px] resize-none border-2 focus:border-blue-500 transition-colors pr-32 pb-16"
          />
          
          {/* Top right controls */}
          <div className="absolute top-3 right-3 flex gap-2">
            <ImageInput 
              onImageText={onImageText}
              onRemoveImage={onRemoveImage}
              apiKey={apiKey}
              isDisabled={isLoading}
              imageUrl={imageUrl}
              showThumbnail={false}
            />
            <VoiceInput 
              onTranscription={onVoiceTranscription}
              isDisabled={isLoading}
            />
          </div>

          {/* Bottom left image thumbnail */}
          {imageUrl && (
            <div className="absolute bottom-3 left-3">
              <div className="relative inline-block">
                <img 
                  src={imageUrl} 
                  alt="Uploaded" 
                  className="w-12 h-12 object-cover rounded-md border-2 border-gray-200"
                />
                <Button
                  onClick={onRemoveImage}
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-500">
        Source language will be detected automatically
      </p>
    </div>
  );
};

export default InputSection;
