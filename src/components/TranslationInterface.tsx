import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { translateMultimodalText } from '@/utils/multimodalTranslationService';
import InputSection from '@/components/InputSection';
import OutputSection from '@/components/OutputSection';

type InputType = 'text' | 'image';

interface TranslationInterfaceProps {
  // No longer need apiKey prop
}

const TranslationInterface: React.FC<TranslationInterfaceProps> = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentInputType, setCurrentInputType] = useState<InputType>('text');
  const [imageUrl, setImageUrl] = useState<string>('');
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error", 
        description: "Please enter text to translate",
        variant: "destructive",
      });
      return;
    }

    if (!targetLanguage) {
      toast({
        title: "Error",
        description: "Please select a target language",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Voice input is transcribed to text via Web Speech API, so it's treated as 'text' input type
      const result = await translateMultimodalText(inputText, targetLanguage, currentInputType);
      setTranslatedText(result);
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Error",
        description: error instanceof Error ? error.message : "Failed to translate text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscription = (transcript: string) => {
    setInputText(transcript);
    // Voice input becomes text input after transcription
    setCurrentInputType('text');
    toast({
      title: "Voice Captured",
      description: "Speech has been transcribed successfully!",
    });
  };

  const handleImageText = (extractedText: string, imageUrl: string) => {
    setInputText(extractedText);
    setImageUrl(imageUrl);
    setCurrentInputType('image');
    toast({
      title: "Text Extracted",
      description: "Text has been extracted from the image!",
    });
  };

  const handleRemoveImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl('');
    setInputText('');
    setCurrentInputType('text');
  };

  // Remove the handleTabChange function since we no longer have tabs
  const handleTabChange = (value: string) => {
    // This function is kept for compatibility but no longer used
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <InputSection
              currentInputType={currentInputType}
              inputText={inputText}
              isLoading={isLoading}
              imageUrl={imageUrl}
              onInputTextChange={setInputText}
              onTabChange={handleTabChange}
              onVoiceTranscription={handleVoiceTranscription}
              onImageText={handleImageText}
              onRemoveImage={handleRemoveImage}
            />

            <OutputSection
              targetLanguage={targetLanguage}
              translatedText={translatedText}
              isLoading={isLoading}
              onTargetLanguageChange={setTargetLanguage}
            />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim()}
              className="flex-1 h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Translating...
                </>
              ) : (
                <>
                  Translate
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationInterface;
