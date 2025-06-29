
export const speakText = async (apiKey: string, text: string): Promise<void> => {
  if (!apiKey || !text) {
    throw new Error('Missing required parameters');
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'nova', // Using 'nova' as 'coral' is not available in OpenAI TTS
      response_format: 'mp3',
      speed: 1.0,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key.');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else {
      throw new Error(`Text-to-speech failed: ${response.status} ${response.statusText}`);
    }
  }

  const audioBuffer = await response.arrayBuffer();
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  const audioUrl = URL.createObjectURL(audioBlob);
  
  const audio = new Audio(audioUrl);
  
  return new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      reject(new Error('Failed to play audio'));
    };
    audio.play().catch(reject);
  });
};
