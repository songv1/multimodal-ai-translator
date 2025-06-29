
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
  apiKey: string;
  onClearApiKey: () => void;
}

const TranslationInterface: React.FC<TranslationInterfaceProps> = ({
  apiKey,
  onClearApiKey
}) => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentInputType, setCurrentInputType] = useState<InputType>('text');
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter your OpenAI API key first",
        variant: "destructive",
      });
      return;
    }

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
      const result = await translateMultimodalText(apiKey, inputText, targetLanguage, currentInputType);
      setTranslatedText(result);
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Error",
        description: error instanceof Error ? error.message : "Failed to translate text. Please check your API key and try again.",
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

  const handleImageText = (extractedText: string) => {
    setInputText(extractedText);
    setCurrentInputType('image');
    toast({
      title: "Text Extracted",
      description: "Text has been extracted from the image!",
    });
  };

  const handleTabChange = (value: string) => {
    setCurrentInputType(value as InputType);
    if (value === 'image') {
      setInputText('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <InputSection
              currentInputType={currentInputType}
              inputText={inputText}
              apiKey={apiKey}
              isLoading={isLoading}
              onInputTextChange={setInputText}
              onTabChange={handleTabChange}
              onVoiceTranscription={handleVoiceTranscription}
              onImageText={handleImageText}
            />

            <OutputSection
              targetLanguage={targetLanguage}
              translatedText={translatedText}
              isLoading={isLoading}
              apiKey={apiKey}
              onTargetLanguageChange={setTargetLanguage}
            />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleTranslate}
              disabled={isLoading}
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
            <Button
              onClick={onClearApiKey}
              variant="outline"
              className="h-12 px-6 border-2 hover:border-red-300 hover:text-red-600"
            >
              Change API Key
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationInterface;
