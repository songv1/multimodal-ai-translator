import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key } from 'lucide-react';
interface ApiKeySectionProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onSaveApiKey: () => void;
  onClearApiKey: () => void;
  showApiKeyInput: boolean;
}
const ApiKeySection: React.FC<ApiKeySectionProps> = ({
  apiKey,
  setApiKey,
  onSaveApiKey,
  onClearApiKey,
  showApiKeyInput
}) => {
  if (!showApiKeyInput) {
    return <div className="mb-8 flex justify-end">
        
      </div>;
  }
  return <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          OpenAI API Key Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="apiKey">Enter your OpenAI API Key</Label>
          <Input id="apiKey" type="password" placeholder="sk-..." value={apiKey} onChange={e => setApiKey(e.target.value)} className="mt-2" />
          <p className="text-sm text-gray-500 mt-2">
            Your API key is stored securely in your browser's local storage and never sent to our servers.
          </p>
        </div>
        <Button onClick={onSaveApiKey} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          Save API Key
        </Button>
      </CardContent>
    </Card>;
};
export default ApiKeySection;