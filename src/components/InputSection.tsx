
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoiceInput from '@/components/VoiceInput';
import ImageInput from '@/components/ImageInput';

type InputType = 'text' | 'voice' | 'image';

interface InputSectionProps {
  currentInputType: InputType;
  inputText: string;
  apiKey: string;
  isLoading: boolean;
  onInputTextChange: (text: string) => void;
  onTabChange: (value: string) => void;
  onVoiceTranscription: (transcript: string) => void;
  onImageText: (extractedText: string) => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  currentInputType,
  inputText,
  apiKey,
  isLoading,
  onInputTextChange,
  onTabChange,
  onVoiceTranscription,
  onImageText
}) => {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold text-gray-700">
        Input Content
      </Label>
      
      <Tabs value={currentInputType} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="space-y-4">
          <Textarea
            placeholder="Enter any text in any language..."
            value={inputText}
            onChange={(e) => onInputTextChange(e.target.value)}
            className="min-h-[200px] resize-none border-2 focus:border-blue-500 transition-colors"
          />
        </TabsContent>
        
        <TabsContent value="voice" className="space-y-4">
          <div className="min-h-[200px] p-4 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center gap-4">
            <VoiceInput 
              onTranscription={onVoiceTranscription}
              isDisabled={isLoading}
            />
            {inputText && (
              <div className="w-full p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-1">Transcribed text:</p>
                <p className="text-gray-800">{inputText}</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="space-y-4">
          <div className="min-h-[200px] p-4 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center gap-4">
            <ImageInput 
              onImageText={onImageText}
              apiKey={apiKey}
              isDisabled={isLoading}
            />
            {inputText && (
              <div className="w-full p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-1">Extracted text:</p>
                <p className="text-gray-800">{inputText}</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <p className="text-sm text-gray-500">
        Source language will be detected automatically
      </p>
    </div>
  );
};

export default InputSection;
