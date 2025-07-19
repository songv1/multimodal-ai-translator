
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Text-to-speech function called');
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not set');
      throw new Error('OpenAI API key is not configured');
    }

    const { text } = await req.json();
    console.log('Text received for speech synthesis:', text?.substring(0, 100));

    // Enhanced input validation
    if (!text) {
      throw new Error('Missing required parameters');
    }

    if (typeof text !== 'string') {
      throw new Error('Invalid parameter type');
    }

    if (text.length > 5000) {
      throw new Error('Text length exceeds maximum limit for speech synthesis');
    }

    // Basic content filtering
    const suspiciousPatterns = [/<script/i, /javascript:/i, /vbscript:/i, /onload=/i, /onerror=/i];
    if (suspiciousPatterns.some(pattern => pattern.test(text))) {
      throw new Error('Invalid content detected');
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'nova',
        response_format: 'mp3',
        speed: 1.0,
      }),
    });

    console.log('OpenAI TTS response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS API error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Text-to-speech failed: ${response.status} ${response.statusText}`);
      }
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    console.log('Text-to-speech successful');

    return new Response(JSON.stringify({ 
      audioContent: base64Audio 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    
    // Generic error message for security
    const isClientError = error instanceof Error && (
      error.message.includes('Missing required parameters') ||
      error.message.includes('Invalid parameter type') ||
      error.message.includes('Text length exceeds') ||
      error.message.includes('Invalid content detected')
    );
    
    const errorMessage = isClientError ? error.message : "Text-to-speech service temporarily unavailable";
    const statusCode = isClientError ? 400 : 500;
    
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: statusCode,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '50',
        'X-RateLimit-Window': '3600'
      },
    });
  }
});
