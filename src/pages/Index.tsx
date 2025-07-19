import React from 'react';
import { Languages } from 'lucide-react';
import TranslationInterface from '@/components/TranslationInterface';

const Index = () => {
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
          <p className="text-lg text-gray-600">Powered by OpenAI • Translate text, voice, and images instantly</p>
        </div>

        <TranslationInterface />

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          
        </div>
      </div>
    </div>
  );
};

export default Index;