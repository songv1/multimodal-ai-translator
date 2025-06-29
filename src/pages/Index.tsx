import React, { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiKeySection from '@/components/ApiKeySection';
import TranslationInterface from '@/components/TranslationInterface';
const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const {
    toast
  } = useToast();
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
        variant: "destructive"
      });
      return;
    }
    sessionStorage.setItem('openai_api_key', apiKey);
    setShowApiKeyInput(false);
    toast({
      title: "Success",
      description: "API key saved successfully!"
    });
  };
  const handleClearApiKey = () => {
    sessionStorage.removeItem('openai_api_key');
    setApiKey('');
    setShowApiKeyInput(true);
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
          <p className="text-lg text-gray-600">Powered by OpenAI • Translate text, voice, and images instantly</p>
        </div>

        <ApiKeySection apiKey={apiKey} setApiKey={setApiKey} onSaveApiKey={handleSaveApiKey} onClearApiKey={handleClearApiKey} showApiKeyInput={showApiKeyInput} />

        {!showApiKeyInput && <TranslationInterface apiKey={apiKey} onClearApiKey={handleClearApiKey} />}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          
        </div>
      </div>
    </div>;
};
export default Index;