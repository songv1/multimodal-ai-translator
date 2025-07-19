
export const translateMultimodalText = async (
  text: string, 
  targetLanguage: string, 
  inputType: 'text' | 'image'
): Promise<string> => {
  if (!text || !targetLanguage) {
    throw new Error('Missing required parameters');
  }

  const response = await fetch('https://gcceplgwujpcymiapbrb.supabase.co/functions/v1/translate-multimodal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      targetLanguage,
      inputType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Translation failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.translatedText) {
    throw new Error('Invalid response from translation service');
  }

  return data.translatedText;
};
