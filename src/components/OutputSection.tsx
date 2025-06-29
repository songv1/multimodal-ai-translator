
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Volume2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';
import { speakText } from '@/utils/textToSpeechService';
import { useToast } from '@/hooks/use-toast';

interface OutputSectionProps {
  targetLanguage: string;
  translatedText: string;
  isLoading: boolean;
  apiKey: string;
  onTargetLanguageChange: (language: string) => void;
}

const OutputSection: React.FC<OutputSectionProps> = ({
  targetLanguage,
  translatedText,
  isLoading,
  apiKey,
  onTargetLanguageChange
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const handleSpeak = async () => {
    if (!translatedText.trim()) {
      toast({
        title: "Error",
        description: "No text to speak",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "Error",
        description: "API key required for text-to-speech",
        variant: "destructive",
      });
      return;
    }

    setIsSpeaking(true);
    try {
      await speakText(apiKey, translatedText);
      toast({
        title: "Success",
        description: "Audio playback completed",
      });
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast({
        title: "Speech Error",
        description: error instanceof Error ? error.message : "Failed to generate speech",
        variant: "destructive",
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="targetLanguage" className="text-lg font-semibold text-gray-700">
          Translate to
        </Label>
        <Select value={targetLanguage} onValueChange={onTargetLanguageChange}>
          <SelectTrigger className="mt-2 border-2 focus:border-purple-500">
            <SelectValue placeholder="Select target language" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.name}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-lg font-semibold text-gray-700">
            Translation
          </Label>
          {translatedText && (
            <Button
              onClick={handleSpeak}
              disabled={isSpeaking || isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isSpeaking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Speaking...
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  Speak
                </>
              )}
            </Button>
          )}
        </div>
        <div className="mt-2 min-h-[200px] p-4 border-2 border-gray-200 rounded-md bg-gray-50 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Translating...</span>
              </div>
            </div>
          ) : translatedText ? (
            <p className="text-gray-800 whitespace-pre-wrap">{translatedText}</p>
          ) : (
            <p className="text-gray-400 italic">Translation will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutputSection;
