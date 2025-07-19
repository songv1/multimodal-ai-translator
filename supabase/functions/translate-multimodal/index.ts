
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
    console.log('Translate multimodal function called');
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not set');
      throw new Error('OpenAI API key is not configured');
    }

    const { text, targetLanguage, inputType } = await req.json();
    console.log('Request data:', { text: text?.substring(0, 100), targetLanguage, inputType });

    // Enhanced input validation
    if (!text || !targetLanguage) {
      throw new Error('Missing required parameters');
    }

    if (typeof text !== 'string' || typeof targetLanguage !== 'string') {
      throw new Error('Invalid parameter types');
    }

    if (text.length > 10000) {
      throw new Error('Text length exceeds maximum limit');
    }

    if (targetLanguage.length > 100) {
      throw new Error('Target language parameter too long');
    }

    // Basic content filtering
    const suspiciousPatterns = [/<script/i, /javascript:/i, /vbscript:/i, /onload=/i, /onerror=/i];
    if (suspiciousPatterns.some(pattern => pattern.test(text))) {
      throw new Error('Invalid content detected');
    }

    // Select model based on input type
    let model: string;
    switch (inputType) {
      case 'text':
        model = 'gpt-4o';
        break;
      case 'image':
        model = 'gpt-4o-mini';
        break;
      default:
        model = 'gpt-4o';
    }

    console.log('Using model:', model);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Your task is to:
1. Detect the source language of the input text
2. Translate the text accurately to ${targetLanguage}
3. Maintain the original meaning, tone, and context
4. Only return the translation, no explanations or additional text

Input type: ${inputType}`
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

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
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
    console.log('OpenAI response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    const translatedText = data.choices[0].message.content.trim();
    console.log('Translation successful');

    return new Response(JSON.stringify({ 
      translatedText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Translation error:', error);
    
    // Generic error message for security
    const isClientError = error instanceof Error && (
      error.message.includes('Missing required parameters') ||
      error.message.includes('Invalid parameter types') ||
      error.message.includes('Text length exceeds') ||
      error.message.includes('Target language parameter') ||
      error.message.includes('Invalid content detected')
    );
    
    const errorMessage = isClientError ? error.message : "Translation service temporarily unavailable";
    const statusCode = isClientError ? 400 : 500;
    
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: statusCode,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Window': '3600'
      },
    });
  }
});
