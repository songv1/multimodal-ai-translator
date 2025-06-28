
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';

interface OutputSectionProps {
  targetLanguage: string;
  translatedText: string;
  isLoading: boolean;
  onTargetLanguageChange: (language: string) => void;
}

const OutputSection: React.FC<OutputSectionProps> = ({
  targetLanguage,
  translatedText,
  isLoading,
  onTargetLanguageChange
}) => {
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
        <Label className="text-lg font-semibold text-gray-700">
          Translation
        </Label>
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
