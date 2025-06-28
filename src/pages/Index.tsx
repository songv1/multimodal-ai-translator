
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Languages, Key, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { translateText } from '@/utils/translationService';
import { translateMultimodalText } from '@/utils/multimodalTranslationService';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';
import VoiceInput from '@/components/VoiceInput';
import ImageInput from '@/components/ImageInput';

type InputType = 'text' | 'voice' | 'image';

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [currentInputType, setCurrentInputType] = useState<InputType>('text');
  const { toast } = useToast();

  useEffect(() => {
    const storedApiKey = sessionStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setShowApiKeyInput(false);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }
    
    sessionStorage.setItem('openai_api_key', apiKey);
    setShowApiKeyInput(false);
    toast({
      title: "Success",
      description: "API key saved successfully!",
    });
  };

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
    setCurrentInputType('voice');
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

  const handleClearApiKey = () => {
    sessionStorage.removeItem('openai_api_key');
    setApiKey('');
    setShowApiKeyInput(true);
    setTranslatedText('');
  };

  const handleTabChange = (value: string) => {
    setCurrentInputType(value as InputType);
    if (value !== 'text') {
      setInputText('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Languages className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Multimodal AI Translator
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Powered by OpenAI GPT-4.1 • Translate text, voice, and images instantly
          </p>
        </div>

        {/* API Key Section */}
        {showApiKeyInput && (
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                OpenAI API Key Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiKey">Enter your OpenAI API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Your API key is stored securely in your browser's local storage and never sent to our servers.
                </p>
              </div>
              <Button onClick={handleSaveApiKey} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Save API Key
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Translation Interface */}
        {!showApiKeyInput && (
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Input Section */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-700">
                      Input Content
                    </Label>
                    
                    <Tabs value={currentInputType} onValueChange={handleTabChange} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="text">Text</TabsTrigger>
                        <TabsTrigger value="voice">Voice</TabsTrigger>
                        <TabsTrigger value="image">Image</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="text" className="space-y-4">
                        <Textarea
                          placeholder="Enter any text in any language..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="min-h-[200px] resize-none border-2 focus:border-blue-500 transition-colors"
                        />
                      </TabsContent>
                      
                      <TabsContent value="voice" className="space-y-4">
                        <div className="min-h-[200px] p-4 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center gap-4">
                          <VoiceInput 
                            onTranscription={handleVoiceTranscription}
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
                            onImageText={handleImageText}
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

                  {/* Output Section */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="targetLanguage" className="text-lg font-semibold text-gray-700">
                        Translate to
                      </Label>
                      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
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
                </div>

                {/* Translate Button */}
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
                    onClick={handleClearApiKey}
                    variant="outline"
                    className="h-12 px-6 border-2 hover:border-red-300 hover:text-red-600"
                  >
                    Change API Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Secure • Private • No data stored on servers • Multimodal Translation</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
