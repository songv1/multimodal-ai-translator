
export const speakText = async (text: string): Promise<void> => {
  if (!text) {
    throw new Error('Missing required parameters');
  }

  const response = await fetch('https://gcceplgwujpcymiapbrb.supabase.co/functions/v1/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Text-to-speech failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.audioContent) {
    throw new Error('Invalid response from text-to-speech service');
  }

  // Convert base64 to audio blob
  const binaryString = atob(data.audioContent);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
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
