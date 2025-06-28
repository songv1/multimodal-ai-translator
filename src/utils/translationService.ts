
export const translateText = async (apiKey: string, text: string, targetLanguage: string): Promise<string> => {
  if (!apiKey || !text || !targetLanguage) {
    throw new Error('Missing required parameters');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Your task is to:
1. Detect the source language of the input text
2. Translate the text accurately to ${targetLanguage}
3. Maintain the original meaning, tone, and context
4. Only return the translation, no explanations or additional text`
        },
        {
          role: 'user',
          content: `Translate this text to ${targetLanguage}: "${text}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key.');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (response.status === 500) {
      throw new Error('OpenAI service error. Please try again later.');
    } else {
      throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from OpenAI API');
  }

  return data.choices[0].message.content.trim();
};
