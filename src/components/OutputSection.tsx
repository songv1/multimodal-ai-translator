
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Volume2, Copy } from 'lucide-react';
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
  const [isCopying, setIsCopying] = useState(false);
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

  const handleCopy = async () => {
    if (!translatedText.trim()) {
      toast({
        title: "Error",
        description: "No text to copy",
        variant: "destructive",
      });
      return;
    }

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(translatedText);
      toast({
        title: "Success",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: "Copy Error",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
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
        <Label className="text-lg font-semibold text-gray-700 mb-2 block">
          Translation
        </Label>
        <div className="relative mt-2 min-h-[200px] p-4 border-2 border-gray-200 rounded-md bg-gray-50 overflow-auto pb-16">
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
          
          {/* Bottom right buttons */}
          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button
              onClick={handleCopy}
              disabled={!translatedText.trim() || isCopying || isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isCopying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Copying...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Button
              onClick={handleSpeak}
              disabled={!translatedText.trim() || isSpeaking || isLoading}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputSection;
